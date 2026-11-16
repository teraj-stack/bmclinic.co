'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RUTA_PROKTOLOGIA, type RutaNode } from '@/data/ruta-proktologia';
import { ADDITIONAL_RUTA, type RutaDepartmentSlug } from '@/data/ruta-specializacje';

const proktologyCaution = 'Pilna pomoc medyczna jest wskazana przy obfitym krwawieniu, omdleniu lub znacznym osłabieniu, nagłym silnym bólu, gorączce z bolesnym obrzękiem albo czarnym smolistym stolcu.';

export default function RutaProktologia({ department = 'proktologia' }: { department?: RutaDepartmentSlug }) {
  const alternate = department === 'proktologia' ? null : ADDITIONAL_RUTA[department];
  const nodes: RutaNode[] = alternate?.nodes ?? RUTA_PROKTOLOGIA;
  const roots = nodes.filter((node) => node.type === 'symptom');
  const caution = alternate?.caution ?? proktologyCaution;
  const departmentName = alternate?.name ?? 'Proktologia';
  const childrenOf = (id: string) => (nodes.find((node) => node.id === id)?.links ?? [])
    .map((key) => nodes.find((node) => node.id === key))
    .filter((node): node is RutaNode => Boolean(node));
  const [symptomId, setSymptomId] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [compact, setCompact] = useState(false);
  const current = nodes.find((n) => n.id === path[path.length - 1]);
  const chosenSymptom = roots.find((n) => n.id === symptomId);
  const next = current ? childrenOf(current.id) : chosenSymptom ? childrenOf(chosenSymptom.id) : [];
  const openSymptom = (id: string) => {
    setSymptomId(id);
    setPath([id]);
  };
  const back = () => {
    if (path.length > 1) setPath((prev) => prev.slice(0, -1));
    else { setPath([]); setSymptomId(null); }
  };

  return (
    <main className="min-h-screen bg-[#06161b] text-[#f4f6f3] pb-24">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <Link href={`/${department}`} className="text-sm text-teal-200 hover:underline">← Poczekalnia: {departmentName}</Link>
            <p className="mt-4 text-xs uppercase tracking-[.25em] text-teal-200/70">BM Clinic / Mapa elementów</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">RUTA <span className="font-light text-white/55">/ {departmentName}</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Wybierz to, co odczuwasz. Odkrywaj połączone elementy i przygotuj się do rozmowy z lekarzem.</p>
          </div>
          <Link href="/" className="rounded-full border border-white/25 px-5 py-2 text-sm hover:bg-white/10">Sky Lobby ↗</Link>
        </header>

        <nav aria-label="Aktualna ścieżka RUTA" className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/60">
          <Link href="/">Sky Lobby</Link><span>›</span><Link href={`/${department}`}>{departmentName}</Link><span>›</span><span className="text-teal-200">RUTA</span>
          {path.map((id) => <span key={id}>› {nodes.find((n) => n.id === id)?.label}</span>)}
        </nav>

        <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
          <div className="overflow-hidden rounded-[32px] border border-teal-100/15 bg-[radial-gradient(circle_at_50%_40%,#0b4d50_0%,#09282e_44%,#06171d_100%)] p-4 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-medium">Mapa objawów</h2><p className="text-xs text-white/50">Wybierz węzeł, aby rozwinąć powiązaną ścieżkę.</p></div>
              <div className="flex gap-2">
                <button type="button" aria-label="Pomniejsz mapę" onClick={() => setZoom((z) => Math.max(.75, +(z - .1).toFixed(2)))} className="rounded-xl border border-white/20 px-3 py-2">−</button>
                <button type="button" aria-label="Powiększ mapę" onClick={() => setZoom((z) => Math.min(1.25, +(z + .1).toFixed(2)))} className="rounded-xl border border-white/20 px-3 py-2">+</button>
                <button type="button" onClick={() => {setZoom(1); setOffset({x: 0, y: 0}); setPath([]); setSymptomId(null); setAnswers({});}} className="rounded-xl border border-white/20 px-3 py-2 text-xs">Reset</button>
              </div>
            </div>
            <div role="group" aria-label="Przesuwanie mapy" className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="mr-2 text-white/60">Przesuń mapę:</span>
              <button type="button" aria-label="Mapa w lewo" onClick={() => setOffset((v) => ({...v, x: v.x - 48}))} className="rounded-lg border border-white/20 px-3 py-2">←</button>
              <button type="button" aria-label="Mapa w górę" onClick={() => setOffset((v) => ({...v, y: v.y - 48}))} className="rounded-lg border border-white/20 px-3 py-2">↑</button>
              <button type="button" aria-label="Mapa w dół" onClick={() => setOffset((v) => ({...v, y: v.y + 48}))} className="rounded-lg border border-white/20 px-3 py-2">↓</button>
              <button type="button" aria-label="Mapa w prawo" onClick={() => setOffset((v) => ({...v, x: v.x + 48}))} className="rounded-lg border border-white/20 px-3 py-2">→</button>
              <button type="button" onClick={() => setOffset({x: 0, y: 0})} className="rounded-lg border border-white/20 px-3 py-2">Wyśrodkuj</button>
            </div>
            <div className="mt-4 min-h-[430px] overflow-auto rounded-3xl border border-white/10 bg-black/10 p-5">
              <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'top center' }} className="mx-auto w-full max-w-2xl transition-transform duration-300">
                <div className="mx-auto w-fit rounded-2xl border border-teal-200/40 bg-teal-100/10 px-6 py-4 text-center shadow-[0_0_40px_#2dd4bf17]">
                  <div className="text-xs uppercase tracking-widest text-teal-200">RUTA 01</div>
                  <div className="mt-1 text-lg font-medium">Co Cię niepokoi?</div>
                </div>
                <div aria-hidden className="mx-auto h-9 w-px bg-teal-200/50"/>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {roots.map((node) => {
                    const active = symptomId === node.id;
                    return <button key={node.id} type="button" aria-pressed={active} onClick={() => openSymptom(node.id)} className={`min-h-24 rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200 ${active ? 'border-teal-200 bg-teal-300/25 shadow-[0_0_30px_#5eead438]' : 'border-white/15 bg-white/[.06] hover:border-teal-200/60 hover:bg-white/10'}`}>
                      <span className="block text-base font-semibold">{node.label}</span><span className="mt-2 block text-xs text-white/55">{active ? 'Wybrano • rozwinięto' : 'Otwórz objaw ↗'}</span>
                    </button>;
                  })}
                </div>
                {chosenSymptom && <div className="mt-7" aria-live="polite">
                  <div aria-hidden className="mx-auto h-9 w-px bg-teal-200/60"/>
                  <div className="mx-auto max-w-xl rounded-2xl border border-teal-200/40 bg-[#103b41] p-5">
                    <p className="text-xs tracking-widest text-teal-200">AKTYWNY WĘZEŁ · {chosenSymptom.label.toUpperCase()}</p>
                    <p className="mt-2 text-sm text-white/80">{chosenSymptom.description}</p>
                    {childrenOf(chosenSymptom.id).map((node) => <button key={node.id} type="button" onClick={() => setPath([chosenSymptom.id, node.id])} className="mt-4 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-left text-sm hover:bg-white/20">{node.label} <span className="float-right">↗</span></button>)}
                  </div>
                </div>}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/55">
              <span>Powiększenie: {Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setCompact((v) => !v)} className="underline underline-offset-4">{compact ? 'Pokaż wskazówki' : 'Ukryj wskazówki'}</button>
            </div>
            {!compact && <p className="mt-3 text-xs leading-5 text-white/55">Mapa działa również klawiaturą. Na telefonie można przewijać obszar mapy. Węzły rozwijają szczegóły po prawej lub poniżej.</p>}
          </div>

          <aside className="rounded-[32px] border border-white/15 bg-white/[.055] p-6">
            <p className="text-xs uppercase tracking-[.2em] text-teal-200">Panel szczegółów</p>
            {current ? <>
              <h2 className="mt-3 text-2xl font-semibold">{current.label}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{current.description}</p>
              {current.options && <fieldset className="mt-6 space-y-3">
                <legend className="mb-3 text-sm font-medium">Co najlepiej opisuje Twoją sytuację?</legend>
                {current.options.map((option) => <label key={option} className="flex cursor-pointer gap-3 rounded-xl border border-white/15 bg-black/10 p-3 text-sm">
                  <input type="radio" name={current.id} checked={answers[current.id] === option} onChange={() => setAnswers((prev) => ({...prev, [current.id]: option}))} className="accent-teal-300"/>
                  {option}
                </label>)}
              </fieldset>}
              {next.length > 0 && <div className="mt-6 space-y-2">
                {next.map((node) => <button key={node.id} type="button" onClick={() => setPath((prev) => [...prev, node.id])} className="w-full rounded-xl bg-teal-200 px-4 py-3 text-left text-sm font-semibold text-[#06282d] hover:bg-teal-100">{node.label} →</button>)}
              </div>}
              {current.type === 'action' && <Link href={`/${department}`} className="mt-6 block rounded-xl bg-teal-200 p-3 text-center text-sm font-semibold text-[#06282d]">Wróć do działu →</Link>}
              <button type="button" onClick={back} className="mt-5 text-sm text-white/65 underline underline-offset-4">← Poprzedni element</button>
            </> : <>
              <h2 className="mt-3 text-2xl font-semibold">Rozpocznij od objawu</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">Wybierz jeden z sześciu elementów mapy. W kolejnym kroku zobaczysz pytania i informacje pomagające przygotować wywiad.</p>
            </>}
            <div className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-100/[.07] p-4">
              <h3 className="text-sm font-medium text-amber-100">Kiedy szukać pomocy pilnie?</h3>
              <p className="mt-2 text-xs leading-5 text-amber-50/75">{caution}</p>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/50">Materiał edukacyjny. Mapa nie stawia diagnozy i nie zastępuje oceny lekarskiej. Odpowiedzi są przechowywane tylko w stanie bieżącego widoku.</p>
          </aside>
        </section>
      </div>
    </main>
  );
}
