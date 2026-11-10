import { safeOrigin, readJson } from "@/lib/auth";
import {
  intakeConfig,
  intakeStore,
  staffAuthorized,
  staffActor,
  cookieValue,
  STAFF_COOKIE,
} from "@/lib/intake/security";
import { parseFormIds, parseProcedure } from "@/lib/intake/forms";
import { privateJson } from "@/lib/intake/responses";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(r: Request) {
  if (!staffAuthorized(r))
    return privateJson(
      { error: "Wymagane logowanie i kod MFA personelu." },
      401,
    );
  try {
    return privateJson({
      packets: intakeStore().list(
        Number(new URL(r.url).searchParams.get("offset") ?? 0),
      ),
      sessionExpires: Number(cookieValue(r, STAFF_COOKIE).split(".")[0]),
    });
  } catch {
    return privateJson({ error: "Moduł niedostępny." }, 503);
  }
}
export async function POST(r: Request) {
  if (!staffAuthorized(r))
    return privateJson(
      { error: "Wymagane logowanie i kod MFA personelu." },
      401,
    );
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  try {
    const p = await readJson(r);
    if (Object.keys(p).some((k) => !["forms", "procedure"].includes(k)))
      throw Error("Błędne pola.");
    return privateJson(
      {
        invitation: intakeStore().issue(
          parseFormIds(p.forms),
          intakeConfig().notice,
          staffActor(r),
          parseProcedure(p.procedure),
        ),
      },
      201,
    );
  } catch {
    return privateJson(
      {
        error:
          "Nie udało się utworzyć dostępu. Sprawdź formularze i konfigurację.",
      },
      400,
    );
  }
}
