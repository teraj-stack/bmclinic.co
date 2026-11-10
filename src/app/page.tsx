'use client';

import React, { useState, useTransition } from 'react';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
} from '@/lib/seo-scoring-engine';
import { buildBmClinicSchemaGraph } from '@/lib/schema-jsonld';

interface BmClinicPageEntry {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  insight: string;
}

const BMCLINIC_FOUNDATION_PAGES: BmClinicPageEntry[] = [
  {
    id: 1,
    page: {
      slug: 'laserowe-leczenie-hemoroidow-lhp',
      urlPath: '/procedury/laserowe-leczenie-hemoroidow-lhp',
      servicePillar: 'Proktologia Laserowa',
      procedureTitle: 'Laserowa plastyka hemoroidów LHP (1470 nm) — zabieg 1 dnia',
      contentArchetype: 'INTERACTIVE_3D_PROCEDURE_MODEL',
      h1Headline: 'Laserowe leczenie hemoroidów LHP w Warszawie — bez nacięć i bez szwów',
      h2AioQuestion:
        'Na czym polega laserowe usuwanie hemoroidów metodą LHP i ile trwa rekonwalescencja?',
      aioDirectAnswerPassage:
        'Laserowe leczenie hemoroidów metodą LHP (Laser Hemorrhoidoplasty) wykorzystuje falę o długości 1470 nm, która zamyka naczynia krwionośne guzka krwawniczego od wewnątrz bez wycinania tkanek i bez zakładania szwów. Zabieg w BM Clinic trwa około 25–35 minut w znieczuleniu miejscowym lub krótkiej sedacji. Pacjent opuszcza klinikę po około 2 godzinach, a powrót do pracy biurowej i codziennej aktywności następuje zazwyczaj w ciągu 24–48 godzin.',
      aioWordCount: 154,
      leadPhysicianName: 'dr n. med. Jan Bujok',
      physicianSpecialty: 'Chirurg Ogólny, Proktolog',
      pwzVerified: true,
      clinicalStudiesCited: 7,
      originalAssetsCount: 11,
      effortScore: 96,
      schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage', 'VideoObject'],
      entityDensityScore: 94,
      clickDepth: 1,
      siteFocusScore: 0.98,
      siteRadiusDelta: 0.03,
      basePricePln: 3200,
    },
    telemetry: {
      impressions: 14800,
      totalClicks: 1920,
      goodClicks: 1765,
      badClicks: 82,
      lastLongestClicks: 1340,
      avgDwellTimeSec: 248,
      avgScrollDepthPct: 86.5,
      interactive3dOrCalcUses: 1190,
      onlineBookings: 148,
      phoneCalls: 94,
      calculatorLeads: 76,
      revenuePln: 412000,
      lcpMs: 1420,
      inpMs: 68,
      clsScore: 0.02,
      ttfbMs: 180,
    },
    insight:
      'Interaktywny model 3D przebiegu impulsu lasera + pasaż 154 słów pod H2 z autoryzacją dr n. med. Jana Bujoka daje najwyższą nagrodę RL (0.9808).',
  },
  {
    id: 2,
    page: {
      slug: 'cennik-i-kalkulator-zabiegow-proktologicznych',
      urlPath: '/procedury/cennik-i-kalkulator-zabiegow-proktologicznych',
      servicePillar: 'Proktologia Laserowa',
      procedureTitle: 'Kalkulator kosztów leczenia i porównanie metod (Laser LHP vs Klasyczna)',
      contentArchetype: 'TRANSPARENT_PRICING_CALCULATOR',
      h1Headline:
        'Ile kosztuje laserowe leczenie proktologiczne w BM Clinic? Kalkulator i porównanie metod',
      h2AioQuestion:
        'Jaka jest różnica w kosztach i czasie zwolnienia lekarskiego między zabiegiem laserowym a operacją klasyczną?',
      aioDirectAnswerPassage:
        'Całkowity koszt małoinwazyjnego zabiegu laserowego obejmuje kwalifikację z badaniem anoskopowym, procedurę światłowodową oraz wizytę kontrolną. W przeciwieństwie do klasycznej operacji chirurgicznej wymagającej 3–4 tygodni zwolnienia lekarskiego, procedura laserowa pozwala wrócić do obowiązków zawodowych już następnego dnia, co redukuje koszt pośredni nieobecności w pracy.',
      aioWordCount: 146,
      leadPhysicianName: 'dr n. med. Jan Bujok',
      physicianSpecialty: 'Chirurg Ogólny, Proktolog',
      pwzVerified: true,
      clinicalStudiesCited: 5,
      originalAssetsCount: 8,
      effortScore: 92,
      schemaTypes: ['MedicalClinic', 'MedicalProcedure', 'FAQPage', 'OfferCatalog'],
      entityDensityScore: 89,
      clickDepth: 1,
      siteFocusScore: 0.96,
      siteRadiusDelta: 0.05,
      basePricePln: 2800,
    },
    telemetry: {
      impressions: 11200,
      totalClicks: 1540,
      goodClicks: 1390,
      badClicks: 95,
      lastLongestClicks: 1020,
      avgDwellTimeSec: 215,
      avgScrollDepthPct: 82.0,
      interactive3dOrCalcUses: 1080,
      onlineBookings: 119,
      phoneCalls: 81,
      calculatorLeads: 112,
      revenuePln: 338000,
      lcpMs: 1310,
      inpMs: 54,
      clsScore: 0.01,
      ttfbMs: 165,
    },
    insight:
      'Interaktywny kalkulator ceny i czasu rekonwalescencji generuje najwyższy współczynnik konwersji łącznej (20.26%).',
  },
];

export default function BmClinicHomePage() {
  const [entries, setEntries] = useState<BmClinicPageEntry[]>(BMCLINIC_FOUNDATION_PAGES);
  const [isPending, startTransition] = useTransition();

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

  const primarySchema = buildBmClinicSchemaGraph(entries[0].page);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(primarySchema) }}
      />
      <header className="max-w-7xl mx-auto mb-10 border-b border-cyan-500/20 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-2">
            BMCLINIC.CO • FUNDAMENT STRONY NEXT.JS 15 + BAZA TELEMETRYCZNA AGENTA AI
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            BM Clinic — Centrum Medycyny Laserowej, Proktologii i Technologii 3D
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Zintegrowany fundament strony pacjenta z bazą danych uczącą Agenta AI, które formaty treści generują najwyższą sprzedaż zabiegów.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8">
        {entries.map((entry) => {
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
                    Lekarz prowadzący (E-E-A-T): <strong>{entry.page.leadPhysicianName}</strong> ({entry.page.physicianSpecialty})
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

              <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20">
                <h3 className="text-sm font-semibold text-cyan-300">{entry.page.h2AioQuestion}</h3>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                  {entry.page.aioDirectAnswerPassage}
                </p>
                <span className="inline-block mt-2 text-xs text-slate-400">
                  Blok semantyczny AI Overviews (GEO): {entry.page.aioWordCount} słów • Schema.org: {entry.page.schemaTypes.join(', ')}
                </span>
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
                  + Interakcja z modelem 3D / kalkulatorem (+dwellTime)
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
        })}
      </main>
    </div>
  );
}
