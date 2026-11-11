'use client';

import React, { useState } from 'react';
import { CLINIC_ROOMS, type DepartmentRoomNode } from './BmClinicSpatialModel3D';

interface BmClinicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDept?: DepartmentRoomNode['deptName'];
  defaultProcedureTitle?: string;
  estimatedPricePln?: number;
  highContrastViMode?: boolean;
  onBookingConfirmed?: (details: {
    bookingCode: string;
    deptName: DepartmentRoomNode['deptName'];
    procedureTitle: string;
    estimatedPricePln: number;
  }) => void;
}

export default function BmClinicBookingModal({
  isOpen,
  onClose,
  defaultDept = 'Medycyna Estetyczna',
  defaultProcedureTitle = '',
  estimatedPricePln = 1800,
  highContrastViMode = false,
  onBookingConfirmed,
}: BmClinicBookingModalProps) {
  const [deptName, setDeptName] = useState<DepartmentRoomNode['deptName']>(defaultDept);
  const [visitMode, setVisitMode] = useState<
    'CONSULTATION_DIAGNOSTICS' | 'WALK_IN_LASER_PROCEDURE' | 'POST_OP_CONTROL'
  >('CONSULTATION_DIAGNOSTICS');
  const [viAssistance, setViAssistance] = useState<
    'STANDARD' | 'VI_HRTF_BRAILLE_ASSIST' | 'QUIET_SENSORY_HOUR'
  >('STANDARD');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-11-16');
  const [preferredTime, setPreferredTime] = useState('11:30');
  const [rodoAccepted, setRodoAccepted] = useState(true);
  const [confirmedPass, setConfirmedPass] = useState<{
    bookingCode: string;
    roomCode: string;
    brailleCode: string;
    beaconFreqHz: number;
    deptName: DepartmentRoomNode['deptName'];
    visitMode: string;
    viAssistance: string;
    preferredDate: string;
    preferredTime: string;
    estimatedPricePln: number;
  } | null>(null);

  if (!isOpen) return null;

  const activeRoom =
    CLINIC_ROOMS.find((r) => r.deptName === deptName) || CLINIC_ROOMS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !rodoAccepted) return;

    const bookingCode = `BM-REZ-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const pass = {
      bookingCode,
      roomCode: activeRoom.roomCode,
      brailleCode: activeRoom.brailleCode,
      beaconFreqHz: activeRoom.beaconFreqHz,
      deptName,
      visitMode,
      viAssistance,
      preferredDate,
      preferredTime,
      estimatedPricePln,
    };

    setConfirmedPass(pass);

    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'BOOKING_CONFIRMED',
          bookingCode,
          department: deptName,
          roomCode: activeRoom.roomCode,
          visitMode,
          viAssistance,
          revenueAttributedPln: estimatedPricePln,
        }),
      });
    } catch {
      // Non-blocking telemetry
    }

    if (onBookingConfirmed) {
      onBookingConfirmed({
        bookingCode,
        deptName,
        procedureTitle: defaultProcedureTitle || `Wizyta w dziale: ${deptName}`,
        estimatedPricePln,
      });
    }
  };

  const handleDownloadPass = () => {
    if (!confirmedPass) return;
    const blob = new Blob([JSON.stringify(confirmedPass, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${confirmedPass.bookingCode}_bmclinic_pass.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rezerwacja wizyty online w BM Clinic"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl border p-6 md:p-8 shadow-2xl ${
          highContrastViMode
            ? 'bg-[#05070a] border-[#ffe600] text-white'
            : 'bg-slate-900/95 border-cyan-400/40 text-slate-100'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4 mb-5">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/40 mb-1">
              REZERWACJA ONLINE 24/7 • WALK-IN / WALK-OUT • ASYSTA VI HRTF & BRAILLE
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold">
              Umów wizytę lub zabieg 1 dnia w BM Clinic (bmclinic.co)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-bold hover:bg-white/20"
          >
            ✕ Zamknij
          </button>
        </div>

        {confirmedPass ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-lime-400/50 bg-lime-400/10">
              <div className="text-xs font-mono uppercase text-lime-300 font-bold">
                ✓ REZERWACJA POTWIERDZONA • KOD PRZEPUSTKI: {confirmedPass.bookingCode}
              </div>
              <h3 className="text-xl font-extrabold mt-1">
                {confirmedPass.deptName} — {confirmedPass.roomCode}
              </h3>
              <p className="text-xs text-slate-200 mt-1">
                Termin: <strong>{confirmedPass.preferredDate}</strong> o godz.{' '}
                <strong>{confirmedPass.preferredTime}</strong> • Szacowany koszt:{' '}
                <strong>{confirmedPass.estimatedPricePln} PLN</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/15">
                  <span className="text-slate-400 block">Gabinet & Kod Braille’a</span>
                  <strong className="text-cyan-300 font-mono text-sm">
                    {confirmedPass.roomCode} • {confirmedPass.brailleCode}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/15">
                  <span className="text-slate-400 block">Latarnia Dźwiękowa HRTF</span>
                  <strong className="text-lime-400 font-mono text-sm">
                    {confirmedPass.beaconFreqHz} Hz (3D Audio)
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/15">
                  <span className="text-slate-400 block">Tryb Dostępności</span>
                  <strong className="text-amber-300 font-mono text-sm">
                    {confirmedPass.viAssistance}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadPass}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/25 border border-cyan-400 text-cyan-200 text-xs font-bold hover:bg-cyan-500/35"
              >
                ⬇ Pobierz Przepustkę Nawigacyjną 3D / VI (.json)
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedPass(null);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-lime-400/25 border border-lime-400 text-lime-200 text-xs font-bold"
              >
                Gotowe
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  1. Wybierz dział kliniki bmclinic.co:
                </label>
                <select
                  value={deptName}
                  onChange={(e) =>
                    setDeptName(e.target.value as DepartmentRoomNode['deptName'])
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
                >
                  {CLINIC_ROOMS.map((r) => (
                    <option key={r.id} value={r.deptName}>
                      {r.roomCode} • {r.deptName} ({r.beaconFreqHz} Hz)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  2. Rodzaj wizyty / procedury:
                </label>
                <select
                  value={visitMode}
                  onChange={(e) =>
                    setVisitMode(
                      e.target.value as
                        | 'CONSULTATION_DIAGNOSTICS'
                        | 'WALK_IN_LASER_PROCEDURE'
                        | 'POST_OP_CONTROL'
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
                >
                  <option value="CONSULTATION_DIAGNOSTICS">
                    Konsultacja Specjalistyczna + Skan 3D LiDAR / USG Doppler
                  </option>
                  <option value="WALK_IN_LASER_PROCEDURE">
                    Zabieg Małoinwazyjny 1 Dnia (Walk-In / Walk-Out)
                  </option>
                  <option value="POST_OP_CONTROL">
                    Wizyta Kontrolna Pozabiegowa + Kontrola Gojenia WHI-3D
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                3. Profil dostępności i nawigacji wewnątrz kliniki (WCAG AAA / VI):
              </label>
              <select
                value={viAssistance}
                onChange={(e) =>
                  setViAssistance(
                    e.target.value as
                      | 'STANDARD'
                      | 'VI_HRTF_BRAILLE_ASSIST'
                      | 'QUIET_SENSORY_HOUR'
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
              >
                <option value="STANDARD">
                  Standardowa wizyta + dostęp do modelu 3D kliniki w telefonie
                </option>
                <option value="VI_HRTF_BRAILLE_ASSIST">
                  Asysta dla pacjenta niewidomego / słabowidzącego (VI + Latarnia HRTF{' '}
                  {activeRoom.beaconFreqHz} Hz + tabliczki Braille {activeRoom.brailleCode})
                </option>
                <option value="QUIET_SENSORY_HOUR">
                  Cicha godzina sensoryczna + bezpośrednie wejście przez dyskretną śluzę
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Imię i nazwisko pacjenta:
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Jan Kowalski"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Telefon kontaktowy (SMS z kodem gabinetu):
                </label>
                <input
                  type="tel"
                  required
                  placeholder="np. +48 600 000 000"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Preferowana data wizyty:
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Preferowana godzina:
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white"
                >
                  <option value="09:00">09:00 (Poranny blok diagnostyczny)</option>
                  <option value="11:30">11:30 (Blok zabiegowy Walk-In / Walk-Out)</option>
                  <option value="14:00">14:00 (Blok laseroterapii 1470 nm)</option>
                  <option value="16:30">16:30 (Popołudniowe konsultacje specjalistyczne)</option>
                  <option value="18:30">18:30 (Wieczorny dyżur chirurgii 1 dnia)</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={rodoAccepted}
                onChange={(e) => setRodoAccepted(e.target.checked)}
                required
                className="mt-0.5 accent-cyan-400"
              />
              <span className="text-slate-300 leading-relaxed">
                Wyrażam zgodę na przetwarzanie danych kontaktowych w celu potwierdzenia wizyty
                lekarskiej w <strong>BM Clinic (bmclinic.co)</strong> zgodnie z RODO oraz ustawą o
                prawach pacjenta.
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-slate-400">
                Docelowy gabinet: <strong className="text-cyan-300">{activeRoom.roomCode}</strong> •
                Braille: <strong className="text-amber-300">{activeRoom.brailleCode}</strong>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-lime-400/25 border border-lime-400 text-lime-200 font-extrabold hover:bg-lime-400/35"
              >
                ✓ Potwierdź rezerwację wizyty ({estimatedPricePln} PLN)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
