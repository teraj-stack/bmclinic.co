import { test } from "node:test";
import assert from "node:assert/strict";
import {
  totpCode,
  totpStep,
  makeStaffSession,
  validStaffSession,
} from "../src/lib/intake/security";
test("TOTP matches RFC vector and rejects wrong or stale codes", () => {
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  assert.equal(totpCode(secret, 1), "287082");
  assert.equal(totpStep(secret, "287082", 59000), 1);
  assert.equal(totpStep(secret, "000000", 59000), null);
  assert.equal(totpStep(secret, "287082", 590000), null);
});
test("staff step-up is bound to original admin session", () => {
  process.env.SESSION_SECRET = "a".repeat(40);
  const token = makeStaffSession("admin-cookie");
  assert.equal(validStaffSession(token, "admin-cookie"), true);
  assert.equal(validStaffSession(token, "other"), false);
  assert.equal(validStaffSession(token + "x", "admin-cookie"), false);
});
