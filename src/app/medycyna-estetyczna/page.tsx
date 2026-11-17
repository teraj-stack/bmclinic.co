'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Need = { code: string; title: string; group: string; legacyNeed: number };
const needs: Need[] = [
  {
    "code": "01.1",
    "title": "Sucha skóra",
    "group": "Skóra",
    "legacyNeed": 0
  },
  {
    "code": "00.1",
    "title": "Bezpieczeństwo i opieka",
    "group": "Bezpieczeństwo",
    "legacyNeed": 2
  },
  {
    "code": "01.3",
    "title": "Plamy na skórze",
    "group": "Skóra",
    "legacyNeed": 1
  },
  {
    "code": "01.4",
    "title": "Skóra tłusta i wągry",
    "group": "Skóra",
    "legacyNeed": 3
  },
  {
    "code": "02.1",
    "title": "Worki pod oczami",
    "group": "Okolica oka",
    "legacyNeed": 6
  },
  {
    "code": "02.2",
    "title": "Kurze łapki",
    "group": "Okolica oka",
    "legacyNeed": 7
  },
  {
    "code": "02.3",
    "title": "Opadająca powieka",
    "group": "Okolica oka",
    "legacyNeed": 8
  },
  {
    "code": "02.4",
    "title": "Dolina łez",
    "group": "Okolica oka",
    "legacyNeed": 9
  },
  {
    "code": "03.1",
    "title": "Zmiany wyglądu dłoni",
    "group": "Dłonie",
    "legacyNeed": 5
  },
  {
    "code": "03.2",
    "title": "Widoczne naczynia i ścięgna",
    "group": "Dłonie",
    "legacyNeed": 5
  },
  {
    "code": "03.3",
    "title": "Przebarwienia na dłoniach",
    "group": "Dłonie",
    "legacyNeed": 5
  },
  {
    "code": "03.4",
    "title": "Sucha i wiotka skóra dłoni",
    "group": "Dłonie",
    "legacyNeed": 5
  },
  {
    "code": "04.1",
    "title": "Wiotka skóra brzucha",
    "group": "Sylwetka",
    "legacyNeed": 3
  },
  {
    "code": "04.2",
    "title": "Tkanka tłuszczowa brzucha",
    "group": "Sylwetka",
    "legacyNeed": 3
  },
  {
    "code": "04.3",
    "title": "Otarcia skóry",
    "group": "Sylwetka",
    "legacyNeed": 9
  },
  {
    "code": "04.4",
    "title": "Wiotkość ramion",
    "group": "Sylwetka",
    "legacyNeed": 9
  },
  {
    "code": "07.1",
    "title": "Naczynka na nogach",
    "group": "Nogi",
    "legacyNeed": 4
  },
  {
    "code": "07.2",
    "title": "Ciężkie nogi",
    "group": "Nogi",
    "legacyNeed": 4
  },
  {
    "code": "07.3",
    "title": "Cellulit",
    "group": "Nogi",
    "legacyNeed": 4
  },
  {
    "code": "07.4",
    "title": "Skórka pomarańczowa",
    "group": "Nogi",
    "legacyNeed": 4
  },
  {
    "code": "07.5",
    "title": "Modelowanie pośladków",
    "group": "Nogi",
    "legacyNeed": 4
  },
  {
    "code": "05.1",
    "title": "Rumień i naczynka na twarzy",
    "group": "Przebarwienia",
    "legacyNeed": 10
  },
  {
    "code": "01.2",
    "title": "Blizny potrądzikowe i rozstępy",
    "group": "Skóra",
    "legacyNeed": 11
  },
  {
    "code": "05.2",
    "title": "Przebarwienia pozapalne",
    "group": "Przebarwienia",
    "legacyNeed": 12
  },
  {
    "code": "06.2",
    "title": "Zmarszczki dekoltu i plamy posłoneczne",
    "group": "Szyja i dekolt",
    "legacyNeed": 13
  },
  {
    "code": "06.1",
    "title": "Szyja i dekolt",
    "group": "Szyja i dekolt",
    "legacyNeed": 13
  },
  {
    "code": "06.4",
    "title": "Naszyjnik Wenus",
    "group": "Szyja i dekolt",
    "legacyNeed": 13
  }
];
const groups = ['Wszystkie', 'Skóra', 'Okolica oka', 'Dłonie', 'Sylwetka', 'Nogi', 'Przebarwienia', 'Szyja i dekolt', 'Bezpieczeństwo'];
const palettes = {
  klasyk: { background: '#f4efe7', surface: '#fffaf3', text: '#302e2b', dim: '#736b62', line: '#d9cdbf', accent: '#957456' },
  grafit: { background: '#141a1c', surface: '#20292c', text: '#f1f1ea', dim: '#a5b4b3', line: '#344448', accent: '#9ac5bb' },
  noir: { background: '#090a0c', surface: '#17191c', text: '#f7f4eb', dim: '#a9a9a5', line: '#33383a', accent: '#d9bca0' },
  myskincode: { background: '#f2ecec', surface: '#fff9f9', text: '#3a3037', dim: '#796976', line: '#e4d6db', accent: '#a27d91' }
};
type Palette = keyof typeof palettes;

export default function AestheticMedicine() {
  const [category, setCategory] = useState('Wszystkie');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<Palette>('grafit');
  const [selected, setSelected] = useState<Need | null>(null);
  const colors = palettes[theme];
  const filtered = useMemo(() => needs.filter(item =>
    (category === 'Wszystkie' || item.group === category) &&
    (item.title + ' ' + item.group).toLocaleLowerCase('pl').includes(search.toLocaleLowerCase('pl'))
  ).sort((a,b) => a.code.localeCompare(b.code,'pl')), [category, search]);

  return <main style={{minHeight:'100vh',background:colors.background,color:colors.text,transition:'background .25s,color .25s',fontFamily:'system-ui, -apple-system, sans-serif'}}>
    <div style={{maxWidth:1180,margin:'auto',padding:'28px 22px 100px'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
        <Link href="/" style={{color:colors.accent,textDecoration:'none',fontSize:14}}>← BM Clinic / Sky Lobby</Link>
        <span style={{fontSize:12,letterSpacing:3,color:colors.dim}}>MEDYCYNA ESTETYCZNA</span>
      </nav>
      <section style={{padding:'66px 0 38px',maxWidth:900}}>
        <div style={{fontSize:12,letterSpacing:4,color:colors.accent}}>BM CLINIC / BEAUTY & LONGEVITY</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(38px,6vw,74px)',lineHeight:1.07,fontWeight:400,margin:'22px 0'}}>Piękno zaczyna się od rozmowy.</h1>
        <p style={{fontSize:'clamp(16px,2vw,20px)',lineHeight:1.65,color:colors.dim,maxWidth:720}}>Wybierz to, co Cię niepokoi lub co chcesz zmienić. Nie musisz znać nazwy zabiegu. To początek rozmowy o potrzebach, możliwościach i bezpieczeństwie.</p>
      </section>
      <section style={{display:'flex',gap:12,flexWrap:'wrap',margin:'0 0 32px'}}>
        <Link href="/ruta" style={{display:'inline-block',padding:'14px 20px',background:colors.accent,color:colors.background,borderRadius:14,textDecoration:'none',fontWeight:600}}>Otwórz mapę objawów RUTA →</Link>
        <Link href="/" style={{display:'inline-block',padding:'14px 20px',border:'1px solid '+colors.line,borderRadius:14,textDecoration:'none',color:colors.text}}>Wróć do Sky Lobby</Link>
      </section>
      <section aria-label="Motyw kolorystyczny" style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:30}}>
        {(['klasyk','grafit','noir','myskincode'] as Palette[]).map(key=><button key={key} type="button" onClick={()=>setTheme(key)} aria-pressed={theme===key} style={{cursor:'pointer',border:'1px solid '+colors.line,borderRadius:30,padding:'10px 16px',background:theme===key?colors.accent:colors.surface,color:theme===key?colors.background:colors.text}}>{key==='myskincode'?'MySkinCode':key[0].toUpperCase()+key.slice(1)}</button>)}
      </section>
      <div style={{border:'1px solid '+colors.line,borderRadius:24,padding:'24px',background:colors.surface}}>
        <div style={{display:'flex',gap:16,justifyContent:'space-between',flexWrap:'wrap',alignItems:'center',marginBottom:22}}>
          <div><div style={{fontSize:11,letterSpacing:3,color:colors.accent}}>MAPA POTRZEB</div><h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:32,margin:'8px 0'}}>Co chciałabyś lub chciałbyś zmienić?</h2></div>
          <input aria-label="Szukaj problemu" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Wpisz objaw lub obszar…" style={{minWidth:230,maxWidth:'100%',padding:14,borderRadius:14,border:'1px solid '+colors.line,background:colors.background,color:colors.text}}/>
        </div>
        <div role="group" aria-label="Filtruj według obszaru" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:26}}>
          {groups.map(g=><button key={g} type="button" onClick={()=>setCategory(g)} aria-pressed={g===category} style={{cursor:'pointer',border:'1px solid '+colors.line,padding:'9px 12px',borderRadius:12,background:g===category?colors.accent:colors.background,color:g===category?colors.background:colors.text}}>{g}</button>)}
        </div>
        <div aria-live="polite" style={{fontSize:13,color:colors.dim,marginBottom:12}}>Znaleziono: {filtered.length} / {needs.length}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:12}}>
          {filtered.map(item=><button key={item.code} type="button" onClick={()=>setSelected(item)} style={{cursor:'pointer',border:'1px solid '+colors.line,borderRadius:18,background:colors.background,color:colors.text,textAlign:'left',padding:20,minHeight:140,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:25}}>
            <span style={{fontSize:12,letterSpacing:2,color:colors.accent}}>{item.code} / {item.group}</span><strong style={{fontWeight:500,fontSize:18,lineHeight:1.35}}>{item.title} <span aria-hidden="true" style={{color:colors.accent}}>↗</span></strong>
          </button>)}
        </div>
        {!filtered.length&&<p>Brak wyników. Zmień filtr lub wpisaną frazę.</p>}
      </div>
      <p style={{fontSize:13,lineHeight:1.6,color:colors.dim,marginTop:30}}>Wersja informacyjna — nie stanowi diagnozy ani kwalifikacji do zabiegu. Wybór problemu nie przesyła danych na serwer. Ostateczna metoda zależy od badania i konsultacji.</p>
      <Link href="/" style={{color:colors.accent}}>Wróć do kliniki</Link>
    </div>
    {selected&&<div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}} style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,.75)',display:'grid',placeItems:'center',padding:18}}>
      <section role="dialog" aria-modal="true" aria-labelledby="need-title" style={{position:'relative',width:'min(100%,580px)',background:colors.surface,color:colors.text,border:'1px solid '+colors.line,borderRadius:24,padding:'clamp(24px,5vw,42px)',boxShadow:'0 20px 60px #0008'}}>
        <button type="button" onClick={()=>setSelected(null)} aria-label="Zamknij" style={{position:'absolute',right:18,top:16,fontSize:26,background:'transparent',border:0,color:colors.text,cursor:'pointer'}}>×</button>
        <div style={{fontSize:12,color:colors.accent,letterSpacing:2}}>{selected.code} / {selected.group}</div>
        <h2 id="need-title" style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:35,lineHeight:1.2,margin:'18px 0'}}>{selected.title}</h2>
        <p style={{lineHeight:1.7,color:colors.dim}}>Zacznijmy od określenia, od kiedy obserwujesz tę zmianę, co Ci w niej przeszkadza i jaki efekt byłby dla Ciebie naturalny. Przed zaproponowaniem zabiegu potrzebna jest ocena skóry, wywiad i omówienie alternatyw oraz przeciwwskazań.</p>
        <p style={{fontSize:12,color:colors.dim}}>Oryginalny identyfikator ścieżki: {selected.legacyNeed}. Zachowano powiązanie z odzyskanym układem kafli.</p>
        <button type="button" onClick={()=>setSelected(null)} style={{marginTop:18,padding:'12px 20px',background:colors.accent,color:colors.background,border:0,borderRadius:12,cursor:'pointer'}}>Wróć do mapy</button>
      </section>
    </div>}
  </main>;
}
