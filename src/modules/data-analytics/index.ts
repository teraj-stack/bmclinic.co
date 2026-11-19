import fs from 'node:fs';
import path from 'node:path';
import {
  DEPARTMENT_LIST,
  DEPARTMENT_PROFILES,
  buildFlagshipSeedEntries,
} from '@/lib/clinic-departments-data';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
} from '@/lib/seo-scoring-engine';
import type {
  AcquisitionChannel,
  AeoSeoPageSignal,
  CeoAlert,
  CeoMetricsSummary,
  PatientFlowRecord,
  PatientFlowStage,
  PatientPriority,
  RoomOccupancySummary,
  UnifiedAnalyticsDbSnapshot,
} from './types';

export * from './types';

export const PATIENT_FLOW_STAGES: readonly PatientFlowStage[] = [
  'REJESTRACJA',
  'KWALIFIKACJA',
  'KONSULTACJA',
  'ZABIEG',
  'WYPIS',
] as const;

const CONTROL_DB_PATH = path.join(process.cwd(), 'db', 'control_center_db.json');
const AGENT_STATE_PATH = path.join(process.cwd(), 'public', 'bmclinic_agent_state.json');

interface PersistedControlDb {
  version: number;
  updatedAt: string;
  patientFlow: PatientFlowRecord[];
}

function buildInitialPatientFlow(): PatientFlowRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'pf-1001',
      patientCode: 'BM-2026-041',
      departmentSlug: 'flebologia',
      departmentName: DEPARTMENT_PROFILES.flebologia.deptName,
      roomCode: DEPARTMENT_PROFILES.flebologia.roomCode,
      procedureTitle: DEPARTMENT_PROFILES.flebologia.procedures[0]?.title ?? 'EVLT 1470nm',
      physicianName: DEPARTMENT_PROFILES.flebologia.leadPhysician,
      stage: 'KONSULTACJA',
      channel: 'AEO_AI_OVERVIEW',
      priority: 'STANDARD',
      waitMinutes: 12,
      estimatedValuePln: DEPARTMENT_PROFILES.flebologia.procedures[0]?.pricePln ?? 4200,
      updatedAt: now,
    },
    {
      id: 'pf-1002',
      patientCode: 'BM-2026-042',
      departmentSlug: 'medycyna-estetyczna',
      departmentName: DEPARTMENT_PROFILES['medycyna-estetyczna'].deptName,
      roomCode: DEPARTMENT_PROFILES['medycyna-estetyczna'].roomCode,
      procedureTitle:
        DEPARTMENT_PROFILES['medycyna-estetyczna'].procedures[0]?.title ??
        'Laserowy Resurfacing Frakcyjny 3D',
      physicianName: DEPARTMENT_PROFILES['medycyna-estetyczna'].leadPhysician,
      stage: 'ZABIEG',
      channel: 'GOOGLE_SEO',
      priority: 'VIP',
      waitMinutes: 5,
      estimatedValuePln:
        DEPARTMENT_PROFILES['medycyna-estetyczna'].procedures[0]?.pricePln ?? 1500,
      updatedAt: now,
    },
    {
      id: 'pf-1003',
      patientCode: 'BM-2026-043',
      departmentSlug: 'proktologia',
      departmentName: DEPARTMENT_PROFILES.proktologia.deptName,
      roomCode: DEPARTMENT_PROFILES.proktologia.roomCode,
      procedureTitle: DEPARTMENT_PROFILES.proktologia.procedures[0]?.title ?? 'LHP Laser',
      physicianName: DEPARTMENT_PROFILES.proktologia.leadPhysician,
      stage: 'KWALIFIKACJA',
      channel: 'AEO_AI_OVERVIEW',
      priority: 'PILNY',
      waitMinutes: 26,
      estimatedValuePln: DEPARTMENT_PROFILES.proktologia.procedures[0]?.pricePln ?? 3600,
      updatedAt: now,
    },
    {
      id: 'pf-1004',
      patientCode: 'BM-2026-044',
      departmentSlug: 'chirurgia-ogolna',
      departmentName: DEPARTMENT_PROFILES['chirurgia-ogolna'].deptName,
      roomCode: DEPARTMENT_PROFILES['chirurgia-ogolna'].roomCode,
      procedureTitle:
        DEPARTMENT_PROFILES['chirurgia-ogolna'].procedures[0]?.title ??
        'Usuwanie znamion RF 4.0 MHz',
      physicianName: DEPARTMENT_PROFILES['chirurgia-ogolna'].leadPhysician,
      stage: 'REJESTRACJA',
      channel: 'DIRECT',
      priority: 'STANDARD',
      waitMinutes: 18,
      estimatedValuePln:
        DEPARTMENT_PROFILES['chirurgia-ogolna'].procedures[0]?.pricePln ?? 1800,
      updatedAt: now,
    },
  ];
}

function readControlDb(): PersistedControlDb {
  try {
    if (fs.existsSync(CONTROL_DB_PATH)) {
      const raw = fs.readFileSync(CONTROL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistedControlDb>;
      if (Array.isArray(parsed.patientFlow)) {
        return {
          version: parsed.version ?? 1,
          updatedAt: parsed.updatedAt ?? new Date().toISOString(),
          patientFlow: parsed.patientFlow,
        };
      }
    }
  } catch {
    // fallback to seed
  }

  const initial: PersistedControlDb = {
    version: 1,
    updatedAt: new Date().toISOString(),
    patientFlow: buildInitialPatientFlow(),
  };
  writeControlDb(initial);
  return initial;
}

function writeControlDb(db: PersistedControlDb): void {
  try {
    fs.mkdirSync(path.dirname(CONTROL_DB_PATH), { recursive: true });
    fs.writeFileSync(CONTROL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // ignore read-only fs
  }
}

function loadAeoSeoSignals(): AeoSeoPageSignal[] {
  let rawEntries: Array<{
    page: BmClinicPageConfig;
    telemetry: BmClinicTelemetry;
    insight?: string;
  }> = [];

  try {
    if (fs.existsSync(AGENT_STATE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(AGENT_STATE_PATH, 'utf-8'));
      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        rawEntries = parsed.pages;
      }
    }
  } catch {
    // fallback to flagship seeds
  }

  if (rawEntries.length === 0) {
    rawEntries = buildFlagshipSeedEntries();
  }

  return rawEntries.map((entry) => {
    const metrics = evaluateBmClinicPageForAgent(entry.page, entry.telemetry);
    const leadsTotal =
      entry.telemetry.onlineBookings +
      entry.telemetry.phoneCalls +
      entry.telemetry.calculatorLeads;
    return {
      slug: entry.page.slug,
      urlPath: entry.page.urlPath,
      servicePillar: entry.page.servicePillar,
      procedureTitle: entry.page.procedureTitle,
      h2AioQuestion: entry.page.h2AioQuestion,
      aioWordCount: entry.page.aioWordCount,
      aioPassageOptimal:
        entry.page.aioWordCount >= 130 && entry.page.aioWordCount <= 170,
      schemaTypes: entry.page.schemaTypes,
      compositeGoogleSeoScore: metrics.compositeGoogleSeoScore,
      salesEffectivenessScore: metrics.salesEffectivenessScore,
      conversionRatePct: metrics.conversionRatePct,
      navboostGoodRatioPct: metrics.navboostGoodRatioPct,
      agentRlReward: metrics.agentRlReward,
      revenuePln: entry.telemetry.revenuePln,
      leadsTotal,
      insight: entry.insight ?? '',
    };
  });
}

function computeRoomOccupancy(patientFlow: PatientFlowRecord[]): RoomOccupancySummary[] {
  return DEPARTMENT_LIST.map((dept) => {
    const active = patientFlow.filter(
      (p) => p.departmentSlug === dept.slug && p.stage !== 'WYPIS',
    );
    const avgWait =
      active.length > 0
        ? Math.round(
            active.reduce((sum, p) => sum + p.waitMinutes, 0) / active.length,
          )
        : 0;
    const loadPct = Math.min(100, active.length * 35);
    const status: RoomOccupancySummary['status'] =
      loadPct >= 85 || avgWait >= 25
        ? 'PRZECIAZONE'
        : loadPct >= 55 || avgWait >= 15
          ? 'WYSOKIE'
          : 'OPTYMALNE';

    return {
      roomCode: dept.roomCode,
      departmentSlug: dept.slug,
      departmentName: dept.deptName,
      leadPhysician: dept.leadPhysician,
      activePatients: active.length,
      avgWaitMinutes: avgWait,
      loadPct,
      status,
    };
  });
}

function computeCeoSummary(
  patientFlow: PatientFlowRecord[],
  roomOccupancy: RoomOccupancySummary[],
  aeoSignals: AeoSeoPageSignal[],
): CeoMetricsSummary {
  const activePatients = patientFlow.filter((p) => p.stage !== 'WYPIS');
  const completedToday = patientFlow.filter((p) => p.stage === 'WYPIS');

  const totalPipelineRevenuePln = patientFlow.reduce(
    (sum, p) => sum + p.estimatedValuePln,
    0,
  );
  const realizedTelemetryRevenuePln = aeoSignals.reduce(
    (sum, s) => sum + s.revenuePln,
    0,
  );

  const avgWaitMinutes =
    activePatients.length > 0
      ? Math.round(
          activePatients.reduce((sum, p) => sum + p.waitMinutes, 0) /
            activePatients.length,
        )
      : 0;

  const avgConversionRatePct =
    aeoSignals.length > 0
      ? Number(
          (
            aeoSignals.reduce((sum, s) => sum + s.conversionRatePct, 0) /
            aeoSignals.length
          ).toFixed(2),
        )
      : 0;

  const avgAeoSeoScore =
    aeoSignals.length > 0
      ? Number(
          (
            aeoSignals.reduce((sum, s) => sum + s.compositeGoogleSeoScore, 0) /
            aeoSignals.length
          ).toFixed(1),
        )
      : 0;

  const aeoPatients = patientFlow.filter(
    (p) => p.channel === 'AEO_AI_OVERVIEW',
  ).length;
  const aeoTrafficSharePct =
    patientFlow.length > 0
      ? Math.round((aeoPatients / patientFlow.length) * 100)
      : 0;

  const alerts: CeoAlert[] = [];
  for (const room of roomOccupancy) {
    if (room.status === 'PRZECIAZONE') {
      alerts.push({
        id: `alert-room-${room.roomCode}`,
        severity: 'KRYTYCZNY',
        area: 'RUCH_PACJENTOW',
        message: `${room.roomCode} (${room.departmentName}): średni czas oczekiwania ${room.avgWaitMinutes} min — rozważ przesunięcie kwalifikacji.`,
      });
    }
  }

  for (const page of aeoSignals) {
    if (!page.aioPassageOptimal) {
      alerts.push({
        id: `alert-aeo-${page.slug}`,
        severity: 'UWAGA',
        area: 'AEO',
        message: `Strona ${page.urlPath} ma blok AEO o długości ${page.aioWordCount} słów (cel: 130–170 słów).`,
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'alert-ok',
      severity: 'INFO',
      area: 'CEO',
      message:
        'Wszystkie gabinety oraz wskaźniki AEO/SEO mieszczą się w normie operacyjnej.',
    });
  }

  return {
    totalPipelineRevenuePln,
    realizedTelemetryRevenuePln,
    activePatientsCount: activePatients.length,
    completedTodayCount: completedToday.length,
    avgWaitMinutes,
    avgConversionRatePct,
    avgAeoSeoScore,
    aeoTrafficSharePct,
    alerts,
  };
}

/**
 * Zunifikowany odczyt bazy danych + silnika analitycznego (jeden moduł).
 */
export function getUnifiedAnalyticsDbSnapshot(): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  const aeoSignals = loadAeoSeoSignals();
  const roomOccupancy = computeRoomOccupancy(db.patientFlow);
  const ceo = computeCeoSummary(db.patientFlow, roomOccupancy, aeoSignals);

  return {
    generatedAt: new Date().toISOString(),
    storageMode: 'LOCAL_JSON_DB',
    dbFilePath: 'db/control_center_db.json',
    patientFlow: db.patientFlow,
    roomOccupancy,
    aeoSignals,
    ceo,
  };
}

export function addPatientToFlow(input: {
  patientCode: string;
  departmentSlug: string;
  channel: AcquisitionChannel;
  priority: PatientPriority;
  waitMinutes?: number;
}): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  const dept =
    DEPARTMENT_PROFILES[input.departmentSlug] ??
    DEPARTMENT_PROFILES['medycyna-estetyczna'];
  const proc = dept.procedures[0];

  const record: PatientFlowRecord = {
    id: `pf-${Date.now()}`,
    patientCode: input.patientCode.trim() || `BM-${Date.now().toString().slice(-4)}`,
    departmentSlug: dept.slug,
    departmentName: dept.deptName,
    roomCode: dept.roomCode,
    procedureTitle: proc?.title ?? dept.deptName,
    physicianName: dept.leadPhysician,
    stage: 'REJESTRACJA',
    channel: input.channel,
    priority: input.priority,
    waitMinutes: Math.max(0, Number(input.waitMinutes ?? 8)),
    estimatedValuePln: proc?.pricePln ?? 1500,
    updatedAt: new Date().toISOString(),
  };

  db.patientFlow = [record, ...db.patientFlow];
  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}

export function updatePatientStage(
  id: string,
  nextStage?: PatientFlowStage,
): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  db.patientFlow = db.patientFlow.map((item) => {
    if (item.id !== id) return item;
    let resolvedStage: PatientFlowStage;
    if (nextStage && PATIENT_FLOW_STAGES.includes(nextStage)) {
      resolvedStage = nextStage;
    } else {
      const idx = PATIENT_FLOW_STAGES.indexOf(item.stage);
      resolvedStage =
        PATIENT_FLOW_STAGES[Math.min(idx + 1, PATIENT_FLOW_STAGES.length - 1)];
    }
    return {
      ...item,
      stage: resolvedStage,
      waitMinutes: resolvedStage === 'WYPIS' ? 0 : Math.max(0, item.waitMinutes - 4),
      updatedAt: new Date().toISOString(),
    };
  });
  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}
