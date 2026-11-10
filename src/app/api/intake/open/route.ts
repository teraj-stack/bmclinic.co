import { safeOrigin, readJson } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { intakeStore, PATIENT_COOKIE } from "@/lib/intake/security";
import { privateJson } from "@/lib/intake/responses";
export const runtime = "nodejs";
export async function POST(r: Request) {
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  if (!getStore().allow("intake-open-global", 60, 60))
    return privateJson({ error: "Zbyt wiele prób. Spróbuj później." }, 429);
  try {
    const p = await readJson(r);
    if (
      typeof p?.token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(p.token) ||
      typeof p.pin !== "string" ||
      !/^\d{6}$/.test(p.pin)
    )
      return privateJson({ error: "Sprawdź link i sześciocyfrowy kod." }, 400);
    let store;
    try {
      store = intakeStore();
    } catch {
      return privateJson(
        { error: "Formularze online nie są jeszcze uruchomione." },
        503,
      );
    }
    const s = store.open(p.token, p.pin);
    const response = privateJson({ ok: true, expires: s.expires });
    response.cookies.set(PATIENT_COOKIE, s.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/api/intake",
      maxAge: 20 * 60,
    });
    return response;
  } catch {
    return privateJson(
      {
        error:
          "Dostęp nieprawidłowy, wygasły lub już wykorzystany. Poproś recepcję o nowy link.",
      },
      401,
    );
  }
}
