import { test } from "node:test";
import assert from "node:assert/strict";
import { makeSession, validSession, safeOrigin } from "../src/lib/auth";
test("sessions require secret, expire and reject tampering", () => {
  process.env.ADMIN_PASSWORD = "a".repeat(24);
  process.env.SESSION_SECRET = "b".repeat(40);
  const token = makeSession();
  assert.equal(validSession(token), true);
  assert.equal(validSession(token + "x"), false);
  assert.equal(validSession(""), false);
  delete process.env.SESSION_SECRET;
  assert.equal(validSession(token), false);
});
test("cross-site writes fail closed", () => {
  assert.equal(
    safeOrigin(
      new Request("https://clinic.test/api/content", {
        headers: { origin: "https://evil.test" },
      }),
    ),
    false,
  );
  assert.equal(
    safeOrigin(new Request("https://clinic.test/api/content")),
    false,
  );
  assert.equal(
    safeOrigin(
      new Request("https://clinic.test/api/content", {
        headers: { origin: "https://clinic.test" },
      }),
    ),
    true,
  );
});
