import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ClinicStore } from "../src/lib/store";
import { parseContent, parseEvent, slugify } from "../src/lib/validation";
const draft = {
  title: "Wrastający paznokieć",
  department: "chirurgia-ogolna",
  summary: "Informacje o konsultacji i możliwych dalszych krokach.",
  body: "Indywidualny plan postępowania ustala lekarz podczas konsultacji.",
  status: "draft",
  reviewer: "",
  sources: "",
  preparation: "",
  aftercare: "",
};
test("Polish slugs preserve meaning and reject empty slugs", () => {
  assert.equal(slugify("Żylaki kończyn — Łódź"), "zylaki-konczyn-lodz");
  assert.throws(() => slugify("!!!"));
});
test("publication requires explicit review, never fabricated credentials", () => {
  assert.throws(() => parseContent({ ...draft, status: "published" }));
  assert.equal(
    parseContent({
      ...draft,
      status: "published",
      reviewer: "Lekarz prowadzący",
    }).status,
    "published",
  );
  assert.throws(() => parseContent({ ...draft, department: "unknown" }));
});
test("only minimal consented events accepted; no patient health text or revenue", () => {
  assert.throws(() =>
    parseEvent({ event: "booking_confirmed", consent: true }),
  );
  assert.throws(() =>
    parseEvent({ event: "booking_opened", consent: false, id: "event-123456" }),
  );
  assert.throws(() =>
    parseEvent({
      event: "booking_opened",
      consent: true,
      id: "event-123456",
      symptom: "ból",
    }),
  );
  assert.equal(
    parseEvent({ event: "booking_opened", consent: true, id: "event-123456" })
      .event,
    "booking_opened",
  );
});
test("durable content, draft privacy, revisions and idempotent initialization/events", () => {
  const dir = mkdtempSync(join(tmpdir(), "bmclinic-"));
  const path = join(dir, "test.sqlite");
  try {
    let store = new ClinicStore(path);
    const saved = store.save(parseContent(draft));
    assert.equal(store.published().length, 0);
    assert.equal(store.findPublished(saved.slug), undefined);
    store.close();
    store = new ClinicStore(path);
    assert.equal(store.all().length, 1);
    const published = store.save(
      parseContent({
        ...draft,
        id: saved.id,
        status: "published",
        reviewer: "Lekarz",
      }),
    );
    assert.ok(store.findPublished(published.slug));
    assert.equal(store.revisionCount(saved.id), 2);
    store.record(
      parseEvent({
        event: "booking_opened",
        consent: true,
        id: "event-123456",
      }),
    );
    store.record(
      parseEvent({
        event: "booking_opened",
        consent: true,
        id: "event-123456",
      }),
    );
    assert.equal(store.stats().booking_opened, 1);
    assert.equal(store.stats().contact_opened, 0);
    store.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("ninety-day statistics exclude expired events even without new ingestion", async () => {
  const { default: Database } = await import("better-sqlite3");
  const dir = mkdtempSync(join(tmpdir(), "bmclinic-expired-"));
  const path = join(dir, "test.sqlite");
  try {
    const store = new ClinicStore(path);
    const db = new Database(path);
    db.prepare("INSERT INTO clinic_events_v1 VALUES(?,?,?)").run(
      "expired-event",
      "booking_opened",
      "2000-01-01 00:00:00",
    );
    db.close();
    assert.equal(store.stats().booking_opened, 0);
    store.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("real web vitals accept finite nonnegative measurements only", () => {
  assert.equal(
    parseEvent({
      id: "vital-event-1234",
      event: "web_vital",
      consent: true,
      metric: "LCP",
      value: 1200,
    }).event,
    "web_vital",
  );
  assert.throws(() =>
    parseEvent({
      id: "vital-event-1234",
      event: "web_vital",
      consent: true,
      metric: "LCP",
      value: -1,
    }),
  );
  assert.throws(() =>
    parseEvent({
      id: "vital-event-1234",
      event: "web_vital",
      consent: true,
      metric: "OTHER",
      value: 10,
    }),
  );
});
test("web vitals persist, deduplicate and compute p75 without inventing samples", () => {
  const dir = mkdtempSync(join(tmpdir(), "bmclinic-vitals-"));
  try {
    const store = new ClinicStore(join(dir, "db.sqlite"));
    assert.equal(store.vitals()[0].p75, null);
    for (const [i, value] of [100, 200, 300, 400].entries())
      store.record(
        parseEvent({
          id: "metric-sample-" + i,
          event: "web_vital",
          consent: true,
          metric: "LCP",
          value,
        }),
      );
    store.record(
      parseEvent({
        id: "metric-sample-0",
        event: "web_vital",
        consent: true,
        metric: "LCP",
        value: 100,
      }),
    );
    assert.deepEqual(store.vitals()[0], {
      metric: "LCP",
      samples: 4,
      p75: 300,
    });
    assert.equal(store.stats().booking_opened, 0);
    store.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
