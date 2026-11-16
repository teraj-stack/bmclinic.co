import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Public preview reads only. The original endpoint allowed anyone to modify
// and delete state and depended on ephemeral serverless filesystem storage.
export async function GET() {
  return NextResponse.json({
    domain: 'bmclinic.co',
    status: 'PREVIEW_READ_ONLY',
    generated_at: new Date().toISOString(),
    pages: [],
  }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST() {
  return NextResponse.json({ error: 'Zapisywanie danych jest wyłączone w wersji demonstracyjnej.' }, { status: 403 });
}
export async function DELETE() {
  return NextResponse.json({ error: 'Usuwanie danych jest wyłączone w wersji demonstracyjnej.' }, { status: 403 });
}
