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

export interface CeoAlert {
  id: string;
  severity: 'INFO' | 'UWAGA' | 'KRYTYCZNY';
  area: 'RUCH_PACJENTOW' | 'CEO' | 'AEO';
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
  alerts: CeoAlert[];
}

export interface UnifiedAnalyticsDbSnapshot {
  generatedAt: string;
  storageMode: 'LOCAL_JSON_DB';
  dbFilePath: string;
  patientFlow: PatientFlowRecord[];
  roomOccupancy: RoomOccupancySummary[];
  aeoSignals: AeoSeoPageSignal[];
  ceo: CeoMetricsSummary;
}
