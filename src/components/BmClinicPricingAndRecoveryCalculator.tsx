'use client';

import React, { useState, useMemo } from 'react';
import type { DepartmentRoomNode } from './BmClinicSpatialModel3D';

interface BmClinicPricingAndRecoveryCalculatorProps {
  selectedDept: DepartmentRoomNode['deptName'];
  basePricePln?: number;
  highContrastViMode?: boolean;
  onCalculatorLead?: (estimatedTotalPln: number) => void;
}

const DEPT_CONFIG: Record<
  DepartmentRoomNode['deptName'],
  {
    defaultBasePln: number;
    diagnosticLabel: string;
    diagnosticPricePln: number;
    recoveryDaysWalkIn: string;
    sportReturnDays: string;
    laserFiberLabel: string;
    laserFiberCostPln: number;
  }
> = {
  'Medycyna Estetyczna': {
    defaultBasePln: 1400,
    diagnosticLabel: 'Komputerowa Analiza Skóry 3D + Kwalifikacja Lekarska',
    diagnosticPricePln: 250,
    recoveryDaysWalkIn: '0 dni (powrót do pracy tego samego dnia)',
    sportReturnDays: '2–3 dni (ochrona fotoprotekcyjna SPF 50+)',
    laserFiberLabel: 'Pakiet Regeneracji Osoczem Bogatopłytkowym PRP',
    laserFiberCostPln: 600,
  },
  Flebologia: {
    defaultBasePln: 3800,
    diagnosticLabel: 'Badanie USG Doppler Żył Kończyn Dolnych 3D',
    diagnosticPricePln: 300,
    recoveryDaysWalkIn: 'Walk-in / Walk-out (wyjście z kliniki po 45 min)',
    sportReturnDays: '7–10 dni (kompresjoterapia pończochą II kl.)',
    laserFiberLabel: 'Jednorazowe Włókno Radialne Lasera EVLT 1470 nm',
    laserFiberCostPln: 900,
  },
  Proktologia: {
    defaultBasePln: 3600,
    diagnosticLabel: 'Wideo-Anoskopia HD + Kwalifikacja Proktologiczna',
    diagnosticPricePln: 320,
    recoveryDaysWalkIn: '1–2 dni (zabieg małoinwazyjny bez szwów i nacięć)',
    sportReturnDays: '10–14 dni (pełny komfort siedzenia i aktywności)',
    laserFiberLabel: 'Światłowód Proktologiczny Biolitec LHP / FiLaC 1470 nm',
    laserFiberCostPln: 850,
  },
  'Chirurgia Ogólna': {
    defaultBasePln: 1800,
    diagnosticLabel: 'Konsultacja Chirurgiczna + Badanie Histopatologiczne',
    diagnosticPricePln: 280,
    recoveryDaysWalkIn: '0–1 dzień (znieczulenie miejscowe / tumescencyjne)',
    sportReturnDays: '5–7 dni (kontrola i zdjęcie szwów kosmetycznych)',
    laserFiberLabel: 'Zestaw Radiochirurgii RF + Opatrunek Hydrokoloidowy',
    laserFiberCostPln: 450,
  },
};

export default function BmClinicPricingAndRecoveryCalculator({
  selectedDept,
  basePricePln,
  highContrastViMode = false,
  onCalculatorLead,
}: BmClinicPricingAndRecoveryCalculatorProps) {
  const cfg = DEPT_CONFIG[selectedDept];
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [includeLaserPackage, setIncludeLaserPackage] = useState(true);
  const [anesthesiaMode, setAnesthesiaMode] = useState<'LOCAL_TUMESCENT' | 'ANALGOSEDATION'>(
    'LOCAL_TUMESCENT'
  );
  const [followUpControl, setFollowUpControl] = useState(true);
  const [submittedQuote, setSubmittedQuote] = useState<number | null>(null);

  const totalPln = useMemo(() => {
    const startPrice = basePricePln && basePricePln > 0 ? basePricePln : cfg.defaultBasePln;
    let sum = startPrice;
    if (includeDiagnostics) sum += cfg.diagnosticPricePln;
    if (includeLaserPackage) sum += cfg.laserFiberCostPln;
    if (anesthesiaMode === 'ANALGOSEDATION') sum += 750;
    if (followUpControl) sum += 200;
    return sum;
  }, [
    anesthesiaMode,
    basePricePln,
    cfg.defaultBasePln,
    cfg.diagnosticPricePln,
    cfg.laserFiberCostPln,
    followUpControl,
    includeDiagnostics,
    includeLaserPackage,
  ]);

  const installments12x = Math.round(totalPln / 12);

  return (
    <section
      aria-label="Transparentny Kalkulator Kosztów Zabiegu i Rekonwalescencji"
      className={`rounded-3xl border p-6 transition-all ${
        highContrastViMode
          ? 'bg-[#05070a] border-[#ffe600] text-white'
          : 'border-amber-400/25 bg-white/5 backdrop-blur-2xl shadow-2xl'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-200 border border-amber-400/30 mb-1">
            ARCHETYP KONWERSJI • TRANSPARENT_PRICING_CALCULATOR (E-E-A-T + NAVBOOST)
          </span>
          <h2 className="text-xl font-extrabold">
            Kalkulator Kosztów Zabiegu i Czasu Powrotu do Aktywności — {selectedDept}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Szacowany koszt całkowity (0 ukrytych opłat)</div>
          <div className="text-2xl md:text-3xl font-black text-amber-300">
            {totalPln} PLN{' '}
            <span className="text-xs font-normal text-slate-300">
              (lub 12 × {installments12x} PLN MediRaty)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-white/15 bg-slate-900/70 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDiagnostics}
              onChange={(e) => setIncludeDiagnostics(e.target.checked)}
              className="mt-0.5 accent-cyan-400"
            />
            <div>
              <div className="font-bold text-slate-100">{cfg.diagnosticLabel}</div>
              <div className="text-cyan-300 font-mono mt-0.5">+{cfg.diagnosticPricePln} PLN</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-white/15 bg-slate-900/70 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLaserPackage}
              onChange={(e) => setIncludeLaserPackage(e.target.checked)}
              className="mt-0.5 accent-cyan-400"
            />
            <div>
              <div className="font-bold text-slate-100">{cfg.laserFiberLabel}</div>
              <div className="text-cyan-300 font-mono mt-0.5">+{cfg.laserFiberCostPln} PLN</div>
            </div>
          </label>

          <div className="p-3.5 rounded-2xl border border-white/15 bg-slate-900/70">
            <div className="font-bold text-slate-100 mb-2">Rodzaj znieczulenia zabiegowego:</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAnesthesiaMode('LOCAL_TUMESCENT')}
                className={`flex-1 py-1.5 px-2 rounded-xl font-bold border ${
                  anesthesiaMode === 'LOCAL_TUMESCENT'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                    : 'border-white/15 bg-white/5 text-slate-400'
                }`}
              >
                Miejscowe (0 PLN)
              </button>
              <button
                type="button"
                onClick={() => setAnesthesiaMode('ANALGOSEDATION')}
                className={`flex-1 py-1.5 px-2 rounded-xl font-bold border ${
                  anesthesiaMode === 'ANALGOSEDATION'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                    : 'border-white/15 bg-white/5 text-slate-400'
                }`}
              >
                Analgosedacja (+750 PLN)
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-white/15 bg-slate-900/70 cursor-pointer">
            <input
              type="checkbox"
              checked={followUpControl}
              onChange={(e) => setFollowUpControl(e.target.checked)}
              className="mt-0.5 accent-cyan-400"
            />
            <div>
              <div className="font-bold text-slate-100">
                Wizyta kontrolna po zabiegu + kontrolny skan USG/3D
              </div>
              <div className="text-cyan-300 font-mono mt-0.5">+200 PLN</div>
            </div>
          </label>
        </div>

        <div className="p-4 rounded-2xl border border-white/15 bg-slate-900/90 flex flex-col justify-between text-xs">
          <div className="space-y-2">
            <div className="font-mono uppercase text-amber-300 font-bold">
              Oś Czasu Rekonwalescencji (Walk-in / Walk-out)
            </div>
            <div>
              <span className="text-slate-400 block">Powrót do pracy biurowej:</span>
              <strong className="text-slate-100">{cfg.recoveryDaysWalkIn}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Pełny wysiłek fizyczny / sport:</span>
              <strong className="text-slate-100">{cfg.sportReturnDays}</strong>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setSubmittedQuote(totalPln);
                if (onCalculatorLead) onCalculatorLead(totalPln);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-lime-400/25 border border-lime-400/60 text-lime-200 font-extrabold hover:bg-lime-400/35"
            >
              ✓ Zapisz kosztorys i zarezerwuj termin ({totalPln} PLN)
            </button>
            {submittedQuote !== null && (
              <div className="mt-2 text-[11px] text-lime-300 font-semibold">
                Zarejestrowano lead kalkulatora ({submittedQuote} PLN) — sygnał +goodClick &
                +calculatorLead wysłany do Agenta AI.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
