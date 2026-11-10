import { safeOrigin, readJson } from "@/lib/auth";
import {
  intakeStore,
  PATIENT_COOKIE,
  cookieValue,
} from "@/lib/intake/security";
import { privateJson } from "@/lib/intake/responses";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(r: Request) {
  try {
    return privateJson({
      packet: intakeStore().load(cookieValue(r, PATIENT_COOKIE)),
    });
  } catch {
    return privateJson(
      { error: "Sesja zakończona. Poproś recepcję o nowy dostęp." },
      401,
    );
  }
}
export async function POST(r: Request) {
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  try {
    try {
      intakeStore().load(cookieValue(r, PATIENT_COOKIE));
    } catch {
      return privateJson(
        { error: "Sesja zakończona. Poproś recepcję o pomoc." },
        401,
      );
    }
    const p = await readJson(r);
    if (
      !p ||
      !["draft", "submit"].includes(p.action) ||
      Object.keys(p).some((k) => !["action", "answers", "revision"].includes(k))
    )
      return privateJson({ error: "Nieprawidłowe żądanie." }, 400);
    const result = intakeStore().save(
      cookieValue(r, PATIENT_COOKIE),
      p.answers,
      p.revision,
      p.action === "submit",
    );
    return privateJson(result);
  } catch (e) {
    return privateJson(
      { error: e instanceof Error ? e.message : "Nie udało się zapisać." },
      400,
    );
  }
}
export async function DELETE(r: Request) {
  if (!safeOrigin(r))
    return privateJson({ error: "Niedozwolone źródło." }, 403);
  try {
    intakeStore().logout(cookieValue(r, PATIENT_COOKIE));
  } catch {}
  const response = privateJson({ ok: true });
  response.cookies.set(PATIENT_COOKIE, "", {
    httpOnly: true,
    path: "/api/intake",
    maxAge: 0,
  });
  return response;
}
