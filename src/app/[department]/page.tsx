'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import BmClinicSpatialModel3D, {
  CLINIC_ROOMS,
  type DepartmentRoomNode,
} from '@/components/BmClinicSpatialModel3D';
import BmClinicLidarDiagnosticAnalyzer from '@/components/BmClinicLidarDiagnosticAnalyzer';
import BmClinicPricingAndRecoveryCalculator from '@/components/BmClinicPricingAndRecoveryCalculator';

const SLUG_TO_DEPT: Record<string, DepartmentRoomNode['deptName']> = {
  'medycyna-estetyczna': 'Medycyna Estetyczna',
  flebologia: 'Flebologia',
  proktologia: 'Proktologia',
  'chirurgia-ogolna': 'Chirurgia Ogólna',
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

  const room =
    CLINIC_ROOMS.find((r) => r.deptName === selectedDept) || CLINIC_ROOMS[0];

  return (
    <div
      className={`min-h-screen p-6 md:p-8 transition-colors ${
        highContrastViMode ? 'bg-[#05070a] text-white' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <header className="max-w-7xl mx-auto mb-8 border-b border-cyan-500/20 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-block text-xs font-bold text-cyan-300 hover:underline mb-2"
          >
            ← Powrót do strony głównej bmclinic.co (Wszystkie 4 Działy)
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              {room.roomCode} • Braille: {room.brailleCode} • Beacon HRTF: {room.beaconFreqHz} Hz
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {room.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Wyposażenie gabinetu: <strong>{room.equipment}</strong> • {room.landmarkHintPl}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-8">
        <BmClinicSpatialModel3D
          selectedDept={selectedDept}
          onSelectDepartment={(dept) => setSelectedDept(dept)}
          highContrastViMode={highContrastViMode}
          onToggleViMode={() => setHighContrastViMode((v) => !v)}
        />

        <BmClinicLidarDiagnosticAnalyzer
          selectedDept={selectedDept}
          highContrastViMode={highContrastViMode}
        />

        <BmClinicPricingAndRecoveryCalculator
          selectedDept={selectedDept}
          highContrastViMode={highContrastViMode}
        />
      </main>
    </div>
  );
}
