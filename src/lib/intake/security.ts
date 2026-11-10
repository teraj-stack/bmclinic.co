import { createHmac, randomBytes, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { authorized, COOKIE, equal, configured } from "../auth";
import { IntakeStore, type Notice } from "./store";
export const PATIENT_COOKIE = "bm_patient",
  STAFF_COOKIE = "bm_patient_staff";
export function cookieValue(r: Request, name: string) {
  return (
    r.headers
      .get("cookie")
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(name + "="))
      ?.slice(name.length + 1) ?? ""
  );
}
export function totpCode(secret: string, step: number) {
  let bits = "";
  for (const c of secret.toUpperCase()) {
    const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);
    if (n < 0) throw Error("Błędny sekret MFA.");
    bits += n.toString(2).padStart(5, "0");
  }
  const key = Buffer.from(
    (bits.match(/.{8}/g) ?? []).map((x) => parseInt(x, 2)),
  );
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const h = createHmac("sha1", key).update(counter).digest();
  const offset = h[h.length - 1] & 15;
  return String((h.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}
export function totpStep(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  const step = Math.floor(now / 30000);
  for (const delta of [-1, 0, 1]) {
    if (step + delta >= 0 && equal(totpCode(secret, step + delta), code))
      return step + delta;
  }
  return null;
}
const adminHash = (s: string) => createHash("sha256").update(s).digest("hex");
function signature(s: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw Error("Brak konfiguracji sesji.");
  return createHmac("sha256", secret)
    .update("patient-staff:" + s)
    .digest("hex");
}
export function makeStaffSession(admin: string) {
  const body = `${Date.now() + 15 * 60000}.${randomBytes(16).toString("hex")}.${adminHash(admin)}`;
  return body + "." + signature(body);
}
export function validStaffSession(token: string, admin: string) {
  try {
    const parts = token.split(".");
    if (
      parts.length !== 4 ||
      !admin ||
      !/^\d+$/.test(parts[0]) ||
      Number(parts[0]) <= Date.now() ||
      Number(parts[0]) > Date.now() + 15 * 60000 ||
      parts[2] !== adminHash(admin)
    )
      return false;
    return equal(parts[3], signature(parts.slice(0, 3).join(".")));
  } catch {
    return false;
  }
}
export function staffAuthorized(r: Request) {
  return (
    authorized(r) &&
    validStaffSession(cookieValue(r, STAFF_COOKIE), cookieValue(r, COOKIE))
  );
}
export function staffActor(r: Request) {
  return (
    (process.env.PATIENT_STAFF_NAME ?? "staff") +
    ":" +
    adminHash(cookieValue(r, STAFF_COOKIE)).slice(0, 12)
  );
}
export function intakeConfig(): { key: Buffer; notice: Notice } {
  if (process.env.PATIENT_INTAKE_ENABLED !== "true" || !configured())
    throw Error("Formularze online nie są jeszcze uruchomione.");
  const key = process.env.PATIENT_DATA_KEY ?? "",
    secret = process.env.PATIENT_STAFF_TOTP_SECRET ?? "";
  if (
    !/^[a-fA-F0-9]{64}$/.test(key) ||
    !/^[A-Z2-7]{32,64}$/.test(secret) ||
    !process.env.PATIENT_STAFF_NAME
  )
    throw Error("Formularze online wymagają konfiguracji bezpieczeństwa.");
  if (!process.env.SITE_URL) throw Error("Wymagany jawny adres strony.");
  const url = new URL(process.env.SITE_URL);
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw Error("Wymagane jest HTTPS.");
  const text = readFileSync(
      /* turbopackIgnore: true */ process.env.PATIENT_NOTICE_PATH ?? "",
      "utf8",
    ),
    version = process.env.PATIENT_NOTICE_VERSION ?? "";
  if (
    text.length < 300 ||
    text.length > 30000 ||
    /\[[^\]]+\]/.test(text) ||
    !version ||
    version.length > 100
  )
    throw Error(
      "Wymagana jest zatwierdzona informacja o przetwarzaniu danych.",
    );
  return { key: Buffer.from(key, "hex"), notice: { text, version } };
}
let singleton: IntakeStore | undefined;
export function intakeStore() {
  const config = intakeConfig();
  return (singleton ??= new IntakeStore(
    process.env.PATIENT_DATABASE_PATH ?? "data/patient-intake.sqlite",
    config.key,
  ));
}
