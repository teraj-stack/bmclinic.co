"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Consent() {
  const [choice, setChoice] = useState<string | null>("pending");
  useEffect(() => {
    try {
      setChoice(localStorage.getItem("bm-analytics"));
    } catch {
      setChoice(null);
    }
  }, []);
  function choose(value: string) {
    try {
      localStorage.setItem("bm-analytics", value);
    } catch {}
    setChoice(value);
    window.dispatchEvent(new Event("bm-consent"));
  }
  return (
    <>
      {choice === null && (
        <aside className="consent" aria-label="Ustawienia prywatności">
          <p>
            Opcjonalny pomiar obejmuje otwarcia rezerwacji i kontaktu oraz
            szybkość działania strony. Nie wysyłamy wyborów objawów ani treści
            formularzy. <Link href="/prywatnosc">Prywatność</Link>
          </p>
          <button onClick={() => choose("no")}>Odrzuć</button>
          <button onClick={() => choose("yes")}>Zgadzam się</button>
        </aside>
      )}
      <button className="privacy-control" onClick={() => setChoice(null)}>
        Ustawienia prywatności
      </button>
    </>
  );
}
