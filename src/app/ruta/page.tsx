'use client';

import { useState } from 'react';
import Link from 'next/link';
type RouteItem = [string,string,string[]];
type Dept = {name:string;accent:string;items:RouteItem[];alert:string};
const departments:Record<string,Dept> = {
  "proktologia": {
    "name": "Proktologia",
    "accent": "#8edcd1",
    "items": [
      [
        "Krwawienie",
        "Jak wygląda krwawienie?",
        [
          "Jasna krew na papierze",
          "Krew zmieszana ze stolcem",
          "Ciemny lub smolisty stolec",
          "Obfite krwawienie"
        ]
      ],
      [
        "Ból",
        "Kiedy pojawia się ból?",
        [
          "Podczas wypróżniania",
          "Po wypróżnieniu",
          "Stale",
          "Nagły silny ból"
        ]
      ],
      [
        "Świąd",
        "Kiedy pojawia się świąd?",
        [
          "W nocy",
          "Po wypróżnieniu",
          "Po pielęgnacji",
          "Cały dzień"
        ]
      ],
      [
        "Pieczenie",
        "Co nasila pieczenie?",
        [
          "Wypróżnianie",
          "Mycie",
          "Siedzenie",
          "Nie wiem"
        ]
      ],
      [
        "Guzek",
        "Co opisuje guzek?",
        [
          "Pojawił się nagle",
          "Boli",
          "Powiększa się",
          "Towarzyszy gorączka"
        ]
      ],
      [
        "Wyciek",
        "Jaki jest charakter wydzieliny?",
        [
          "Śluzowa",
          "Ropna",
          "Krwista",
          "Nie wiem"
        ]
      ]
    ],
    "alert": "Obfite krwawienie, omdlenie lub silny ból z gorączką wymagają pilnej oceny."
  },
  "flebologia": {
    "name": "Flebologia",
    "accent": "#e3cdeb",
    "items": [
      [
        "Obrzęk nóg",
        "Kiedy występuje obrzęk?",
        [
          "Pod koniec dnia",
          "Od rana",
          "Nagły jednostronny",
          "Obustronny"
        ]
      ],
      [
        "Ciężkie nogi",
        "Kiedy nogi są najcięższe?",
        [
          "Wieczorem",
          "Rano",
          "Po staniu",
          "Stale"
        ]
      ],
      [
        "Żylaki",
        "Co zauważasz?",
        [
          "Wypukłe żyły",
          "Ból",
          "Świąd",
          "Zmiany skórne"
        ]
      ],
      [
        "Pajączki",
        "Gdzie widoczne są naczynka?",
        [
          "Uda",
          "Łydki",
          "Obie nogi",
          "Jeden obszar"
        ]
      ],
      [
        "Mrowienie",
        "Kiedy pojawia się mrowienie?",
        [
          "W spoczynku",
          "W nocy",
          "Po wysiłku",
          "Stale"
        ]
      ],
      [
        "Wygląd nóg",
        "Co chcesz omówić?",
        [
          "Grube łydki",
          "Widoczne naczynia",
          "Nierówności",
          "Inny problem"
        ]
      ]
    ],
    "alert": "Nagły jednostronny obrzęk z bólem wymaga pilnej oceny. Duszność lub ból w klatce piersiowej — pomoc ratunkowa."
  },
  "chirurgia": {
    "name": "Chirurgia",
    "accent": "#dce9e6",
    "items": [
      [
        "Rana",
        "Co dzieje się z raną?",
        [
          "Nie goi się",
          "Sączy się",
          "Boli",
          "Pojawiło się zaczerwienienie"
        ]
      ],
      [
        "Paznokieć",
        "Co najbardziej przeszkadza?",
        [
          "Wrasta",
          "Boli",
          "Ropieje",
          "Nawraca"
        ]
      ],
      [
        "Zmiana skórna",
        "Jak zmienia się zmiana?",
        [
          "Rośnie",
          "Zmienia kolor",
          "Krwawi",
          "Nie zmienia się"
        ]
      ],
      [
        "Guzek",
        "Jak zachowuje się guzek?",
        [
          "Rośnie",
          "Boli",
          "Od dawna",
          "Pojawił się nagle"
        ]
      ],
      [
        "Blizna",
        "Co przeszkadza?",
        [
          "Ściąganie",
          "Świąd",
          "Wygląd",
          "Ból"
        ]
      ],
      [
        "Miejscowy ból",
        "Co towarzyszy bólowi?",
        [
          "Obrzęk",
          "Zaczerwienienie",
          "Gorączka",
          "Nic dodatkowego"
        ]
      ]
    ],
    "alert": "Narastające zaczerwienienie, gorączka, silny ból lub nieopanowane krwawienie wymagają pilnej oceny."
  },
  "estetyka": {
    "name": "Medycyna estetyczna",
    "accent": "#e5cadd",
    "items": [
      [
        "Przebarwienia",
        "Kiedy powstały?",
        [
          "Po słońcu",
          "Po stanie zapalnym",
          "Od dawna",
          "Niedawno"
        ]
      ],
      [
        "Naczynka",
        "Co widzisz?",
        [
          "Stały rumień",
          "Pojedyncze naczynka",
          "Napadowe zaczerwienienie",
          "Zmiany mieszane"
        ]
      ],
      [
        "Blizny",
        "Jaki problem dominuje?",
        [
          "Zagłębienia",
          "Wypukłość",
          "Kolor",
          "Napięcie"
        ]
      ],
      [
        "Struktura skóry",
        "Co przeszkadza?",
        [
          "Nierówności",
          "Pory",
          "Suchość",
          "Wiotkość"
        ]
      ],
      [
        "Zmarszczki",
        "Gdzie się znajdują?",
        [
          "Czoło",
          "Oczy",
          "Okolica ust",
          "Wiele obszarów"
        ]
      ],
      [
        "Regeneracja",
        "Jaki jest cel?",
        [
          "Nawilżenie",
          "Jakość skóry",
          "Regeneracja po zabiegu",
          "Konsultacja"
        ]
      ]
    ],
    "alert": "Gwałtowny obrzęk, narastający ból, zaburzenia widzenia lub zmiana koloru skóry po zabiegu wymagają pilnej oceny."
  }
};

export default function RutaPage(){
 const [dept,setDept]=useState('proktologia');
 const [active,setActive]=useState<number|null>(null);
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [showSummary,setShowSummary]=useState(false);
 const current=departments[dept];
 const chosen=active===null?null:current.items[active];
 const key=dept+':'+active;
 const answerCount=Object.keys(answers).length;
 const summary=Object.entries(answers).map(([k,v])=>{const [d,n]=k.split(':');const item=departments[d]?.items[Number(n)];return (departments[d]?.name||d)+' / '+(item?.[0]||'')+': '+v}).join('\n');
 return <main style={{minHeight:'100vh',background:'#101719',color:'#f2f5f4',fontFamily:'system-ui,sans-serif'}}>
 <div style={{maxWidth:1160,margin:'auto',padding:'28px 20px 90px'}}>
 <nav style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:60}}><Link href="/" style={{color:'#9ecdc8'}}>← Sky Lobby</Link><Link href="/medycyna-estetyczna" style={{color:'#dfc5d3'}}>Medycyna estetyczna →</Link></nav>
 <div style={{fontSize:12,letterSpacing:3,color:current.accent}}>BM CLINIC / RUTA</div>
 <h1 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(36px,5vw,65px)',margin:'12px 0'}}>Zacznij od tego, co odczuwasz.</h1>
 <p style={{maxWidth:750,lineHeight:1.7,color:'#bac8c7'}}>Nie musisz znać diagnozy. Wybierz dział, a następnie najbardziej pasujące określenie. Wybory pozostają tylko w pamięci tej strony.</p>
 <div role="group" aria-label="Wybierz specjalizację" style={{display:'flex',flexWrap:'wrap',gap:10,margin:'30px 0'}}>
 {Object.entries(departments).map(([id,d])=><button key={id} type="button" aria-pressed={dept===id} onClick={()=>{setDept(id);setActive(null);setShowSummary(false)}} style={{cursor:'pointer',background:dept===id?d.accent:'#1c292c',color:dept===id?'#111b1d':'#fff',border:'1px solid #3f5b60',borderRadius:30,padding:'12px 18px'}}>{d.name}</button>)}
 </div>
 <div style={{border:'1px solid #36474c',borderRadius:22,padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))',gap:32,background:'#172023'}}>
 <section><h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:28}}>Wybierz problem</h2><div style={{display:'grid',gap:8}}>
 {current.items.map((it,i)=><button key={i} type="button" onClick={()=>{setActive(i);setShowSummary(false)}} aria-pressed={active===i} style={{cursor:'pointer',background:active===i?'#2d3f42':'#1a292b',border:active===i?'1px solid '+current.accent:'1px solid #3e5153',borderRadius:12,padding:'17px 16px',textAlign:'left',color:'#f6f6f4',display:'flex',justifyContent:'space-between',gap:14}}><span>{String(i+1).padStart(2,'0')} / {it[0]}</span><span aria-hidden="true">↗</span></button>)}</div></section>
 <section aria-live="polite"><h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:28}}>Doprecyzuj objaw</h2>{chosen?<><h3 style={{fontSize:20,fontWeight:500}}>{chosen[1]}</h3><div role="radiogroup" aria-label={chosen[1]} style={{display:'grid',gap:12}}>
 {chosen[2].map(value=><label key={value} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:'1px solid #4b5d5f',borderRadius:10,cursor:'pointer'}}><input type="radio" name={key} checked={answers[key]===value} onChange={()=>setAnswers(v=>({...v,[key]:value}))}/>{value}</label>)}</div></>:<p style={{lineHeight:1.7,color:'#bec9c6'}}>Wybierz jeden z sześciu tematów po lewej stronie.</p>}
 <div style={{marginTop:30,padding:17,background:'#2d2927',border:'1px solid #69544c',borderRadius:12,fontSize:13,lineHeight:1.6}}><strong>Ważne:</strong> {current.alert}</div>
 {dept==='estetyka'&&<p style={{marginTop:20}}><Link href="/medycyna-estetyczna" style={{color:current.accent}}>Zobacz 27 szczegółowych tematów estetycznych →</Link></p>}
 </section></div>
 <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginTop:25}}>
 <button type="button" onClick={()=>setShowSummary(v=>!v)} style={{padding:'12px 18px',background:current.accent,color:'#101719',border:0,borderRadius:12,cursor:'pointer'}}>Podsumowanie wyborów ({answerCount})</button>
 <button type="button" onClick={()=>{setAnswers({});setActive(null);setShowSummary(false)}} style={{padding:'12px 18px',background:'transparent',color:'#fff',border:'1px solid #506266',borderRadius:12,cursor:'pointer'}}>Wyczyść wybory</button>
 </div>
 {showSummary&&<section style={{marginTop:18,border:'1px solid #4b5b5f',padding:20,borderRadius:14}}><h2 style={{fontSize:20}}>Podsumowanie do rozmowy</h2><pre style={{whiteSpace:'pre-wrap',lineHeight:1.8,fontFamily:'inherit'}}>{summary||'Nie wybrano jeszcze odpowiedzi.'}</pre><button type="button" onClick={()=>{if(navigator.clipboard&&summary)void navigator.clipboard.writeText(summary)}} style={{padding:'10px 16px',cursor:'pointer'}}>Kopiuj do schowka</button></section>}
 <p style={{color:'#9caeaf',fontSize:13,lineHeight:1.7,marginTop:35}}>To demonstracja informacyjna, nie diagnoza. Nie wpisuj danych osobowych. Aplikacja nie przesyła ani nie zapisuje danych medycznych.</p>
 </div></main>
}
