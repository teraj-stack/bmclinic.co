'use client';

import React, { useState, useTransition } from 'react';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
  type ContentArchetype,
} from '@/lib/seo-scoring-engine';
import { buildBmClinicSchemaGraph } from '@/lib/schema-jsonld';

interface BmClinicPageEntry {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  insight: string;
}

// Czysty fundament — 0 wgranych na sztywno filarów usługowych
const BMCLINIC_FOUNDATION_PAGES: BmClinicPageEntry[] = [];

export default function BmClinicHomePage() {
  const [entries, setEntries] = useState<BmClinicPageEntry[]>(BMCLINIC_FOUNDATION_PAGES);
  const [pillarName, setPillarName] = useState('');
  const [procedureTitle, setProcedureTitle] = useState('');
  const [archetype, setArchetype] = useState<ContentArchetype>('INTERACTIVE_3D_PROCEDURE_MODEL');
  const [physicianName, setPhysicianName] = useState('');
  const [basePrice, setBasePrice] = useState(1000);
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
        servicePillar: pillarName.trim() || 'Własny Filar Medyczny',
        procedureTitle: procedureTitle.trim(),
        contentArchetype: archetype,
        h1Headline: `${procedureTitle.trim()} — BM Clinic`,
        h2AioQuestion: `Na czym polega ${procedureTitle.trim().toLowerCase()} i jak przebiega wizyta?`,
        aioDirectAnswerPassage:
          'Samodzielny blok odpowiedzi bezpośredniej (130–170 słów) przygotowany pod cytowania w Google AI Overviews (GEO) oraz ocenę jakości E-E-A-T.',
        aioWordCount: 150,
        leadPhysicianName: physicianName.trim() || 'Lekarz Specjalista BM Clinic',
        physicianSpecialty: 'Specjalista Medyczny',
        pwzVerified: true,
        clinicalStudiesCited: 5,
        originalAssetsCount: 8,
        effortScore: 92,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 90,
        clickDepth: 1,
        siteFocusScore: 0.96,
        siteRadiusDelta: 0.04,
        basePricePln: Number(basePrice) || 1000,
      },
      telemetry: {
        impressions: 100,
        totalClicks: 10,
        goodClicks: 9,
        badClicks: 1,
        lastLongestClicks: 7,
        avgDwellTimeSec: 185,
        avgScrollDepthPct: 80,
        interactive3dOrCalcUses: 6,
        onlineBookings: 1,
        phoneCalls: 0,
        calculatorLeads: 0,
        revenuePln: Number(basePrice) || 1000,
        lcpMs: 1380,
        inpMs: 64,
        clsScore: 0.02,
        ttfbMs: 175,
      },
      insight: 'Nowo dodany filar medyczny zbierający dane telemetryczne NavBoost i konwersji sprzedaży.',
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
            t.avgDwellTimeSec = Math.min(420, t.avgDwellTimeSec + 5);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(primarySchema) }}
      />
      <header className="max-w-7xl mx-auto mb-10 border-b border-cyan-500/20 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-2">
            BMCLINIC.CO • CZYSTY FUNDAMENT NEXT.JS 15 + BAZA TELEMETRYCZNA AGENTA AI
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            BM Clinic (bmclinic.co) — Fundament Bazy Danych i Trenera Agenta AI
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Czysta baza danych (0 predefiniowanych filarów) gotowa do wprowadzania własnych usług medycznych i zbierania danych o efektywności sprzedaży.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8">
        <section className="rounded-3xl border border-cyan-500/25 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-lg font-bold text-cyan-300 mb-4">
            + Dodaj nowy filar / podstronę usługi medycznej do bazy bmclinic.co
          </h2>
          <form onSubmit={handleAddPillar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Filar (np. Chirurgia, Diagnostyka...)"
              value={pillarName}
              onChange={(e) => setPillarName(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
            />
            <input
              type="text"
              placeholder="Nazwa procedury / usługi medycznej"
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
              <option value="TRANSPARENT_PRICING_CALCULATOR">TRANSPARENT_PRICING_CALCULATOR</option>
              <option value="DOCTOR_QA_CASE_STUDY_BEFORE_AFTER">DOCTOR_QA_CASE_STUDY_BEFORE_AFTER</option>
              <option value="SPATIAL_3D_CLINIC_TOUR">SPATIAL_3D_CLINIC_TOUR</option>
            </select>
            <input
              type="text"
              placeholder="Lekarz / Specjalista (E-E-A-T)"
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

        {entries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400 text-sm">
            Brak wgranych filarów usługowych. Fundament <strong>bmclinic.co</strong> jest czysty — dodaj pierwszą usługę powyżej, aby rozpocząć zbieranie telemetrii NavBoost i uczenie Agenta AI.
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
                      Filar: <strong>{entry.page.servicePillar}</strong> • E-E-A-T:{' '}
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
                    + Interakcja z modułem (+dwellTime)
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRecordPatientAction(entry.id, 'BOUNCE')}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold hover:bg-rose-500/30"
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
