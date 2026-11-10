"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "./Header";
import Consent from "./Consent";
import WebVitals from "./WebVitals";
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const privateArea =
    path.startsWith("/pacjent") || path.startsWith("/admin/pacjenci");
  if (privateArea)
    return (
      <>
        <header className="intake-header">
          <Link href="/">BM Clinic</Link>
          <span>Dokumenty pacjenta</span>
        </header>
        {children}
      </>
    );
  return (
    <>
      <Header />
      {children}
      <footer>
        <Link href="/">BM Clinic · Bujok Medical</Link>
        <span>Spokojna przestrzeń. Świadome decyzje.</span>
        <Link href="/pacjent">Dokumenty pacjenta</Link>
        <Link href="/prywatnosc">Prywatność</Link>
        <Link href="/admin">Panel redakcyjny</Link>
      </footer>
      <Consent />
      <WebVitals />
    </>
  );
}
