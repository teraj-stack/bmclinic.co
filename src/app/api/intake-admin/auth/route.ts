import { safeOrigin, readJson, authorized, COOKIE } from "@/lib/auth";
import { getStore } from "@/lib/store";
import {
  intakeStore,
  totpStep,
  makeStaffSession,
  STAFF_COOKIE,
  cookieValue,
} from "@/lib/intake/security";
import { privateJson } from "@/lib/intake/responses";
export const runtime = "nodejs";
export async function POST(r: Request) {
  if (!authorized(r))
    return privateJson(
      { error: "Najpierw zaloguj się do panelu kliniki." },
      401,
    );
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  if (!getStore().allow("intake-mfa-global", 10, 300))
    return privateJson({ error: "Zbyt wiele prób MFA. Spróbuj później." }, 429);
  let store;
  try {
    store = intakeStore();
  } catch {
    return privateJson(
      {
        error:
          "Moduł wymaga klucza szyfrowania, zatwierdzonej informacji RODO i konfiguracji MFA.",
      },
      503,
    );
  }
  try {
    const p = await readJson(r);
    const step =
      typeof p?.code === "string"
        ? totpStep(process.env.PATIENT_STAFF_TOTP_SECRET!, p.code)
        : null;
    if (step === null || !store.useMfa(step))
      return privateJson(
        { error: "Nieprawidłowy albo już użyty kod. Poczekaj na kolejny kod." },
        401,
      );
    const response = privateJson({ ok: true });
    response.cookies.set(
      STAFF_COOKIE,
      makeStaffSession(cookieValue(r, COOKIE)),
      {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/api/intake-admin",
        maxAge: 15 * 60,
      },
    );
    return response;
  } catch {
    return privateJson({ error: "Nie udało się potwierdzić dostępu." }, 400);
  }
}
export async function DELETE(r: Request) {
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  const response = privateJson({ ok: true });
  response.cookies.set(STAFF_COOKIE, "", {
    path: "/api/intake-admin",
    httpOnly: true,
    maxAge: 0,
  });
  return response;
}
