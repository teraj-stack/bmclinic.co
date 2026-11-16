'use client';

import React from 'react';
import Link from 'next/link';
import type { DepartmentRoomNode } from './BmClinicSpatialModel3D';

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

/** Preview-only. Real booking is intentionally disabled until a secure
 * persistent calendar integration and patient information processing exist.
 * Never collect health/contact data or fabricate confirmation codes here. */
export default function BmClinicBookingModal({
  isOpen,
  onClose,
  defaultDept = 'Proktologia',
  defaultProcedureTitle = '',
  highContrastViMode = false,
}: BmClinicBookingModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="booking-preview-title"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl border p-7 shadow-2xl ${highContrastViMode ? 'border-yellow-300 bg-black text-white' : 'border-teal-200/30 bg-[#091b25] text-white'}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">BM Clinic · wersja demonstracyjna</p>
            <h2 id="booking-preview-title" className="mt-2 text-2xl font-semibold">Kontakt i rejestracja</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij okno" className="rounded-full border border-white/25 px-3 py-2">✕</button>
        </div>
        <div className="rounded-2xl border border-amber-200/25 bg-amber-50/10 p-4">
          <h3 className="font-semibold text-amber-100">Rejestracja online nie jest jeszcze aktywna</h3>
          <p className="mt-2 text-sm leading-6 text-white/75">
            To podgląd interfejsu. Nie przyjmujemy tutaj danych osobowych,
            nie zapisujemy terminów i nie generujemy potwierdzeń wizyt.
          </p>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div><dt className="text-white/55">Dział</dt><dd className="font-semibold">{defaultDept}</dd></div>
          {defaultProcedureTitle && <div><dt className="text-white/55">Wybrana procedura</dt><dd className="font-semibold">{defaultProcedureTitle}</dd></div>}
        </dl>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={onClose} className="rounded-xl bg-teal-200 px-5 py-3 text-sm font-semibold text-[#073036]">Wróć do strony</button>
          <Link href={`/${defaultDept === 'Proktologia' ? 'proktologia' : defaultDept === 'Flebologia' ? 'flebologia' : defaultDept === 'Chirurgia Ogólna' ? 'chirurgia-ogolna' : 'medycyna-estetyczna'}`} onClick={onClose} className="rounded-xl border border-white/25 px-5 py-3 text-sm">Informacje o dziale</Link>
        </div>
      </div>
    </div>
  );
}
