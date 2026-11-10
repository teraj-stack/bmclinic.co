import WebVitals from "@/components/WebVitals";
import type { Metadata } from "next";
import Link from "next/link";
import Consent from "@/components/Consent";
import Header from "@/components/Header";
import { siteUrl } from "@/lib/departments";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "BM Clinic — chirurgia i medycyna w Warszawie",
    template: "%s | BM Clinic",
  },
  description:
    "Proktologia, flebologia, chirurgia ambulatoryjna i medycyna estetyczna. Poznaj zakres konsultacji BM Clinic.",
  robots: {
    index: process.env.SITE_INDEXABLE === "true",
    follow: process.env.SITE_INDEXABLE === "true",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <a className="skip" href="#main">
          Przejdź do treści
        </a>
        <Header />
        {children}
        <footer>
          <Link href="/">BM Clinic · Bujok Medical</Link>
          <span>Spokojna przestrzeń. Świadome decyzje.</span>
          <Link href="/prywatnosc">Prywatność</Link>
          <Link href="/admin">Panel redakcyjny</Link>
        </footer>
        <Consent />
        <WebVitals />
      </body>
    </html>
  );
}
