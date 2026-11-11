import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#060b14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bmclinic.co'),
  title: {
    default: 'BM Clinic (bmclinic.co) — Klinika Chirurgii Małoinwazyjnej i Laserowej',
    template: '%s | BM Clinic (bmclinic.co)',
  },
  description:
    'BM Clinic (bmclinic.co) — Klinika Chirurgii Małoinwazyjnej i Laserowej: Medycyna Estetyczna, Flebologia EVLT 1470nm, Proktologia LHP/FiLaC i Chirurgia 1 Dnia. Interaktywny Model 3D Kliniki z nawigacją HRTF dla niewidomych (VI), diagnostyka 3D LiDAR (WHI/CEI) oraz silnik SEO & Konwersji Agenta AI.',
  keywords: [
    'BM Clinic',
    'bmclinic.co',
    'medycyna estetyczna',
    'flebologia laserowa EVLT',
    'proktologia laserowa LHP FiLaC',
    'chirurgia jednego dnia',
    'nawigacja 3D dla niewidomych HRTF',
    'skaner 3D LiDAR diagnostyka',
  ],
  alternates: {
    canonical: 'https://bmclinic.co',
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://bmclinic.co',
    siteName: 'BM Clinic (bmclinic.co)',
    title: 'BM Clinic — Klinika Chirurgii Małoinwazyjnej i Laserowej (Model 3D & LiDAR)',
    description:
      '4 Działy Kliniczne (Medycyna Estetyczna, Flebologia, Proktologia, Chirurgia Ogólna), Cyfrowy Bliźniak 3D z nawigacją dźwiękową HRTF (WCAG AAA) i Kalkulator Kosztów Zabiegu.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BM Clinic (bmclinic.co) — Chirurgia Małoinwazyjna & Laseroterapia 3D',
    description:
      'Interaktywny Model 3D Kliniki, Skaner 3D LiDAR (6 parametrów WHI/CEI) i Transparentny Kalkulator Zabiegów.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30">
        {children}
      </body>
    </html>
  );
}
