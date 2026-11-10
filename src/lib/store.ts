import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { slugify, type ContentInput, type EventInput } from "./validation";
export type Content = ContentInput & {
  id: number;
  slug: string;
  updatedAt: string;
  reviewedAt: string | null;
};
export class ClinicStore {
  private db: Database.Database;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("busy_timeout = 5000");
    this.db.exec(`
 CREATE TABLE IF NOT EXISTS clinic_content_v1(id INTEGER PRIMARY KEY,slug TEXT UNIQUE NOT NULL,document TEXT NOT NULL,status TEXT NOT NULL,department TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinic_revisions_v1(id TEXT PRIMARY KEY,content_id INTEGER NOT NULL REFERENCES clinic_content_v1(id),document TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinic_events_v1(id TEXT PRIMARY KEY,event TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinic_vitals_v1(id TEXT PRIMARY KEY,metric TEXT NOT NULL,value REAL NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinic_rate_limits_v1(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
 `);
  }
  all(): Content[] {
    return (
      this.db
        .prepare("SELECT document FROM clinic_content_v1 ORDER BY id DESC")
        .all() as { document: string }[]
    ).map((r) => JSON.parse(r.document));
  }
  published() {
    return this.all().filter((p) => p.status === "published");
  }
  findPublished(slug: string) {
    return this.published().find((p) => p.slug === slug);
  }
  save(input: ContentInput): Content {
    return this.db.transaction(() => {
      const old = input.id
        ? this.all().find((p) => p.id === input.id)
        : undefined;
      if (input.id && !old) throw new Error("Nie znaleziono treści.");
      const id =
        old?.id ??
        Number(
          (
            this.db
              .prepare(
                "SELECT COALESCE(MAX(id),0)+1 AS id FROM clinic_content_v1",
              )
              .get() as { id: number }
          ).id,
        );
      const slug =
        old?.slug ?? `${slugify(input.title)}-${randomUUID().slice(0, 8)}`;
      const doc: Content = {
        ...input,
        id,
        slug,
        updatedAt: new Date().toISOString(),
        reviewedAt:
          input.status === "published" ? new Date().toISOString() : null,
      };
      this.db
        .prepare(
          "INSERT INTO clinic_content_v1(id,slug,document,status,department) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document,status=excluded.status,department=excluded.department",
        )
        .run(id, slug, JSON.stringify(doc), doc.status, doc.department);
      this.db
        .prepare("INSERT INTO clinic_revisions_v1 VALUES(?,?,?,?)")
        .run(randomUUID(), id, JSON.stringify(doc), doc.updatedAt);
      return doc;
    })();
  }
  revisionCount(id: number) {
    return (
      this.db
        .prepare(
          "SELECT COUNT(*) AS n FROM clinic_revisions_v1 WHERE content_id=?",
        )
        .get(id) as { n: number }
    ).n;
  }
  record(event: EventInput) {
    this.db
      .prepare(
        "DELETE FROM clinic_events_v1 WHERE created_at < datetime('now','-90 days')",
      )
      .run();
    this.db
      .prepare(
        "DELETE FROM clinic_vitals_v1 WHERE created_at < datetime('now','-90 days')",
      )
      .run();
    if (event.event === "web_vital") {
      this.db
        .prepare(
          "INSERT OR IGNORE INTO clinic_vitals_v1 VALUES(?,?,?,datetime('now'))",
        )
        .run(event.id, event.metric, event.value);
    } else {
      this.db
        .prepare(
          "INSERT OR IGNORE INTO clinic_events_v1 VALUES(?,?,datetime('now'))",
        )
        .run(event.id, event.event);
    }
  }
  vitals() {
    return ["LCP", "INP", "CLS"].map((metric) => {
      const rows = this.db
        .prepare(
          "SELECT value FROM clinic_vitals_v1 WHERE metric=? AND created_at >= datetime('now','-90 days') ORDER BY value",
        )
        .all(metric) as { value: number }[];
      return {
        metric,
        samples: rows.length,
        p75: rows.length ? rows[Math.ceil(rows.length * 0.75) - 1].value : null,
      };
    });
  }
  stats() {
    const out = { booking_opened: 0, contact_opened: 0 };
    for (const r of this.db
      .prepare(
        "SELECT event,COUNT(*) AS n FROM clinic_events_v1 WHERE created_at >= datetime('now','-90 days') GROUP BY event",
      )
      .all() as { event: keyof typeof out; n: number }[])
      out[r.event] = r.n;
    return out;
  }
  allow(key: string, limit: number, seconds: number) {
    const now = Date.now();
    return this.db.transaction(() => {
      this.db
        .prepare("DELETE FROM clinic_rate_limits_v1 WHERE expires < ?")
        .run(now);
      const r = this.db
        .prepare("SELECT count FROM clinic_rate_limits_v1 WHERE key=?")
        .get(key) as { count: number } | undefined;
      if (r && r.count >= limit) return false;
      this.db
        .prepare(
          "INSERT INTO clinic_rate_limits_v1 VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
        )
        .run(key, now + seconds * 1000);
      return true;
    })();
  }
  close() {
    this.db.close();
  }
}
let singleton: ClinicStore | undefined;
export function getStore() {
  return (singleton ??= new ClinicStore(
    process.env.DATABASE_PATH ?? "data/clinic.sqlite",
  ));
}
