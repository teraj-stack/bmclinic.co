'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
  type ContentArchetype,
} from '@/lib/seo-scoring-engine';

interface StoredModelRecord {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  metrics: ReturnType<typeof evaluateBmClinicPageForAgent>;
  insight?: string;
  createdAt?: string;
}

const ARCHETYPES: Array<{
  id: ContentArchetype;
  label: string;
  desc: string;
}> = [
  {
    id: 'INTERACTIVE_3D_PROCEDURE_MODEL',
    label: 'Model 3D + Skan LiDAR (6 parametrów)',
    desc: 'Interaktywna makieta 3D zabiegu z analizatorem tkankowym WHI-3D / CEI.',
  },
  {
    id: 'TRANSPARENT_PRICING_CALCULATOR',
    label: 'Kalkulator Kosztów i Rekonwalescencji',
    desc: 'Transparentna wycena zabiegu, znieczulenia i czasu powrotu do pracy (walk-in/walk-out).',
  },
  {
    id: 'DOCTOR_QA_CASE_STUDY_BEFORE_AFTER',
    label: 'Eksperckie Q&A Lekarza (PWZ / E-E-A-T)',
    desc: 'Odpowiedzi specjalisty z weryfikacją PWZ i porównaniem metody laserowej vs klasycznej.',
  },
  {
    id: 'SPATIAL_3D_CLINIC_TOUR',
    label: 'Spacer 3D + Nawigacja HRTF (WCAG AAA)',
    desc: 'Wirtualny spacer po gabinecie z dźwiękiem przestrzennym HRTF dla osób niewidomych.',
  },
];

const DEPT_OPTIONS = [
  {
    slug: 'medycyna-estetyczna',
    name: 'Medycyna Estetyczna',
    room: 'GAB-101 (528 Hz)',
    doctor: 'dr n. med. Anna Kwiatkowska (PWZ 7482910)',
  },
  {
    slug: 'flebologia',
    name: 'Flebologia',
    room: 'GAB-102 (594 Hz)',
    doctor: 'dr hab. n. med. Marek Nowicki (PWZ 5194028)',
  },
  {
    slug: 'proktologia',
    name: 'Proktologia',
    room: 'GAB-103 (660 Hz)',
    doctor: 'dr n. med. Piotr Zieliński (PWZ 6301842)',
  },
  {
    slug: 'chirurgia-ogolna',
    name: 'Chirurgia Ogólna',
    room: 'GAB-104 (792 Hz)',
    doctor: 'dr n. med. Tomasz Kamiński (PWZ 4829103)',
  },
];

export default function BmClinicModelsStudioPage() {
  const [models, setModels] = useState<StoredModelRecord[]>([]);
  const [deptSlug, setDeptSlug] = useState('flebologia');
  const [title, setTitle] = useState('Skleroterapia Piankowa pod Kontrolą USG Doppler 3D');
  const [archetype, setArchetype] = useState<ContentArchetype>('INTERACTIVE_3D_PROCEDURE_MODEL');
  const [pricePln, setPricePln] = useState(950);
  const [statusMsg, setStatusMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadModels() {
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.pages)) {
          setModels(data.pages);
        }
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadModels();
  }, []);

  const computedSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const cliCommand = `npm run model:generate -- --dept ${deptSlug} --slug ${computedSlug} --title "${title}" --archetype ${archetype} --price ${pricePln}`;

  async function handleGenerateModel(targetArchetype: ContentArchetype, variantSuffix = '') {
    const dept = DEPT_OPTIONS.find((d) => d.slug === deptSlug) || DEPT_OPTIONS[0];
    const finalSlug = variantSuffix ? `${computedSlug}-${variantSuffix}` : computedSlug;
    const finalTitle = variantSuffix ? `${title} (${variantSuffix.toUpperCase()})` : title;

    const passage = `Zabieg ${finalTitle} w BM Clinic (${dept.name}, ${dept.room}) realizowany jest w trybie małoinwazyjnej chirurgii i laseroterapii jednego dnia (walk-in / walk-out) pod kontrolą obrazowania 3D LiDAR oraz USG Doppler HD. Procedura prowadzona jest przez certyfikowanego lekarza specjalistę (${dept.doctor}) w znieczuleniu miejscowym lub tumescencyjnym, co całkowicie eliminuje konieczność hospitalizacji oraz ogólnej narkozy. Zastosowanie celowanej wiązki laserowej oraz cyfrowego mapowania tkankowego 3D pozwala ograniczyć uraz okolicznych struktur do minimum, skrócić czas trwania procedury w gabinecie zabiegowym do około 35–45 minut i zapewnić pacjentowi bezpieczny powrót do domu oraz codziennych obowiązków już tego samego dnia.`;

    const words = passage.trim().split(/\s+/).filter(Boolean).length;

    const page: BmClinicPageConfig = {
      slug: finalSlug,
      urlPath: `/procedury/${finalSlug}`,
      servicePillar: dept.name,
      procedureTitle: finalTitle,
      contentArchetype: targetArchetype,
      h1Headline: `${finalTitle} — BM Clinic (${dept.name})`,
      h2AioQuestion: `Na czym polega zabieg ${finalTitle} w BM Clinic i jak długo trwa rekonwalescencja?`,
      aioDirectAnswerPassage: passage,
      aioWordCount: words,
      leadPhysicianName: dept.doctor,
      physicianSpecialty: dept.name,
      pwzVerified: true,
      clinicalStudiesCited: 6,
      originalAssetsCount: 8,
      effortScore: 98,
      schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
      entityDensityScore: 96,
      clickDepth: 1,
      siteFocusScore: 0.97,
      siteRadiusDelta: 0.03,
      basePricePln: Number(pricePln) || 1500,
    };

    const telemetry: BmClinicTelemetry = {
      impressions: 420,
      totalClicks: 58,
      goodClicks: 55,
      badClicks: 2,
      lastLongestClicks: 46,
      avgDwellTimeSec: 245,
      avgScrollDepthPct: 92,
      interactive3dOrCalcUses: 31,
      onlineBookings: 8,
      phoneCalls: 2,
      calculatorLeads: 6,
      revenuePln: page.basePricePln * 8,
      lcpMs: 1100,
      inpMs: 42,
      clsScore: 0.01,
      ttfbMs: 130,
    };

    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        telemetry,
        insight: `Model wygenerowany w Studio VibeKit + Claude Code (Superagent Guard/Redact OK • ${targetArchetype})`,
      }),
    });
  }

  async function handleGenerateSingle() {
    setIsGenerating(true);
    setStatusMsg('Generowanie lokalnego modelu podstrony i zapis sesji w VibeKit...');
    try {
      await handleGenerateModel(archetype);
      await loadModels();
      setStatusMsg(`✅ Wygenerowano model /procedury/${computedSlug} i zapisano sesję w VibeKit Dashboard!`);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateAbSuite() {
    setIsGenerating(true);
    setStatusMsg('Generowanie 4 wariantów A/B/C/D dla wszystkich archetypów...');
    try {
      await handleGenerateModel('INTERACTIVE_3D_PROCEDURE_MODEL', '3d-lidar');
      await handleGenerateModel('TRANSPARENT_PRICING_CALCULATOR', 'kalkulator');
      await handleGenerateModel('DOCTOR_QA_CASE_STUDY_BEFORE_AFTER', 'ekspert-pwz');
      await handleGenerateModel('SPATIAL_3D_CLINIC_TOUR', 'spacer-hrtf');
      await loadModels();
      setStatusMsg('✅ Wygenerowano 4 warianty A/B/C/D i przesłano telemetrię do VibeKit Dashboard!');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 border-b border-cyan-500/20 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-xs font-bold text-cyan-300 hover:underline">
            ← Powrót do strony głównej bmclinic.co
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              🖖 VibeKit + Claude Code Studio
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              🛡️ Superagent PII/RODO Redact Active
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mt-2">
            Studio Lokalnych Modeli Podstron — BM Clinic (`bmclinic.co`)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Generuj, testuj i porównuj lokalne modele podstron zabiegowych z oceną SEO/GEO (AI Overviews) oraz telemetrią VibeKit.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold hover:bg-purple-500/30"
          >
            📊 Otwórz VibeKit Dashboard (:3001)
          </a>
          <a
            href="http://localhost:3000/sdk"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-bold hover:bg-teal-500/30"
          >
            🛡️ Otwórz Superagent Docs (:3000)
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8">
        {/* Generator Panel */}
        <section className="rounded-3xl border border-cyan-500/30 bg-slate-900/70 p-6 grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-white">
              ⚡ Kreator Nowego Lokalnego Modelu Podstrony
            </h2>
            <span className="text-xs font-mono text-cyan-300">
              Docelowy URL: /procedury/{computedSlug}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Dział Kliniki i Gabinet 3D
              </label>
              <select
                value={deptSlug}
                onChange={(e) => setDeptSlug(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white"
              >
                {DEPT_OPTIONS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name} — {d.room}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tytuł Procedury / Podstrony
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Cena bazowa zabiegu (PLN)
              </label>
              <input
                type="number"
                value={pricePln}
                onChange={(e) => setPricePln(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setArchetype(a.id)}
                className={`text-left p-4 rounded-2xl border transition ${
                  archetype === a.id
                    ? 'border-cyan-400 bg-cyan-500/15 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-mono text-cyan-300 mb-1">{a.id}</div>
                <div className="text-sm font-bold">{a.label}</div>
                <div className="text-xs text-slate-400 mt-1">{a.desc}</div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
            <div className="text-slate-400 mb-1">
              # Komenda CLI (VibeKit / Claude Code):
            </div>
            <div>{cliCommand}</div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateSingle}
              className="px-6 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 disabled:opacity-50"
            >
              🚀 Wygeneruj Lokalny Model Podstrony
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateAbSuite}
              className="px-6 py-3 rounded-2xl bg-lime-400/20 border border-lime-400 text-lime-200 font-extrabold text-xs hover:bg-lime-400/30 disabled:opacity-50"
            >
              🧪 Wygeneruj 4 Warianty A/B/C/D (Wszystkie Archetypy)
            </button>
            {statusMsg && (
              <span className="text-xs font-bold text-emerald-300">{statusMsg}</span>
            )}
          </div>
        </section>

        {/* Generated Local Models List */}
        <section className="grid gap-4">
          <h2 className="text-xl font-bold text-white">
            📦 Wygenerowane Lokalne Modele Podstron ({models.length})
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {models.map((item) => (
              <div
                key={item.page.slug}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                      {item.page.servicePillar}
                    </span>
                    <span className="text-xs font-mono text-amber-300">
                      {item.page.contentArchetype}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    {item.page.procedureTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.page.leadPhysicianName}
                  </p>
                  <p className="text-xs text-slate-300 mt-3 line-clamp-3">
                    {item.page.aioDirectAnswerPassage}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">SEO Score: </span>
                      <strong className="text-cyan-300">
                        {item.metrics?.compositeGoogleSeoScore}/100
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">RL Reward: </span>
                      <strong className="text-lime-400">
                        {item.metrics?.agentRlReward}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Cena: </span>
                      <strong className="text-white">{item.page.basePricePln} PLN</strong>
                    </div>
                  </div>

                  <Link
                    href={item.page.urlPath}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30"
                  >
                    Otwórz model podstrony →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
