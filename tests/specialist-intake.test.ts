import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  assignedFormIds,
  schemaForProcedure,
  parseAnswers,
  packetForms,
  attentionItems,
  procedures,
} from "../src/lib/intake/forms";
import { IntakeStore } from "../src/lib/intake/store";
test("proctology and LHP have separate mandatory form steps without aesthetic laser questions", () => {
  assert.equal(procedures[0].id, "proctology");
  assert.deepEqual(assignedFormIds(["registration"], "proctology"), [
    "registration",
    "health",
    "proctology",
  ]);
  const ids = assignedFormIds(["registration"], "lhp");
  assert.ok(ids.includes("proctology") && ids.includes("operative"));
  const schema = schemaForProcedure("lhp");
  assert.ok(
    schema
      .find((f) => f.id === "proctology")!
      .fields.find((f) => f.id === "proctoStoolControlCheck"),
  );
  assert.equal(
    schema.flatMap((f) => f.fields).some((f) => f.id === "tanningCheck"),
    false,
  );
  assert.throws(() =>
    parseAnswers({ venousSymptomsSide: "Prawa" }, ids, false, schema),
  );
  const op = schema.find((f) => f.id === "operative")!;
  assert.match(op.title, /LHP/);
  const text = op.information!.paragraphs.join(" ");
  assert.match(text, /krwotok/i);
  assert.match(text, /zgon/);
  assert.match(text, /mucopeksja/);
  assert.match(text, /nie.*kompletna/i);
  assert.match(text, /zgoda/i);
  assert.throws(() =>
    parseAnswers(
      { patientName: "Fikcyjny", identifier: "test" },
      ids,
      true,
      schema,
    ),
  );
});
test("venous operation is assigned independently of symptoms side and never treated as a small aesthetic procedure", () => {
  const ids = assignedFormIds(["registration"], "venous_surgery"),
    schema = schemaForProcedure("venous_surgery");
  assert.ok(ids.includes("operative"));
  assert.equal(ids.includes("proctology"), false);
  const op = schema.find((f) => f.id === "operative")!;
  assert.ok(op.fields.find((f) => f.id === "venousSymptomsSide"));
  assert.ok(op.fields.find((f) => f.id === "operativeAntithromboticCheck"));
  assert.match(op.information!.paragraphs.join(" "), /zatorowość płucna/);
  assert.throws(() =>
    assignedFormIds(["registration", "operative"], "botulinum"),
  );
  const summary = attentionItems(schema, {
    venousSymptomsSide: "Nie wiem — ustalę z lekarzem",
    operativeQuestions: "Chcę omówić znieczulenie",
  });
  assert.equal(summary.length, 2);
});
test("server always attaches required LHP schema, persists serious-risk information and preserves it on follow-up", () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-lhp-"));
  const s = new IntakeStore(join(dir, "db"), Buffer.alloc(32, 7));
  try {
    const invite = s.issue(
      ["registration"],
      { version: "test", text: "test notice" },
      "staff",
      "lhp",
    );
    const session = s.open(invite.token, invite.pin);
    const packet = s.load(session.token);
    assert.ok(packet.forms.includes("operative"));
    const schema = packetForms(packet);
    const answers = Object.fromEntries(
      schema
        .flatMap((f) => f.fields)
        .filter((f) => f.required && f.buttons)
        .map((f) => [f.id, "Nie"]),
    );
    Object.assign(answers, {
      patientName: "Pacjent Fikcyjny",
      identifier: "test",
    });
    s.save(session.token, answers, 0, true);
    s.review(invite.id, "staff", "EDM-LHP-1");
    const hash = s.detail(invite.id, "staff").submissionHash;
    const next = s.followUp(invite.id, "staff", {
      version: "new",
      text: "new notice",
    });
    const second = s.load(s.open(next.token, next.pin).token);
    assert.ok(second.forms.includes("operative"));
    assert.deepEqual(second.schema, packet.schema);
    assert.equal(second.notice.version, "new");
    assert.equal(s.detail(invite.id, "staff").submissionHash, hash);
  } finally {
    s.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("historical v3 surgical packet without a snapshot retains the original wording", () => {
  const schema = packetForms({
    forms: ["health"],
    formVersion: "patient-intake-2026-11-10-v3",
    procedure: "minor_surgery",
  });
  assert.equal(schema.length, 1);
  assert.equal(schema[0].title, "Krótki wywiad przed wizytą");
  assert.ok(schema[0].fields.find((f) => f.id === "localProcedureCheck"));
});
