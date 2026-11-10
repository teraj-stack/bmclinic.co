import { NextResponse } from "next/server";
import { authorized, readJson, safeOrigin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { parseContent } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  return NextResponse.json(
    {
      pages: getStore().all(),
      stats: getStore().stats(),
      vitals: getStore().vitals(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Niedozwolone źródło." },
      { status: 403 },
    );
  let input;
  try {
    input = parseContent(await readJson(request));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Błędna treść." },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(
      { page: getStore().save(input) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Nie udało się zapisać. Sprawdź dane i spróbuj ponownie." },
      { status: 500 },
    );
  }
}
