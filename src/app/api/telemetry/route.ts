import { NextResponse } from "next/server";
import { readJson, safeOrigin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { parseEvent } from "@/lib/validation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Niedozwolone źródło." },
      { status: 403 },
    );
  let input;
  try {
    input = parseEvent(await readJson(request));
  } catch {
    return NextResponse.json(
      { error: "Niedozwolone zdarzenie lub brak zgody." },
      { status: 400 },
    );
  }
  try {
    const store = getStore();
    if (!store.allow("telemetry-global", 1000, 60))
      return NextResponse.json({ error: "Limit zdarzeń." }, { status: 429 });
    store.record(input);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Zdarzenie nie zostało zapisane." },
      { status: 503 },
    );
  }
}
