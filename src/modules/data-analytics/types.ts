export type PatientFlowStage =
  | 'REJESTRACJA'
  | 'KWALIFIKACJA'
  | 'KONSULTACJA'
  | 'ZABIEG'
  | 'WYPIS';

export type AcquisitionChannel =
  | 'AEO_AI_OVERVIEW'
  | 'GOOGLE_SEO'
  | 'DIRECT'
  | 'REFERRAL';

export type PatientPriority = 'STANDARD' | 'PILNY' | 'VIP';

export interface PatientFlowRecord {
  id: string;
  patientCode: string;
  departmentSlug: string;
  departmentName: string;
  roomCode: string;
  procedureTitle: string;
  physicianName: string;
  stage: PatientFlowStage;
  channel: AcquisitionChannel;
  priority: PatientPriority;
  waitMinutes: number;
  estimatedValuePln: number;
  updatedAt: string;
}

export interface RoomOccupancySummary {
  roomCode: string;
  departmentSlug: string;
  departmentName: string;
  leadPhysician: string;
  activePatients: number;
  avgWaitMinutes: number;
  loadPct: number;
  status: 'OPTYMALNE' | 'WYSOKIE' | 'PRZECIAZONE';
}

export interface AeoSeoPageSignal {
  slug: string;
  urlPath: string;
  servicePillar: string;
  procedureTitle: string;
  h2AioQuestion: string;
  aioWordCount: number;
  aioPassageOptimal: boolean;
  schemaTypes: string[];
  compositeGoogleSeoScore: number;
  salesEffectivenessScore: number;
  conversionRatePct: number;
  navboostGoodRatioPct: number;
  agentRlReward: number;
  revenuePln: number;
  leadsTotal: number;
  insight: string;
}

/* ===== SLOT 1: OBRÓT NARZĘDZI I ZUŻYĆ ===== */
export type InstrumentSetStatus =
  | 'STERYLNY'
  | 'W_UZYCIU'
  | 'DO_STERYLIZACJI'
  | 'W_AUTOKLAWIE';

export interface InstrumentSetRecord {
  id: string;
  code: string;
  name: string;
  roomCode: string;
  status: InstrumentSetStatus;
  lastSterilizedAt: string;
  expiresAt: string;
  cycleCount: number;
}

export type ConsumableCategory =
  | 'LASER'
  | 'CHIRURGIA'
  | 'OPATRUNKI'
  | 'DEZYNFEKCJA';

export interface ConsumableItemRecord {
  id: string;
  sku: string;
  name: string;
  category: ConsumableCategory;
  unit: string;
  stockQty: number;
  minThreshold: number;
  usedToday: number;
  unitCostPln: number;
}

/* ===== SLOT 2: PROWADZENIE POOPERACYJNE ===== */
export type PostOpMilestone = 'D+1' | 'D+7' | 'D+30' | 'ZAKONCZONO';
export type PostOpAlertLevel = 'BRAK' | 'KONTROLA' | 'PILNY_KONTAKT';

export interface PostOpCareRecord {
  id: string;
  patientCode: string;
  departmentName: string;
  procedureTitle: string;
  physicianName: string;
  careCoordinator: string;
  milestone: PostOpMilestone;
  nextCheckDate: string;
  alertLevel: PostOpAlertLevel;
  notes: string;
  updatedAt: string;
}

export interface CeoAlert {
  id: string;
  severity: 'INFO' | 'UWAGA' | 'KRYTYCZNY';
  area: 'RUCH_PACJENTOW' | 'CEO' | 'AEO' | 'NARZEDZIA_I_ZUZYCIA' | 'POOPERACYJNE';
  message: string;
}

export interface CeoMetricsSummary {
  totalPipelineRevenuePln: number;
  realizedTelemetryRevenuePln: number;
  activePatientsCount: number;
  completedTodayCount: number;
  avgWaitMinutes: number;
  avgConversionRatePct: number;
  avgAeoSeoScore: number;
  aeoTrafficSharePct: number;
  lowStockConsumablesCount: number;
  sterileSetsReadyCount: number;
  activePostOpCount: number;
  urgentPostOpAlertsCount: number;
  alerts: CeoAlert[];
}

export interface UnifiedAnalyticsDbSnapshot {
  generatedAt: string;
  storageMode: 'LOCAL_JSON_DB';
  dbFilePath: string;
  patientFlow: PatientFlowRecord[];
  roomOccupancy: RoomOccupancySummary[];
  aeoSignals: AeoSeoPageSignal[];
  instrumentSets: InstrumentSetRecord[];
  consumables: ConsumableItemRecord[];
  postOpCare: PostOpCareRecord[];
  ceo: CeoMetricsSummary;
}
