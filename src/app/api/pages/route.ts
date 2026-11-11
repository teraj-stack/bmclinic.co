import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
} from '@/lib/seo-scoring-engine';

const STATE_PATH = path.join(process.cwd(), 'public', 'bmclinic_agent_state.json');

interface StoredAgentPage {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  metrics: ReturnType<typeof evaluateBmClinicPageForAgent>;
  createdAt: string;
}

function readAgentState(): {
  domain: string;
  status: string;
  generated_at: string;
  pages: StoredAgentPage[];
} {
  try {
    if (fs.existsSync(STATE_PATH)) {
      const raw = fs.readFileSync(STATE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        domain: 'bmclinic.co',
        status: parsed.status || 'CLEAN_FOUNDATION_NO_PRELOADED_PILLARS',
        generated_at: parsed.generated_at || new Date().toISOString(),
        pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      };
    }
  } catch {
    // Fallback to clean empty foundation
  }
  return {
    domain: 'bmclinic.co',
    status: 'CLEAN_FOUNDATION_NO_PRELOADED_PILLARS',
    generated_at: new Date().toISOString(),
    pages: [],
  };
}

function writeAgentState(pages: StoredAgentPage[]) {
  const payload = {
    domain: 'bmclinic.co',
    status: pages.length === 0 ? 'CLEAN_FOUNDATION_NO_PRELOADED_PILLARS' : 'ACTIVE_TELEMETRY_ENGINE',
    generated_at: new Date().toISOString(),
    pages,
  };
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

export async function GET() {
  const state = readAgentState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const state = readAgentState();

    const page: BmClinicPageConfig = body.page;
    const telemetry: BmClinicTelemetry = body.telemetry;
    const metrics = evaluateBmClinicPageForAgent(page, telemetry);

    const newRecord: StoredAgentPage = {
      id: body.id || Date.now(),
      page,
      telemetry,
      metrics,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = state.pages.findIndex((p) => p.page.slug === page.slug);
    if (existingIdx >= 0) {
      state.pages[existingIdx] = newRecord;
    } else {
      state.pages.push(newRecord);
    }

    const updated = writeAgentState(state.pages);
    return NextResponse.json({ ok: true, state: updated, record: newRecord });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Błąd zapisu strony bmclinic.co' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const updated = writeAgentState([]);
  return NextResponse.json({
    ok: true,
    message: 'Wyczyszczono bazę bmclinic.co do stanu czystego (0 predefiniowanych filarów).',
    state: updated,
  });
}
