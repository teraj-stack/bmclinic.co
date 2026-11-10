"use client";
import { useId, useState } from "react";
import { treatmentIntents } from "../../lib/symptoms/treatment-intent";
import type { Specialty } from "../../lib/symptoms/model";
export default function TreatmentNavigator({
  specialty,
  demo = false,
}: {
  specialty: Specialty;
  demo?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    id = useId();
  const options = treatmentIntents[specialty],
    active = options.find((x) => x.id === selected);
  return (
    <section
      className="treatment-navigator"
      data-specialty={specialty}
      aria-labelledby={id + "-title"}
    >
      <p className="treatment-eyebrow">
        BM CLINIC · MOŻLIWOŚCI LECZENIA ZABIEGOWEGO
      </p>
      <h2 id={id + "-title"}>
        {specialty === "flebologia"
          ? "To, co Ci przeszkadza, ma znaczenie."
          : "Szukasz konkretnego leczenia?"}
      </h2>
      <p className="treatment-lead">
        {specialty === "flebologia"
          ? "Drobne naczynka, widoczne żyły, zmiany po wcześniejszym leczeniu. Możesz chcieć coś zmienić — także wtedy, gdy nic nie boli. Porozmawiajmy o możliwościach i realnym planie."
          : "Konsultacja może być kolejnym krokiem do zaplanowania zabiegu. Zacznij od tego, czego potrzebujesz; szczegóły objawów uporządkujemy wspólnie."}
      </p>
      <div className="treatment-goals">
        {options.map((option, index) => (
          <button
            type="button"
            key={option.id}
            aria-expanded={active?.id === option.id}
            aria-controls={id + "-details"}
            onClick={() =>
              setSelected(active?.id === option.id ? null : option.id)
            }
          >
            <span className="treatment-number">0{index + 1}</span>
            <strong>{option.title}</strong>
            <span>{option.need}</span>
            <span aria-hidden="true">Poznaj kolejny krok ↗</span>
          </button>
        ))}
      </div>
      {active && (
        <div
          className="treatment-details"
          id={id + "-details"}
          role="region"
          aria-label={active.title}
        >
          <h3>{active.title}</h3>
          <p>{active.intro}</p>
          <div className="treatment-detail-columns">
            <section>
              <h4>Co omówimy?</h4>
              <ul>
                {active.discuss.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4>Jak się przygotować?</h4>
              <ul>
                {active.prepare.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          </div>
          {demo ? (
            <p className="treatment-demo-cta">
              W działającej stronie: {active.cta}. Demonstracja nie przyjmuje
              rezerwacji.
            </p>
          ) : (
            <a className="button" href={"/" + specialty + "/rezerwacja"}>
              {active.cta} →
            </a>
          )}
          <p className="treatment-fine">
            Plan, zakres, możliwe odczucia i ryzyko ustalamy indywidualnie.
            Konsultacja nie zobowiązuje do wykonania zabiegu.
          </p>
        </div>
      )}
      <div className="treatment-principles">
        <section>
          <h3>Metoda dobrana do Ciebie</h3>
          <p>
            Rozmawiamy o problemie i oczekiwaniach, następnie dobieramy
            postępowanie. Sam wybór lasera lub nazwy procedury nie zastępuje
            kwalifikacji.
          </p>
        </section>
        <section>
          <h3>Konkretny plan przed decyzją</h3>
          <p>
            Zapytaj o etapy, znieczulenie, gojenie, ograniczenia, koszt oraz
            możliwe powikłania. Masz czas na pytania.
          </p>
        </section>
      </div>
      <section className="treatment-comfort">
        <h3>Komfort jest indywidualny</h3>
        <p>
          Każdy odczuwa ból inaczej. Przed zabiegiem porozmawiamy o Twoich
          obawach, wcześniejszych doświadczeniach i możliwościach znieczulenia.
          Ustalimy też, jak zgłaszać dyskomfort podczas leczenia.
        </p>
      </section>
      <aside className="treatment-urgent">
        {specialty === "flebologia"
          ? "Nowy jednostronny obrzęk lub ból nogi wymaga pilnej oceny. Nagła duszność, ból w klatce piersiowej lub omdlenie: 112 lub 999."
          : "Obfite lub nieustępujące krwawienie, omdlenie lub znaczne osłabienie wymaga natychmiastowej pomocy. W zagrożeniu życia: 112 lub 999."}{" "}
        Nie czekaj wtedy na planowy termin.
      </aside>
    </section>
  );
}
