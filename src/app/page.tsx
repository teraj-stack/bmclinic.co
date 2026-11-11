'use client';

import React, { useState, useTransition } from 'react';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
  type ContentArchetype,
} from '@/lib/seo-scoring-engine';
import { buildBmClinicSchemaGraph } from '@/lib/schema-jsonld';
import BmClinicSpatialModel3D, {
  type DepartmentRoomNode,
} from '@/components/BmClinicSpatialModel3D';
import BmClinicLidarDiagnosticAnalyzer from '@/components/BmClinicLidarDiagnosticAnalyzer';
import BmClinicPricingAndRecoveryCalculator from '@/components/BmClinicPricingAndRecoveryCalculator';
import Link from 'next/link';

interface BmClinicPageEntry {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  insight: string;
}

const DEPARTMENTS: Array<{
  name: DepartmentRoomNode['deptName'];
  slug: string;
  badge: string;
  desc: string;
}> = [
  {
    name: 'Medycyna Estetyczna',
    slug: '/medycyna-estetyczna',
    badge: 'DZIAŁ 01 • LASEROTERAPIA HI-TECH',
    desc: 'Regeneracja tkankowa, laseroterapia frakcyjna i małoinwazyjne procedury anti-aging.',
  },
  {
    name: 'Flebologia',
    slug: '/flebologia',
    badge: 'DZIAŁ 02 • EVLT 1470NM & DOPPLER',
    desc: 'Diagnostyka USG Doppler 3D oraz wewnątrznaczyniowe laserowe leczenie żylaków.',
  },
  {
    name: 'Proktologia',
    slug: '/proktologia',
    badge: 'DZIAŁ 03 • LHP / FILAC 1 DNIA',
    desc: 'Małoinwazyjna proktologia laserowa jednego dnia i wideo-anoskopia HD.',
  },
  {
    name: 'Chirurgia Ogólna',
    slug: '/chirurgia-ogolna',
    badge: 'DZIAŁ 04 • CHIRURGIA 1 DNIA',
    desc: 'Zabiegi chirurgii jednego dnia i radiochirurgia RF w znieczuleniu miejscowym.',
  },
];

// Czysty fundament — 0 wgranych na sztywno filarów usługowych
const BMCLINIC_FOUNDATION_PAGES: BmClinicPageEntry[] = [];

export default function BmClinicHomePage() {
  const [entries, setEntries] = useState<BmClinicPageEntry[]>(BMCLINIC_FOUNDATION_PAGES);
  const [selectedDept, setSelectedDept] =
    useState<DepartmentRoomNode['deptName']>('Medycyna Estetyczna');
  const [procedureTitle, setProcedureTitle] = useState('');
  const [archetype, setArchetype] = useState<ContentArchetype>('INTERACTIVE_3D_PROCEDURE_MODEL');
  const [physicianName, setPhysicianName] = useState('');
  const [basePrice, setBasePrice] = useState(1500);
  const [highContrastViMode, setHighContrastViMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddPillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedureTitle.trim()) return;
    const slug = procedureTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newEntry: BmClinicPageEntry = {
      id: Date.now(),
      page: {
        slug,
        urlPath: `/procedury/${slug}`,
        servicePillar: selectedDept,
        procedureTitle: procedureTitle.trim(),
        contentArchetype: archetype,
        h1Headline: `${procedureTitle.trim()} — BM Clinic (${selectedDept})`,
        h2AioQuestion: `Na czym polega ${procedureTitle.trim().toLowerCase()} i jak przebiega wizyta w BM Clinic?`,
        aioDirectAnswerPassage:
          'Samodzielny blok odpowiedzi bezpośredniej (130–170 słów) przygotowany pod cytowania w Google AI Overviews (GEO) oraz ocenę jakości E-E-A-T.',
        aioWordCount: 150,
        leadPhysicianName: physicianName.trim() || 'Lekarz Specjalista BM Clinic',
        physicianSpecialty: selectedDept,
        pwzVerified: true,
        clinicalStudiesCited: 5,
        originalAssetsCount: 8,
        effortScore: 94,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 92,
        clickDepth: 1,
        siteFocusScore: 0.96,
        siteRadiusDelta: 0.04,
        basePricePln: Number(basePrice) || 1500,
      },
      telemetry: {
        impressions: 100,
        totalClicks: 10,
        goodClicks: 9,
        badClicks: 1,
        lastLongestClicks: 7,
        avgDwellTimeSec: 185,
        avgScrollDepthPct: 82,
        interactive3dOrCalcUses: 6,
        onlineBookings: 1,
        phoneCalls: 0,
        calculatorLeads: 0,
        revenuePln: Number(basePrice) || 1500,
        lcpMs: 1320,
        inpMs: 58,
        clsScore: 0.02,
        ttfbMs: 165,
      },
      insight: `Aktywna podstrona w dziale ${selectedDept} połączona z modelem 3D kliniki i telemetrią konwersji.`,
    };

    setEntries((prev) => [...prev, newEntry]);
    setProcedureTitle('');
  };

  const handleRecordPatientAction = (id: number, action: 'BOOK' | '3D_USE' | 'BOUNCE') => {
    startTransition(() => {
      setEntries((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const t = { ...item.telemetry };
          if (action === 'BOOK') {
            t.totalClicks += 1;
            t.goodClicks += 1;
            t.lastLongestClicks += 1;
            t.interactive3dOrCalcUses += 1;
            t.onlineBookings += 1;
            t.revenuePln += item.page.basePricePln;
          } else if (action === '3D_USE') {
            t.interactive3dOrCalcUses += 1;
            t.avgDwellTimeSec = Math.min(420, t.avgDwellTimeSec + 8);
          } else {
            t.totalClicks += 1;
            t.badClicks += 1;
          }
          return { ...item, telemetry: t };
        })
      );
    });
  };

  const primarySchema = buildBmClinicSchemaGraph(entries[0]?.page);

  return (
    <div
      className={`min-h-screen p-6 md:p-8 transition-colors ${
        highContrastViMode ? 'bg-[#05070a] text-white' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(primarySchema) }}
      />

      {/* Asymmetric Cutout Liquid Glass Header */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-cyan-500/20 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-amber-300/30 border border-white/40 flex items-center justify-center font-black text-amber-200 shadow-lg">
            BM
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-1">
              BMCLINIC.CO • MODEL 3D KLINIKI + SILNIK SEO & KONWERSJI AGENTA AI
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              BM Clinic — Klinika Chirurgii Małoinwazyjnej i Laserowej
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8">
        {/* 4 Department Cards (Bento Grid) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEPARTMENTS.map((dept) => {
            const active = selectedDept === dept.name;
            return (
              <button
                key={dept.name}
                type="button"
                onClick={() => setSelectedDept(dept.name)}
                className={`text-left p-5 rounded-3xl border transition-all ${
                  active
                    ? highContrastViMode
                      ? 'bg-[#ffe600] text-black border-white font-bold'
                      : 'bg-cyan-500/15 border-cyan-400 shadow-xl'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
                }`}
              >
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 mb-2">
                  {dept.badge}
                </span>
                <h2 className="text-lg font-extrabold">{dept.name}</h2>
                <p className={`text-xs mt-1 ${active && highContrastViMode ? 'text-black' : 'text-slate-400'}`}>
                  {dept.desc}
                </p>
                <div className="mt-3">
                  <Link
                    href={dept.slug}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-amber-300 hover:underline"
                  >
                    Otwórz podstronę działu ({dept.slug}) →
                  </Link>
                </div>
              </button>
            );
          })}
        </section>

        {/* Interactive 3D Spatial Clinic Digital Twin & VI Wayfinding Model */}
        <BmClinicSpatialModel3D
          selectedDept={selectedDept}
          onSelectDepartment={(dept) => setSelectedDept(dept)}
          highContrastViMode={highContrastViMode}
          onToggleViMode={() => setHighContrastViMode((v) => !v)}
        />

        {/* 6-Parameter 3D/LiDAR Clinical Diagnostic Simulator */}
        <BmClinicLidarDiagnosticAnalyzer
          selectedDept={selectedDept}
          highContrastViMode={highContrastViMode}
        />

        {/* Transparent Pricing & Recovery Time Calculator */}
        <BmClinicPricingAndRecoveryCalculator
          selectedDept={selectedDept}
          basePricePln={basePrice}
          highContrastViMode={highContrastViMode}
        />

        {/* Add Procedure to Clean Foundation Database */}
        <section className="rounded-3xl border border-cyan-500/25 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-lg font-bold text-cyan-300 mb-4">
            + Dodaj usługę medyczną w dziale: {selectedDept} (Czysty Fundament Bazy bmclinic.co)
          </h2>
          <form onSubmit={handleAddPillar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as DepartmentRoomNode['deptName'])}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Nazwa zabiegu / procedury medycznej"
              value={procedureTitle}
              onChange={(e) => setProcedureTitle(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
              required
            />

            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as ContentArchetype)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
            >
              <option value="INTERACTIVE_3D_PROCEDURE_MODEL">INTERACTIVE_3D_PROCEDURE_MODEL</option>
              <option value="SPATIAL_3D_CLINIC_TOUR">SPATIAL_3D_CLINIC_TOUR</option>
              <option value="TRANSPARENT_PRICING_CALCULATOR">TRANSPARENT_PRICING_CALCULATOR</option>
              <option value="DOCTOR_QA_CASE_STUDY_BEFORE_AFTER">DOCTOR_QA_CASE_STUDY_BEFORE_AFTER</option>
            </select>

            <input
              type="text"
              placeholder="Lekarz prowadzący (E-E-A-T)"
              value={physicianName}
              onChange={(e) => setPhysicianName(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
            />

            <input
              type="number"
              placeholder="Cena bazowa PLN"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 text-sm font-bold hover:bg-cyan-500/35"
            >
              Dodaj usługę do bazy bmclinic.co
            </button>
          </form>
        </section>

        {/* Database Entries & AI Conversion / SEO Scoring Cards */}
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400 text-sm">
            Baza usług <strong>bmclinic.co</strong> jest czysta (0 predefiniowanych zabiegów). Wybierz gabinet na modelu 3D powyżej i dodaj pierwszą procedurę w jednym z 4 działów kliniki.
          </div>
        ) : (
          entries.map((entry) => {
            const metrics = evaluateBmClinicPageForAgent(entry.page, entry.telemetry);
            return (
              <section
                key={entry.id}
                className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-cyan-400">
                      {entry.page.urlPath} • {entry.page.contentArchetype}
                    </span>
                    <h2 className="text-2xl font-bold mt-1">{entry.page.h1Headline}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Dział: <strong>{entry.page.servicePillar}</strong> • E-E-A-T:{' '}
                      <strong>{entry.page.leadPhysicianName}</strong>
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right bg-lime-400/10 border border-lime-400/30 px-4 py-2 rounded-2xl">
                      <div className="text-xs text-slate-300">RL Agent Reward</div>
                      <div className="text-2xl font-extrabold text-lime-400">{metrics.agentRlReward}</div>
                    </div>
                    <div className="text-right bg-cyan-400/10 border border-cyan-400/30 px-4 py-2 rounded-2xl">
                      <div className="text-xs text-slate-300">Konwersja Sprzedaży</div>
                      <div className="text-2xl font-extrabold text-cyan-300">{metrics.conversionRatePct}%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRecordPatientAction(entry.id, 'BOOK')}
                    className="px-4 py-2 rounded-xl bg-lime-400/20 border border-lime-400/40 text-lime-200 text-xs font-bold hover:bg-lime-400/30"
                  >
                    + Umów wizytę online (+goodClick, +{entry.page.basePricePln} PLN)
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRecordPatientAction(entry.id, '3D_USE')}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30"
                  >
                    + Interakcja z modelem 3D (+dwellTime)
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRecordPatientAction(entry.id, 'BOUNCE')}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold hover:bg-rose-500/30"
                  >
                    + Symuluj pogo-sticking (badClick)
                  </button>
                </div>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
