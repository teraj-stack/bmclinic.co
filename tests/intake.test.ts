import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IntakeStore } from "../src/lib/intake/store";
import { parseAnswers } from "../src/lib/intake/forms";
const notice = {
  version: "test-1",
  text: "Informacja dla testowego administratora danych. ".repeat(20),
};
const answers = { patientName: "Testowy Pacjent", identifier: "2000-01-01" };
test("intake data encrypted; one-time invitation; optimistic revision; immutable submission", () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-intake-")),
    path = join(dir, "db.sqlite");
  try {
    let s = new IntakeStore(path, Buffer.alloc(32, 7));
    const invite = s.issue(["registration", "health"], notice, "admin");
    assert.equal(s.list().length, 1);
    const session = s.open(invite.token, invite.pin);
    assert.throws(() => s.open(invite.token, invite.pin));
    assert.equal(s.load(session.token).revision, 0);
    s.save(session.token, answers, 0, false);
    assert.throws(() => s.save(session.token, answers, 0, false));
    s.save(session.token, answers, 1, true);
    assert.throws(() => s.save(session.token, answers, 2, false));
    s.close();
    s = new IntakeStore(path, Buffer.alloc(32, 7));
    assert.equal(s.detail(invite.id, "admin").status, "submitted");
    s.close();
    assert.equal(
      readFileSync(path).includes(Buffer.from("Testowy Pacjent")),
      false,
    );
    const wrong = new IntakeStore(path, Buffer.alloc(32, 8));
    assert.throws(() => wrong.detail(invite.id, "admin"));
    wrong.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("expired or revoked invitations and expired sessions fail closed; PIN attempts lock", () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-intake-expiry-"));
  try {
    let now = 1000;
    const s = new IntakeStore(
      join(dir, "db.sqlite"),
      Buffer.alloc(32, 7),
      () => now,
    );
    const a = s.issue(["registration"], notice, "admin");
    for (let i = 0; i < 5; i++) assert.throws(() => s.open(a.token, "wrong"));
    assert.throws(() => s.open(a.token, a.pin));
    const b = s.issue(["registration"], notice, "admin");
    const session = s.open(b.token, b.pin);
    now += 21 * 60 * 1000;
    assert.throws(() => s.load(session.token));
    const c = s.issue(["registration"], notice, "admin");
    s.revoke(c.id, "admin");
    assert.throws(() => s.open(c.token, c.pin));
    const d = s.issue(["registration"], notice, "admin");
    now += 25 * 3600 * 1000;
    assert.throws(() => s.open(d.token, d.pin));
    s.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("form schema rejects injection, unknown fields and unassigned health fields", () => {
  assert.throws(() =>
    parseAnswers({ patientName: 1 }, ["registration"], false),
  );
  assert.throws(() =>
    parseAnswers({ symptoms: "private" }, ["registration"], false),
  );
  assert.throws(() =>
    parseAnswers({ healthReason: "private" }, ["registration"], false),
  );
  assert.throws(() => parseAnswers({}, ["registration"], true));
  assert.equal(
    parseAnswers(answers, ["registration"], true).patientName,
    "Testowy Pacjent",
  );
});
test("reissue preserves draft and revision, invalidates all old access, cannot reopen submitted packet", () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-intake-reissue-"));
  const s = new IntakeStore(join(dir, "db.sqlite"), Buffer.alloc(32, 7));
  try {
    const a = s.issue(["registration"], notice, "staff");
    const first = s.open(a.token, a.pin);
    s.save(first.token, answers, 0, false);
    const b = s.reissue(a.id, "staff");
    assert.equal(b.id, a.id);
    assert.throws(() => s.load(first.token));
    assert.throws(() => s.open(a.token, a.pin));
    const second = s.open(b.token, b.pin);
    assert.deepEqual(s.load(second.token).answers, answers);
    assert.equal(s.load(second.token).revision, 1);
    assert.equal(s.load(second.token).sessionExpires, second.expires);
    s.save(second.token, answers, 1, true);
    assert.throws(() => s.reissue(a.id, "staff"));
  } finally {
    s.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test("packet pagination retains access to older records", () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-intake-pages-"));
  let time = 1;
  const s = new IntakeStore(
    join(dir, "db.sqlite"),
    Buffer.alloc(32, 7),
    () => time++,
  );
  try {
    const first = s.issue(["registration"], notice, "staff");
    const second = s.issue(["registration"], notice, "staff");
    assert.equal(s.list(0)[0].id, second.id);
    assert.equal(s.list(1)[0].id, first.id);
    assert.equal(s.list(2).length, 0);
    assert.throws(() => s.list(-1));
  } finally {
    s.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
