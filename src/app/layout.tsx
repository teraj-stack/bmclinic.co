import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/departments";
import "./globals.css";
import "@/components/symptoms/symptom-map.css";
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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
