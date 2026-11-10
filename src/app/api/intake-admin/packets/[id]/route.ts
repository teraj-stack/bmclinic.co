import { safeOrigin, readJson } from "@/lib/auth";
import {
  intakeStore,
  intakeConfig,
  staffAuthorized,
  staffActor,
} from "@/lib/intake/security";
import { privateJson } from "@/lib/intake/responses";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type C = { params: Promise<{ id: string }> };
export async function GET(r: Request, c: C) {
  if (!staffAuthorized(r))
    return privateJson({ error: "Wymagane logowanie i kod MFA." }, 401);
  try {
    const { id } = await c.params;
    return privateJson({ packet: intakeStore().detail(id, staffActor(r)) });
  } catch {
    return privateJson(
      { error: "Nie znaleziono formularza lub moduł niedostępny." },
      404,
    );
  }
}
export async function POST(r: Request, c: C) {
  if (!staffAuthorized(r))
    return privateJson({ error: "Wymagane logowanie i kod MFA." }, 401);
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  try {
    const { id } = await c.params,
      p = await readJson(r);
    if (p.action === "followUp") {
      if (p.identityChecked !== true)
        return privateJson(
          {
            error:
              "Potwierdź tożsamość tej samej osoby przed przygotowaniem aktualizacji.",
          },
          400,
        );
      return privateJson({
        invitation: intakeStore().followUp(
          id,
          staffActor(r),
          intakeConfig().notice,
        ),
      });
    }
    if (p.action === "reissue")
      return privateJson({
        invitation: intakeStore().reissue(id, staffActor(r)),
      });
    if (p.action === "revoke") {
      intakeStore().revoke(id, staffActor(r));
      return privateJson({ ok: true });
    }
    if (
      p.action === "review" &&
      p.identityChecked === true &&
      p.importConfirmed === true &&
      typeof p.recordReference === "string"
    )
      return privateJson(
        intakeStore().review(id, staffActor(r), p.recordReference),
      );
    return privateJson(
      {
        error:
          "Potwierdź weryfikację tożsamości oraz wprowadzenie do dokumentacji.",
      },
      400,
    );
  } catch {
    return privateJson(
      { error: "Nie udało się zaktualizować. Sprawdź status i dane." },
      400,
    );
  }
}
