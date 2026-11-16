import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Telemetry persistence must use authenticated, consent-aware durable storage.
// The serverless /tmp fallback was neither durable nor appropriate for patient events.
export async function GET() {
  return NextResponse.json({ ok: true, domain: 'bmclinic.co', events: [], mode: 'preview' }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
export async function POST() {
  return NextResponse.json({ ok: false, mode: 'preview', error: 'Telemetria jest wyłączona w wersji demonstracyjnej.' }, { status: 503 });
}
