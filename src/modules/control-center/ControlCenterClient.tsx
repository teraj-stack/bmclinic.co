'use client';

import { useState } from 'react';
import type {
  AcquisitionChannel,
  InstrumentSetStatus,
  PatientFlowStage,
  PatientPriority,
  PostOpAlertLevel,
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

const INSTRUMENT_LABELS: Record<InstrumentSetStatus, string> = {
  STERYLNY: 'Sterylny (gotowy)',
  W_UZYCIU: 'W użyciu',
  DO_STERYLIZACJI: 'Do sterylizacji',
  W_AUTOKLAWIE: 'W autoklawie',
};

const DEPARTMENTS = [
  { slug: 'medycyna-estetyczna', label: 'GAB-101 · Medycyna Estetyczna', name: 'Medycyna Estetyczna' },
  { slug: 'flebologia', label: 'GAB-102 · Flebologia', name: 'Flebologia' },
  { slug: 'proktologia', label: 'GAB-103 · Proktologia', name: 'Proktologia' },
  { slug: 'chirurgia-ogolna', label: 'GAB-104 · Chirurgia Ogólna', name: 'Chirurgia Ogólna' },
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

  const [postOpCode, setPostOpCode] = useState('');
  const [postOpDept, setPostOpDept] = useState('Flebologia');
  const [postOpProc, setPostOpProc] = useState('');
  const [postOpNotes, setPostOpNotes] = useState('');

  async function postAction(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch('/api/control-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    await postAction({
      action: 'add-patient',
      patientCode: patientCode || `BM-2026-${Math.floor(100 + Math.random() * 899)}`,
      departmentSlug,
      channel,
      priority,
    });
    setPatientCode('');
  }

  async function handleAddPostOp(e: React.FormEvent) {
    e.preventDefault();
    await postAction({
      action: 'add-postop',
      patientCode: postOpCode || `BM-2026-${Math.floor(100 + Math.random() * 899)}`,
      departmentName: postOpDept,
      procedureTitle: postOpProc || 'Zabieg laserowy / ambulatoryjny',
      notes: postOpNotes,
    });
    setPostOpCode('');
    setPostOpProc('');
    setPostOpNotes('');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nagłówek */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span>BM Clinic · Moduł Sterujący</span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px]">
                GAŁĄŹ: feat/control-center · SLOTY 1 &amp; 2 AKTYWNE
              </span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
              Centrum Operacyjne: Ruch Pacjentów, CEO, AEO, Narzędzia i Opieka Pooperacyjna
            </h1>
            <p className="text-xs text-slate-400">
              Wspólny moduł <span className="font-mono">data-analytics</span> (
              {snapshot.dbFilePath}) · Dr Jan Bujok &amp; Milena Skrzyńska
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

        {/* Nawigacja: 3 moduły rdzeniowe + 2 aktywne sloty */}
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
            Panel CEO ({snapshot.ceo.alerts.length})
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
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                activeTab === slot.id
                  ? 'border-sky-400 bg-sky-500 text-slate-950'
                  : 'border-sky-500/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20'
              }`}
            >
              {slot.shortLabel}
              {slot.id === 'tools-inventory' &&
                snapshot.ceo.lowStockConsumablesCount > 0 &&
                ` (${snapshot.ceo.lowStockConsumablesCount}!)`}
              {slot.id === 'post-op-care' &&
                ` (${snapshot.ceo.activePostOpCount})`}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Pasek KPI */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="text-[11px] text-slate-400">Aktywni pacjenci</div>
            <div className="mt-1 text-xl font-semibold text-white">
              {snapshot.ceo.activePatientsCount}
            </div>
            <div className="text-[11px] text-slate-500">
              Śr. czekanie: {snapshot.ceo.avgWaitMinutes} min
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="text-[11px] text-slate-400">Pipeline wizyt</div>
            <div className="mt-1 text-xl font-semibold text-emerald-400">
              {snapshot.ceo.totalPipelineRevenuePln.toLocaleString('pl-PL')} zł
            </div>
            <div className="text-[11px] text-slate-500">
              Wypisy: {snapshot.ceo.completedTodayCount}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="text-[11px] text-slate-400">Wynik AEO / SEO</div>
            <div className="mt-1 text-xl font-semibold text-sky-400">
              {snapshot.ceo.avgAeoSeoScore}/100
            </div>
            <div className="text-[11px] text-slate-500">
              Ruch AEO: {snapshot.ceo.aeoTrafficSharePct}%
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="text-[11px] text-slate-400">Konwersja</div>
            <div className="mt-1 text-xl font-semibold text-violet-400">
              {snapshot.ceo.avgConversionRatePct}%
            </div>
            <div className="text-[11px] text-slate-500">Telemetria stron</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="text-[11px] text-slate-400">Zestawy sterylne</div>
            <div className="mt-1 text-xl font-semibold text-emerald-300">
              {snapshot.ceo.sterileSetsReadyCount}/{snapshot.instrumentSets.length}
            </div>
            <div className="text-[11px] text-amber-400">
              Niskie stany: {snapshot.ceo.lowStockConsumablesCount}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5">
            <div className="text-[11px] text-slate-400">Opieka pooperacyjna</div>
            <div className="mt-1 text-xl font-semibold text-sky-300">
              {snapshot.ceo.activePostOpCount}
            </div>
            <div className="text-[11px] text-rose-400">
              Pilny kontakt: {snapshot.ceo.urgentPostOpAlertsCount}
            </div>
          </div>
        </section>

        {/* ZAKŁADKA 1: RUCH PACJENTÓW */}
        {activeTab === 'patient-flow' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-white">
                    Kolejka operacyjna — Ruch pacjentów
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Przejście na WYPIS automatycznie przekazuje pacjenta do Prowadzenia pooperacyjnego
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
                            onClick={() =>
                              postAction({ action: 'advance-stage', id: patient.id })
                            }
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
                Alerty decyzyjne CEO (ruch pacjentów + narzędzia/zużycia + opieka pooperacyjna + AEO)
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

        {/* SLOT 1 (AKTYWNY): OBRÓT NARZĘDZI I ZUŻYĆ */}
        {activeTab === 'tools-inventory' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Zestawy narzędzi i sterylizacja */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-1 text-sm font-semibold text-white">
                Obieg zestawów narzędzi i sterylizacja
              </h2>
              <p className="mb-4 text-xs text-slate-400">
                Cykl: Sterylny → W użyciu → Do sterylizacji → W autoklawie → Sterylny
              </p>
              <div className="space-y-3">
                {snapshot.instrumentSets.map((set) => (
                  <div
                    key={set.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-white">
                          {set.code}
                        </span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                          {set.roomCode}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-300">{set.name}</div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Cykle: {set.cycleCount} · Ważność: {set.expiresAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          set.status === 'STERYLNY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : set.status === 'W_UZYCIU'
                              ? 'bg-sky-500/20 text-sky-300'
                              : set.status === 'DO_STERYLIZACJI'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {INSTRUMENT_LABELS[set.status]}
                      </span>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          postAction({ action: 'advance-instrument', id: set.id })
                        }
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-white disabled:opacity-50"
                      >
                        Następny etap →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Materiały zużywalne */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-1 text-sm font-semibold text-white">
                Rozchód materiałów zużywalnych
              </h2>
              <p className="mb-4 text-xs text-slate-400">
                Stany poniżej minimum automatycznie generują alert w Panelu CEO
              </p>
              <div className="space-y-3">
                {snapshot.consumables.map((item) => {
                  const isLow = item.stockQty < item.minThreshold;
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 text-xs ${
                        isLow
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-slate-800 bg-slate-950/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-white">
                            {item.sku}
                          </span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {item.category}
                          </span>
                          {isLow && (
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              NISKI STAN
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-slate-200">{item.name}</div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          Stan: <strong className="text-white">{item.stockQty} {item.unit}</strong>{' '}
                          (min. {item.minThreshold}) · Zużyto dziś: {item.usedToday} · Koszt: {item.unitCostPln} zł
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={saving || item.stockQty === 0}
                          onClick={() =>
                            postAction({
                              action: 'adjust-consumable',
                              id: item.id,
                              delta: -1,
                            })
                          }
                          className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-medium text-rose-200 hover:bg-rose-500/25 disabled:opacity-40"
                        >
                          −1 zużycie
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            postAction({
                              action: 'adjust-consumable',
                              id: item.id,
                              delta: 5,
                            })
                          }
                          className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40"
                        >
                          +5 dostawa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SLOT 2 (AKTYWNY): PROWADZENIE POOPERACYJNE */}
        {activeTab === 'post-op-care' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="mb-1 text-sm font-semibold text-white">
                  Aktywna opieka pooperacyjna (D+1 · D+7 · D+30)
                </h2>
                <p className="mb-4 text-xs text-slate-400">
                  Koordynacja kontaktu przed/po wizycie: Milena Skrzyńska · Nadzór kliniczny: Dr Jan Bujok
                </p>

                <div className="space-y-3">
                  {snapshot.postOpCare.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-lg border p-4 text-xs ${
                        entry.alertLevel === 'PILNY_KONTAKT'
                          ? 'border-rose-500/50 bg-rose-500/10'
                          : 'border-slate-800 bg-slate-950/70'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-semibold text-white">
                            {entry.patientCode}
                          </span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                            {entry.departmentName}
                          </span>
                          <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                            Etap: {entry.milestone}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Następna kontrola: {entry.nextCheckDate}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <select
                            aria-label="Poziom alertu pooperacyjnego"
                            value={entry.alertLevel}
                            disabled={saving}
                            onChange={(e) =>
                              postAction({
                                action: 'set-postop-alert',
                                id: entry.id,
                                alertLevel: e.target.value as PostOpAlertLevel,
                              })
                            }
                            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100"
                          >
                            <option value="BRAK">Status: OK</option>
                            <option value="KONTROLA">Wymaga kontroli</option>
                            <option value="PILNY_KONTAKT">PILNY KONTAKT</option>
                          </select>
                          {entry.milestone !== 'ZAKONCZONO' && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                postAction({ action: 'advance-postop', id: entry.id })
                              }
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-950 hover:bg-white disabled:opacity-50"
                            >
                              Kolejna kontrola →
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 font-medium text-slate-200">
                        {entry.procedureTitle}
                      </div>
                      <p className="mt-1 text-slate-400">{entry.notes}</p>
                      <div className="mt-2 text-[11px] text-slate-500">
                        Lekarz: {entry.physicianName} · Opiekun pacjenta: {entry.careCoordinator}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleAddPostOp}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-xs"
            >
              <h2 className="mb-3 text-sm font-semibold text-white">
                Dodaj pacjenta do opieki pooperacyjnej
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-slate-400">Kod pacjenta</label>
                  <input
                    type="text"
                    value={postOpCode}
                    onChange={(e) => setPostOpCode(e.target.value)}
                    placeholder="np. BM-2026-049"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Dział</label>
                  <select
                    value={postOpDept}
                    onChange={(e) => setPostOpDept(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.slug} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Zabieg</label>
                  <input
                    type="text"
                    value={postOpProc}
                    onChange={(e) => setPostOpProc(e.target.value)}
                    placeholder="np. EVLT 1470 nm / LHP"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Zalecenia / uwagi organizacyjne</label>
                  <textarea
                    rows={3}
                    value={postOpNotes}
                    onChange={(e) => setPostOpNotes(e.target.value)}
                    placeholder="Np. kontakt telefoniczny D+1, kontrola opatrunku…"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-sky-500 py-2 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
                >
                  + Utwórz plan D+1 / D+7 / D+30
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
