import type { Metadata } from 'next';
import RutaProktologia from '@/components/ruta/RutaProktologia';

export const metadata: Metadata = {
  title: 'RUTA — interaktywna mapa objawów proktologicznych',
  description: 'Interaktywna mapa objawów BM Clinic: krwawienie, ból, świąd, pieczenie, guzek i wyciek. Materiał edukacyjny przygotowujący do konsultacji.',
  robots: { index: false, follow: false },
};

export default function RutaPage() {
  return <RutaProktologia />;
}
