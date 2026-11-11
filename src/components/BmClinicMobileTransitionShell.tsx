'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CLINIC_ROOMS, type DepartmentRoomNode } from './BmClinicSpatialModel3D';

export type MobileSectionId = '3d-clinic' | 'departments' | 'lidar' | 'calculator' | 'database';

interface BmClinicMobileTransitionShellProps {
  selectedDept: DepartmentRoomNode['deptName'];
  onSelectDepartment: (dept: DepartmentRoomNode['deptName']) => void;
  highContrastViMode?: boolean;
  onNavigateSection?: (sectionId: MobileSectionId) => void;
}

export function applyRubberBand(distance: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  const sign = distance < 0 ? -1 : 1;
  const absD = Math.abs(distance);
  return sign * ((absD * constant * dimension) / (dimension + constant * absD));
}

export function runViewTransitionWithHaptics(
  updateFn: () => void,
  hapticMs: number | number[] = 12
) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(hapticMs);
    } catch {
      // Ignore if vibration blocked
    }
  }

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (
    !prefersReduced &&
    typeof document !== 'undefined' &&
    'startViewTransition' in document
  ) {
    (
      document as unknown as { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(() => {
      updateFn();
    });
  } else {
    updateFn();
  }
}

export default function BmClinicMobileTransitionShell({
  selectedDept,
  onSelectDepartment,
  highContrastViMode = false,
  onNavigateSection,
}: BmClinicMobileTransitionShellProps) {
  const [islandState, setIslandState] = useState<'COMPACT' | 'WAYFINDING' | 'EXPANDED'>('COMPACT');
  const [activeTab, setActiveTab] = useState<MobileSectionId>('3d-clinic');
  const [sheetDetent, setSheetDetent] = useState<'CLOSED' | 'HALF' | 'FULL'>('CLOSED');
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);

  const dragStartRef = useRef<{ y: number; time: number } | null>(null);

  const activeRoom =
    CLINIC_ROOMS.find((r) => r.deptName === selectedDept) || CLINIC_ROOMS[0];

  const handleTabSelect = useCallback(
    (tabId: MobileSectionId) => {
      runViewTransitionWithHaptics(() => {
        setActiveTab(tabId);
        if (onNavigateSection) onNavigateSection(tabId);
      }, 10);

      if (typeof document !== 'undefined') {
        const el = document.getElementById(`section-${tabId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [onNavigateSection]
  );

  const handleCycleIsland = () => {
    runViewTransitionWithHaptics(() => {
      setIslandState((prev) =>
        prev === 'COMPACT' ? 'WAYFINDING' : prev === 'WAYFINDING' ? 'EXPANDED' : 'COMPACT'
      );
    }, [10, 30, 15]);
  };

  const handleOpenQuickSheet = (dept: DepartmentRoomNode['deptName']) => {
    runViewTransitionWithHaptics(() => {
      onSelectDepartment(dept);
      setSheetDetent('HALF');
      setDragOffsetY(0);
    }, [15, 40, 20]);
  };

  // Pointer Gesture Handlers with Rubber-Banding & Velocity Projection
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = { y: e.clientY, time: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const rawDelta = e.clientY - dragStartRef.current.y;
    if (rawDelta < 0) {
      // Upward over-drag uses Apple rubber-banding formula
      setDragOffsetY(applyRubberBand(rawDelta, 280, 0.52));
    } else {
      setDragOffsetY(rawDelta);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const rawDelta = e.clientY - dragStartRef.current.y;
    const dt = Math.max(16, performance.now() - dragStartRef.current.time);
    const velocityY = rawDelta / dt; // px per ms
    const projectedY = rawDelta + velocityY * 180;

    dragStartRef.current = null;
    setDragOffsetY(0);

    runViewTransitionWithHaptics(() => {
      if (projectedY > 110) {
        setSheetDetent('CLOSED');
      } else if (projectedY < -75) {
        setSheetDetent('FULL');
      } else {
        setSheetDetent((prev) => (prev === 'CLOSED' ? 'HALF' : prev));
      }
    }, 12);
  };

  const TABS: Array<{ id: MobileSectionId; label: string; icon: string }> = [
    { id: '3d-clinic', label: 'Model 3D', icon: '🏛️' },
    { id: 'departments', label: '4 Działy', icon: '🩺' },
    { id: 'lidar', label: 'LiDAR 3D', icon: '📡' },
    { id: 'calculator', label: 'Kalkulator', icon: '💳' },
    { id: 'database', label: 'Baza AI', icon: '🧠' },
  ];

  return (
    <>
      <style>{`
        :root {
          --spring-snappy: linear(
            0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%,
            1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%,
            1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%,
            0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1
          );
          --spring-fluid: linear(
            0, 0.012, 0.049 2.4%, 0.196 5.6%, 0.618 12.4%, 0.871 16.9%,
            1.004 20.6%, 1.064 23.6%, 1.084 26.2%, 1.077 29.8%, 1.014 41.2%,
            0.991 49.4%, 0.996 62%, 1
          );
        }
        @view-transition {
          navigation: auto;
        }
        ::view-transition-group(*) {
          animation-duration: 460ms;
          animation-timing-function: var(--spring-fluid, cubic-bezier(0.22, 1, 0.36, 1));
        }
        .spring-morph-island {
          transition:
            width 520ms var(--spring-snappy, cubic-bezier(0.22, 1, 0.36, 1)),
            height 520ms var(--spring-snappy, cubic-bezier(0.22, 1, 0.36, 1)),
            border-radius 480ms var(--spring-snappy, cubic-bezier(0.22, 1, 0.36, 1)),
            transform 460ms var(--spring-fluid, cubic-bezier(0.22, 1, 0.36, 1));
        }
        .spring-sheet-transition {
          transition: transform 540ms var(--spring-fluid, cubic-bezier(0.22, 1, 0.36, 1));
        }
        @media (prefers-reduced-motion: reduce) {
          .spring-morph-island,
          .spring-sheet-transition {
            transition: opacity 120ms linear !important;
          }
        }
      `}</style>

      {/* Top Dynamic Island Morphing Pill (iOS 18/19 Fluid Spring Surface) */}
      <div className="w-full flex flex-col items-center mb-6">
        <div
          role="button"
          tabIndex={0}
          onClick={handleCycleIsland}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleCycleIsland();
          }}
          style={{ viewTransitionName: 'bmclinic-dynamic-island' }}
          className={`spring-morph-island cursor-pointer select-none overflow-hidden border shadow-2xl ${
            highContrastViMode
              ? 'bg-black border-[#ffe600] text-[#ffe600]'
              : 'bg-slate-950/90 border-cyan-400/40 backdrop-blur-2xl text-slate-100'
          } ${
            islandState === 'COMPACT'
              ? 'w-[295px] sm:w-[340px] h-[42px] rounded-full px-4 flex items-center justify-between'
              : islandState === 'WAYFINDING'
              ? 'w-[340px] sm:w-[440px] h-[68px] rounded-[28px] px-5 py-2.5 flex items-center justify-between'
              : 'w-[350px] sm:w-[540px] h-[156px] rounded-[32px] p-5 flex flex-col justify-between'
          }`}
        >
          {islandState === 'COMPACT' && (
            <>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                <span>{activeRoom.roomCode} • {activeRoom.deptName}</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                {activeRoom.beaconFreqHz} Hz • Dotknij ▾
              </span>
            </>
          )}

          {islandState === 'WAYFINDING' && (
            <>
              <div>
                <div className="text-[10px] font-mono uppercase text-lime-400">
                  NAWIGACJA PRZESTRZENNA 3D LIVE ACTIVITY • BRAILLE {activeRoom.brailleCode}
                </div>
                <div className="text-sm font-extrabold">
                  Kierunek do {activeRoom.roomCode}: {activeRoom.deptName}
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                  {activeRoom.beaconFreqHz} Hz
                </span>
              </div>
            </>
          )}

          {islandState === 'EXPANDED' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-cyan-300 font-bold">
                  DYNAMIC ISLAND • PRZEJŚCIA WSPÓŁDZIELONYCH ELEMENTÓW (SPRING 120HZ)
                </span>
                <span className="text-xs font-mono text-lime-400">
                  Braille: {activeRoom.brailleCode}
                </span>
              </div>
              <div className="text-sm font-bold">
                {activeRoom.title} — {activeRoom.equipment}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <span className="text-[11px] text-slate-300">
                  Dotknij dowolny dział poniżej, aby otworzyć kartę Bottom Sheet z fizyką sprężyny:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenQuickSheet(activeRoom.deptName);
                  }}
                  className="px-3 py-1 rounded-xl bg-lime-400/25 border border-lime-400 text-lime-200 text-xs font-bold"
                >
                  ⚡ Otwórz Szybki Sheet Mobilny
                </button>
              </div>
            </>
          )}
        </div>

        {/* Shared-Element Quick Morph Pills for the 4 Clinic Departments */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {CLINIC_ROOMS.map((room) => {
            const isSelected = room.deptName === selectedDept;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => handleOpenQuickSheet(room.deptName)}
                style={{ viewTransitionName: `mobile-pill-${room.id}` }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-transform active:scale-95 ${
                  isSelected
                    ? highContrastViMode
                      ? 'bg-[#ffe600] text-black border-white'
                      : 'bg-cyan-500/25 border-cyan-400 text-white shadow-lg scale-105'
                    : 'bg-white/5 border-white/15 text-slate-300 hover:border-cyan-400/40'
                }`}
              >
                {room.roomCode} • {room.deptName} (Sheet ↗)
              </button>
            );
          })}
        </div>
      </div>

      {/* Gesture-Driven Mobile Bottom Sheet with Rubber-Banding & Velocity Projection */}
      {sheetDetent !== 'CLOSED' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 backdrop-blur-sm p-0 sm:p-4"
          onClick={() =>
            runViewTransitionWithHaptics(() => setSheetDetent('CLOSED'), 10)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Karta mobilna działu ${activeRoom.deptName}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              viewTransitionName: 'bmclinic-active-bottom-sheet',
              transform: `translate3d(0, ${dragOffsetY}px, 0)`,
            }}
            className={`${
              dragStartRef.current ? '' : 'spring-sheet-transition'
            } w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] border p-6 shadow-2xl touch-none select-none ${
              highContrastViMode
                ? 'bg-[#05070a] border-[#ffe600] text-white'
                : 'bg-slate-900/95 border-cyan-400/40 backdrop-blur-2xl text-slate-100'
            } ${sheetDetent === 'FULL' ? 'min-h-[78vh]' : 'min-h-[42vh]'}`}
          >
            {/* Tactile Grabber Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/30 mx-auto mb-4 cursor-grab active:cursor-grabbing" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 mb-1">
                  SHARED-ELEMENT BOTTOM SHEET • RUBBER-BAND GESTURE ENGINE
                </span>
                <h3 className="text-xl font-extrabold">{activeRoom.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{activeRoom.equipment}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  runViewTransitionWithHaptics(() => setSheetDetent('CLOSED'), 10)
                }
                className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-bold hover:bg-white/20"
              >
                ✕ Zamknij
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Kod Gabinetu & Braille</span>
                <strong className="text-base font-mono text-cyan-300">
                  {activeRoom.roomCode} • {activeRoom.brailleCode}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Częstotliwość Latarni HRTF</span>
                <strong className="text-base font-mono text-lime-400">
                  {activeRoom.beaconFreqHz} Hz (3D Audio)
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block">Detent Karty (Przeciągnij)</span>
                <strong className="text-base font-mono text-amber-300">
                  {sheetDetent === 'FULL' ? 'PEŁNY EKRAN (90%)' : 'PÓŁ-KARTA (50%)'}
                </strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              💡 <strong>Wskazówka dotykowa (iOS 18/19 Fluid Gesture):</strong> Przeciągnij tę
              kartę w górę, aby rozwinąć ją z oporem sprężynowym (<em>rubber-banding</em>), lub
              szybko przesuń w dół (<em>velocity flick</em>), aby ją zamknąć.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  runViewTransitionWithHaptics(
                    () => setSheetDetent((d) => (d === 'HALF' ? 'FULL' : 'HALF')),
                    12
                  )
                }
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold"
              >
                {sheetDetent === 'HALF' ? '⬆ Rozwiń do pełnego widoku' : '⬇ Zmniejsz do pół-karty'}
              </button>
              <a
                href={`/${
                  activeRoom.deptName === 'Medycyna Estetyczna'
                    ? 'medycyna-estetyczna'
                    : activeRoom.deptName === 'Flebologia'
                    ? 'flebologia'
                    : activeRoom.deptName === 'Proktologia'
                    ? 'proktologia'
                    : 'chirurgia-ogolna'
                }`}
                className="px-4 py-2 rounded-xl bg-lime-400/25 border border-lime-400/60 text-lime-200 text-xs font-bold"
              >
                Przejdź do podstrony działu {activeRoom.deptName} →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Liquid Glass Mobile Dock (Spring-Animated Active Pill) */}
      <nav
        aria-label="Mobilny pasek nawigacji płynnej bmclinic.co"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-2.5 py-2 rounded-full border border-white/20 bg-slate-950/85 backdrop-blur-2xl shadow-2xl flex items-center gap-1 sm:gap-2"
      >
        {TABS.map((tab) => {
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSelect(tab.id)}
              style={isAct ? { viewTransitionName: 'mobile-dock-active-pill' } : undefined}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                isAct
                  ? highContrastViMode
                    ? 'bg-[#ffe600] text-black font-extrabold'
                    : 'bg-gradient-to-r from-cyan-500/35 to-lime-400/25 border border-cyan-300/60 text-white shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
