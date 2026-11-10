import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://bmclinic.co'),
  title: {
    default: 'BM Clinic (bmclinic.co) — Fundament Strony i Bazy Danych Agenta AI',
    template: '%s | BM Clinic (bmclinic.co)',
  },
  description:
    'Fundament strony Next.js 15 z bazą telemetryczną Google Search (NavBoost, E-E-A-T, AI Overviews / GEO, Core Web Vitals) uczącą Agenta AI efektywności sprzedaży usług medycznych.',
  alternates: {
    canonical: 'https://bmclinic.co',
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
