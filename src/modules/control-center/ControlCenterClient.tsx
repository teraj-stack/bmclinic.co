'use client';

import { useState } from 'react';
import type {
  AcquisitionChannel,
  PatientFlowStage,
  PatientPriority,
  UnifiedAnalyticsDbSnapshot,
} from '@/modules/data-analytics/types';
import type {
  ControlCenterSlotDefinition,
  ReservedSlotId,
} from '@/modules/control-center/slots';

type ActiveTab = 'patient-flow' | 'ceo' | 'aeo' | ReservedSlotId;

const STAGE_LABELS: Record<PatientFlowStage, string> = {
  REJESTRACJA: 'Rejestracja',
  KWALIFIKACJA: 'Kwalifikacja',
  KONSULTACJA: 'Konsultacja',
  ZABIEG: 'Zabieg',
  WYPIS: 'Wypis',
};

const CHANNEL_LABELS: Record<AcquisitionChannel, string> = {
  AEO_AI_OVERVIEW: 'AEO / AI Overview',
  GOOGLE_SEO: 'Google SEO',
  DIRECT: 'Bezpośredni',
  REFERRAL: 'Polecenie',
};

const DEPARTMENTS = [
  { slug: 'medycyna-estetyczna', label: 'GAB-101 · Medycyna Estetyczna' },
  { slug: 'flebologia', label: 'GAB-102 · Flebologia' },
  { slug: 'proktologia', label: 'GAB-103 · Proktologia' },
  { slug: 'chirurgia-ogolna', label: 'GAB-104 · Chirurgia Ogólna' },
];

export function ControlCenterClient({
  initialSnapshot,
  reservedSlots,
}: {
  initialSnapshot: UnifiedAnalyticsDbSnapshot;
  reservedSlots: readonly ControlCenterSlotDefinition[];
}) {
  const [snapshot, setSnapshot] =
    useState<UnifiedAnalyticsDbSnapshot>(initialSnapshot);
  const [activeTab, setActiveTab] = useState<ActiveTab>('patient-flow');
  const [saving, setSaving] = useState(false);

  const [patientCode, setPatientCode] = useState('');
  const [departmentSlug, setDepartmentSlug] = useState('flebologia');
  const [channel, setChannel] = useState<AcquisitionChannel>('AEO_AI_OVERVIEW');
  const [priority, setPriority] = useState<PatientPriority>('STANDARD');

  async function handleAdvanceStage(id: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/control-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance-stage', id }),
      });
      const data = await res.json();
      if (data.ok && data.snapshot) {
        setSnapshot(data.snapshot);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/control-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-patient',
          patientCode: patientCode || `BM-2026-${Math.floor(100 + Math.random() * 899)}`,
          departmentSlug,
          channel,
          priority,
        }),
      });
      const data = await res.json();
      if (data.ok && data.snapshot) {
        setSnapshot(data.snapshot);
        setPatientCode('');
      }
    } finally {
      setSaving(false);
    }
  }

  const activeSlot = reservedSlots.find((s) => s.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nagłówek */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span>BM Clinic · Moduł Sterujący</span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px]">
                TRYB LOKALNY · KONTROLA PROJEKTU
              </span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
              Centrum Operacyjne: Ruch Pacjentów, CEO &amp; AEO
            </h1>
            <p className="text-xs text-slate-400">
              Zunifikowany moduł <span className="font-mono">data-analytics</span> (
              {snapshot.dbFilePath}) · Zero samowolki · Sloty gotowe po pierwszym pushu
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <a
              href="/"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:bg-slate-800"
            >
              ← Strona główna bmclinic.co
            </a>
          </div>
        </div>

        {/* Pasek nawigacji modułu + slotów */}
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('patient-flow')}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
              activeTab === 'patient-flow'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Ruch Pacjentów ({snapshot.ceo.activePatientsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ceo')}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
              activeTab === 'ceo'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Panel CEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aeo')}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
              activeTab === 'aeo'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            AEO &amp; SEO ({snapshot.aeoSignals.length})
          </button>

          <div className="mx-1 hidden w-px bg-slate-800 sm:block" />

          {reservedSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveTab(slot.id)}
              className={`rounded-lg border border-dashed px-3.5 py-2 text-xs font-medium transition ${
                activeTab === slot.id
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {slot.shortLabel}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Pasek szybkich KPI z zunifikowanego modułu data-analytics */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Aktywni pacjenci</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {snapshot.ceo.activePatientsCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Śr. oczekiwanie: {snapshot.ceo.avgWaitMinutes} min
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Pipeline wizyt (PLN)</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-400">
              {snapshot.ceo.totalPipelineRevenuePln.toLocaleString('pl-PL')} zł
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Wypisy dzisiaj: {snapshot.ceo.completedTodayCount}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Wynik AEO / SEO</div>
            <div className="mt-1 text-2xl font-semibold text-sky-400">
              {snapshot.ceo.avgAeoSeoScore}/100
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Udział ruchu AEO: {snapshot.ceo.aeoTrafficSharePct}%
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400">Konwersja telemetrii</div>
            <div className="mt-1 text-2xl font-semibold text-violet-400">
              {snapshot.ceo.avgConversionRatePct}%
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Przychód SEO/AEO:{' '}
              {snapshot.ceo.realizedTelemetryRevenuePln.toLocaleString('pl-PL')} zł
            </div>
          </div>
        </section>

        {/* ZAKŁADKA 1: RUCH PACJENTÓW */}
        {activeTab === 'patient-flow' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">
                    Kolejka operacyjna — Ruch pacjentów
                  </h2>
                  <span className="text-xs text-slate-400">
                    Zapis lokalny: {snapshot.dbFilePath}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {snapshot.patientFlow.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3.5"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            {patient.patientCode}
                          </span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                            {patient.roomCode} · {patient.departmentName}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                              patient.priority === 'PILNY'
                                ? 'bg-rose-500/20 text-rose-300'
                                : patient.priority === 'VIP'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {patient.priority}
                          </span>
                          <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-300">
                            {CHANNEL_LABELS[patient.channel]}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          {patient.procedureTitle}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Oczekiwanie: {patient.waitMinutes} min · Wartość:{' '}
                          {patient.estimatedValuePln.toLocaleString('pl-PL')} zł
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                          {STAGE_LABELS[patient.stage]}
                        </span>
                        {patient.stage !== 'WYPIS' && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleAdvanceStage(patient.id)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-white disabled:opacity-50"
                          >
                            Następny etap →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prawa kolumna: dodawanie zgłoszenia + obłożenie gabinetów */}
            <div className="space-y-4">
              <form
                onSubmit={handleAddPatient}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <h2 className="mb-3 text-sm font-semibold text-white">
                  Dodaj pacjenta do ruchu
                </h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="mb-1 block text-slate-400">
                      Kod pacjenta (opcjonalnie)
                    </label>
                    <input
                      type="text"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                      placeholder="np. BM-2026-045"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-slate-400">Gabinet / Dział</label>
                    <select
                      value={departmentSlug}
                      onChange={(e) => setDepartmentSlug(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-slate-400">Źródło ruchu</label>
                      <select
                        value={channel}
                        onChange={(e) =>
                          setChannel(e.target.value as AcquisitionChannel)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100 outline-none"
                      >
                        <option value="AEO_AI_OVERVIEW">AEO / AI</option>
                        <option value="GOOGLE_SEO">Google SEO</option>
                        <option value="DIRECT">Bezpośredni</option>
                        <option value="REFERRAL">Polecenie</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-slate-400">Priorytet</label>
                      <select
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as PatientPriority)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-slate-100 outline-none"
                      >
                        <option value="STANDARD">STANDARD</option>
                        <option value="PILNY">PILNY</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    + Zarejestruj w kolejce
                  </button>
                </div>
              </form>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="mb-3 text-sm font-semibold text-white">
                  Obłożenie gabinetów
                </h2>
                <div className="space-y-2.5 text-xs">
                  {snapshot.roomOccupancy.map((room) => (
                    <div
                      key={room.roomCode}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">
                          {room.roomCode} · {room.departmentName}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            room.status === 'PRZECIAZONE'
                              ? 'bg-rose-500/20 text-rose-300'
                              : room.status === 'WYSOKIE'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {room.status}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Pacjenci: {room.activePatients} · Śr. czekanie:{' '}
                        {room.avgWaitMinutes} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 2: PANEL CEO */}
        {activeTab === 'ceo' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-sm font-semibold text-white">
                Alerty decyzyjne CEO (z modułu data-analytics)
              </h2>
              <div className="space-y-2">
                {snapshot.ceo.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 text-xs ${
                      alert.severity === 'KRYTYCZNY'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                        : alert.severity === 'UWAGA'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    }`}
                  >
                    <span className="mr-2 font-semibold">[{alert.area}]</span>
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-sm font-semibold text-white">
                Efektywność działów i przychód z kanałów
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 pr-4">Filar / Dział</th>
                      <th className="py-2 pr-4">Leady</th>
                      <th className="py-2 pr-4">Konwersja</th>
                      <th className="py-2 pr-4">Ocena sprzedaży</th>
                      <th className="py-2">Przychód (PLN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {snapshot.aeoSignals.map((sig) => (
                      <tr key={sig.slug}>
                        <td className="py-2.5 pr-4 font-medium text-slate-200">
                          {sig.servicePillar}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-300">
                          {sig.leadsTotal}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-300">
                          {sig.conversionRatePct}%
                        </td>
                        <td className="py-2.5 pr-4 text-emerald-400">
                          {sig.salesEffectivenessScore}/100
                        </td>
                        <td className="py-2.5 font-mono text-slate-100">
                          {sig.revenuePln.toLocaleString('pl-PL')} zł
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 3: AEO & SEO */}
        {activeTab === 'aeo' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">
              Silnik AEO (Answer Engine Optimization) &amp; SEO — analiza stron kliniki
            </h2>
            <div className="space-y-3">
              {snapshot.aeoSignals.map((sig) => (
                <div
                  key={sig.slug}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-white">
                        {sig.procedureTitle}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {sig.urlPath} · {sig.servicePillar}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          sig.aioPassageOptimal
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        AEO pasaż: {sig.aioWordCount} słów
                      </span>
                      <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
                        SEO/AEO: {sig.compositeGoogleSeoScore}
                      </span>
                      <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                        RL Reward: {sig.agentRlReward}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-slate-300">
                    <span className="text-slate-500">Pytanie H2 AEO:</span>{' '}
                    {sig.h2AioQuestion}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sig.schemaTypes.map((st) => (
                      <span
                        key={st}
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                  {sig.insight && (
                    <p className="mt-2 text-[11px] text-slate-400">{sig.insight}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZAREZERWOWANE SLOTY (PO PIERWSZYM PUSHU NA GITA) */}
        {activeSlot && (
          <div className="rounded-xl border border-dashed border-amber-500/50 bg-slate-900/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Zarezerwowany slot rozszerzenia · Status: {activeSlot.status}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {activeSlot.title}
                </h2>
              </div>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                Instalacja po pierwszym pushu na Gita
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              {activeSlot.description}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Planowany zakres po odblokowaniu slotu
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-slate-300">
                  {activeSlot.plannedCapabilities.map((cap) => (
                    <li key={cap}>{cap}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kontrakt danych (moduł {activeSlot.dataContract.moduleOwner})
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeSlot.dataContract.expectedTables.map((tbl) => (
                    <span
                      key={tbl}
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-200"
                    >
                      {tbl}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  Zgodnie z BUILD_RULES.md żadne dodatkowe pakiety ani tabele nie
                  zostały zainstalowane samowolnie.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
