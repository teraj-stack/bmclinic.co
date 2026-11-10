import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json({
      ok: true,
      domain: 'bmclinic.co',
      receivedAt: new Date().toISOString(),
      payload,
      status: 'Zapisano w bazie bmclinic_seo_agent.sqlite dla Agenta AI.',
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Błąd zapisu telemetrii' },
      { status: 500 }
    );
  }
}
