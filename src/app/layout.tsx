import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://bmclinic.co'),
  title: {
    default: 'BM Clinic (bmclinic.co) — Centrum Medycyny Laserowej, Proktologii i Technologii 3D',
    template: '%s | BM Clinic (bmclinic.co)',
  },
  description:
    'Małoinwazyjna proktologia laserowa LHP (dr n. med. Jan Bujok), modelowanie sylwetki EMS EMT RF Sculpt oraz nawigacja przestrzenna 3D. Zabiegi 1 dnia w pełnej dyskrecji.',
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
