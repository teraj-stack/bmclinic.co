"use client";
import { useState } from "react";
import SymptomMap from "./symptoms/SymptomMap";
import TreatmentNavigator from "./symptoms/TreatmentNavigator";
import TrackedLink from "./TrackedLink";
function BasicProblemPicker({
  problems,
  department,
}: {
  problems: readonly string[];
  department: string;
}) {
  const [selected, setSelected] = useState("");
  return (
    <section className="problem-picker">
      <h2>Co Cię niepokoi?</h2>
      <p>Wybierz temat, o którym chcesz porozmawiać.</p>
      <div className="problem-grid">
        {problems.map((p) => (
          <button
            key={p}
            aria-pressed={selected === p}
            onClick={() => setSelected(p)}
          >
            {p}
            <span>↗</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="selection" role="status">
          <h3>{selected}</h3>
          <p>
            Podczas konsultacji omówimy dolegliwości, dotychczasowe leczenie i
            możliwe dalsze kroki. Sam wybór tematu nie stanowi rozpoznania ani
            kwalifikacji do zabiegu.
          </p>
          <TrackedLink
            href={"/" + department + "/rezerwacja"}
            event="booking_opened"
            className="button"
          >
            Przejdź do rezerwacji ↗
          </TrackedLink>
        </div>
      )}
    </section>
  );
}

export default function ProblemPicker(props: {
  problems: readonly string[];
  department: string;
}) {
  if (props.department === "proktologia" || props.department === "flebologia")
    return (
      <>
        <TreatmentNavigator
          key={props.department}
          specialty={props.department}
        />
        <details className="symptom-map-disclosure" id="mapa-objawow">
          <summary>
            Chcę najpierw nazwać i uporządkować objawy — otwórz mapę
          </summary>
          <SymptomMap key={props.department} specialty={props.department} />
          <a
            className="symptom-full-link"
            href={"/" + props.department + "/objawy"}
          >
            Otwórz mapę na osobnej stronie ↗
          </a>
        </details>
      </>
    );
  return <BasicProblemPicker {...props} />;
}
