import { useState } from "react";
import { createRoot } from "react-dom/client";
import SymptomMap from "../components/symptoms/SymptomMap";
import TreatmentNavigator from "../components/symptoms/TreatmentNavigator";
import type { Specialty } from "../lib/symptoms/model";
function Demo() {
  const [specialty, setSpecialty] = useState<Specialty>("proktologia"),
    [mode, setMode] = useState<"goals" | "map">("goals");
  return (
    <>
      <header className="symptom-map-demo-header">
        <strong>BM Clinic · działająca demonstracja</strong>
        <button
          onClick={() => setSpecialty("proktologia")}
          aria-pressed={specialty === "proktologia"}
        >
          Proktologia
        </button>
        <button
          onClick={() => setSpecialty("flebologia")}
          aria-pressed={specialty === "flebologia"}
        >
          Flebologia
        </button>
        <button onClick={() => setMode(mode === "goals" ? "map" : "goals")}>
          {mode === "goals"
            ? "Pokaż mapę objawów"
            : "Pokaż możliwości zabiegowe"}
        </button>
      </header>
      <p className="symptom-map-demo-note">
        Podgląd działa lokalnie, bez rezerwacji i wysyłania wyborów. Wpisuj
        wyłącznie fikcyjne notatki.
      </p>
      <main style={{ maxWidth: 1360, margin: "auto", padding: "0 16px 40px" }}>
        {mode === "goals" ? (
          <TreatmentNavigator key={specialty} specialty={specialty} demo />
        ) : (
          <SymptomMap key={specialty} specialty={specialty} />
        )}
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
