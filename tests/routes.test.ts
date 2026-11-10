import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { POST as eventPost } from "../src/app/api/telemetry/route";
import {
  POST as contentPost,
  GET as contentGet,
} from "../src/app/api/content/route";
import { makeSession, COOKIE } from "../src/lib/auth";
test("API validates authentication, CSRF, persistence and consent", async () => {
  const dir = mkdtempSync(join(tmpdir(), "bm-api-"));
  process.env.DATABASE_PATH = join(dir, "db.sqlite");
  process.env.ADMIN_PASSWORD = "a".repeat(24);
  process.env.SESSION_SECRET = "b".repeat(40);
  const cookie = `${COOKIE}=${makeSession()}`;
  const req = (
    path: string,
    payload?: unknown,
    auth = false,
    origin = "http://clinic.test",
  ) =>
    new Request("http://clinic.test" + path, {
      method: payload ? "POST" : "GET",
      headers: {
        origin,
        "content-type": "application/json",
        ...(auth ? { cookie } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });
  assert.equal((await contentGet(req("/api/content"))).status, 401);
  assert.equal(
    (await contentPost(req("/api/content", {}, true, "http://evil.test")))
      .status,
    403,
  );
  assert.equal(
    (
      await eventPost(
        req("/api/telemetry", {
          event: "booking_confirmed",
          consent: true,
          id: "event-api-1234",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await eventPost(
        req("/api/telemetry", {
          event: "booking_opened",
          consent: false,
          id: "event-api-1234",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await eventPost(
        req("/api/telemetry", {
          event: "booking_opened",
          consent: true,
          id: "event-api-1234",
        }),
      )
    ).status,
    201,
  );
  const p = {
    title: "Treść testowa",
    department: "proktologia",
    summary: "Podsumowanie",
    body: "Treść",
    status: "draft",
    reviewer: "",
    sources: "",
    preparation: "",
    aftercare: "",
  };
  const response = await contentPost(req("/api/content", p, true));
  assert.equal(response.status, 200);
  const saved = (await response.json()).page;
  const list = await (
    await contentGet(req("/api/content", undefined, true))
  ).json();
  assert.equal(list.pages[0].id, saved.id);
  assert.equal(list.stats.booking_opened, 1);
  assert.equal(list.vitals.length, 3);
  assert.equal(list.vitals[0].p75, null);
  rmSync(dir, { recursive: true, force: true });
});
