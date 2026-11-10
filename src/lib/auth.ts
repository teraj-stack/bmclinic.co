import { createHmac, timingSafeEqual } from "node:crypto";
export const COOKIE = "bm_admin";
function secret() {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : undefined;
}
export function configured() {
  return !!secret() && (process.env.ADMIN_PASSWORD?.length ?? 0) >= 16;
}
export function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function makeSession() {
  const s = secret();
  if (!s || !configured()) throw new Error("Panel wymaga konfiguracji.");
  const expires = String(Date.now() + 8 * 3600 * 1000);
  return `${expires}.${createHmac("sha256", s).update(expires).digest("hex")}`;
}
export function validSession(token: string) {
  const s = secret();
  if (!s || !configured()) return false;
  const [expires, signature, ...extra] = token.split(".");
  if (
    extra.length ||
    !/^\d+$/.test(expires ?? "") ||
    Number(expires) <= Date.now() ||
    Number(expires) > Date.now() + 8 * 3600 * 1000
  )
    return false;
  return equal(
    signature ?? "",
    createHmac("sha256", s).update(expires).digest("hex"),
  );
}
export function safeOrigin(request: Request) {
  return (
    request.headers.get("origin") ===
    new URL(process.env.SITE_URL ?? request.url).origin
  );
}
export function authorized(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);
  return validSession(cookie ?? "");
}
export async function readJson(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 50000)
    throw new Error("Za duże żądanie.");
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 50000) throw new Error("Za duże żądanie.");
  return JSON.parse(raw);
}
