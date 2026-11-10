import Image from "next/image";
import Link from "next/link";
import { departments } from "@/lib/departments";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <main id="main">
      <section className="reception">
        <Image
          src="/images/sky-lobby.webp"
          alt="Wirtualna recepcja BM Clinic z marmurową ladą, srebrną rzeźbą i panoramą Warszawy"
          fill
          priority
          sizes="100vw"
        />
        <nav className="scene-hotspots" aria-label="Wejścia do działów kliniki">
          {departments.map((d, i) => (
            <Link
              key={d.id}
              href={"/" + d.id}
              className="scene-entrance"
              style={{ left: `${53.2 + i * 9.5}%` }}
              aria-label={"Wejdź: " + d.name}
            >
              <span className="sr-only">{d.name}</span>
            </Link>
          ))}
        </nav>
        <div className="scene-caption">
          SKY LOBBY · WIRTUALNA PRZESTRZEŃ BM CLINIC
        </div>
      </section>
      <section id="specjalizacje" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ZAPRASZAMY DO ŚRODKA</p>
            <h1>Wybierz przestrzeń dla siebie.</h1>
          </div>
          <p>
            Cztery specjalizacje. Jedno indywidualne podejście.
            <br />
            Przejdź do działu i znajdź temat, który Cię interesuje.
          </p>
        </div>
        <div className="department-grid">
          {departments.map((d) => (
            <Link
              href={"/" + d.id}
              key={d.id}
              className={"department-card " + d.theme}
            >
              <span className="number">{d.mark}</span>
              <h2>{d.name}</h2>
              <p>{d.description}</p>
              <span className="card-link">
                Wejdź do poczekalni <b>↗</b>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section quiet">
        <p className="eyebrow">TWOJA WIZYTA</p>
        <h2>Najpierw rozmowa. Potem plan.</h2>
        <div className="steps">
          <p>
            <b>01 · Wybierz dział</b>
            <br />
            Znajdź temat odpowiadający Twoim potrzebom.
          </p>
          <p>
            <b>02 · Poznaj możliwości</b>
            <br />
            Zapoznaj się z informacjami zatwierdzonymi przez lekarza.
          </p>
          <p>
            <b>03 · Umów konsultację</b>
            <br />
            Plan postępowania ustalamy indywidualnie podczas wizyty.
          </p>
        </div>
        <p className="fine">
          Sky Lobby jest wizualizacją koncepcyjną. Rzeczywiste dane placówki i
          informacje organizacyjne znajdują się w zakładce Kontakt.
        </p>
      </section>
    </main>
  );
}
