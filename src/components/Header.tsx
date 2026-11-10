"use client";
import { usePathname } from "next/navigation";
import { departmentById } from "@/lib/departments";
import Link from "next/link";
import TrackedLink from "./TrackedLink";
export default function Header() {
  const pathname = usePathname();
  const d = departmentById(pathname.split("/")[1]);
  return (
    <header className={"header " + (d?.theme ?? "")}>
      <Link className="brand" href="/" aria-label="BM Clinic — recepcja">
        <span className="monogram">B</span>
        <span>
          BUJOK MEDICAL<small>BM CLINIC · WARSZAWA</small>
        </span>
      </Link>
      <nav aria-label="Nawigacja główna">
        <Link href="/#specjalizacje">Specjalizacje</Link>
        <TrackedLink
          href={d ? "/" + d.id + "/kontakt" : "/kontakt"}
          event="contact_opened"
        >
          Kontakt
        </TrackedLink>
        <TrackedLink
          href={d ? "/" + d.id + "/rezerwacja" : "/rezerwacja"}
          event="booking_opened"
          className="button"
        >
          Umów konsultację ↗
        </TrackedLink>
      </nav>
    </header>
  );
}
