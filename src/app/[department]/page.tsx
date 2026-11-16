'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import RutaWaitingRoom from '@/components/ruta/RutaWaitingRoom';
import type { RutaDepartmentSlug } from '@/data/ruta-specializacje';
import BmClinicSpatialModel3D, {
  CLINIC_ROOMS,
  type DepartmentRoomNode,
} from '@/components/BmClinicSpatialModel3D';
import BmClinicLidarDiagnosticAnalyzer from '@/components/BmClinicLidarDiagnosticAnalyzer';
import BmClinicPricingAndRecoveryCalculator from '@/components/BmClinicPricingAndRecoveryCalculator';
import BmClinicBookingModal from '@/components/BmClinicBookingModal';
import { DEPARTMENT_PROFILES } from '@/lib/clinic-departments-data';
import { buildBmClinicSchemaGraph } from '@/lib/schema-jsonld';

const SLUG_TO_DEPT: Record<string, DepartmentRoomNode['deptName']> = {
  'medycyna-estetyczna': 'Medycyna Estetyczna',
  flebologia: 'Flebologia',
  proktologia: 'Proktologia',
  'chirurgia-ogolna': 'Chirurgia Ogólna',
};

const DEPT_TO_SLUG: Record<DepartmentRoomNode['deptName'], string> = {
  'Medycyna Estetyczna': 'medycyna-estetyczna',
  Flebologia: 'flebologia',
  Proktologia: 'proktologia',
  'Chirurgia Ogólna': 'chirurgia-ogolna',
};

export default function DepartmentHubPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const resolved = use(params);
  const initialDept = SLUG_TO_DEPT[resolved.department] || 'Medycyna Estetyczna';
  const [selectedDept, setSelectedDept] =
    useState<DepartmentRoomNode['deptName']>(initialDept);
  const [highContrastViMode, setHighContrastViMode] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingProcedureTitle, setBookingProcedureTitle] = useState('');
  const [bookingPricePln, setBookingPricePln] = useState(1800);

  const activeSlug = DEPT_TO_SLUG[selectedDept] || 'medycyna-estetyczna';
  const profile =
    DEPARTMENT_PROFILES[activeSlug] || DEPARTMENT_PROFILES['medycyna-estetyczna'];
  const room =
    CLINIC_ROOMS.find((r) => r.deptName === selectedDept) || CLINIC_ROOMS[0];

  const primaryProc = profile.procedures[0];
  const schemaGraph = buildBmClinicSchemaGraph({
    urlPath: `/${profile.slug}`,
    procedureTitle: `${profile.deptName} — ${primaryProc.title}`,
    aioDirectAnswerPassage: profile.clinicalSummaryAio,
    leadPhysicianName: profile.leadPhysician,
    physicianSpecialty: profile.deptName,
    basePricePln: primaryProc.pricePln,
    h2AioQuestion: primaryProc.aioQuestion,
  });

  const handleOpenBooking = (procTitle?: string, price?: number) => {
    setBookingProcedureTitle(procTitle || `${profile.deptName} — Konsultacja / Zabieg`);
    setBookingPricePln(price || primaryProc.pricePln);
    setBookingModalOpen(true);
  };

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
          <Link
            href="/"
            className="inline-block text-xs font-bold text-cyan-300 hover:underline mb-2"
          >
            ← Powrót do strony głównej bmclinic.co (Wszystkie 4 Działy)
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              {room.roomCode} • Braille: {room.brailleCode} • Beacon HRTF: {room.beaconFreqHz} Hz
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400/15 text-lime-300 border border-lime-400/30">
              {profile.pwzNumber}
            </span>
          </div>
          {DEPARTMENT_PROFILES[activeSlug] && (
            <Link
              href={`/ruta/${activeSlug}`}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-teal-200/50 bg-teal-300/15 px-5 py-3 text-sm font-bold text-teal-100 transition-colors hover:bg-teal-300/25"
            >
              Otwórz interaktywną mapę objawów RUTA <span aria-hidden>↗</span>
            </Link>
          )}
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {room.title}
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            {profile.heroSubtitle}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Kierownik medyczny działu: <strong className="text-slate-200">{profile.leadPhysician}</strong> •{' '}
            Wyposażenie: <strong className="text-cyan-300">{room.equipment}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setHighContrastViMode((v) => !v)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border ${
              highContrastViMode
                ? 'bg-[#ffe600] text-black border-white'
                : 'border-amber-400/40 bg-amber-400/15 text-amber-200'
            }`}
          >
            {highContrastViMode ? '👁️ Tryb WCAG AAA (Aktywny)' : '👁️ Tryb Wysokiego Kontrastu VI'}
          </button>
          <button
            type="button"
            onClick={() => handleOpenBooking()}
            className="px-5 py-2.5 rounded-2xl bg-lime-400/25 border border-lime-400 text-lime-200 text-xs font-extrabold hover:bg-lime-400/35 shadow-lg"
          >
            📅 Umów wizytę w {room.roomCode} ({profile.deptName})
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8 pb-20">
        <RutaWaitingRoom key={activeSlug} department={activeSlug as RutaDepartmentSlug} name={profile.deptName} />
        {/* AI Overviews (GEO) Direct Clinical Summary + Indications */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 rounded-3xl border border-cyan-500/30 bg-white/5 backdrop-blur-xl p-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-2">
              ODPOWIEDŹ BEZPOŚREDNIA AI OVERVIEWS (GEO) • E-E-A-T • {profile.pwzNumber}
            </span>
            <h2 className="text-xl font-extrabold text-white mb-2">
              Jak przebiega diagnostyka i leczenie w dziale {profile.deptName} w BM Clinic?
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              {profile.clinicalSummaryAio}
            </p>

            <div className="mt-5 pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase text-cyan-300 font-bold mb-2">
                Technologie i Urządzenia Zabiegowe ({room.roomCode}):
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {profile.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-200 font-medium"
                  >
                    ✓ {tech}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-amber-300 font-bold">
                Wskazania Kliniczne • {profile.deptName}
              </span>
              <h3 className="text-lg font-extrabold mt-1 mb-3">
                Najczęstsze wskazania do wizyty w {room.roomCode}:
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-200">
                {profile.indications.map((ind) => (
                  <li key={ind} className="flex items-start gap-2">
                    <span className="text-lime-400 font-bold">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
              Ścieżka dostępności VI: <em className="text-slate-300">{room.landmarkHintPl}</em>
            </div>
          </aside>
        </section>

        {/* Department Flagship Procedures Grid */}
        <section className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-300 font-bold">
                KATALOG PROCEDUR MAŁOINWAZYJNYCH • WALK-IN / WALK-OUT
              </span>
              <h2 className="text-xl font-extrabold mt-0.5">
                Zabiegi i Procedury Medyczne — {profile.deptName}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.procedures.map((proc) => (
              <div
                key={proc.slug}
                className="p-5 rounded-2xl border border-white/15 bg-slate-900/75 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {proc.technologyBadge}
                    </span>
                    <span className="text-lg font-black text-amber-300">
                      od {proc.pricePln} PLN
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{proc.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{proc.shortDesc}</p>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] bg-slate-950/80 p-3 rounded-xl border border-white/10">
                    <div>
                      <span className="text-slate-400 block">Czas zabiegu</span>
                      <strong className="text-cyan-300">{proc.durationMin}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Znieczulenie</span>
                      <strong className="text-slate-200">{proc.anesthesia}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Rekonwalescencja</span>
                      <strong className="text-lime-300">{proc.recoveryWalkOut}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <Link
                    href={`/procedury/${proc.slug}`}
                    className="text-xs font-bold text-cyan-300 hover:underline"
                  >
                    Szczegóły zabiegu i opis GEO (/procedury/{proc.slug}) →
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(proc.title, proc.pricePln)}
                    className="px-3.5 py-1.5 rounded-xl bg-lime-400/20 border border-lime-400/50 text-lime-200 text-xs font-bold hover:bg-lime-400/30"
                  >
                    Umów zabieg
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3D Digital Twin & VI Wayfinding */}
        <BmClinicSpatialModel3D
          selectedDept={selectedDept}
          onSelectDepartment={(dept) => setSelectedDept(dept)}
          highContrastViMode={highContrastViMode}
          onToggleViMode={() => setHighContrastViMode((v) => !v)}
        />

        {/* 6-Parameter 3D LiDAR Diagnostic Analyzer */}
        <BmClinicLidarDiagnosticAnalyzer
          selectedDept={selectedDept}
          highContrastViMode={highContrastViMode}
        />

        {/* Transparent Pricing & Recovery Calculator */}
        <BmClinicPricingAndRecoveryCalculator
          selectedDept={selectedDept}
          basePricePln={primaryProc.pricePln}
          highContrastViMode={highContrastViMode}
          onCalculatorLead={(quotePln) =>
            handleOpenBooking(`${profile.deptName} — Pakiet z Kalkulatora`, quotePln)
          }
        />

        {/* FAQ Section for Google Rich Results & Patients */}
        <section className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-6">
          <span className="text-xs font-mono uppercase text-cyan-300 font-bold">
            FAQ • PYTANIA PACJENTÓW & DANE STRUKTURALNE SCHEMA.ORG
          </span>
          <h2 className="text-xl font-extrabold mt-1 mb-4">
            Najczęściej zadawane pytania — {profile.deptName} ({room.roomCode})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.faqs.map((faq) => (
              <div
                key={faq.q}
                className="p-4 rounded-2xl bg-slate-900/80 border border-white/10"
              >
                <h3 className="text-sm font-bold text-cyan-200">{faq.q}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BmClinicBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDept={selectedDept}
        defaultProcedureTitle={bookingProcedureTitle}
        estimatedPricePln={bookingPricePln}
        highContrastViMode={highContrastViMode}
      />
    </div>
  );
}
