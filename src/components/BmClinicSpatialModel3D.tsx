'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface DepartmentRoomNode {
  id: string;
  deptName: 'Medycyna Estetyczna' | 'Flebologia' | 'Proktologia' | 'Chirurgia Ogólna';
  roomCode: string;
  brailleCode: string;
  title: string;
  equipment: string;
  position: [number, number, number]; // [x, y, z] in meters
  color: string;
  beaconFreqHz: number;
  landmarkHintPl: string;
}

export const CLINIC_ROOMS: DepartmentRoomNode[] = [
  {
    id: 'room-estetyczna',
    deptName: 'Medycyna Estetyczna',
    roomCode: 'GAB-101',
    brailleCode: '⠃⠍⠁⠚⠁',
    title: 'Gabinet 101 — Medycyna Estetyczna & Laseroterapia Hi-Tech',
    equipment: 'Platforma Laserowa Frakcyjna & Skaner 3D Skóry',
    position: [-5.5, 0, -3.5],
    color: '#e2c799',
    beaconFreqHz: 528,
    landmarkHintPl: 'Po lewej stronie głównego korytarza, pierwsze drzwi za recepcją (ścieżka naprowadzająca z guzkami uwagi).',
  },
  {
    id: 'room-flebologia',
    deptName: 'Flebologia',
    roomCode: 'GAB-102',
    brailleCode: '⠃⠍⠁⠚⠃',
    title: 'Gabinet 102 — Flebologia & Diagnostyka USG Doppler',
    equipment: 'Laser Wewnątrznaczyniowy EVLT 1470nm + USG Doppler 3D',
    position: [5.5, 0, -3.5],
    color: '#00e5ff',
    beaconFreqHz: 594,
    landmarkHintPl: 'Po prawej stronie głównego korytarza, naprzeciwko gabinetu 101.',
  },
  {
    id: 'room-proktologia',
    deptName: 'Proktologia',
    roomCode: 'GAB-103',
    brailleCode: '⠃⠍⠁⠚⠉',
    title: 'Gabinet 103 — Proktologia Małoinwazyjna 1 Dnia',
    equipment: 'Stacja Laserowa Biolitec LHP/FiLaC 1470nm + Wideo-Anoskop HD',
    position: [-5.5, 0, 3.5],
    color: '#6a85ff',
    beaconFreqHz: 660,
    landmarkHintPl: 'Drugi gabinet po lewej stronie korytarza, wyposażony w śluzę zapewniającą pełną dyskrecję.',
  },
  {
    id: 'room-chirurgia',
    deptName: 'Chirurgia Ogólna',
    roomCode: 'GAB-104',
    brailleCode: '⠃⠍⠁⠚⠙',
    title: 'Gabinet 104 — Sala Zabiegowa Chirurgii Jednego Dnia',
    equipment: 'Tor Wizyjny 4K + Nóż Radiochirurgiczny RF + Autoklaw Klasy B',
    position: [5.5, 0, 3.5],
    color: '#b8ff01',
    beaconFreqHz: 792,
    landmarkHintPl: 'Na końcu korytarza po prawej stronie, przy strefie aseptycznej.',
  },
];

export function computeClockDirection(
  userPos: [number, number, number],
  userYawRad: number,
  targetPos: [number, number, number]
): { clockHour: number; distanceMeters: number; instructionPl: string } {
  const dx = targetPos[0] - userPos[0];
  const dz = targetPos[2] - userPos[2];
  const distanceMeters = Math.hypot(dx, dz);

  const targetAngle = Math.atan2(dx, -dz);
  let relAngle = targetAngle - userYawRad;
  while (relAngle < -Math.PI) relAngle += Math.PI * 2;
  while (relAngle > Math.PI) relAngle -= Math.PI * 2;

  const deg = (relAngle * 180) / Math.PI;
  let clockHour = Math.round(((deg + 360) % 360) / 30);
  if (clockHour === 0) clockHour = 12;

  const steps = Math.max(1, Math.round(distanceMeters / 0.75));
  let turnPhrase = 'na wprost (godzina 12)';
  if (clockHour === 1 || clockHour === 2) turnPhrase = `lekko w prawo (godzina ${clockHour})`;
  else if (clockHour === 3 || clockHour === 4) turnPhrase = `w prawo (godzina ${clockHour})`;
  else if (clockHour >= 5 && clockHour <= 7) turnPhrase = `za Tobą (godzina ${clockHour})`;
  else if (clockHour === 8 || clockHour === 9) turnPhrase = `w lewo (godzina ${clockHour})`;
  else if (clockHour === 10 || clockHour === 11) turnPhrase = `lekko w lewo (godzina ${clockHour})`;

  return {
    clockHour,
    distanceMeters: Number(distanceMeters.toFixed(1)),
    instructionPl: `Kierunek: ${turnPhrase}, dystans ${distanceMeters.toFixed(1)} m (ok. ${steps} kroków).`,
  };
}

interface BmClinicSpatialModel3DProps {
  selectedDept: string;
  onSelectDepartment: (dept: DepartmentRoomNode['deptName']) => void;
  onModelInteract?: () => void;
  highContrastViMode: boolean;
  onToggleViMode: () => void;
}

export default function BmClinicSpatialModel3D({
  selectedDept,
  onSelectDepartment,
  onModelInteract,
  highContrastViMode,
  onToggleViMode,
}: BmClinicSpatialModel3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [cameraMode, setCameraMode] = useState<'ISOMETRIC_3D' | 'FIRST_PERSON_VI'>('ISOMETRIC_3D');
  const [timeOfDay, setTimeOfDay] = useState<'DAY' | 'SUNSET' | 'NIGHT'>('DAY');
  const [yawDeg, setYawDeg] = useState<number>(28);
  const [pitchDeg, setPitchDeg] = useState<number>(36);
  const [walkProgress, setWalkProgress] = useState<number>(0);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>(
    'Model 3D kliniki BM Clinic gotowy. Wybierz jeden z czterech gabinetów, aby uruchomić nawigację przestrzenną.'
  );

  const activeRoom =
    CLINIC_ROOMS.find((r) => r.deptName === selectedDept) || CLINIC_ROOMS[0];

  // Calculate interpolated patient position along A* tactile corridor path:
  // Start at Reception [0, 0, -7] -> Corridor junction [0, 0, activeRoom.z] -> Room door [activeRoom.x * 0.78, 0, activeRoom.z]
  const getPatientPose = useCallback(
    (progress: number): { pos: [number, number, number]; headingRad: number } => {
      const start: [number, number, number] = [0, 0, -6.8];
      const mid: [number, number, number] = [0, 0, activeRoom.position[2]];
      const end: [number, number, number] = [
        activeRoom.position[0] * 0.72,
        0,
        activeRoom.position[2],
      ];

      if (progress < 0.55) {
        const t = progress / 0.55;
        const z = start[2] + (mid[2] - start[2]) * t;
        return { pos: [0, 0, z], headingRad: Math.PI };
      } else {
        const t = (progress - 0.55) / 0.45;
        const x = mid[0] + (end[0] - mid[0]) * t;
        const headingRad = end[0] > 0 ? Math.PI / 2 : -Math.PI / 2;
        return { pos: [x, 0, mid[2]], headingRad };
      }
    },
    [activeRoom]
  );

  const emitSpatialBeaconPing = useCallback(
    (room: DepartmentRoomNode) => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const pose = getPatientPose(walkProgress);
        const listener = ctx.listener;
        const fx = Math.sin(pose.headingRad);
        const fz = -Math.cos(pose.headingRad);

        if (listener.positionX) {
          listener.positionX.value = pose.pos[0];
          listener.positionY.value = 1.65;
          listener.positionZ.value = pose.pos[2];
          listener.forwardX.value = fx;
          listener.forwardY.value = 0;
          listener.forwardZ.value = fz;
        }

        const panner = ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1.5;
        panner.maxDistance = 25;
        panner.rolloffFactor = 1.1;
        panner.positionX.setValueAtTime(room.position[0], now);
        panner.positionY.setValueAtTime(1.5, now);
        panner.positionZ.setValueAtTime(room.position[2], now);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(room.beaconFreqHz, now);
        osc.frequency.exponentialRampToValueAtTime(room.beaconFreqHz * 1.45, now + 0.2);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      } catch {
        // Ignore if browser blocks audio before user gesture
      }
    },
    [getPatientPose, walkProgress]
  );

  const speakGuidance = useCallback((text: string) => {
    setLiveAnnouncement(text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'pl-PL';
        utter.rate = 1.02;
        window.speechSynthesis.speak(utter);
      } catch {
        // Fallback to ARIA-Live only
      }
    }
  }, []);

  // Walking animation loop
  useEffect(() => {
    if (!isWalking) return;
    const interval = setInterval(() => {
      setWalkProgress((prev) => {
        if (prev >= 1) {
          setIsWalking(false);
          return 1;
        }
        return Number(Math.min(1, prev + 0.025).toFixed(3));
      });
    }, 60);
    return () => clearInterval(interval);
  }, [isWalking]);

  // Render 3D Clinic Scene on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let pulsePhase = 0;

    const render = () => {
      pulsePhase += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background lighting by Time of Day & Accessibility Mode
      if (highContrastViMode) {
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, w, h);
      } else {
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 30, w * 0.5, h * 0.5, w * 0.7);
        if (timeOfDay === 'DAY') {
          bgGrad.addColorStop(0, '#0f2236');
          bgGrad.addColorStop(1, '#060b14');
        } else if (timeOfDay === 'SUNSET') {
          bgGrad.addColorStop(0, '#2a1b2e');
          bgGrad.addColorStop(1, '#080b14');
        } else {
          bgGrad.addColorStop(0, '#091326');
          bgGrad.addColorStop(1, '#03060c');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      const yaw = (yawDeg * Math.PI) / 180;
      const pitch = (pitchDeg * Math.PI) / 180;
      const scale = cameraMode === 'FIRST_PERSON_VI' ? 36 : 26;
      const cx = w * 0.5;
      const cy = h * 0.54;

      const project3D = (x: number, y: number, z: number): [number, number] => {
        const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
        const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
        const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
        const depth = Math.max(12, 24 + rz * Math.cos(pitch) * 0.35);
        const persp = 24 / depth;
        return [cx + rx * scale * persp, cy - ry * scale * persp];
      };

      // Draw 3D Floor Grid (Zero-404 Procedural LiDAR Grid)
      ctx.lineWidth = 1;
      for (let gx = -9; gx <= 9; gx += 1.5) {
        const [x1, y1] = project3D(gx, 0, -8);
        const [x2, y2] = project3D(gx, 0, 7);
        ctx.strokeStyle = highContrastViMode ? 'rgba(255, 230, 0, 0.22)' : 'rgba(0, 229, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      for (let gz = -8; gz <= 7; gz += 1.5) {
        const [x1, y1] = project3D(-9, 0, gz);
        const [x2, y2] = project3D(9, 0, gz);
        ctx.strokeStyle = highContrastViMode ? 'rgba(255, 230, 0, 0.22)' : 'rgba(0, 229, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw Central Tactile Paving Path (Ścieżka naprowadzająca dla pacjentów niewidomych)
      const [tp1x, tp1y] = project3D(0, 0.05, -7);
      const [tp2x, tp2y] = project3D(0, 0.05, 5.5);
      ctx.strokeStyle = highContrastViMode ? '#ffe600' : 'rgba(226, 199, 153, 0.55)';
      ctx.lineWidth = highContrastViMode ? 5 : 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(tp1x, tp1y);
      ctx.lineTo(tp2x, tp2y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Reception Desk at [0, 0, -6.8]
      const [rx1, ry1] = project3D(-2.2, 0.9, -6.8);
      const [rx2, ry2] = project3D(2.2, 0.9, -6.8);
      ctx.strokeStyle = highContrastViMode ? '#00f5d4' : '#15c5c5';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rx1, ry1);
      ctx.lineTo(rx2, ry2);
      ctx.stroke();
      ctx.fillStyle = highContrastViMode ? '#ffe600' : '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RECEPCJA BM CLINIC (START)', (rx1 + rx2) / 2, (ry1 + ry2) / 2 - 10);

      // Draw 4 Department Rooms as Layered 3D Extruded Glass Volumes
      CLINIC_ROOMS.forEach((room) => {
        const isSelected = room.id === activeRoom.id;
        const [bx, bz] = [room.position[0], room.position[2]];
        const rw = 2.8;
        const rd = 2.2;
        const rh = isSelected ? 2.4 : 1.8;

        const baseCorners: [number, number][] = [
          project3D(bx - rw, 0, bz - rd),
          project3D(bx + rw, 0, bz - rd),
          project3D(bx + rw, 0, bz + rd),
          project3D(bx - rw, 0, bz + rd),
        ];
        const topCorners: [number, number][] = [
          project3D(bx - rw, rh, bz - rd),
          project3D(bx + rw, rh, bz - rd),
          project3D(bx + rw, rh, bz + rd),
          project3D(bx - rw, rh, bz + rd),
        ];

        // Floor plate
        ctx.fillStyle = isSelected
          ? highContrastViMode
            ? 'rgba(255, 230, 0, 0.28)'
            : 'rgba(0, 229, 255, 0.22)'
          : 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = isSelected
          ? highContrastViMode
            ? '#ffe600'
            : room.color
          : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = isSelected ? 2.5 : 1.2;

        ctx.beginPath();
        baseCorners.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vertical glass pillars
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(baseCorners[i][0], baseCorners[i][1]);
          ctx.lineTo(topCorners[i][0], topCorners[i][1]);
          ctx.stroke();
        }

        // Top refractive roof rim
        ctx.fillStyle = isSelected
          ? highContrastViMode
            ? 'rgba(0, 245, 212, 0.25)'
            : 'rgba(21, 197, 197, 0.18)'
          : 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        topCorners.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Audio Beacon Pulse Ring at Room Door
        const doorX = bx > 0 ? bx - rw : bx + rw;
        const [dx, dy] = project3D(doorX, 0.4, bz);
        if (isSelected) {
          const pulseRadius = 8 + Math.sin(pulsePhase * 2) * 5;
          ctx.strokeStyle = highContrastViMode ? '#ffe600' : '#b8ff01';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(dx, dy, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Room Label HUD Tag
        const [lx, ly] = project3D(bx, rh + 0.5, bz);
        ctx.fillStyle = highContrastViMode ? '#05070a' : 'rgba(6, 11, 20, 0.88)';
        ctx.fillRect(lx - 86, ly - 22, 172, 34);
        ctx.strokeStyle = isSelected
          ? highContrastViMode
            ? '#ffe600'
            : room.color
          : 'rgba(255,255,255,0.25)';
        ctx.strokeRect(lx - 86, ly - 22, 172, 34);

        ctx.fillStyle = isSelected ? (highContrastViMode ? '#ffe600' : room.color) : '#f8fafc';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${room.roomCode} • ${room.deptName}`, lx, ly - 7);
        ctx.fillStyle = highContrastViMode ? '#ffffff' : '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Braille: ${room.brailleCode} • ${room.beaconFreqHz}Hz`, lx, ly + 7);
      });

      // Draw Active A* Navigation Spline from Reception to Selected Room
      const doorTargetX = activeRoom.position[0] * 0.72;
      const [pStartX, pStartY] = project3D(0, 0.15, -6.8);
      const [pMidX, pMidY] = project3D(0, 0.15, activeRoom.position[2]);
      const [pEndX, pEndY] = project3D(doorTargetX, 0.15, activeRoom.position[2]);

      ctx.strokeStyle = highContrastViMode ? '#00f5d4' : '#b8ff01';
      ctx.lineWidth = highContrastViMode ? 4 : 3;
      ctx.beginPath();
      ctx.moveTo(pStartX, pStartY);
      ctx.lineTo(pMidX, pMidY);
      ctx.lineTo(pEndX, pEndY);
      ctx.stroke();

      // Draw Patient Avatar Pose along the route
      const pose = getPatientPose(walkProgress);
      const [ux, uy] = project3D(pose.pos[0], 0.35, pose.pos[2]);
      ctx.fillStyle = highContrastViMode ? '#ffe600' : '#00e5ff';
      ctx.beginPath();
      ctx.arc(ux, uy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeRoom, cameraMode, getPatientPose, highContrastViMode, pitchDeg, timeOfDay, walkProgress, yawDeg]);

  const pose = getPatientPose(walkProgress);
  const navInfo = computeClockDirection(pose.pos, pose.headingRad, activeRoom.position);

  const handleRoomClick = (room: DepartmentRoomNode) => {
    onSelectDepartment(room.deptName);
    setWalkProgress(0);
    if (onModelInteract) onModelInteract();
    if (audioEnabled) {
      emitSpatialBeaconPing(room);
    }
    speakGuidance(
      `Wybrano ${room.title}. ${room.landmarkHintPl} ${navInfo.instructionPl}`
    );
  };

  const handleStartWalk = () => {
    setWalkProgress(0);
    setIsWalking(true);
    if (onModelInteract) onModelInteract();
    if (audioEnabled) {
      emitSpatialBeaconPing(activeRoom);
    }
    speakGuidance(
      `Rozpoczęto prowadzenie wzdłuż ścieżki naprowadzającej do: ${activeRoom.deptName}, ${activeRoom.roomCode}. ${navInfo.instructionPl}`
    );
  };

  return (
    <section
      aria-label="Interaktywny Model Przestrzenny 3D Kliniki BM Clinic oraz Nawigacja dla Pacjentów"
      className={`rounded-3xl border p-6 transition-all ${
        highContrastViMode
          ? 'bg-[#05070a] border-[#ffe600] text-white'
          : 'border-cyan-500/30 bg-white/5 backdrop-blur-2xl shadow-2xl'
      }`}
    >
      {/* Screen-reader live region for blind (VI) patients */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Top Spatial HUD Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${
              highContrastViMode
                ? 'bg-[#ffe600] text-black'
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
            }`}
          >
            CYFROWY BLIŹNIAK 3D • LIQUID GLASS HUD • NAWIGACJA VI (HRTF AUDIO + WCAG AAA)
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold">
            Przestrzenny Model 3D Kliniki bmclinic.co (4 Działy Zabiegowe)
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setCameraMode((m) => (m === 'ISOMETRIC_3D' ? 'FIRST_PERSON_VI' : 'ISOMETRIC_3D'))
            }
            className="px-3 py-2 rounded-xl text-xs font-bold border border-white/20 bg-white/10 hover:bg-white/20"
          >
            Kamera: {cameraMode === 'ISOMETRIC_3D' ? 'Rzut 3D Izometryczny' : 'Widok Pacjenta 1st-POV'}
          </button>

          <button
            type="button"
            onClick={() =>
              setTimeOfDay((t) => (t === 'DAY' ? 'SUNSET' : t === 'SUNSET' ? 'NIGHT' : 'DAY'))
            }
            className="px-3 py-2 rounded-xl text-xs font-bold border border-white/20 bg-white/10 hover:bg-white/20"
          >
            Światło: {timeOfDay === 'DAY' ? '☀️ Dzień' : timeOfDay === 'SUNSET' ? '🌅 Zmierzch' : '🌙 Noc'}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (next) emitSpatialBeaconPing(activeRoom);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${
              audioEnabled
                ? 'bg-lime-400/25 border-lime-400 text-lime-200'
                : 'border-white/20 bg-white/10'
            }`}
          >
            {audioEnabled ? '🔊 Latarnia HRTF 3D: WŁ.' : '🔇 Włącz Dźwięk 3D HRTF'}
          </button>

          <button
            type="button"
            onClick={onToggleViMode}
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${
              highContrastViMode
                ? 'bg-[#ffe600] text-black border-white'
                : 'border-amber-400/40 bg-amber-400/15 text-amber-200'
            }`}
          >
            {highContrastViMode ? '👁️ Tryb WCAG AAA (Aktywny)' : '👁️ Tryb Wysokiego Kontrastu VI'}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + Active Room Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={820}
            height={440}
            className="w-full h-[380px] md:h-[430px] block cursor-grab active:cursor-grabbing"
            onClick={() => {
              if (audioEnabled) emitSpatialBeaconPing(activeRoom);
              if (onModelInteract) onModelInteract();
            }}
          />

          {/* Bottom Camera Orbit Sliders */}
          <div className="p-3 bg-slate-900/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Obrót 3D (Yaw):</span>
              <input
                type="range"
                min={-65}
                max={65}
                value={yawDeg}
                onChange={(e) => setYawDeg(Number(e.target.value))}
                className="accent-cyan-400"
              />
              <span className="font-mono">{yawDeg}°</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Nachylenie (Pitch):</span>
              <input
                type="range"
                min={18}
                max={62}
                value={pitchDeg}
                onChange={(e) => setPitchDeg(Number(e.target.value))}
                className="accent-cyan-400"
              />
              <span className="font-mono">{pitchDeg}°</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartWalk}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 font-bold hover:bg-cyan-500/35"
              >
                🚶 Symuluj przejście pacjenta (A* Route)
              </button>
              <button
                type="button"
                onClick={() => emitSpatialBeaconPing(activeRoom)}
                className="px-3 py-1.5 rounded-lg bg-lime-400/20 border border-lime-400/40 text-lime-200 font-bold hover:bg-lime-400/30"
              >
                📡 Impuls Sonarowy ({activeRoom.beaconFreqHz} Hz)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Department Room Selector & VI Telemetry */}
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Wybierz gabinet w modelu 3D (4 Działy bmclinic.co):
            </div>
            {CLINIC_ROOMS.map((room) => {
              const active = room.id === activeRoom.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleRoomClick(room)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    active
                      ? highContrastViMode
                        ? 'bg-[#ffe600] text-black border-white font-bold'
                        : 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : 'bg-slate-900/70 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>
                      {room.roomCode} • Braille: {room.brailleCode}
                    </span>
                    <span>{room.beaconFreqHz} Hz</span>
                  </div>
                  <div className="font-bold text-sm mt-0.5">{room.deptName}</div>
                  <div className={`text-xs mt-0.5 ${active && highContrastViMode ? 'text-black' : 'text-slate-400'}`}>
                    {room.equipment}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clock-Face & Metric Wayfinding Telemetry Box */}
          <div
            className={`p-4 rounded-2xl border ${
              highContrastViMode
                ? 'bg-black border-[#00f5d4] text-[#ffe600]'
                : 'bg-slate-900/90 border-white/15'
            }`}
          >
            <div className="text-xs font-mono uppercase text-cyan-300">
              Nawigacja Zegarowa & Asystent Głosowy VI
            </div>
            <div className="text-2xl font-extrabold mt-1">
              Godzina {navInfo.clockHour} • {navInfo.distanceMeters} m
            </div>
            <p className="text-xs text-slate-300 mt-1">{navInfo.instructionPl}</p>
            <p className="text-xs text-slate-400 mt-1 italic">{activeRoom.landmarkHintPl}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
