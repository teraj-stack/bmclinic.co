import Database from "better-sqlite3";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomInt,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  FORM_VERSION,
  assignedFormIds,
  parseAnswers,
  parseFormIds,
  packetForms,
  parseProcedure,
  schemaForProcedure,
  type IntakeForm,
  type ProcedureId,
  type FormId,
} from "./forms";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export type Notice = { version: string; text: string };
export type IntakePacket = {
  forms: FormId[];
  formVersion: string;
  notice: Notice;
  answers: Record<string, string>;
  schema?: IntakeForm[];
  procedure?: ProcedureId;
  previous?: {
    packetId: string;
    submittedAt: string;
    answers: Record<string, string>;
  };
  previousReviewedAt?: string;
  submittedAt?: string;
  submissionHash?: string;
  review?: {
    identityChecked: boolean;
    reviewedBy: string;
    reviewedAt: string;
    recordReference: string;
  };
};
export class IntakeStore {
  private db: Database.Database;
  constructor(
    path: string,
    private key: Buffer,
    private now: () => number = Date.now,
  ) {
    if (key.length !== 32) throw Error("Wymagany klucz 256-bitowy.");
    mkdirSync(dirname(path), { recursive: true });
    this.db = new Database(path);
    this.db.pragma("journal_mode=WAL");
    this.db.pragma("foreign_keys=ON");
    this.db.pragma("busy_timeout=5000");
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS intake_packets_v1(id TEXT PRIMARY KEY,ciphertext TEXT NOT NULL,status TEXT NOT NULL,revision INTEGER NOT NULL,created INTEGER NOT NULL,revoked INTEGER NOT NULL DEFAULT 0);CREATE TABLE IF NOT EXISTS intake_invites_v1(token_hash TEXT PRIMARY KEY,packet_id TEXT NOT NULL REFERENCES intake_packets_v1(id),pin_salt TEXT NOT NULL,pin_hash TEXT NOT NULL,expires INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,used INTEGER NOT NULL DEFAULT 0);CREATE TABLE IF NOT EXISTS intake_sessions_v1(token_hash TEXT PRIMARY KEY,packet_id TEXT NOT NULL REFERENCES intake_packets_v1(id),expires INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS intake_audit_v1(id INTEGER PRIMARY KEY,packet_id TEXT,action TEXT NOT NULL,actor TEXT NOT NULL,created INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS intake_mfa_used_v1(step INTEGER PRIMARY KEY,used_at INTEGER NOT NULL);`,
    );
  }
  private seal(id: string, p: object) {
    const iv = randomBytes(12),
      c = createCipheriv("aes-256-gcm", this.key, iv);
    c.setAAD(Buffer.from(id));
    const bytes = Buffer.concat([
      c.update(JSON.stringify(p), "utf8"),
      c.final(),
    ]);
    return Buffer.concat([iv, c.getAuthTag(), bytes]).toString("base64");
  }
  private unseal(id: string, s: string): IntakePacket {
    const b = Buffer.from(s, "base64");
    const d = createDecipheriv("aes-256-gcm", this.key, b.subarray(0, 12));
    d.setAAD(Buffer.from(id));
    d.setAuthTag(b.subarray(12, 28));
    return JSON.parse(
      Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8"),
    );
  }
  private audit(id: string | null, action: string, actor: string) {
    this.db
      .prepare(
        "INSERT INTO intake_audit_v1(packet_id,action,actor,created) VALUES(?,?,?,?)",
      )
      .run(id, action, actor, this.now());
  }
  issue(
    forms: FormId[],
    notice: Notice,
    actor: string,
    procedure: ProcedureId = "general",
  ) {
    parseProcedure(procedure);
    forms = assignedFormIds(forms, procedure);
    if (!notice.text || !notice.version)
      throw Error("Brak informacji dla pacjenta.");
    const id = randomBytes(16).toString("hex"),
      token = randomBytes(32).toString("base64url"),
      pin = String(randomInt(100000, 1000000)),
      salt = randomBytes(16).toString("hex"),
      expires = this.now() + 24 * 3600 * 1000;
    this.db.transaction(() => {
      this.db
        .prepare("INSERT INTO intake_packets_v1 VALUES(?,?,'draft',0,?,0)")
        .run(
          id,
          this.seal(id, {
            forms,
            formVersion: FORM_VERSION,
            procedure,
            schema: schemaForProcedure(procedure).filter((f) =>
              forms.includes(f.id),
            ),
            notice,
            answers: {},
          }),
          this.now(),
        );
      this.db
        .prepare(
          "INSERT INTO intake_invites_v1(token_hash,packet_id,pin_salt,pin_hash,expires) VALUES(?,?,?,?,?)",
        )
        .run(
          hash(token),
          id,
          salt,
          scryptSync(pin, salt, 32).toString("hex"),
          expires,
        );
      this.audit(id, "invite_created", actor);
    })();
    return { id, token, pin, expires };
  }
  followUp(id: string, actor: string, notice: Notice) {
    return this.db.transaction(() => {
      const source = this.detail(id, actor);
      if (
        source.status !== "submitted" ||
        !source.review ||
        !source.submittedAt ||
        !source.forms.includes("health")
      )
        throw Error(
          "Aktualizacja wymaga przekazanego, zweryfikowanego wywiadu.",
        );
      const invitation = this.issue(
        source.forms,
        notice,
        actor,
        source.procedure ?? "general",
      );
      const selectedForms = assignedFormIds(
        source.forms,
        source.procedure ?? "general",
      );
      const oldSchema = packetForms(source);
      const updatedSchema = schemaForProcedure(source.procedure ?? "general")
        .filter((f) => selectedForms.includes(f.id))
        .map((f) => oldSchema.find((old) => old.id === f.id) ?? f);
      const payload: IntakePacket = {
        forms: selectedForms,
        formVersion: FORM_VERSION,
        schema: updatedSchema,
        procedure: source.procedure ?? "general",
        notice,
        answers: { ...source.answers },
        previous: {
          packetId: id,
          submittedAt: source.submittedAt,
          answers: { ...source.answers },
        },
      };
      this.db
        .prepare("UPDATE intake_packets_v1 SET ciphertext=? WHERE id=?")
        .run(this.seal(invitation.id, payload), invitation.id);
      this.audit(invitation.id, "follow_up_created_identity_confirmed", actor);
      return invitation;
    })();
  }
  reissue(id: string, actor: string) {
    return this.db.transaction(() => {
      const row = this.db
        .prepare("SELECT status FROM intake_packets_v1 WHERE id=?")
        .get(id) as { status: string } | undefined;
      if (!row || row.status !== "draft")
        throw Error("Można wznowić tylko szkic.");
      const token = randomBytes(32).toString("base64url"),
        pin = String(randomInt(100000, 1000000)),
        salt = randomBytes(16).toString("hex"),
        expires = this.now() + 24 * 3600000;
      this.db
        .prepare("UPDATE intake_invites_v1 SET used=1 WHERE packet_id=?")
        .run(id);
      this.db
        .prepare("DELETE FROM intake_sessions_v1 WHERE packet_id=?")
        .run(id);
      this.db
        .prepare("UPDATE intake_packets_v1 SET revoked=0 WHERE id=?")
        .run(id);
      this.db
        .prepare(
          "INSERT INTO intake_invites_v1(token_hash,packet_id,pin_salt,pin_hash,expires) VALUES(?,?,?,?,?)",
        )
        .run(
          hash(token),
          id,
          salt,
          scryptSync(pin, salt, 32).toString("hex"),
          expires,
        );
      this.audit(id, "invite_reissued", actor);
      return { id, token, pin, expires };
    })();
  }
  open(token: string, pin: string) {
    const result = this.db.transaction(() => {
      const r = this.db
        .prepare(
          "SELECT i.*,p.revoked FROM intake_invites_v1 i JOIN intake_packets_v1 p ON p.id=i.packet_id WHERE token_hash=?",
        )
        .get(hash(token)) as
        | {
            packet_id: string;
            used: number;
            revoked: number;
            expires: number;
            attempts: number;
            pin_salt: string;
            pin_hash: string;
          }
        | undefined;
      if (
        !r ||
        r.used ||
        r.revoked ||
        r.expires <= this.now() ||
        r.attempts >= 5
      )
        return null;
      const good = timingSafeEqual(
        scryptSync(pin, r.pin_salt, 32),
        Buffer.from(r.pin_hash, "hex"),
      );
      if (!good) {
        this.db
          .prepare(
            "UPDATE intake_invites_v1 SET attempts=attempts+1 WHERE token_hash=?",
          )
          .run(hash(token));
        this.audit(r.packet_id, "pin_failed", "patient");
        return null;
      }
      const session = randomBytes(32).toString("base64url"),
        expires = this.now() + 20 * 60 * 1000;
      this.db
        .prepare("UPDATE intake_invites_v1 SET used=1 WHERE token_hash=?")
        .run(hash(token));
      this.db
        .prepare("INSERT INTO intake_sessions_v1 VALUES(?,?,?)")
        .run(hash(session), r.packet_id, expires);
      this.audit(r.packet_id, "session_opened", "patient");
      return { token: session, expires };
    })();
    if (!result)
      throw Error(
        "Link lub kod jest nieprawidłowy, wygasł albo został już użyty.",
      );
    return result;
  }
  private row(session: string) {
    const r = this.db
      .prepare(
        "SELECT p.*,s.expires AS sessionExpires FROM intake_sessions_v1 s JOIN intake_packets_v1 p ON p.id=s.packet_id WHERE s.token_hash=? AND s.expires>? AND p.revoked=0",
      )
      .get(hash(session), this.now()) as
      | {
          id: string;
          ciphertext: string;
          revision: number;
          status: string;
          sessionExpires: number;
        }
      | undefined;
    if (!r) throw Error("Sesja zakończona. Poproś recepcję o nowy dostęp.");
    return r;
  }
  load(session: string) {
    const r = this.row(session);
    return {
      ...this.unseal(r.id, r.ciphertext),
      id: r.id,
      revision: r.revision,
      sessionExpires: r.sessionExpires,
      status: r.status,
    };
  }
  save(
    session: string,
    answers: unknown,
    revision: number,
    final: boolean,
    reviewedPrevious = false,
  ) {
    return this.db.transaction(() => {
      const r = this.row(session);
      if (r.status !== "draft") throw Error("Formularz został już przekazany.");
      if (!Number.isSafeInteger(revision) || r.revision !== revision)
        throw Error("Zmieniono wersję formularza. Odśwież dane.");
      const p = this.unseal(r.id, r.ciphertext);
      p.answers = parseAnswers(answers, p.forms, final, packetForms(p));
      if (final && p.previous) {
        if (reviewedPrevious !== true)
          throw Error(
            "Przejrzyj wcześniejsze odpowiedzi i potwierdź ich aktualność po wprowadzeniu zmian.",
          );
        p.previousReviewedAt = new Date(this.now()).toISOString();
      }
      if (final) {
        p.submittedAt = new Date(this.now()).toISOString();
        p.submissionHash = hash(
          JSON.stringify({
            forms: p.forms,
            formVersion: p.formVersion,
            notice: p.notice,
            schema: p.schema,
            procedure: p.procedure,
            previous: p.previous,
            previousReviewedAt: p.previousReviewedAt,
            answers: p.answers,
            submittedAt: p.submittedAt,
          }),
        );
      }
      this.db
        .prepare(
          "UPDATE intake_packets_v1 SET ciphertext=?,revision=revision+1,status=? WHERE id=?",
        )
        .run(this.seal(r.id, p), final ? "submitted" : "draft", r.id);
      this.audit(r.id, final ? "submitted" : "draft_saved", "patient");
      return {
        revision: r.revision + 1,
        status: final ? "submitted" : "draft",
      };
    })();
  }
  logout(session: string) {
    const r = this.db
      .prepare("SELECT packet_id FROM intake_sessions_v1 WHERE token_hash=?")
      .get(hash(session)) as { packet_id: string } | undefined;
    this.db
      .prepare("DELETE FROM intake_sessions_v1 WHERE token_hash=?")
      .run(hash(session));
    if (r) this.audit(r.packet_id, "session_closed", "patient");
  }
  list(offset = 0) {
    if (!Number.isSafeInteger(offset) || offset < 0)
      throw Error("Błędna strona.");
    return this.db
      .prepare(
        "SELECT id,status,revision,created,revoked FROM intake_packets_v1 ORDER BY created DESC,id DESC LIMIT 100 OFFSET ?",
      )
      .all(offset) as {
      id: string;
      status: string;
      revision: number;
      created: number;
      revoked: number;
    }[];
  }
  detail(id: string, actor: string) {
    const r = this.db
      .prepare("SELECT * FROM intake_packets_v1 WHERE id=?")
      .get(id) as
      | {
          id: string;
          ciphertext: string;
          status: string;
          revision: number;
          revoked: number;
        }
      | undefined;
    if (!r) throw Error("Nie znaleziono formularza.");
    this.audit(id, "staff_read", actor);
    return {
      ...this.unseal(id, r.ciphertext),
      id,
      status: r.status,
      revision: r.revision,
      revoked: !!r.revoked,
    };
  }
  review(id: string, actor: string, reference: string) {
    return this.db.transaction(() => {
      const p = this.detail(id, actor);
      if (
        p.status !== "submitted" ||
        !reference.trim() ||
        reference.length > 160
      )
        throw Error(
          "Wymagany przekazany formularz i identyfikator wpisu w dokumentacji.",
        );
      p.review = {
        identityChecked: true,
        reviewedBy: actor,
        reviewedAt: new Date(this.now()).toISOString(),
        recordReference: reference.trim(),
      };
      const { status, revision, revoked, ...payload } = p;
      this.db
        .prepare("UPDATE intake_packets_v1 SET ciphertext=? WHERE id=?")
        .run(this.seal(id, payload), id);
      this.audit(id, "staff_verified_and_imported", actor);
      return { ok: true };
    })();
  }
  revoke(id: string, actor: string) {
    this.db.transaction(() => {
      const result = this.db
        .prepare("UPDATE intake_packets_v1 SET revoked=1 WHERE id=?")
        .run(id);
      if (!result.changes) throw Error("Nie znaleziono formularza.");
      this.db
        .prepare("DELETE FROM intake_sessions_v1 WHERE packet_id=?")
        .run(id);
      this.audit(id, "access_revoked", actor);
    })();
  }
  useMfa(step: number) {
    const r = this.db
      .prepare("INSERT OR IGNORE INTO intake_mfa_used_v1 VALUES(?,?)")
      .run(step, this.now());
    return r.changes === 1;
  }
  close() {
    this.db.close();
  }
}
