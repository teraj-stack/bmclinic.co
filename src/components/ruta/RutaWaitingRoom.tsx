import Link from 'next/link';
import { RUTA_PROKTOLOGIA } from '@/data/ruta-proktologia';
import { ADDITIONAL_RUTA, type RutaDepartmentSlug } from '@/data/ruta-specializacje';

const styles: Record<RutaDepartmentSlug, { background: string; eyebrow: string; button: string; card: string }> = {
  proktologia: {
    background: 'bg-gradient-to-br from-[#061a20] via-[#10383f] to-[#07141b] text-white',
    eyebrow: 'text-teal-200',
    button: 'bg-teal-200 text-[#092b30] hover:bg-teal-100',
    card: 'border-teal-200/20 bg-white/[.06] hover:border-teal-200/60',
  },
  flebologia: {
    background: 'bg-gradient-to-br from-[#f4eef9] via-[#e9eaf9] to-[#f9f5ef] text-[#273347]',
    eyebrow: 'text-[#655c91]',
    button: 'bg-[#605d91] text-white hover:bg-[#464575]',
    card: 'border-[#777397]/25 bg-white/60 hover:border-[#777397]',
  },
  'chirurgia-ogolna': {
    background: 'bg-gradient-to-br from-[#f8f8f6] via-[#edf2f4] to-[#e4eaed] text-[#25333c]',
    eyebrow: 'text-[#547083]',
    button: 'bg-[#344f61] text-white hover:bg-[#233e50]',
    card: 'border-[#7d9aa6]/30 bg-white/70 hover:border-[#7d9aa6]',
  },
  'medycyna-estetyczna': {
    background: 'bg-gradient-to-br from-[#f5f0f8] via-[#e9e3f1] to-[#f8f3f4] text-[#3c304c]',
    eyebrow: 'text-[#79618d]',
    button: 'bg-[#745b86] text-white hover:bg-[#614a76]',
    card: 'border-[#a58ab5]/30 bg-white/60 hover:border-[#a58ab5]',
  },
};

export default function RutaWaitingRoom({ department, name }: { department: RutaDepartmentSlug; name: string }) {
  const nodes = department === 'proktologia' ? RUTA_PROKTOLOGIA : ADDITIONAL_RUTA[department].nodes;
  const symptoms = nodes.filter((node) => node.type === 'symptom');
  const palette = styles[department];

  return (
    <section aria-labelledby="waiting-room-title" className={`relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl ${palette.background}`}>
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-current opacity-[.04]" aria-hidden />
      <div className="relative p-6 sm:p-9 lg:p-12">
        <p className={`text-xs font-semibold uppercase tracking-[.24em] ${palette.eyebrow}`}>Poczekalnia cyfrowa · {name}</p>
        <h2 id="waiting-room-title" className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">Zacznij od tego, co Cię niepokoi.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 opacity-75">Nie musisz znać nazwy schorzenia. Wybierz własnymi słowami objaw lub problem i przejdź do interaktywnej mapy elementów RUTA.</p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {symptoms.map((node) => (
            <Link key={node.id} href={`/ruta/${department}?objaw=${encodeURIComponent(node.id)}`} className={`group flex min-h-24 items-center justify-between gap-2 rounded-2xl border p-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${palette.card}`}>
              <span>{node.label}</span><span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">↗</span>
            </Link>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link href={`/ruta/${department}`} className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold transition-colors ${palette.button}`}>Otwórz pełną mapę RUTA →</Link>
          <span className="max-w-md text-xs leading-5 opacity-65">Mapa ma charakter edukacyjny i nie zastępuje konsultacji. Wybory nie są przesyłane do kliniki.</span>
        </div>
      </div>
    </section>
  );
}
