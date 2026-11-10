import { NextResponse } from "next/server";
import {
  COOKIE,
  configured,
  equal,
  makeSession,
  readJson,
  safeOrigin,
} from "@/lib/auth";
import { getStore } from "@/lib/store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Niedozwolone źródło." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      { error: "Panel wymaga ustawienia ADMIN_PASSWORD i SESSION_SECRET." },
      { status: 503 },
    );
  if (!getStore().allow("login-global", 20, 300))
    return NextResponse.json(
      { error: "Zbyt wiele prób. Spróbuj za kilka minut." },
      { status: 429 },
    );
  try {
    const p = await readJson(request);
    if (
      typeof p?.password !== "string" ||
      !equal(p.password, process.env.ADMIN_PASSWORD!)
    )
      return NextResponse.json(
        { error: "Nieprawidłowe hasło." },
        { status: 401 },
      );
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, makeSession(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 3600,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe żądanie." },
      { status: 400 },
    );
  }
}
export async function DELETE(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Niedozwolone źródło." },
      { status: 403 },
    );
  const r = NextResponse.json({ ok: true });
  r.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return r;
}
