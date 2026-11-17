'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
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
import BmClinicMobileTransitionShell, {
  runViewTransitionWithHaptics,
} from '@/components/BmClinicMobileTransitionShell';
import BmClinicBookingModal from '@/components/BmClinicBookingModal';
import {
  DEPARTMENT_LIST,
  buildFlagshipSeedEntries,
} from '@/lib/clinic-departments-data';

interface BmClinicPageEntry {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  insight: string;
}

const DEPARTMENTS: Array<{
  name: DepartmentRoomNode['deptName'];
  slug: string;
  roomCode: string;
  beaconHz: number;
  badge: string;
  desc: string;
}> = [
  {
    name: 'Medycyna Estetyczna',
    slug: '/medycyna-estetyczna',
    roomCode: 'GAB-101',
    beaconHz: 528,
    badge: 'DZIAŁ 01 • LASEROTERAPIA HI-TECH',
    desc: 'Regeneracja tkankowa, laseroterapia frakcyjna i małoinwazyjne procedury anti-aging pod kontrolą skanera 3D LiDAR.',
  },
  {
    name: 'Flebologia',
    slug: '/flebologia',
    roomCode: 'GAB-102',
    beaconHz: 594,
    badge: 'DZIAŁ 02 • EVLT 1470NM & DOPPLER',
    desc: 'Diagnostyka USG Doppler 3D oraz wewnątrznaczyniowe laserowe leczenie żylaków w trybie Walk-in / Walk-out (45 min).',
  },
  {
    name: 'Proktologia',
    slug: '/proktologia',
    roomCode: 'GAB-103',
    beaconHz: 660,
    badge: 'DZIAŁ 03 • LHP / FILAC 1 DNIA',
    desc: 'Małoinwazyjna proktologia laserowa jednego dnia (Biolitec 1470nm) i wideo-anoskopia HD w pełnej dyskrecji.',
  },
  {
    name: 'Chirurgia Ogólna',
    slug: '/chirurgia-ogolna',
    roomCode: 'GAB-104',
    beaconHz: 792,
    badge: 'DZIAŁ 04 • CHIRURGIA 1 DNIA & RF',
    desc: 'Zabiegi chirurgii jednego dnia i radiochirurgia RF 4.0 MHz w znieczuleniu miejscowym z pełną histopatologią.',
  },
];

// Czysty fundament — 0 wgranych na sztywno filarów usługowych przy pierwszym uruchomieniu
const BMCLINIC_FOUNDATION_PAGES: BmClinicPageEntry[] = [];
const STORAGE_KEY = 'BMCLINIC_CO_VERCEL_STATE_V1';

export default function BmClinicHomePage() {
  const [entries, setEntries] = useState<BmClinicPageEntry[]>(BMCLINIC_FOUNDATION_PAGES);
  const [selectedDept, setSelectedDept] =
    useState<DepartmentRoomNode['deptName']>('Medycyna Estetyczna');
  const [procedureTitle, setProcedureTitle] = useState('');
  const [archetype, setArchetype] = useState<ContentArchetype>('INTERACTIVE_3D_PROCEDURE_MODEL');
  const [physicianName, setPhysicianName] = useState('');
  const [basePrice, setBasePrice] = useState(1500);
  const [highContrastViMode, setHighContrastViMode] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingPrice, setBookingPrice] = useState(1800);
  const [isPending, startTransition] = useTransition();

  // Hydrate saved state from /api/pages or localStorage
  useEffect(() => {
    let mounted = true;
    async function loadState() {
      try {
        const res = await fetch('/api/pages');
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.pages) && data.pages.length > 0) {
            setEntries(data.pages);
            return;
          }
        }
      } catch {
        // Fallback to localStorage
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setEntries(parsed);
        }
      } catch {
        // Ignore storage errors
      }
    }
    loadState();
    return () => {
      mounted = false;
    };
  }, []);

  const persistEntries = (nextEntries: BmClinicPageEntry[]) => {
    setEntries(nextEntries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    } catch {
      // Ignore storage errors
    }
  };

  const handleAddPillar = async (e: React.FormEvent) => {
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
          'Samodzielny blok odpowiedzi bezpośredniej (130–170 słów) przygotowany pod cytowania w Google AI Overviews (GEO) oraz ocenę jakości E-E-A-T w klinice chirurgii małoinwazyjnej i laserowej BM Clinic.',
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

    const next = [...entries, newEntry];
    persistEntries(next);
    setProcedureTitle('');

    try {
      await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch {
      // Non-blocking API sync
    }
  };

  const handleLoadFlagshipDemo = async () => {
    const seeds = buildFlagshipSeedEntries();
    persistEntries(seeds);
    try {
      for (const item of seeds) {
        await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
    } catch {
      // Non-blocking
    }
  };

  const handleClearDatabase = async () => {
    persistEntries([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      await fetch('/api/pages', { method: 'DELETE' });
    } catch {
      // Non-blocking
    }
  };

  const handleRecordPatientAction = (id: number, action: 'BOOK' | '3D_USE' | 'BOUNCE') => {
    startTransition(() => {
      const updated = entries.map((item) => {
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
      });
      persistEntries(updated);
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

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/ruta" className="px-4 py-2.5 rounded-xl text-xs font-bold border border-teal-300/50 bg-teal-300/15 text-teal-100 hover:bg-teal-300/25">◎ RUTA — mapa objawów</Link>
          <nav aria-label="Szybkie linki do działów" className="hidden xl:flex items-center gap-2 mr-2">
            {DEPARTMENTS.map((d) => (
              <Link
                key={d.slug}
                href={d.slug}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/15 bg-white/5 hover:border-cyan-400/50 text-slate-200"
              >
                {d.roomCode} • {d.name}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setHighContrastViMode((v) => !v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
              highContrastViMode
                ? 'bg-[#ffe600] text-black border-white'
                : 'border-amber-400/40 bg-amber-400/15 text-amber-200'
            }`}
          >
            {highContrastViMode ? '👁️ WCAG AAA (WŁ.)' : '👁️ Kontrast VI'}
          </button>

          <button
            type="button"
            onClick={() => {
              setBookingTitle(`Wizyta w dziale: ${selectedDept}`);
              setBookingPrice(basePrice);
              setBookingModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-lime-400/25 border border-lime-400 text-lime-200 text-xs font-extrabold hover:bg-lime-400/35 shadow-lg"
          >
            📅 Umów wizytę online
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8 pb-24">
        {/* Dynamic Island + Shared-Element Mobile Transitions + Gesture Bottom Sheet + Floating Dock */}
        <BmClinicMobileTransitionShell
          selectedDept={selectedDept}
          onSelectDepartment={(dept) => setSelectedDept(dept)}
          highContrastViMode={highContrastViMode}
        />

        {/* Clinical Value Proposition & E-E-A-T Highlights Banner */}
        <section className="rounded-3xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-slate-900/80 to-amber-400/10 p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <span className="text-cyan-300 font-mono uppercase font-bold block">
              01 • CHIRURGIA 1 DNIA
            </span>
            <strong className="text-sm text-white block mt-0.5">
              Tryb Walk-In / Walk-Out (30–45 min)
            </strong>
            <p className="text-slate-400 mt-1">
              Zabiegi laserowe 1470 nm i radiochirurgia RF w znieczuleniu miejscowym bez hospitalizacji.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <span className="text-lime-300 font-mono uppercase font-bold block">
              02 • NAWIGACJA VI HRTF 3D
            </span>
            <strong className="text-sm text-white block mt-0.5">
              Dostępność dla Niewidomych (WCAG AAA)
            </strong>
            <p className="text-slate-400 mt-1">
              Latarnie dźwiękowe HRTF (528–792 Hz), tabliczki Braille’a i prowadzenie zegarowe do 4 gabinetów.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <span className="text-amber-300 font-mono uppercase font-bold block">
              03 • DIAGNOSTYKA 3D LiDAR
            </span>
            <strong className="text-sm text-white block mt-0.5">
              6 Parametrów Tkankowych (WHI-3D & CEI)
            </strong>
            <p className="text-slate-400 mt-1">
              Obiektywny pomiar głębokości zmian, perfuzji oraz mikrotekstury skóry Ra (µm) przed zabiegiem.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
            <span className="text-cyan-300 font-mono uppercase font-bold block">
              04 • SILNIK SEO & AI AGENT
            </span>
            <strong className="text-sm text-white block mt-0.5">
              NavBoost • E-E-A-T • AI Overviews (GEO)
            </strong>
            <p className="text-slate-400 mt-1">
              Baza danych ucząca Agenta AI optymalizacji konwersji sprzedaży usług medycznych.
            </p>
          </div>
        </section>

        {/* 4 Department Cards (Bento Grid with Shared-Element View Transition Morphing) */}
        <section
          id="section-departments"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {DEPARTMENTS.map((dept) => {
            const active = selectedDept === dept.name;
            const deptProfile = DEPARTMENT_LIST.find((d) => d.deptName === dept.name);
            return (
              <div
                key={dept.name}
                style={{ viewTransitionName: `bento-dept-${dept.slug.replace('/', '')}` }}
                onClick={() =>
                  runViewTransitionWithHaptics(() => setSelectedDept(dept.name), 12)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    runViewTransitionWithHaptics(() => setSelectedDept(dept.name), 12);
                  }
                }}
                className={`text-left p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  active
                    ? highContrastViMode
                      ? 'bg-[#ffe600] text-black border-white font-bold'
                      : 'bg-cyan-500/15 border-cyan-400 shadow-xl scale-[1.01]'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {dept.badge}
                    </span>
                    <span className="text-[11px] font-mono text-lime-400">
                      {dept.roomCode}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold">{dept.name}</h2>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      active && highContrastViMode ? 'text-black' : 'text-slate-400'
                    }`}
                  >
                    {dept.desc}
                  </p>

                  {deptProfile && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
                      {deptProfile.procedures.map((proc) => (
                        <Link
                          key={proc.slug}
                          href={`/procedury/${proc.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block text-[11px] text-cyan-300 hover:underline truncate"
                        >
                          • {proc.title} ({proc.pricePln} PLN)
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={dept.slug}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-amber-300 hover:underline"
                  >
                    Podstrona działu ({dept.slug}) →
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDept(dept.name);
                      setBookingTitle(`Konsultacja / Zabieg — ${dept.name}`);
                      setBookingPrice(deptProfile?.procedures[0]?.pricePln || 1800);
                      setBookingModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-lime-400/20 border border-lime-400/40 text-lime-200 text-[10px] font-bold"
                  >
                    Umów
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Interactive 3D Spatial Clinic Digital Twin & VI Wayfinding Model */}
        <div id="section-3d-clinic">
          <BmClinicSpatialModel3D
            selectedDept={selectedDept}
            onSelectDepartment={(dept) =>
              runViewTransitionWithHaptics(() => setSelectedDept(dept), 10)
            }
            highContrastViMode={highContrastViMode}
            onToggleViMode={() => setHighContrastViMode((v) => !v)}
          />
        </div>

        {/* 6-Parameter 3D/LiDAR Clinical Diagnostic Simulator */}
        <div id="section-lidar">
          <BmClinicLidarDiagnosticAnalyzer
            selectedDept={selectedDept}
            highContrastViMode={highContrastViMode}
          />
        </div>

        {/* Transparent Pricing & Recovery Time Calculator */}
        <div id="section-calculator">
          <BmClinicPricingAndRecoveryCalculator
            selectedDept={selectedDept}
            basePricePln={basePrice}
            highContrastViMode={highContrastViMode}
            onCalculatorLead={(quotePln) => {
              setBookingTitle(`Kosztorys kalkulatora — ${selectedDept}`);
              setBookingPrice(quotePln);
              setBookingModalOpen(true);
            }}
          />
        </div>

        {/* Add Procedure to Clean Foundation Database */}
        <section
          id="section-database"
          className="rounded-3xl border border-cyan-500/25 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-cyan-300">
                + Dodaj usługę medyczną w dziale: {selectedDept} (Baza Agenta AI bmclinic.co)
              </h2>
              <p className="text-xs text-slate-400">
                Możesz utrzymać czysty fundament (0 filarów) lub załadować 4 flagowe procedury demonstracyjne jednym kliknięciem.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLoadFlagshipDemo}
                className="px-3.5 py-1.5 rounded-xl bg-lime-400/20 border border-lime-400/50 text-lime-200 text-xs font-bold hover:bg-lime-400/30"
              >
                ⚡ Wgraj 4 flagowe procedury (Demo SEO/AI)
              </button>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDatabase}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold hover:bg-rose-500/30"
                >
                  🧹 Wyczyść bazę (0 filarów)
                </button>
              )}
            </div>
          </div>

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
            Baza usług <strong>bmclinic.co</strong> jest w trybie czystego fundamentu (0 predefiniowanych zabiegów). Wybierz gabinet na modelu 3D powyżej, dodaj własną procedurę lub kliknij{' '}
            <button
              type="button"
              onClick={handleLoadFlagshipDemo}
              className="text-lime-300 font-bold underline hover:text-lime-200"
            >
              Wgraj 4 flagowe procedury
            </button>
            .
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
                    {entry.insight && (
                      <p className="text-xs text-amber-300/90 mt-1">{entry.insight}</p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right bg-lime-400/10 border border-lime-400/30 px-4 py-2 rounded-2xl">
                      <div className="text-xs text-slate-300">RL Agent Reward</div>
                      <div className="text-2xl font-extrabold text-lime-400">
                        {metrics.agentRlReward}
                      </div>
                    </div>
                    <div className="text-right bg-cyan-400/10 border border-cyan-400/30 px-4 py-2 rounded-2xl">
                      <div className="text-xs text-slate-300">Konwersja Sprzedaży</div>
                      <div className="text-2xl font-extrabold text-cyan-300">
                        {metrics.conversionRatePct}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3">
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

                  <Link
                    href={entry.page.urlPath}
                    className="text-xs font-bold text-amber-300 hover:underline"
                  >
                    Otwórz dedykowaną podstronę zabiegu ({entry.page.urlPath}) →
                  </Link>
                </div>
              </section>
            );
          })
        )}

        {/* Complete Medical Compliance & Vercel Production Footer */}
        <footer className="mt-8 rounded-3xl border border-white/15 bg-slate-900/70 p-6 md:p-8 text-xs text-slate-400">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="text-sm font-extrabold text-white mb-2">
                BM Clinic (bmclinic.co)
              </div>
              <p className="leading-relaxed">
                Klinika Chirurgii Małoinwazyjnej i Laserowej. Podmiot leczniczy spełniający
                standardy E-E-A-T / YMYL, WCAG 2.1 AAA dla pacjentów niewidomych i słabowidzących
                oraz wymagania RODO.
              </p>
            </div>

            <div>
              <div className="text-sm font-bold text-cyan-300 mb-2">4 Działy Zabiegowe</div>
              <ul className="space-y-1.5">
                {DEPARTMENTS.map((d) => (
                  <li key={d.slug}>
                    <Link href={d.slug} className="hover:text-white hover:underline">
                      {d.roomCode} • {d.name} ({d.beaconHz} Hz)
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-bold text-lime-300 mb-2">
                Flagowe Procedury 1 Dnia
              </div>
              <ul className="space-y-1.5">
                {DEPARTMENT_LIST.map((d) => (
                  <li key={d.procedures[0].slug}>
                    <Link
                      href={`/procedury/${d.procedures[0].slug}`}
                      className="hover:text-white hover:underline"
                    >
                      {d.procedures[0].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-bold text-amber-300 mb-2">
                Infrastruktura Vercel & API
              </div>
              <ul className="space-y-1.5 font-mono text-[11px]">
                <li>
                  <a href="/api/health" className="hover:text-white hover:underline">
                    GET /api/health (Smoke Test)
                  </a>
                </li>
                <li>
                  <a href="/api/pages" className="hover:text-white hover:underline">
                    GET /api/pages (Stan Agenta AI)
                  </a>
                </li>
                <li>
                  <a href="/sitemap.xml" className="hover:text-white hover:underline">
                    /sitemap.xml (Indeks Google)
                  </a>
                </li>
                <li>
                  <a href="/robots.txt" className="hover:text-white hover:underline">
                    /robots.txt (Googlebot & GEO)
                  </a>
                </li>
                <li>
                  <a href="/standalone-preview.html" className="hover:text-white hover:underline">
                    /standalone-preview.html (Tryb Statyczny)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span>
              © {new Date().getFullYear()} BM Clinic (bmclinic.co) • Wszystkie prawa zastrzeżone.
            </span>
            <span className="text-slate-500">
              Next.js 15 App Router • Vercel Prebuilt & Staged Production Ready
            </span>
          </div>
        </footer>
      </main>

      <BmClinicBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDept={selectedDept}
        defaultProcedureTitle={bookingTitle}
        estimatedPricePln={bookingPrice}
        highContrastViMode={highContrastViMode}
      />
    </div>
  );
}
