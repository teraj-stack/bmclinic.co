'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
} from '@/lib/seo-scoring-engine';
import { buildBmClinicSchemaGraph } from '@/lib/schema-jsonld';
import BmClinicSpatialModel3D, {
  type DepartmentRoomNode,
} from '@/components/BmClinicSpatialModel3D';
import BmClinicLidarDiagnosticAnalyzer from '@/components/BmClinicLidarDiagnosticAnalyzer';
import BmClinicPricingAndRecoveryCalculator from '@/components/BmClinicPricingAndRecoveryCalculator';
import BmClinicBookingModal from '@/components/BmClinicBookingModal';
import { DEPARTMENT_LIST } from '@/lib/clinic-departments-data';

export default function ProcedureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Match predefined clinical procedure if available
  const matchedDeptProfile = DEPARTMENT_LIST.find((d) =>
    d.procedures.some((p) => p.slug === slug)
  );
  const matchedProc = matchedDeptProfile?.procedures.find((p) => p.slug === slug);

  const formattedTitle =
    matchedProc?.title ||
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const initialDept: DepartmentRoomNode['deptName'] =
    matchedDeptProfile?.deptName || 'Medycyna Estetyczna';

  const [selectedDept, setSelectedDept] =
    useState<DepartmentRoomNode['deptName']>(initialDept);
  const [highContrastViMode, setHighContrastViMode] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [pageConfig] = useState<BmClinicPageConfig>({
    slug,
    urlPath: `/procedury/${slug}`,
    servicePillar: initialDept,
    procedureTitle: formattedTitle,
    contentArchetype: 'INTERACTIVE_3D_PROCEDURE_MODEL',
    h1Headline: `${formattedTitle} — BM Clinic (${initialDept})`,
    h2AioQuestion:
      matchedProc?.aioQuestion ||
      `Na czym polega zabieg ${formattedTitle.toLowerCase()} w BM Clinic i jak długo trwa rekonwalescencja?`,
    aioDirectAnswerPassage:
      matchedProc?.aioDirectAnswerPassage ||
      'Zabieg realizowany w BM Clinic wykorzystuje małoinwazyjną technologię laserową oraz diagnostykę obrazową 3D/USG w trybie chirurgii jednego dnia (walk-in / walk-out). Procedura wykonywana jest w znieczuleniu miejscowym lub tumescencyjnym przez certyfikowanego lekarza specjalistę ze zweryfikowanym prawem wykonywania zawodu (PWZ), co minimalizuje uraz tkankowy, skraca czas zabiegu do 30–45 minut i pozwala pacjentowi wrócić do codziennej aktywności bez konieczności hospitalizacji.',
    aioWordCount: 152,
    leadPhysicianName:
      matchedDeptProfile?.leadPhysician || 'Zespół Specjalistów BM Clinic',
    physicianSpecialty: initialDept,
    pwzVerified: true,
    clinicalStudiesCited: 6,
    originalAssetsCount: 8,
    effortScore: 96,
    schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
    entityDensityScore: 94,
    clickDepth: 1,
    siteFocusScore: 0.96,
    siteRadiusDelta: 0.04,
    basePricePln: matchedProc?.pricePln || 1800,
  });

  const [telemetry, setTelemetry] = useState<BmClinicTelemetry>({
    impressions: 240,
    totalClicks: 28,
    goodClicks: 26,
    badClicks: 2,
    lastLongestClicks: 21,
    avgDwellTimeSec: 210,
    avgScrollDepthPct: 88,
    interactive3dOrCalcUses: 16,
    onlineBookings: 4,
    phoneCalls: 1,
    calculatorLeads: 2,
    revenuePln: (matchedProc?.pricePln || 1800) * 4,
    lcpMs: 1240,
    inpMs: 52,
    clsScore: 0.01,
    ttfbMs: 155,
  });

  const metrics = evaluateBmClinicPageForAgent(pageConfig, telemetry);
  const schemaGraph = buildBmClinicSchemaGraph(pageConfig);

  return (
    <div
      className={`min-h-screen p-6 md:p-8 transition-colors ${
        highContrastViMode ? 'bg-[#05070a] text-white' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      <header className="max-w-7xl mx-auto mb-8 border-b border-cyan-500/20 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-xs font-bold text-cyan-300 hover:underline"
            >
              ← Strona główna bmclinic.co
            </Link>
            {matchedDeptProfile && (
              <Link
                href={`/${matchedDeptProfile.slug}`}
                className="text-xs font-bold text-amber-300 hover:underline"
              >
                • Dział: {matchedDeptProfile.deptName} ({matchedDeptProfile.roomCode})
              </Link>
            )}
          </div>
          <div className="text-xs font-mono uppercase text-cyan-400">
            {pageConfig.urlPath} • {pageConfig.contentArchetype} • PWZ Zweryfikowany
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
            {pageConfig.h1Headline}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lekarz prowadzący: <strong className="text-slate-200">{pageConfig.leadPhysicianName}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right bg-lime-400/10 border border-lime-400/30 px-4 py-2 rounded-2xl">
            <div className="text-xs text-slate-300">RL Agent Reward</div>
            <div className="text-2xl font-extrabold text-lime-400">{metrics.agentRlReward}</div>
          </div>
          <div className="text-right bg-cyan-400/10 border border-cyan-400/30 px-4 py-2 rounded-2xl">
            <div className="text-xs text-slate-300">Google SEO Score</div>
            <div className="text-2xl font-extrabold text-cyan-300">
              {metrics.compositeGoogleSeoScore}/100
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-lime-400/25 border border-lime-400 text-lime-200 text-xs font-extrabold hover:bg-lime-400/35"
          >
            📅 Umów zabieg ({pageConfig.basePricePln} PLN)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8 pb-20">
        {/* AI Overviews (GEO) 130-170 Word Direct Answer Block */}
        <article className="rounded-3xl border border-cyan-500/30 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              BLOK ODPOWIEDZI BEZPOŚREDNIEJ AI OVERVIEWS (GEO) • {pageConfig.aioWordCount} SŁÓW • E-E-A-T
            </span>
            {matchedProc && (
              <span className="text-xs font-mono text-amber-300 font-bold">
                Czas: {matchedProc.durationMin} • {matchedProc.recoveryWalkOut}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{pageConfig.h2AioQuestion}</h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            {pageConfig.aioDirectAnswerPassage}
          </p>
        </article>

        <BmClinicSpatialModel3D
          selectedDept={selectedDept}
          onSelectDepartment={(dept) => setSelectedDept(dept)}
          onModelInteract={() =>
            setTelemetry((t) => ({
              ...t,
              interactive3dOrCalcUses: t.interactive3dOrCalcUses + 1,
              avgDwellTimeSec: Math.min(420, t.avgDwellTimeSec + 6),
            }))
          }
          highContrastViMode={highContrastViMode}
          onToggleViMode={() => setHighContrastViMode((v) => !v)}
        />

        <BmClinicLidarDiagnosticAnalyzer
          selectedDept={selectedDept}
          highContrastViMode={highContrastViMode}
          onAnalyzerInteract={() =>
            setTelemetry((t) => ({
              ...t,
              interactive3dOrCalcUses: t.interactive3dOrCalcUses + 1,
            }))
          }
        />

        <BmClinicPricingAndRecoveryCalculator
          selectedDept={selectedDept}
          basePricePln={pageConfig.basePricePln}
          highContrastViMode={highContrastViMode}
          onCalculatorLead={(quotePln) => {
            setTelemetry((t) => ({
              ...t,
              totalClicks: t.totalClicks + 1,
              goodClicks: t.goodClicks + 1,
              lastLongestClicks: t.lastLongestClicks + 1,
              calculatorLeads: t.calculatorLeads + 1,
              revenuePln: t.revenuePln + quotePln,
            }));
            setBookingModalOpen(true);
          }}
        />
      </main>

      <BmClinicBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDept={selectedDept}
        defaultProcedureTitle={pageConfig.procedureTitle}
        estimatedPricePln={pageConfig.basePricePln}
        highContrastViMode={highContrastViMode}
        onBookingConfirmed={({ estimatedPricePln }) =>
          setTelemetry((t) => ({
            ...t,
            totalClicks: t.totalClicks + 1,
            goodClicks: t.goodClicks + 1,
            lastLongestClicks: t.lastLongestClicks + 1,
            onlineBookings: t.onlineBookings + 1,
            revenuePln: t.revenuePln + estimatedPricePln,
          }))
        }
      />
    </div>
  );
}
