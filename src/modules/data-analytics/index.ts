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
  ConsumableItemRecord,
  InstrumentSetRecord,
  InstrumentSetStatus,
  PatientFlowRecord,
  PatientFlowStage,
  PatientPriority,
  PostOpAlertLevel,
  PostOpCareRecord,
  PostOpMilestone,
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

export const INSTRUMENT_STATUS_FLOW: readonly InstrumentSetStatus[] = [
  'STERYLNY',
  'W_UZYCIU',
  'DO_STERYLIZACJI',
  'W_AUTOKLAWIE',
] as const;

export const POST_OP_MILESTONES: readonly PostOpMilestone[] = [
  'D+1',
  'D+7',
  'D+30',
  'ZAKONCZONO',
] as const;

const CONTROL_DB_PATH = path.join(process.cwd(), 'db', 'control_center_db.json');
const AGENT_STATE_PATH = path.join(process.cwd(), 'public', 'bmclinic_agent_state.json');

interface PersistedControlDb {
  version: number;
  updatedAt: string;
  patientFlow: PatientFlowRecord[];
  instrumentSets: InstrumentSetRecord[];
  consumables: ConsumableItemRecord[];
  postOpCare: PostOpCareRecord[];
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
      physicianName: 'Dr Jan Bujok',
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
      physicianName: 'Dr Jan Bujok',
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
      physicianName: 'Dr Jan Bujok',
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
      physicianName: 'Dr Jan Bujok',
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

function buildInitialInstrumentSets(): InstrumentSetRecord[] {
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
  return [
    {
      id: 'inst-1',
      code: 'ZEST-PROK-01',
      name: 'Zestaw proktologiczny LHP / anoskopia',
      roomCode: 'GAB-103',
      status: 'STERYLNY',
      lastSterilizedAt: now.slice(0, 10),
      expiresAt: expires,
      cycleCount: 42,
    },
    {
      id: 'inst-2',
      code: 'ZEST-FLEB-02',
      name: 'Zestaw flebologiczny EVLT 1470 nm + tumescencja',
      roomCode: 'GAB-102',
      status: 'W_UZYCIU',
      lastSterilizedAt: now.slice(0, 10),
      expiresAt: expires,
      cycleCount: 38,
    },
    {
      id: 'inst-3',
      code: 'ZEST-CHIR-03',
      name: 'Zestaw chirurgiczny RF + pobieranie histopatologii',
      roomCode: 'GAB-104',
      status: 'DO_STERYLIZACJI',
      lastSterilizedAt: now.slice(0, 10),
      expiresAt: expires,
      cycleCount: 51,
    },
    {
      id: 'inst-4',
      code: 'ZEST-EST-01',
      name: 'Zestaw końcówek laserowych + chłodzenie kontaktowe',
      roomCode: 'GAB-101',
      status: 'STERYLNY',
      lastSterilizedAt: now.slice(0, 10),
      expiresAt: expires,
      cycleCount: 29,
    },
  ];
}

function buildInitialConsumables(): ConsumableItemRecord[] {
  return [
    {
      id: 'cons-1',
      sku: 'FIB-1470-RAD',
      name: 'Włókno laserowe radialne 1470 nm (jednorazowe)',
      category: 'LASER',
      unit: 'szt.',
      stockQty: 4,
      minThreshold: 5,
      usedToday: 2,
      unitCostPln: 680,
    },
    {
      id: 'cons-2',
      sku: 'KIT-PRP-HD',
      name: 'Zestaw probówek autologicznych PRP / I-PRF',
      category: 'LASER',
      unit: 'kpl.',
      stockQty: 14,
      minThreshold: 6,
      usedToday: 3,
      unitCostPln: 190,
    },
    {
      id: 'cons-3',
      sku: 'SUT-40-MON',
      name: 'Szwy chirurgiczne monofilamentowe 4-0 + pojemnik hist-pat',
      category: 'CHIRURGIA',
      unit: 'kpl.',
      stockQty: 18,
      minThreshold: 8,
      usedToday: 2,
      unitCostPln: 65,
    },
    {
      id: 'cons-4',
      sku: 'DRESS-STER-L',
      name: 'Opatrunki jałowe pooperacyjne + kompresy',
      category: 'OPATRUNKI',
      unit: 'op.',
      stockQty: 9,
      minThreshold: 10,
      usedToday: 4,
      unitCostPln: 42,
    },
  ];
}

function buildInitialPostOpCare(): PostOpCareRecord[] {
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  return [
    {
      id: 'po-2001',
      patientCode: 'BM-2026-037',
      departmentName: 'Flebologia',
      procedureTitle: 'Wewnątrznaczyniowe Laserowe Leczenie Żylaków EVLT 1470 nm',
      physicianName: 'Dr Jan Bujok',
      careCoordinator: 'Milena Skrzyńska',
      milestone: 'D+1',
      nextCheckDate: tomorrow,
      alertLevel: 'KONTROLA',
      notes: 'Kontakt telefoniczny po 24h: ocena komfortu, przypomnienie o pończosze uciskowej.',
      updatedAt: now,
    },
    {
      id: 'po-2002',
      patientCode: 'BM-2026-035',
      departmentName: 'Proktologia',
      procedureTitle: 'Laserowa Plastyka Hemoroidów LHP 1470 nm',
      physicianName: 'Dr Jan Bujok',
      careCoordinator: 'Milena Skrzyńska',
      milestone: 'D+7',
      nextCheckDate: nextWeek,
      alertLevel: 'BRAK',
      notes: 'Gojenie prawidłowe. Zaplanowana wizyta kontrolna D+7.',
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
        const db: PersistedControlDb = {
          version: parsed.version ?? 2,
          updatedAt: parsed.updatedAt ?? new Date().toISOString(),
          patientFlow: parsed.patientFlow,
          instrumentSets: Array.isArray(parsed.instrumentSets)
            ? parsed.instrumentSets
            : buildInitialInstrumentSets(),
          consumables: Array.isArray(parsed.consumables)
            ? parsed.consumables
            : buildInitialConsumables(),
          postOpCare: Array.isArray(parsed.postOpCare)
            ? parsed.postOpCare
            : buildInitialPostOpCare(),
        };
        if (!parsed.instrumentSets || !parsed.consumables || !parsed.postOpCare) {
          writeControlDb(db);
        }
        return db;
      }
    }
  } catch {
    // fallback to seed
  }

  const initial: PersistedControlDb = {
    version: 2,
    updatedAt: new Date().toISOString(),
    patientFlow: buildInitialPatientFlow(),
    instrumentSets: buildInitialInstrumentSets(),
    consumables: buildInitialConsumables(),
    postOpCare: buildInitialPostOpCare(),
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
      leadPhysician: 'Dr Jan Bujok',
      activePatients: active.length,
      avgWaitMinutes: avgWait,
      loadPct,
      status,
    };
  });
}

function computeCeoSummary(
  db: PersistedControlDb,
  roomOccupancy: RoomOccupancySummary[],
  aeoSignals: AeoSeoPageSignal[],
): CeoMetricsSummary {
  const { patientFlow, instrumentSets, consumables, postOpCare } = db;
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

  const lowStockConsumables = consumables.filter(
    (c) => c.stockQty < c.minThreshold,
  );
  const sterileSetsReadyCount = instrumentSets.filter(
    (i) => i.status === 'STERYLNY',
  ).length;
  const activePostOp = postOpCare.filter((p) => p.milestone !== 'ZAKONCZONO');
  const urgentPostOp = activePostOp.filter(
    (p) => p.alertLevel === 'PILNY_KONTAKT',
  );

  const alerts: CeoAlert[] = [];

  for (const po of urgentPostOp) {
    alerts.push({
      id: `alert-postop-${po.id}`,
      severity: 'KRYTYCZNY',
      area: 'POOPERACYJNE',
      message: `PILNY KONTAKT pooperacyjny: ${po.patientCode} (${po.departmentName}, ${po.milestone}) — koordynacja: ${po.careCoordinator}.`,
    });
  }

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

  for (const item of lowStockConsumables) {
    alerts.push({
      id: `alert-stock-${item.id}`,
      severity: item.stockQty <= 2 ? 'KRYTYCZNY' : 'UWAGA',
      area: 'NARZEDZIA_I_ZUZYCIA',
      message: `Niski stan materiału ${item.name} (${item.sku}): ${item.stockQty} ${item.unit} (minimum: ${item.minThreshold} ${item.unit}).`,
    });
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
        'Wszystkie gabinety, stany narzędzi/zużyć, opieka pooperacyjna oraz wskaźniki AEO/SEO mieszczą się w normie.',
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
    lowStockConsumablesCount: lowStockConsumables.length,
    sterileSetsReadyCount,
    activePostOpCount: activePostOp.length,
    urgentPostOpAlertsCount: urgentPostOp.length,
    alerts,
  };
}

export function getUnifiedAnalyticsDbSnapshot(): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  const aeoSignals = loadAeoSeoSignals();
  const roomOccupancy = computeRoomOccupancy(db.patientFlow);
  const ceo = computeCeoSummary(db, roomOccupancy, aeoSignals);

  return {
    generatedAt: new Date().toISOString(),
    storageMode: 'LOCAL_JSON_DB',
    dbFilePath: 'db/control_center_db.json',
    patientFlow: db.patientFlow,
    roomOccupancy,
    aeoSignals,
    instrumentSets: db.instrumentSets,
    consumables: db.consumables,
    postOpCare: db.postOpCare,
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
    physicianName: 'Dr Jan Bujok',
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
  let newlyDischarged: PatientFlowRecord | null = null;

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
    const updated: PatientFlowRecord = {
      ...item,
      stage: resolvedStage,
      waitMinutes: resolvedStage === 'WYPIS' ? 0 : Math.max(0, item.waitMinutes - 4),
      updatedAt: new Date().toISOString(),
    };
    if (item.stage !== 'WYPIS' && resolvedStage === 'WYPIS') {
      newlyDischarged = updated;
    }
    return updated;
  });

  // Automatyczne przejęcie pacjenta z etapu WYPIS do Slotu 2 (Prowadzenie pooperacyjne)
  if (newlyDischarged) {
    const discharged: PatientFlowRecord = newlyDischarged;
    const alreadyInPostOp = db.postOpCare.some(
      (p) => p.patientCode === discharged.patientCode,
    );
    if (!alreadyInPostOp) {
      const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
      db.postOpCare = [
        {
          id: `po-${Date.now()}`,
          patientCode: discharged.patientCode,
          departmentName: discharged.departmentName,
          procedureTitle: discharged.procedureTitle,
          physicianName: discharged.physicianName,
          careCoordinator: 'Milena Skrzyńska',
          milestone: 'D+1',
          nextCheckDate: tomorrow,
          alertLevel: 'KONTROLA',
          notes: 'Automatycznie przejęty po etapie WYPIS — zaplanowany kontakt kontrolny D+1.',
          updatedAt: new Date().toISOString(),
        },
        ...db.postOpCare,
      ];
    }
  }

  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}

/* ===== OPERACJE SLOTU 1: OBRÓT NARZĘDZI I ZUŻYĆ ===== */
export function advanceInstrumentStatus(id: string): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  const today = new Date().toISOString().slice(0, 10);
  const expires = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

  db.instrumentSets = db.instrumentSets.map((set) => {
    if (set.id !== id) return set;
    const idx = INSTRUMENT_STATUS_FLOW.indexOf(set.status);
    const nextStatus =
      INSTRUMENT_STATUS_FLOW[(idx + 1) % INSTRUMENT_STATUS_FLOW.length];
    const completedCycle =
      set.status === 'W_AUTOKLAWIE' && nextStatus === 'STERYLNY';
    return {
      ...set,
      status: nextStatus,
      lastSterilizedAt: completedCycle ? today : set.lastSterilizedAt,
      expiresAt: completedCycle ? expires : set.expiresAt,
      cycleCount: completedCycle ? set.cycleCount + 1 : set.cycleCount,
    };
  });

  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}

export function adjustConsumableStock(
  id: string,
  delta: number,
): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  db.consumables = db.consumables.map((item) => {
    if (item.id !== id) return item;
    const nextQty = Math.max(0, item.stockQty + delta);
    return {
      ...item,
      stockQty: nextQty,
      usedToday: delta < 0 ? item.usedToday + Math.abs(delta) : item.usedToday,
    };
  });
  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}

/* ===== OPERACJE SLOTU 2: PROWADZENIE POOPERACYJNE ===== */
export function advancePostOpMilestone(id: string): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  db.postOpCare = db.postOpCare.map((entry) => {
    if (entry.id !== id) return entry;
    const idx = POST_OP_MILESTONES.indexOf(entry.milestone);
    const nextMilestone =
      POST_OP_MILESTONES[Math.min(idx + 1, POST_OP_MILESTONES.length - 1)];
    const daysAhead =
      nextMilestone === 'D+7' ? 6 : nextMilestone === 'D+30' ? 23 : 0;
    const nextDate =
      nextMilestone === 'ZAKONCZONO'
        ? 'Zakończono'
        : new Date(Date.now() + daysAhead * 86_400_000).toISOString().slice(0, 10);
    return {
      ...entry,
      milestone: nextMilestone,
      nextCheckDate: nextDate,
      alertLevel: nextMilestone === 'ZAKONCZONO' ? 'BRAK' : entry.alertLevel,
      updatedAt: new Date().toISOString(),
    };
  });
  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}

export function setPostOpAlert(
  id: string,
  alertLevel: PostOpAlertLevel,
): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  db.postOpCare = db.postOpCare.map((entry) =>
    entry.id === id
      ? { ...entry, alertLevel, updatedAt: new Date().toISOString() }
      : entry,
  );
  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}

export function addPostOpPatient(input: {
  patientCode: string;
  departmentName: string;
  procedureTitle: string;
  notes?: string;
}): UnifiedAnalyticsDbSnapshot {
  const db = readControlDb();
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  db.postOpCare = [
    {
      id: `po-${Date.now()}`,
      patientCode: input.patientCode.trim() || `BM-${Date.now().toString().slice(-4)}`,
      departmentName: input.departmentName || 'Flebologia',
      procedureTitle: input.procedureTitle.trim() || 'Zabieg ambulatoryjny',
      physicianName: 'Dr Jan Bujok',
      careCoordinator: 'Milena Skrzyńska',
      milestone: 'D+1',
      nextCheckDate: tomorrow,
      alertLevel: 'KONTROLA',
      notes: input.notes?.trim() || 'Plan kontroli pooperacyjnej D+1 / D+7 / D+30.',
      updatedAt: new Date().toISOString(),
    },
    ...db.postOpCare,
  ];
  db.updatedAt = new Date().toISOString();
  writeControlDb(db);
  return getUnifiedAnalyticsDbSnapshot();
}
