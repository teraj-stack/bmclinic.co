import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  intakeForms,
  schemaForProcedure,
  packetForms,
  fieldVisible,
  updateAnswer,
  parseAnswers,
  parseProcedure,
  attentionItems,
  FORM_VERSION,
} from "../src/lib/intake/forms";
import { IntakeStore } from "../src/lib/intake/store";
const forms = ["registration", "health"] as const;
function complete(schema = intakeForms) {
  return Object.fromEntries([
    ...schema
      .filter((f) => f.id === "health")
      .flatMap((f) => f.fields)
      .filter((f) => f.buttons && f.required)
      .map((f) => [f.id, "Nie"]),
    ["patientName", "Pacjent Fikcyjny"],
    ["identifier", "2000-01-01"],
  ]);
}
test("separate operations, diseases and hospitalization; conditional details are pruned on client and server", () => {
  const schema = schemaForProcedure("general");
  const health = schema.find((f) => f.id === "health")!;
  for (const id of ["conditionsCheck", "operationsCheck", "hospitalCheck"])
    assert.ok(health.fields.find((f) => f.id === id));
  const input = {
    ...complete(schema),
    conditionsCheck: "Nie",
    operationsCheck: "Tak",
    healthOperations: "Wyrostek w dzieciństwie",
    healthConditions: "stale detail",
  };
  const clean = parseAnswers(input, [...forms], true, schema);
  assert.equal(clean.healthOperations, "Wyrostek w dzieciństwie");
  assert.equal(clean.healthConditions, undefined);
  assert.equal(
    updateAnswer(clean, "operationsCheck", "Nie", schema).healthOperations,
    undefined,
  );
  assert.equal(
    fieldVisible(
      health.fields.find((f) => f.id === "healthOperations")!,
      {},
    ),
    false,
  );
  assert.throws(() =>
    parseAnswers(
      { patientName: "A", identifier: "X" },
      [...forms],
      true,
      schema,
    ),
  );
});
test("staff procedure assignment narrows questions; unknown assignments and unassigned fields rejected", () => {
  assert.throws(() => parseProcedure("unknown"));
  const laser = schemaForProcedure("laser"),
    bot = schemaForProcedure("botulinum");
  assert.ok(
    laser
      .find((f) => f.id === "health")!
      .fields.find((f) => f.id === "tanningCheck"),
  );
  assert.equal(
    bot
      .find((f) => f.id === "health")!
      .fields.some((f) => f.id === "tanningCheck"),
    false,
  );
  assert.throws(() =>
    parseAnswers({ tanningCheck: "Nie" }, [...forms], false, bot),
  );
  const data = {
    ...complete(laser),
    tanningCheck: "Nie wiem — omówię z lekarzem",
    concerns: "Obawiam się bólu",
  };
  const summary = attentionItems(laser, data);
  assert.ok(summary.some((i) => i.value === "Obawiam się bólu"));
  assert.ok(summary.some((i) => i.value.includes("Nie wiem")));
});
test("existing packets keep legacy questions; new packets carry immutable assigned schema", () => {
  const legacy = packetForms({
    forms: ["health"],
    formVersion: "patient-intake-2026-11-10-v2",
  });
  assert.ok(legacy[0].fields.find((f) => f.id === "healthConditions"));
  assert.equal(
    legacy[0].fields.some((f) => f.id === "conditionsCheck"),
    false,
  );
  const dir = mkdtempSync(join(tmpdir(), "bm-adaptive-"));
  const s = new IntakeStore(join(dir, "db"), Buffer.alloc(32, 7));
  try {
    const invite = s.issue(
      [...forms],
      { version: "test", text: "test" },
      "staff",
      "laser",
    );
    const session = s.open(invite.token, invite.pin);
    const p = s.load(session.token);
    assert.equal(p.procedure, "laser");
    assert.equal(p.formVersion, FORM_VERSION);
    assert.ok(p.schema);
    assert.ok(
      packetForms(p)
        .flatMap((f) => f.fields)
        .find((f) => f.id === "tanningCheck"),
    );
  } finally {
    s.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("follow-up requires reviewed source, preserves original and requires patient confirmation of previous answers", () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-followup-"));
  const s = new IntakeStore(join(dir, "db"), Buffer.alloc(32, 7));
  try {
    const invite = s.issue(
      [...forms],
      { version: "test", text: "test" },
      "staff",
    );
    const session = s.open(invite.token, invite.pin);
    const answers = complete();
    s.save(session.token, answers, 0, true);
    assert.throws(() =>
      s.followUp(invite.id, "staff", {
        version: "new-notice",
        text: "current notice",
      }),
    );
    s.review(invite.id, "staff", "EDM-1");
    const before = s.detail(invite.id, "staff");
    const next = s.followUp(invite.id, "staff", {
      version: "new-notice",
      text: "current notice",
    });
    const nextSession = s.open(next.token, next.pin);
    const p = s.load(nextSession.token);
    assert.deepEqual(p.answers, answers);
    assert.equal(p.previous?.packetId, invite.id);
    assert.throws(() => s.save(nextSession.token, answers, 0, true));
    const changed = {
      ...answers,
      medicinesCheck: "Tak",
      healthMedicines: "Testowy lek",
    };
    s.save(nextSession.token, changed, 0, true, true);
    assert.ok(s.detail(next.id, "staff").previousReviewedAt);
    assert.deepEqual(s.detail(invite.id, "staff").answers, before.answers);
    assert.equal(
      s.detail(invite.id, "staff").submissionHash,
      before.submissionHash,
    );
  } finally {
    s.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
