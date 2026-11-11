'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { DepartmentRoomNode } from './BmClinicSpatialModel3D';

export interface SixParamLidarMetrics {
  colorSpectrumIndexRYB: number; // 0-100: Spektrum RYB (Ziarnina / Regeneracja vs. Zmiana)
  lidarDepthVolumeMm: number; // 0.5-15.0 mm: Głębokość skanu 3D LiDAR / Objętość naczyniowa
  huePerfusionIndex: number; // 0-100: Perfuzja obwodowa i utlenowanie tkankowe
  surfaceSmoothnessRaUm: number; // 5-120 µm: Gładkość mikrotekstury powierzchni 3D (Ra)
  edgeCurvatureContraction: number; // 0-100: Krzywizna i kontrakcja brzegowa
  specularMoistureIndex: number; // 0-100: Refleksyjność i uwodnienie naskórka
}

interface BmClinicLidarDiagnosticAnalyzerProps {
  selectedDept: DepartmentRoomNode['deptName'];
  highContrastViMode?: boolean;
  onAnalyzerInteract?: () => void;
}

const DEPT_PRESETS: Record<DepartmentRoomNode['deptName'], SixParamLidarMetrics> = {
  'Medycyna Estetyczna': {
    colorSpectrumIndexRYB: 88,
    lidarDepthVolumeMm: 1.8,
    huePerfusionIndex: 91,
    surfaceSmoothnessRaUm: 18,
    edgeCurvatureContraction: 86,
    specularMoistureIndex: 74,
  },
  Flebologia: {
    colorSpectrumIndexRYB: 72,
    lidarDepthVolumeMm: 4.6,
    huePerfusionIndex: 68,
    surfaceSmoothnessRaUm: 34,
    edgeCurvatureContraction: 75,
    specularMoistureIndex: 62,
  },
  Proktologia: {
    colorSpectrumIndexRYB: 79,
    lidarDepthVolumeMm: 3.2,
    huePerfusionIndex: 82,
    surfaceSmoothnessRaUm: 26,
    edgeCurvatureContraction: 84,
    specularMoistureIndex: 69,
  },
  'Chirurgia Ogólna': {
    colorSpectrumIndexRYB: 85,
    lidarDepthVolumeMm: 2.4,
    huePerfusionIndex: 87,
    surfaceSmoothnessRaUm: 22,
    edgeCurvatureContraction: 89,
    specularMoistureIndex: 71,
  },
};

export default function BmClinicLidarDiagnosticAnalyzer({
  selectedDept,
  highContrastViMode = false,
  onAnalyzerInteract,
}: BmClinicLidarDiagnosticAnalyzerProps) {
  const [metrics, setMetrics] = useState<SixParamLidarMetrics>(DEPT_PRESETS[selectedDept]);
  const [viewMode, setViewMode] = useState<'TISSUE_3D' | 'LIDAR_DEPTH' | 'RA_MICROGRID'>('LIDAR_DEPTH');
  const meshCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMetrics(DEPT_PRESETS[selectedDept]);
  }, [selectedDept]);

  // Compute WHI 3D (Wound/Tissue Healing Index) & CEI (Circulatory Efficiency/Exacerbation Index)
  const indices = useMemo(() => {
    const depthNorm = Math.max(0, Math.min(100, (1 - metrics.lidarDepthVolumeMm / 15) * 100));
    const smoothNorm = Math.max(0, Math.min(100, (1 - metrics.surfaceSmoothnessRaUm / 120) * 100));
    const moistureOpt = Math.max(0, 100 - Math.abs(metrics.specularMoistureIndex - 68) * 1.4);

    const whi3d = Number(
      (
        metrics.colorSpectrumIndexRYB * 0.25 +
        depthNorm * 0.2 +
        metrics.huePerfusionIndex * 0.2 +
        smoothNorm * 0.15 +
        metrics.edgeCurvatureContraction * 0.1 +
        moistureOpt * 0.1
      ).toFixed(1)
    );

    const cei = Number(
      Math.max(
        5,
        Math.min(
          98,
          (100 - metrics.huePerfusionIndex) * 0.45 +
            (metrics.lidarDepthVolumeMm / 15) * 100 * 0.35 +
            (100 - metrics.colorSpectrumIndexRYB) * 0.2
        )
      ).toFixed(1)
    );

    return { whi3d, cei, depthNorm, smoothNorm };
  }, [metrics]);

  // Draw 3D LiDAR Surface & Depth Mesh
  useEffect(() => {
    const canvas = meshCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let phase = 0;

    const renderMesh = () => {
      phase += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = highContrastViMode ? '#05070a' : '#060c18';
      ctx.fillRect(0, 0, w, h);

      const cols = 22;
      const rows = 14;
      const cellW = (w - 80) / cols;
      const cellH = (h - 70) / rows;

      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const nx = (c / cols) * 2 - 1;
          const ny = (r / rows) * 2 - 1;
          const dist = Math.hypot(nx, ny);
          const wave =
            Math.cos(dist * 3.2 - phase) *
            (metrics.lidarDepthVolumeMm * 2.4) *
            Math.exp(-dist * 1.2);
          const microRough =
            viewMode === 'RA_MICROGRID'
              ? Math.sin(c * 1.9 + r * 2.3 + phase) * (metrics.surfaceSmoothnessRaUm * 0.08)
              : 0;

          const isoX = 40 + c * cellW + (r - rows / 2) * 3.2;
          const isoY = 42 + r * cellH - wave - microRough;

          if (c === 0) ctx.moveTo(isoX, isoY);
          else ctx.lineTo(isoX, isoY);
        }

        if (highContrastViMode) {
          ctx.strokeStyle = '#ffe600';
        } else if (viewMode === 'LIDAR_DEPTH') {
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.35 + (r / rows) * 0.5})`;
        } else if (viewMode === 'TISSUE_3D') {
          ctx.strokeStyle = `rgba(226, 199, 153, ${0.35 + (r / rows) * 0.5})`;
        } else {
          ctx.strokeStyle = `rgba(184, 255, 1, ${0.35 + (r / rows) * 0.5})`;
        }
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // HUD Telemetry Overlay
      ctx.fillStyle = highContrastViMode ? '#ffe600' : '#00e5ff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        `SKANER 3D LiDAR [${selectedDept.toUpperCase()}] • TRYB: ${viewMode}`,
        14,
        20
      );
      ctx.fillStyle = highContrastViMode ? '#ffffff' : '#b8ff01';
      ctx.fillText(
        `WHI-3D: ${indices.whi3d}/100  |  CEI: ${indices.cei}%  |  Ra: ${metrics.surfaceSmoothnessRaUm} µm`,
        14,
        h - 12
      );

      frame = requestAnimationFrame(renderMesh);
    };

    frame = requestAnimationFrame(renderMesh);
    return () => cancelAnimationFrame(frame);
  }, [highContrastViMode, indices, metrics, selectedDept, viewMode]);

  // Draw 6-Axis Clinical Radar Chart
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;

    const labels = [
      'Spektrum RYB',
      'Profil LiDAR',
      'Perfuzja',
      'Gładkość Ra',
      'Kontrakcja',
      'Uwodnienie',
    ];
    const values = [
      metrics.colorSpectrumIndexRYB / 100,
      indices.depthNorm / 100,
      metrics.huePerfusionIndex / 100,
      indices.smoothNorm / 100,
      metrics.edgeCurvatureContraction / 100,
      metrics.specularMoistureIndex / 100,
    ];

    // Draw concentric web rings
    [0.33, 0.66, 1.0].forEach((ring) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius * ring;
        const y = cy + Math.sin(angle) * radius * ring;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = highContrastViMode ? 'rgba(255,230,0,0.3)' : 'rgba(255,255,255,0.14)';
      ctx.stroke();
    });

    // Draw data polygon
    ctx.beginPath();
    values.forEach((val, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius * val;
      const y = cy + Math.sin(angle) * radius * val;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = highContrastViMode ? 'rgba(255, 230, 0, 0.28)' : 'rgba(0, 229, 255, 0.24)';
    ctx.strokeStyle = highContrastViMode ? '#ffe600' : '#00e5ff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = highContrastViMode ? '#ffffff' : '#cbd5e1';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const lx = cx + Math.cos(angle) * (radius + 22);
      const ly = cy + Math.sin(angle) * (radius + 16);
      ctx.fillText(label, lx, ly);
    });
  }, [highContrastViMode, indices, metrics]);

  const handleExportJson = () => {
    if (onAnalyzerInteract) onAnalyzerInteract();
    const record = {
      recordId: 'PAC-2026-0419',
      domain: 'bmclinic.co',
      department: selectedDept,
      timestamp: new Date().toISOString(),
      metrics,
      computedIndices: {
        WHI_3D: indices.whi3d,
        CEI_PCT: indices.cei,
      },
    };
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bmclinic_lidar_diagnostyka_${selectedDept.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="6-Parametrowy Analizator Diagnostyczny 3D LiDAR"
      className={`rounded-3xl border p-6 transition-all ${
        highContrastViMode
          ? 'bg-[#05070a] border-[#ffe600] text-white'
          : 'border-cyan-500/25 bg-white/5 backdrop-blur-2xl shadow-2xl'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-lime-400/15 text-lime-300 border border-lime-400/30 mb-1">
            MODUŁ 3D / LiDAR • 6 PARAMETRÓW DIAGNOSTYCZNYCH (WHI 3D & CEI)
          </span>
          <h2 className="text-xl font-extrabold">
            Symulator Diagnostyki 3D LiDAR — {selectedDept}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['LIDAR_DEPTH', 'TISSUE_3D', 'RA_MICROGRID'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setViewMode(m);
                if (onAnalyzerInteract) onAnalyzerInteract();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                viewMode === m
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                  : 'border-white/15 bg-white/5 text-slate-300'
              }`}
            >
              {m === 'LIDAR_DEPTH'
                ? 'Mapa Głębokości LiDAR'
                : m === 'TISSUE_3D'
                ? 'Model Barwny Tkanki'
                : 'Siatka Mikrotekstury Ra'}
            </button>
          ))}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-lime-400/40 bg-lime-400/15 text-lime-200 hover:bg-lime-400/25"
          >
            ⬇ Eksport Rekordu JSON (PAC-2026-0419)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl overflow-hidden border border-white/15 bg-slate-950">
          <canvas ref={meshCanvasRef} width={440} height={250} className="w-full h-[240px] block" />
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/15 bg-slate-950 flex items-center justify-center">
          <canvas ref={radarCanvasRef} width={300} height={240} className="w-[290px] h-[230px] block" />
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-lime-400/10 border border-lime-400/30">
              <span className="text-slate-300 block">Indeks Regeneracji WHI 3D</span>
              <strong className="text-2xl font-extrabold text-lime-400">{indices.whi3d}/100</strong>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-400/10 border border-cyan-400/30">
              <span className="text-slate-300 block">Wskaźnik Naczyniowy CEI</span>
              <strong className="text-2xl font-extrabold text-cyan-300">{indices.cei}%</strong>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-slate-300 mb-1">
              <span>1. Głębokość skanu LiDAR (mm):</span>
              <span className="font-mono text-cyan-300">{metrics.lidarDepthVolumeMm} mm</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={12}
              step={0.1}
              value={metrics.lidarDepthVolumeMm}
              onChange={(e) => {
                setMetrics((p) => ({ ...p, lidarDepthVolumeMm: Number(e.target.value) }));
                if (onAnalyzerInteract) onAnalyzerInteract();
              }}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <label className="flex justify-between text-slate-300 mb-1">
              <span>2. Perfuzja i mikrokrążenie (%):</span>
              <span className="font-mono text-cyan-300">{metrics.huePerfusionIndex}%</span>
            </label>
            <input
              type="range"
              min={25}
              max={100}
              value={metrics.huePerfusionIndex}
              onChange={(e) => {
                setMetrics((p) => ({ ...p, huePerfusionIndex: Number(e.target.value) }));
                if (onAnalyzerInteract) onAnalyzerInteract();
              }}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <label className="flex justify-between text-slate-300 mb-1">
              <span>3. Gładkość mikrotekstury 3D Ra (µm):</span>
              <span className="font-mono text-cyan-300">{metrics.surfaceSmoothnessRaUm} µm</span>
            </label>
            <input
              type="range"
              min={8}
              max={110}
              value={metrics.surfaceSmoothnessRaUm}
              onChange={(e) => {
                setMetrics((p) => ({ ...p, surfaceSmoothnessRaUm: Number(e.target.value) }));
                if (onAnalyzerInteract) onAnalyzerInteract();
              }}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
