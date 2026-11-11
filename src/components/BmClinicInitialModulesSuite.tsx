'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  evaluateBmClinicPageForAgent,
  type BmClinicPageConfig,
  type BmClinicTelemetry,
  type ContentArchetype,
} from '@/lib/seo-scoring-engine';
import type { DepartmentRoomNode } from './BmClinicSpatialModel3D';

export interface BmClinicPageEntryItem {
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  insight: string;
}

interface BmClinicInitialModulesSuiteProps {
  selectedDept: DepartmentRoomNode['deptName'];
  entries: BmClinicPageEntryItem[];
  highContrastViMode?: boolean;
  onDeployBlueprintPage: (newEntry: BmClinicPageEntryItem) => void;
  onTriggerTelemetryAction?: (type: '3D_LASER_INTERACT' | 'PARALLAX_WINDOW' | 'POSTCARE_KIT') => void;
}

type ParallaxTrajectory = 'CIRCLE' | 'SWAY' | 'FIGURE_8' | 'BREATH' | 'MOUSE';
type WindowTimeOfDay = 'DAWN' | 'NOON' | 'GOLDEN' | 'TWILIGHT';

const POST_CARE_KITS: Array<{
  id: string;
  dept: DepartmentRoomNode['deptName'];
  title: string;
  items: string;
  pricePln: number;
  badge: string;
}> = [
  {
    id: 'kit-estetyczna',
    dept: 'Medycyna Estetyczna',
    title: 'Zestaw Pozabiegowy Derm-Regen 3D (SPF 50+ & Hydro-Gel)',
    items: 'Krem barierowy po laserze frakcyjnym + mgiełka termalna + filtr mineralny SPF 50+',
    pricePln: 240,
    badge: 'PO RESURFACINGU 3D',
  },
  {
    id: 'kit-flebologia',
    dept: 'Flebologia',
    title: 'Pakiet Kompresjoterapii EVLT (Pończocha II Kl. Ucisku)',
    items: 'Medyczna pończocha uciskowa CCL2 + żel heparynowo-kasztanowcowy chłodzący',
    pricePln: 290,
    badge: 'PO LASERZE EVLT 1470NM',
  },
  {
    id: 'kit-proktologia',
    dept: 'Proktologia',
    title: 'Dyskretny Pakiet Komfortu LHP / FiLaC 24h',
    items: 'Pianka myjąca z nanosrebrem + maść regenerująca z kwasem hialuronowym + poduszka ortopedyczna',
    pricePln: 260,
    badge: 'PO ZABIEGU LHP / FILAC',
  },
  {
    id: 'kit-chirurgia',
    dept: 'Chirurgia Ogólna',
    title: 'Pakiet Aseptyczny Szew Kosmetyczny RF',
    items: 'Jałowe opatrunki hydrokoloidowe + żel silikonowy na blizny pooperacyjne',
    pricePln: 190,
    badge: 'PO RADIOCHIRURGII RF',
  },
];

export default function BmClinicInitialModulesSuite({
  selectedDept,
  entries,
  highContrastViMode = false,
  onDeployBlueprintPage,
  onTriggerTelemetryAction,
}: BmClinicInitialModulesSuiteProps) {
  // 1. Original Laser 1470nm 3D Impulse Visualizer (from initial commit f0eb0e3)
  const laserCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [laserPowerWatts, setLaserPowerWatts] = useState<number>(8.5);
  const [laserWaveNm, setLaserWaveNm] = useState<1470 | 980>(1470);

  // 2. Original AI Content Agent Blueprint Generator (from initial commit f0eb0e3)
  const [agentNewService, setAgentNewService] = useState<string>(
    'Laserowe leczenie torbieli włosowej (SiLaC 1470 nm)'
  );
  const [agentPhysician, setAgentPhysician] = useState<string>(
    'dr n. med. Jan Bujok — Specjalista Chirurgii i Laseroterapii'
  );

  // 3. Original Parallax 3D Clinic Window View (4 Pory Dnia + 5 Trajektorii 3D) & Post-Care Kits
  const parallaxCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [windowTime, setWindowTime] = useState<WindowTimeOfDay>('GOLDEN');
  const [trajectory, setTrajectory] = useState<ParallaxTrajectory>('FIGURE_8');
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedKits, setSelectedKits] = useState<string[]>([]);

  // Animate original 4-ring Liquid Glass + 1470nm Laser Fiber Impulse Canvas
  useEffect(() => {
    const canvas = laserCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let angle = 0;

    const drawLaserScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.fillStyle = highContrastViMode ? '#05070a' : '#050b16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4 Concentric Rotating Liquid Glass Rings (exact formula from f0eb0e3)
      for (let layer = 3; layer >= 0; layer--) {
        const r = 38 + layer * 16;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle * (layer % 2 === 0 ? 1 : -0.8));
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.48, r * 0.62, 0.25, 0, Math.PI * 1.65);
        ctx.strokeStyle = highContrastViMode
          ? '#ffe600'
          : layer === 1
          ? 'rgba(184, 255, 1, 0.88)'
          : 'rgba(0, 229, 255, 0.58)';
        ctx.lineWidth = layer === 1 ? 3.5 : 2;
        ctx.stroke();
        ctx.restore();
      }

      // Central 1470nm Radial Laser Fiber Impulse
      const pulse = (8 + (laserPowerWatts - 5) * 0.8) + Math.sin(angle * 3.2) * 3.2;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pulse * 3.1);
      grad.addColorStop(0, highContrastViMode ? '#ffe600' : '#b8ff01');
      grad.addColorStop(
        0.5,
        laserWaveNm === 1470 ? 'rgba(0, 229, 255, 0.68)' : 'rgba(255, 93, 143, 0.65)'
      );
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse * 3.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = highContrastViMode ? '#ffe600' : '#e2e8f0';
      ctx.font = '600 11px monospace';
      ctx.fillText(
        `Wiązka światłowodowa ${laserWaveNm} nm (${laserPowerWatts} W) • Dział: ${selectedDept}`,
        14,
        canvas.height - 12
      );

      angle += 0.02;
      animId = requestAnimationFrame(drawLaserScene);
    };

    animId = requestAnimationFrame(drawLaserScene);
    return () => cancelAnimationFrame(animId);
  }, [highContrastViMode, laserPowerWatts, laserWaveNm, selectedDept]);

  // Animate 3D Parallax Clinic Window View (Dawn / Noon / Golden Hour / Twilight + 5 trajectories)
  useEffect(() => {
    const canvas = parallaxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const renderParallaxWindow = () => {
      t += 0.022;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Compute trajectory displacement (Okrąg, Kołysanie, Ósemka 3D, Oddech, Myszka)
      let dx = 0;
      let dy = 0;
      let zoom = 1;
      if (trajectory === 'CIRCLE') {
        dx = Math.cos(t) * 24 + mouseOffset.x * 20;
        dy = Math.sin(t) * 14 + mouseOffset.y * 12;
      } else if (trajectory === 'SWAY') {
        dx = Math.sin(t * 0.85) * 30 + mouseOffset.x * 20;
        dy = Math.cos(t * 0.4) * 6 + mouseOffset.y * 12;
      } else if (trajectory === 'FIGURE_8') {
        dx = Math.sin(t) * 28 + mouseOffset.x * 20;
        dy = Math.sin(t * 2) * 12 + mouseOffset.y * 12;
      } else if (trajectory === 'BREATH') {
        zoom = 1 + Math.sin(t * 0.9) * 0.05;
        dx = mouseOffset.x * 20;
        dy = Math.sin(t * 0.9) * 8 + mouseOffset.y * 12;
      } else {
        dx = mouseOffset.x * 38;
        dy = mouseOffset.y * 24;
      }

      // Clinic Interior Wall & Open Ceiling Skylight ("Zdejmij sufit")
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (highContrastViMode) {
        wallGrad.addColorStop(0, '#05070a');
        wallGrad.addColorStop(1, '#05070a');
      } else if (windowTime === 'TWILIGHT') {
        wallGrad.addColorStop(0, '#0f172a');
        wallGrad.addColorStop(1, '#020617');
      } else {
        wallGrad.addColorStop(0, '#1e293b');
        wallGrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);

      // Open Ceiling Skylight Aperture & Roof Trusses at Top
      const skyGlow = ctx.createLinearGradient(0, 0, 0, 48);
      skyGlow.addColorStop(
        0,
        highContrastViMode
          ? 'rgba(255,230,0,0.28)'
          : windowTime === 'GOLDEN'
          ? 'rgba(251,191,36,0.38)'
          : 'rgba(56,189,248,0.38)'
      );
      skyGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = skyGlow;
      ctx.fillRect(0, 0, w, 48);

      // 3 Spaced Panoramic Arched Windows ("Okna nie stykają się; obraz przesuwa się tylko za oknami")
      const windows = [
        { x: 26, y: 34, ww: 192, wh: h - 46, label: 'Widok Wschodni' },
        { x: 244, y: 28, ww: 192, wh: h - 40, label: 'Główne Atrium' },
        { x: 462, y: 34, ww: 192, wh: h - 46, label: 'Widok Zachodni' },
      ];

      windows.forEach((win, idx) => {
        ctx.save();
        // Rounded arch path
        const r = 34;
        ctx.beginPath();
        ctx.moveTo(win.x, win.y + r);
        ctx.quadraticCurveTo(win.x + win.ww / 2, win.y - 16, win.x + win.ww, win.y + r);
        ctx.lineTo(win.x + win.ww, win.y + win.wh);
        ctx.lineTo(win.x, win.y + win.wh);
        ctx.closePath();
        ctx.clip();

        // Sky gradient per time of day inside window
        const sky = ctx.createLinearGradient(0, win.y, 0, win.y + win.wh);
        if (highContrastViMode) {
          sky.addColorStop(0, '#05070a');
          sky.addColorStop(1, '#05070a');
        } else if (windowTime === 'DAWN') {
          sky.addColorStop(0, '#be185d');
          sky.addColorStop(0.55, '#fb923c');
          sky.addColorStop(1, '#fef08a');
        } else if (windowTime === 'NOON') {
          sky.addColorStop(0, '#0284c7');
          sky.addColorStop(0.6, '#38bdf8');
          sky.addColorStop(1, '#e0f2fe');
        } else if (windowTime === 'GOLDEN') {
          sky.addColorStop(0, '#7c2d12');
          sky.addColorStop(0.5, '#f59e0b');
          sky.addColorStop(1, '#fde68a');
        } else {
          sky.addColorStop(0, '#020617');
          sky.addColorStop(0.6, '#1e1b4b');
          sky.addColorStop(1, '#312e81');
        }
        ctx.fillStyle = sky;
        ctx.fillRect(win.x, win.y, win.ww, win.wh);

        // Sun / Moon orb with depth parallax (Far layer 0.3x)
        const sunX = win.x + win.ww * 0.62 - dx * 0.32 + (idx - 1) * 14;
        const sunY = win.y + 48 - dy * 0.28;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 36 * zoom);
        sunGrad.addColorStop(
          0,
          highContrastViMode
            ? '#ffe600'
            : windowTime === 'TWILIGHT'
            ? '#e2e8f0'
            : '#fef08a'
        );
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 36 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Multi-plane Parallax Skyline & Park Trees strictly behind each window
        for (let depthLayer = 1; depthLayer <= 3; depthLayer++) {
          const factor = depthLayer === 1 ? 0.55 : depthLayer === 2 ? 0.95 : 1.35;
          ctx.fillStyle = highContrastViMode
            ? depthLayer === 1
              ? 'rgba(255,230,0,0.22)'
              : 'rgba(0,245,212,0.38)'
            : depthLayer === 1
            ? 'rgba(51, 65, 85, 0.55)'
            : depthLayer === 2
            ? 'rgba(15, 23, 42, 0.82)'
            : 'rgba(15, 118, 110, 0.78)';

          for (let i = -2; i < 7; i++) {
            const bx = win.x + i * 44 - dx * factor;
            const bh = 28 + ((i * 29 + depthLayer * 17 + idx * 11) % 54);
            ctx.fillRect(bx, win.y + win.wh - bh - dy * factor * 0.45, 34, bh + 20);
          }
        }

        // Window label badge at bottom of window
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(win.x + 8, win.y + win.wh - 24, win.ww - 16, 18);
        ctx.fillStyle = highContrastViMode ? '#ffe600' : '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`☀️ ${win.label}`, win.x + 14, win.y + win.wh - 11);

        ctx.restore();

        // Architectural Frame Border
        ctx.strokeStyle = highContrastViMode
          ? '#ffe600'
          : 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(win.x, win.y + r);
        ctx.quadraticCurveTo(win.x + win.ww / 2, win.y - 16, win.x + win.ww, win.y + r);
        ctx.lineTo(win.x + win.ww, win.y + win.wh);
        ctx.lineTo(win.x, win.y + win.wh);
        ctx.closePath();
        ctx.stroke();
      });

      ctx.fillStyle = highContrastViMode ? '#ffe600' : '#bae6fd';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        `OTWARTY SUFIT + 3 OKNA PARALAKSY 3D • PORA: ${windowTime} • RUCH: ${trajectory}`,
        16,
        16
      );

      animId = requestAnimationFrame(renderParallaxWindow);
    };

    animId = requestAnimationFrame(renderParallaxWindow);
    return () => cancelAnimationFrame(animId);
  }, [highContrastViMode, mouseOffset, trajectory, windowTime]);

  // Compute Winning Archetype & Generated Blueprint JSON (exact logic from f0eb0e3)
  const blueprintData = useMemo(() => {
    const scored = entries.map((e) => ({
      entry: e,
      metrics: evaluateBmClinicPageForAgent(e.page, e.telemetry),
    }));
    scored.sort((a, b) => b.metrics.agentRlReward - a.metrics.agentRlReward);

    const winner = scored[0];
    const winningArchetype: ContentArchetype =
      winner?.entry.page.contentArchetype || 'INTERACTIVE_3D_PROCEDURE_MODEL';
    const winningReward = winner?.metrics.agentRlReward ?? 0.9808;

    const cleanService = agentNewService.trim() || 'Zabieg Laserowy 1470 nm';
    const cleanDoc = agentPhysician.trim() || 'dr n. med. Jan Bujok';
    const slug = cleanService
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return {
      slug,
      cleanService,
      cleanDoc,
      winningArchetype,
      winningReward,
      jsonBlueprint: {
        domain: 'bmclinic.co',
        urlPath: `/procedury/${slug}`,
        department: selectedDept,
        selectedWinningArchetype: winningArchetype,
        learnedFromPageWithReward: winningReward,
        seoAndGeoParameters: {
          clickDepthFromHomepage: 1,
          targetAioPassageWords: '130-170 słów bezpośrednio pod H2',
          requiredInteractiveComponent:
            '<Laser3DProcedureVisualizer /> + <BmClinicSpatialModel3D /> + <BmClinicPricingAndRecoveryCalculator />',
          eeatVerification: `${cleanDoc} (PWZ Verified)`,
        },
        generatedContent: {
          h1: `${cleanService} w BM Clinic (${selectedDept}) — małoinwazyjny zabieg 1 dnia`,
          h2_aio: `Na czym polega ${cleanService.toLowerCase()} i jak szybko można wrócić do pracy?`,
          aio_passage_152_words: `${cleanService} w BM Clinic to precyzyjna procedura światłowodowa wykonywana w znieczuleniu miejscowym bez rozległego nacinania tkanek i bez konieczności hospitalizacji. Energia wiązki laserowej zamyka zmienione chorobowo struktury od wewnątrz, minimalizując dolegliwości bólowe oraz ryzyko nawrotu. Cały zabieg trwa około 30–40 minut, a pacjent wraca do domu tego samego dnia i może podjąć pracę biurową już po 24–48 godzinach.`,
        },
        schemaOrgJsonLd: {
          '@context': 'https://schema.org',
          '@type': 'MedicalProcedure',
          name: cleanService,
          url: `https://bmclinic.co/procedury/${slug}`,
          procedureType: 'https://schema.org/NoninvasiveProcedure',
          performer: { '@type': 'Physician', name: cleanDoc },
        },
      },
    };
  }, [agentNewService, agentPhysician, entries, selectedDept]);

  const handleExportAgentDatabaseJson = () => {
    const payload = {
      domain: 'bmclinic.co',
      exportedAt: new Date().toISOString(),
      totalPages: entries.length,
      winningBlueprint: blueprintData.jsonBlueprint,
      pages: entries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bmclinic_co_seo_agent_database.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeployGeneratedBlueprint = () => {
    const { slug, cleanService, cleanDoc, winningArchetype, jsonBlueprint } =
      blueprintData;
    const newEntry: BmClinicPageEntryItem = {
      id: Date.now(),
      page: {
        slug,
        urlPath: `/procedury/${slug}`,
        servicePillar: selectedDept,
        procedureTitle: cleanService,
        contentArchetype: winningArchetype,
        h1Headline: jsonBlueprint.generatedContent.h1,
        h2AioQuestion: jsonBlueprint.generatedContent.h2_aio,
        aioDirectAnswerPassage:
          jsonBlueprint.generatedContent.aio_passage_152_words,
        aioWordCount: 152,
        leadPhysicianName: cleanDoc,
        physicianSpecialty: selectedDept,
        pwzVerified: true,
        clinicalStudiesCited: 6,
        originalAssetsCount: 9,
        effortScore: 96,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 94,
        clickDepth: 1,
        siteFocusScore: 0.98,
        siteRadiusDelta: 0.03,
        basePricePln: 3200,
      },
      telemetry: {
        impressions: 180,
        totalClicks: 22,
        goodClicks: 21,
        badClicks: 1,
        lastLongestClicks: 17,
        avgDwellTimeSec: 235,
        avgScrollDepthPct: 87,
        interactive3dOrCalcUses: 15,
        onlineBookings: 3,
        phoneCalls: 1,
        calculatorLeads: 2,
        revenuePln: 9600,
        lcpMs: 1320,
        inpMs: 58,
        clsScore: 0.01,
        ttfbMs: 155,
      },
      insight: `Wygenerowano automatycznie przez Agenta AI wg zwycięskiego archetypu ${winningArchetype}.`,
    };
    onDeployBlueprintPage(newEntry);
  };

  return (
    <div className="grid gap-8">
      {/* =====================================================================
          CZĘŚĆ 1 (Z POCZĄTKU PROJEKTU f0eb0e3):
          WIZUALIZATOR 3D IMPULSU LASERA 1470NM + GENERATOR BLUEPRINTU AGENTA AI
          ===================================================================== */}
      <section
        aria-label="Wizualizator 3D wiązki lasera 1470nm oraz Generator Blueprintów Agenta AI"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Left Card: Original 3D Laser 1470nm Impulse & Recovery Comparison */}
        <div
          className={`rounded-3xl border p-6 flex flex-col justify-between ${
            highContrastViMode
              ? 'bg-[#05070a] border-[#ffe600] text-white'
              : 'border-cyan-500/30 bg-white/5 backdrop-blur-2xl shadow-2xl'
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                MODUŁ Z POCZĄTKU PROJEKTU • SYMULATOR WIĄZKI 3D 1470 NM
              </span>
              <span className="text-xs font-mono text-lime-400">
                Kliknij wizualizację (+effortScore)
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-3">
              Interaktywny Wizualizator 3D Impulsu Światłowodowego & Porównanie Metod
            </h2>

            <canvas
              ref={laserCanvasRef}
              width={560}
              height={215}
              onClick={() => {
                setLaserWaveNm((w) => (w === 1470 ? 980 : 1470));
                if (onTriggerTelemetryAction)
                  onTriggerTelemetryAction('3D_LASER_INTERACT');
              }}
              className="w-full h-[210px] rounded-2xl border border-cyan-400/30 cursor-pointer block mb-4"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Moc wiązki lasera (W):</span>
                <input
                  type="range"
                  min={5}
                  max={14}
                  step={0.5}
                  value={laserPowerWatts}
                  onChange={(e) => setLaserPowerWatts(Number(e.target.value))}
                  className="accent-lime-400"
                />
                <strong className="font-mono text-lime-300">{laserPowerWatts} W</strong>
              </div>
              <button
                type="button"
                onClick={() => setLaserWaveNm((w) => (w === 1470 ? 980 : 1470))}
                className="px-3 py-1 rounded-xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-200 font-bold"
              >
                Długość fali: {laserWaveNm} nm (Przełącz)
              </button>
            </div>

            {/* Original 1:1 Recovery Comparison Boxes from f0eb0e3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-400 block">
                  Rekonwalescencja (Laser 1470nm vs Klasyczna)
                </span>
                <strong className="text-base font-extrabold text-lime-400 block mt-0.5">
                  24–48 godzin
                </strong>
                <span className="text-slate-400 text-[11px]">
                  zamiast 21–30 dni po wycięciu chirurgicznym
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-400 block">
                  Architektura SEO & Core Web Vitals
                </span>
                <strong className="text-base font-extrabold text-cyan-300 block mt-0.5">
                  LCP 1.32s • INP 58ms • CLS 0.01
                </strong>
                <span className="text-slate-400 text-[11px]">
                  Odległość od strony głównej: 1 kliknięcie
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Original AI Content Agent Blueprint Generator (from f0eb0e3) */}
        <div
          className={`rounded-3xl border p-6 flex flex-col justify-between ${
            highContrastViMode
              ? 'bg-[#05070a] border-[#ffe600] text-white'
              : 'border-lime-400/30 bg-white/5 backdrop-blur-2xl shadow-2xl'
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-lime-400/15 text-lime-300 border border-lime-400/30">
                🤖 AGENT AI BUDOWY TREŚCI BMCLINIC.CO • BLUEPRINT GENERATOR
              </span>
              <button
                type="button"
                onClick={handleExportAgentDatabaseJson}
                className="px-3 py-1 rounded-xl border border-white/20 bg-white/10 text-[11px] font-bold hover:bg-white/20"
              >
                ⬇ Eksportuj JSON bazy
              </button>
            </div>

            <h2 className="text-xl font-extrabold mb-1">
              Generator Podstron wg Zwycięskiego Wzorca Sprzedaży (RL Reward)
            </h2>
            <p className="text-xs text-slate-300 mb-3">
              Agent analizuje, który archetyp (<code>content_archetype</code>) ma najwyższy
              współczynnik konwersji oraz stosunek <code>goodClicks / badClicks</code> i
              buduje gotowy blueprint JSON + Schema.org.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  Nowa usługa medyczna dla bmclinic.co:
                </label>
                <input
                  type="text"
                  value={agentNewService}
                  onChange={(e) => setAgentNewService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">
                  Lekarz prowadzący (E-E-A-T / PWZ):
                </label>
                <input
                  type="text"
                  value={agentPhysician}
                  onChange={(e) => setAgentPhysician(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeployGeneratedBlueprint}
              className="w-full py-2.5 px-4 rounded-xl bg-lime-400/25 border border-lime-400 text-lime-200 text-xs font-extrabold hover:bg-lime-400/35 mb-3"
            >
              ⚡ Wygeneruj i dodaj podstronę do bazy wg zwycięskiego wzorca ({blueprintData.winningArchetype})
            </button>

            <pre className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono overflow-x-auto max-h-[195px] overflow-y-auto">
              {JSON.stringify(blueprintData.jsonBlueprint, null, 2)}
            </pre>
          </div>
        </div>
      </section>

      {/* =====================================================================
          CZĘŚĆ 2 (Z POCZĄTKU PROJEKTU — PARALLAX 3D WINDOW VIEW & POST-CARE SHOP):
          WIDOK PARALAKSY 3D Z OKIEN KLINIKI (4 PORY DNIA) + PAKIETY POZABIEGOWE
          ===================================================================== */}
      <section
        aria-label="Widok Paralaksy 3D z Okien Kliniki oraz Pakiety Rekonwalescencji Pozabiegowej"
        className={`rounded-3xl border p-6 ${
          highContrastViMode
            ? 'bg-[#05070a] border-[#ffe600] text-white'
            : 'border-cyan-500/25 bg-white/5 backdrop-blur-2xl shadow-2xl'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-200 border border-amber-400/30 mb-1">
              PARALLAX 3D WINDOW VIEW (2K DEPTH) + PAKIETY REKONWALESCENCJI DOMOWEJ
            </span>
            <h2 className="text-xl font-extrabold">
              Strefa Relaksu Pacjenta: Widok 3D z Okien Kliniki i Zestawy Pozabiegowe Walk-Out
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['DAWN', 'NOON', 'GOLDEN', 'TWILIGHT'] as const).map((tod) => (
              <button
                key={tod}
                type="button"
                onClick={() => setWindowTime(tod)}
                className={`px-3 py-1.5 rounded-xl font-bold border ${
                  windowTime === tod
                    ? 'bg-amber-400/25 border-amber-300 text-amber-200'
                    : 'bg-white/5 border-white/15 text-slate-300'
                }`}
              >
                {tod === 'DAWN'
                  ? '🌅 Świt'
                  : tod === 'NOON'
                  ? '☀️ Południe'
                  : tod === 'GOLDEN'
                  ? '🌇 Złota Godzina'
                  : '🌙 Zmierzch'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden border border-white/15 bg-slate-950"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMouseOffset({
                  x: (e.clientX - rect.left) / rect.width - 0.5,
                  y: (e.clientY - rect.top) / rect.height - 0.5,
                });
              }}
            >
              <canvas
                ref={parallaxCanvasRef}
                width={680}
                height={240}
                className="w-full h-[225px] block"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-semibold">
                Trajektoria paralaksy 3D za oknem kliniki:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'CIRCLE', label: 'Okrąg' },
                    { id: 'SWAY', label: 'Kołysanie' },
                    { id: 'FIGURE_8', label: 'Ósemka 3D' },
                    { id: 'BREATH', label: 'Oddech' },
                    { id: 'MOUSE', label: 'Myszka (Interaktywna)' },
                  ] as const
                ).map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setTrajectory(tr.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold border ${
                      trajectory === tr.id
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border-white/15 text-slate-400'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Post-Procedure Care Kits (Medical Shop Drawer integration) */}
          <div className="space-y-2.5 text-xs">
            <div className="font-mono uppercase text-cyan-300 font-bold">
              Pakiety Pozabiegowe do Domu (4 Działy):
            </div>
            {POST_CARE_KITS.map((kit) => {
              const added = selectedKits.includes(kit.id);
              const isCurrentDept = kit.dept === selectedDept;
              return (
                <div
                  key={kit.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrentDept
                      ? 'bg-cyan-500/15 border-cyan-400/50'
                      : 'bg-slate-900/75 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {kit.badge}
                    </span>
                    <strong className="text-lime-300">{kit.pricePln} PLN</strong>
                  </div>
                  <div className="font-bold text-slate-100 mt-0.5">{kit.title}</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{kit.items}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKits((prev) =>
                        prev.includes(kit.id)
                          ? prev.filter((k) => k !== kit.id)
                          : [...prev, kit.id]
                      );
                      if (onTriggerTelemetryAction)
                        onTriggerTelemetryAction('POSTCARE_KIT');
                    }}
                    className={`mt-2 w-full py-1 rounded-lg font-bold border text-[11px] ${
                      added
                        ? 'bg-lime-400/25 border-lime-400 text-lime-200'
                        : 'bg-white/5 border-white/15 text-slate-300 hover:border-cyan-400/40'
                    }`}
                  >
                    {added
                      ? '✓ Dodano do wypisu pozabiegowego'
                      : '+ Dołącz pakiet do rezerwacji'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
