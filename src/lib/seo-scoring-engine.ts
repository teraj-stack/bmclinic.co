export interface BmClinicPageConfig {
  slug: string;
  urlPath: string;
  servicePillar: string;
  procedureTitle: string;
  contentArchetype:
    | 'INTERACTIVE_3D_PROCEDURE_MODEL'
    | 'TRANSPARENT_PRICING_CALCULATOR'
    | 'DOCTOR_QA_CASE_STUDY_BEFORE_AFTER'
    | 'SPATIAL_3D_CLINIC_TOUR';
  h1Headline: string;
  h2AioQuestion: string;
  aioDirectAnswerPassage: string;
  aioWordCount: number;
  leadPhysicianName: string;
  physicianSpecialty: string;
  pwzVerified: boolean;
  clinicalStudiesCited: number;
  originalAssetsCount: number;
  effortScore: number;
  schemaTypes: string[];
  entityDensityScore: number;
  clickDepth: number;
  siteFocusScore: number;
  siteRadiusDelta: number;
  basePricePln: number;
}

export interface BmClinicTelemetry {
  impressions: number;
  totalClicks: number;
  goodClicks: number;
  badClicks: number;
  lastLongestClicks: number;
  avgDwellTimeSec: number;
  avgScrollDepthPct: number;
  interactive3dOrCalcUses: number;
  onlineBookings: number;
  phoneCalls: number;
  calculatorLeads: number;
  revenuePln: number;
  lcpMs: number;
  inpMs: number;
  clsScore: number;
  ttfbMs: number;
}

export function evaluateBmClinicPageForAgent(page: BmClinicPageConfig, tel: BmClinicTelemetry) {
  const totalClicks = Math.max(tel.totalClicks, 1);
  const goodRatio = tel.goodClicks / Math.max(tel.goodClicks + tel.badClicks, 1);
  const llcRatio = tel.lastLongestClicks / totalClicks;
  const dwellNorm = Math.min(tel.avgDwellTimeSec / 180.0, 1.0);
  const navboostScore = goodRatio * 50.0 + llcRatio * 30.0 + dwellNorm * 20.0;

  const pwzScore = page.pwzVerified ? 25.0 : 0.0;
  const studiesScore = Math.min(page.clinicalStudiesCited / 6.0, 1.0) * 20.0;
  const assetsScore = Math.min(page.originalAssetsCount / 8.0, 1.0) * 20.0;
  const effortPart = (page.effortScore / 100.0) * 35.0;
  const eeatScore = pwzScore + studiesScore + assetsScore + effortPart;

  const wc = page.aioWordCount;
  const passageScore = wc >= 130 && wc <= 170 ? 40.0 : wc >= 110 && wc <= 195 ? 25.0 : 10.0;
  const schemaScore = Math.min(page.schemaTypes.length / 4.0, 1.0) * 30.0;
  const entityPart = (page.entityDensityScore / 100.0) * 30.0;
  const geoScore = passageScore + schemaScore + entityPart;

  const lcpOk = tel.lcpMs <= 2500 ? 40.0 : 15.0;
  const inpOk = tel.inpMs <= 200 ? 35.0 : 10.0;
  const clsOk = tel.clsScore <= 0.1 ? 25.0 : 5.0;
  const cwvScore = lcpOk + inpOk + clsOk;

  const depthScore = page.clickDepth === 1 ? 40.0 : page.clickDepth === 2 ? 25.0 : 5.0;
  const focusPart = page.siteFocusScore * 40.0;
  const radiusPart = Math.max(0.0, (1.0 - page.siteRadiusDelta) * 20.0);
  const domainScore = depthScore + focusPart + radiusPart;

  const compositeGoogleSeoScore =
    navboostScore * 0.35 +
    eeatScore * 0.25 +
    geoScore * 0.2 +
    cwvScore * 0.1 +
    domainScore * 0.1;

  const totalLeads = tel.onlineBookings + tel.phoneCalls + tel.calculatorLeads;
  const conversionRatePct = (totalLeads / totalClicks) * 100.0;
  const widgetRatePct = (tel.interactive3dOrCalcUses / totalClicks) * 100.0;
  const salesEffectivenessScore = Math.min(100.0, conversionRatePct * 6.2 + widgetRatePct * 0.75);
  const agentRlReward = Number(
    ((salesEffectivenessScore * 0.6 + compositeGoogleSeoScore * 0.4) / 100.0).toFixed(4)
  );

  return {
    conversionRatePct: Number(conversionRatePct.toFixed(2)),
    navboostGoodRatioPct: Number((goodRatio * 100.0).toFixed(2)),
    compositeGoogleSeoScore: Number(compositeGoogleSeoScore.toFixed(2)),
    salesEffectivenessScore: Number(salesEffectivenessScore.toFixed(2)),
    agentRlReward,
  };
}
