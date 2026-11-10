"use client";
import { useEffect, useRef, useState } from "react";
import {
  intakeForms,
  documentWorkflow,
  FORM_VERSION,
  type FormId,
  parseAnswers,
} from "@/lib/intake/forms";
import IntakeFieldInput from "./IntakeFieldInput";
import type { IntakePacket } from "@/lib/intake/store";
type Packet = IntakePacket & {
  id: string;
  revision: number;
  status: string;
  sessionExpires?: number;
};
const demoPacket: Packet = {
  id: "demo",
  forms: ["registration", "health", "authorizations", "contact"],
  formVersion: FORM_VERSION,
  notice: {
    version: "demo",
    text: "Wersja demonstracyjna — używaj wyłącznie danych fikcyjnych.\n\nW rzeczywistej wersji w tym miejscu pacjent otrzyma pełną, zatwierdzoną informację o administratorze danych, celach i podstawach przetwarzania, odbiorcach, okresach przechowywania i prawach.\n\nTa demonstracja nie przesyła odpowiedzi do kliniki. Nie służy do wyrażania zgody na zabieg ani do zgłaszania pilnych problemów zdrowotnych.",
  },
  answers: {},
  revision: 0,
  status: "draft",
};
export default function PatientWizard({ demo = false }: { demo?: boolean }) {
  const [packet, setPacket] = useState<Packet | null>(demo ? demoPacket : null),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [step, setStep] = useState(0),
    [token, setToken] = useState(""),
    [pin, setPin] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  const lastActivity = useRef(Date.now());
  const heading = useRef<HTMLHeadingElement>(null);
  const closed = useRef(false);
  const generation = useRef(0);
  const initialized = useRef(false);
  const initialReset = useRef<Promise<unknown>>(Promise.resolve());
  const forms = intakeForms.filter((f) => packet?.forms.includes(f.id));
  const summaryStep = forms.length + 1;
  async function finish(
    reason = "Sesja zakończona. Możesz przekazać tablet recepcji.",
  ) {
    setBusy(true);
    generation.current += 1;
    closed.current = true;
    setAnswers({});
    setPacket(null);
    setToken("");
    setPin("");
    setStep(0);
    setConfirm(false);
    setMessage(
      demo
        ? reason
        : "Kończenie sesji… Poczekaj przed przekazaniem urządzenia.",
    );
    if (!demo)
      try {
        const response = await fetch("/api/intake/session", {
          method: "DELETE",
        });
        if (!response.ok) throw Error("logout");
        setMessage(reason);
      } catch {
        setMessage(
          "Ekran wyczyszczono, ale nie potwierdzono zamknięcia dostępu na serwerze. Nie przekazuj urządzenia kolejnej osobie; poproś recepcję o cofnięcie dostępu.",
        );
      }
    setBusy(false);
  }
  useEffect(() => {
    if (demo || initialized.current) return;
    initialized.current = true;
    const hash = window.location.hash.slice(1);
    history.replaceState(null, "", window.location.pathname);
    // Never resume a previous patient's cookie on a shared tablet.
    if (hash) setToken(hash);
    initialReset.current = fetch("/api/intake/session", {
      method: "DELETE",
    }).catch(() => {});
  }, [demo]);
  useEffect(() => {
    function activity() {
      lastActivity.current = Date.now();
    }
    function restored(e: PageTransitionEvent) {
      if (e.persisted) window.location.reload();
    }
    const events = ["pointerdown", "keydown", "input"];
    events.forEach((e) => window.addEventListener(e, activity));
    window.addEventListener("pageshow", restored);
    const timer = window.setInterval(() => {
      if (packet?.sessionExpires && Date.now() >= packet.sessionExpires) {
        void finish(
          "Minął czas sesji. Zapisany szkic pozostaje w klinice. Poproś recepcję o pomoc.",
        );
      } else if (packet && Date.now() - lastActivity.current > 5 * 60000)
        void finish(
          "Dla ochrony danych zakończono sesję po 5 minutach bezczynności.",
        );
    }, 15000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, activity));
      window.removeEventListener("pageshow", restored);
      clearInterval(timer);
    };
  }, [packet]);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  async function open(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    closed.current = false;
    const operation = ++generation.current;
    try {
      await initialReset.current;
      const reset = await fetch("/api/intake/session", { method: "DELETE" });
      if (!reset.ok)
        throw Error(
          "Nie udało się zamknąć poprzedniego dostępu. Poproś recepcję o pomoc.",
        );
      const r = await fetch("/api/intake/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin }),
      });
      const p = await r.json();
      if (!r.ok) throw Error(p.error);
      const response = await fetch("/api/intake/session", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      if (operation !== generation.current || closed.current) return;
      setPacket(data.packet);
      setAnswers(data.packet.answers);
      setPin("");
      setToken("");
      lastActivity.current = Date.now();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Nie udało się otworzyć.");
    } finally {
      setBusy(false);
    }
  }
  async function save(final: boolean) {
    if (!packet) return false;
    const operation = generation.current;
    setBusy(true);
    setMessage("");
    try {
      const validated = parseAnswers(answers, packet.forms, final);
      if (demo) {
        setPacket({
          ...packet,
          answers: validated,
          status: final ? "submitted" : "draft",
          revision: packet.revision + 1,
        });
        setMessage(
          final
            ? "Demonstracja zakończona — nic nie wysłano do kliniki."
            : "Szkic demonstracji pozostaje tylko w pamięci tej strony.",
        );
        return true;
      }
      const r = await fetch("/api/intake/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: final ? "submit" : "draft",
          answers: validated,
          revision: packet.revision,
        }),
      });
      const p = await r.json();
      if (r.status === 401) {
        await finish(p.error);
        return false;
      }
      if (!r.ok) throw Error(p.error);
      if (closed.current || operation !== generation.current) return false;
      setPacket({
        ...packet,
        answers: validated,
        revision: p.revision,
        status: p.status,
      });
      setMessage(
        final
          ? "Dokumenty przekazano do weryfikacji w klinice."
          : "Szkic zapisano.",
      );
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Nie udało się zapisać.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  function update(id: string, value: string) {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setConfirm(false);
  }
  return (
    <main id="main" className="intake-page">
      <div className="intake-top">
        <p className="eyebrow">BM CLINIC · PRZED TWOJĄ WIZYTĄ</p>
        {demo && (
          <strong className="demo-notice">
            DEMONSTRACJA · WYŁĄCZNIE DANE FIKCYJNE · BRAK WYSYŁKI
          </strong>
        )}
      </div>
      <h1>Dokumenty w Twoim tempie.</h1>
      <p className="intake-lead">
        Wypełnij przed wizytą lub na tablecie w poczekalni. W razie wątpliwości
        poproś recepcję o pomoc.
      </p>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {!packet ? (
        <section className="intake-card">
          <h2>Dostęp do Twoich formularzy</h2>
          <p>
            Recepcja przekaże indywidualny link i osobny kod. Link jest
            jednorazowy i ważny 24 godziny. Otwarta sesja trwa maksymalnie 20
            minut. Odświeżenie lub zamknięcie strony kończy dostęp do tego
            formularza; zapisany szkic sprawdzi recepcja.
          </p>
          <form onSubmit={open}>
            <label>
              Klucz z linku
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                required
              />
            </label>
            <label>
              Kod z recepcji
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={pin}
                maxLength={6}
                pattern="[0-9]{6}"
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </label>
            <button disabled={busy}>
              {busy ? "Otwieranie…" : "Otwórz formularze"}
            </button>
          </form>
          <a href="/pacjent/demo">Zobacz demonstrację bez danych pacjenta →</a>
        </section>
      ) : packet.status === "submitted" ? (
        <section className="intake-card">
          <h2>
            {demo
              ? "Tak będzie wyglądało zakończenie"
              : "Dziękujemy za przekazanie dokumentów."}
          </h2>
          <p>
            {demo
              ? "Dane demonstracji nie zostały przesłane."
              : "Personel sprawdzi informacje i potwierdzi Twoją tożsamość podczas wizyty. To nie jest zgoda na zabieg ani potwierdzenie terminu."}
          </p>
          <button onClick={() => void finish()}>Zakończ i wyczyść ekran</button>
        </section>
      ) : (
        <>
          <div
            className="intake-progress"
            role="progressbar"
            aria-label="Postęp wypełniania"
            aria-valuenow={step}
            aria-valuemin={0}
            aria-valuemax={summaryStep}
          >
            <span
              style={{ width: ((step + 1) / (summaryStep + 1)) * 100 + "%" }}
            />
          </div>
          <p className="fine">
            Krok {step + 1} z {summaryStep + 1}. Po 5 minutach bezczynności
            ekran zostanie wyczyszczony. Niezapisane odpowiedzi mogą zostać
            utracone.
          </p>
          <section className="intake-card">
            <h2 ref={heading} tabIndex={-1}>
              {step === 0
                ? "Twoja prywatność"
                : step === summaryStep
                  ? "Sprawdź przed przekazaniem"
                  : forms[step - 1]?.title}
            </h2>
            {step === 0 ? (
              <>
                <p className="fine">
                  Informacja w wersji {packet.notice.version}. Nie prosimy o
                  ogólną zgodę na prowadzenie dokumentacji medycznej.
                </p>
                <div className="notice-text">{packet.notice.text}</div>
              </>
            ) : step === summaryStep ? (
              <>
                <p>
                  Sprawdź odpowiedzi. Możesz wrócić do każdego kroku.
                  Przekazanie blokuje dalszą edycję; poprawki zgłosisz
                  personelowi.
                </p>
                {forms.map((f) => (
                  <section className="answer-group" key={f.id}>
                    <h3>{f.title}</h3>
                    <dl>
                      {f.fields.map((field) => (
                        <div key={field.id}>
                          <dt>{field.label}</dt>
                          <dd>{answers[field.id] || "Nie podano"}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={confirm}
                    onChange={(e) => setConfirm(e.target.checked)}
                  />
                  Sprawdziłem odpowiedzi i chcę przekazać je klinice do
                  weryfikacji.
                </label>
                <p className="fine">
                  Nie jest to podpis pod zgodą zabiegową. Nie składaj tutaj
                  pilnych zgłoszeń medycznych.
                </p>
              </>
            ) : (
              <>
                <p>{forms[step - 1]?.description}</p>
                <div className="intake-fields">
                  {forms[step - 1]?.fields.map((field) => (
                    <IntakeFieldInput
                      key={field.id}
                      field={field}
                      value={answers[field.id] ?? ""}
                      disabled={busy}
                      onChange={(value) => update(field.id, value)}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="intake-actions">
              {step > 0 && (
                <button disabled={busy} onClick={() => setStep(step - 1)}>
                  ← Wstecz
                </button>
              )}
              {step > 0 && (
                <button disabled={busy} onClick={() => void save(false)}>
                  Zapisz szkic
                </button>
              )}
              {step < summaryStep ? (
                <button
                  disabled={busy}
                  onClick={async () => {
                    if (step === 0 || (await save(false))) {
                      setStep(step + 1);
                      setMessage("");
                    }
                  }}
                >
                  Dalej →
                </button>
              ) : (
                <button
                  disabled={busy || !confirm}
                  onClick={() => void save(true)}
                >
                  {busy ? "Przekazywanie…" : "Przekaż do kliniki"}
                </button>
              )}
            </div>
          </section>
          <button
            className="intake-exit"
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  "Zakończyć i wyczyścić ekran? Niezapisane odpowiedzi zostaną utracone.",
                )
              )
                void finish();
            }}
          >
            Zakończ i wyczyść ekran
          </button>
        </>
      )}
      <details className="document-workflow">
        <summary>Jak obsługujemy pozostałe dokumenty?</summary>
        {documentWorkflow.map(([title, body]) => (
          <div key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </details>
    </main>
  );
}
