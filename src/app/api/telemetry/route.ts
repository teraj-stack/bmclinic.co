import { NextResponse } from 'next/server';
import fs from 'fs';

const TMP_EVENTS_PATH = '/tmp/bmclinic_telemetry_events.json';

export async function GET() {
  try {
    if (fs.existsSync(TMP_EVENTS_PATH)) {
      const events = JSON.parse(fs.readFileSync(TMP_EVENTS_PATH, 'utf-8'));
      return NextResponse.json({ ok: true, domain: 'bmclinic.co', events });
    }
  } catch {
    // Fallback empty
  }
  return NextResponse.json({ ok: true, domain: 'bmclinic.co', events: [] });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entry = {
      id: `EVT-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      ...payload,
    };

    try {
      const existing = fs.existsSync(TMP_EVENTS_PATH)
        ? JSON.parse(fs.readFileSync(TMP_EVENTS_PATH, 'utf-8'))
        : [];
      const nextEvents = [entry, ...(Array.isArray(existing) ? existing : [])].slice(0, 100);
      fs.writeFileSync(TMP_EVENTS_PATH, JSON.stringify(nextEvents, null, 2), 'utf-8');
    } catch {
      // Ignore filesystem errors on restricted runtimes
    }

    return NextResponse.json({
      ok: true,
      domain: 'bmclinic.co',
      receivedAt: entry.receivedAt,
      eventId: entry.id,
      payload,
      status: 'Zarejestrowano zdarzenie telemetryczne pacjenta dla Agenta AI.',
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Błąd zapisu telemetrii' },
      { status: 500 }
    );
  }
}
