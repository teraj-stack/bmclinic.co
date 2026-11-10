"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { intakeForms, type FormId } from "@/lib/intake/forms";
import type { IntakePacket } from "@/lib/intake/store";
type Row = { id: string; status: string; created: number; revoked: number };
type Detail = IntakePacket & {
  id: string;
  status: string;
  revision: number;
  revoked: boolean;
};
export default function StaffPanel() {
  const [ready, setReady] = useState(false),
    [code, setCode] = useState(""),
    [forms, setForms] = useState<FormId[]>([
      "registration",
      "health",
      "authorizations",
      "contact",
    ]),
    [rows, setRows] = useState<Row[]>([]),
    [detail, setDetail] = useState<Detail | null>(null),
    [message, setMessage] = useState(""),
    [invite, setInvite] = useState<{
      id: string;
      token: string;
      pin: string;
      expires: number;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [identity, setIdentity] = useState(false),
    [imported, setImported] = useState(false),
    [reference, setReference] = useState("");
  const activity = useRef(Date.now());
  const deadline = useRef(0);
  const generation = useRef(0);
  const [offset, setOffset] = useState(0);
  function lock() {
    generation.current++;
    setDetail(null);
    setInvite(null);
    setRows([]);
    setReady(false);
    setReference("");
    setCode("");
  }

  async function closeAccess() {
    lock();
    try {
      const r = await fetch("/api/intake-admin/auth", { method: "DELETE" });
      if (!r.ok) throw Error("logout");
      setMessage("Dostęp zamknięty. Ponowne otwarcie wymaga kodu MFA.");
    } catch {
      setMessage(
        "Ekran zablokowano. Nie potwierdzono zamknięcia sesji na serwerze — nie przekazuj urządzenia. Ponów zamknięcie po przywróceniu połączenia.",
      );
    }
  }

  useEffect(() => {
    if (!ready) return;
    activity.current = Date.now();
    const touch = () => {
      activity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "input"];
    events.forEach((e) => window.addEventListener(e, touch));
    const timer = setInterval(() => {
      if (
        Date.now() >= deadline.current ||
        Date.now() - activity.current > 5 * 60000
      ) {
        void closeAccess();
      }
    }, 15000);
    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, [ready]);
  async function api(path: string, body?: unknown) {
    const operation = generation.current;
    const r = await fetch("/api/intake-admin/" + path, {
      method: body ? "POST" : "GET",
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const p = await r.json();
    if (operation !== generation.current) throw Error("Dostęp zakończony.");
    if (!r.ok) {
      if (r.status === 401) {
        lock();
        setReady(false);
        setDetail(null);
        setRows([]);
        setInvite(null);
      }
      throw Error(p.error ?? "Błąd połączenia.");
    }
    return p;
  }
  async function load(page = offset) {
    try {
      const p = await api("packets?offset=" + page);
      deadline.current = p.sessionExpires;
      setOffset(page);
      setRows(p.packets);
      setReady(true);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Moduł niedostępny.");
    }
  }
  useEffect(() => {
    // A fresh page always requires an explicit MFA unlock.
    const clear = () => {
      lock();
    };
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", restored);
    return () => {
      window.removeEventListener("pagehide", clear);
      window.removeEventListener("pageshow", restored);
    };
  }, []);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Nie udało się wykonać.");
    } finally {
      setBusy(false);
    }
  }
  async function open(id: string) {
    await action(async () => {
      const p = await api("packets/" + id);
      setDetail(p.packet);
      setIdentity(false);
      setImported(false);
      setReference("");
      setInvite(null);
    });
  }
  const link =
    invite && typeof window !== "undefined"
      ? window.location.origin + "/pacjent#" + invite.token
      : "";
  return (
    <main id="main" className="intake-page staff-page">
      <p className="eyebrow">BM CLINIC · PERSONEL</p>
      <h1>Dokumenty przed wizytą.</h1>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {!ready ? (
        <section className="intake-card">
          <h2>Dostęp do danych pacjentów</h2>
          <p>
            Najpierw <Link href="/admin">zaloguj się do panelu kliniki</Link>.
            Następnie potwierdź dostęp kodem z aplikacji uwierzytelniającej.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                await api("auth", { code });
                setCode("");
                await load();
              });
            }}
          >
            <label>
              Kod MFA
              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
            <button disabled={busy}>Potwierdź dostęp</button>
          </form>
          <p className="fine">
            Przed uruchomieniem moduł wymaga konfiguracji klucza szyfrowania,
            MFA i zatwierdzonej informacji RODO.
          </p>
          <button type="button" onClick={() => void closeAccess()}>
            Zamknij pozostałą sesję / ponów zamknięcie
          </button>
          <Link href="/pacjent/demo">Zobacz demonstrację formularzy →</Link>
        </section>
      ) : (
        <>
          <div className="intake-actions no-print">
            <button disabled={busy} onClick={() => void load()}>
              Odśwież listę
            </button>
            <button
              onClick={() =>
                void action(async () => {
                  await closeAccess();
                })
              }
            >
              Zamknij dostęp do danych
            </button>
          </div>
          <section className="intake-card no-print">
            <h2>Przygotuj indywidualny dostęp</h2>
            <p>
              Wybierz tylko dokumenty potrzebne tej osobie. Dane pacjenta nie są
              wpisywane do adresu linku.
            </p>
            <div className="form-choices">
              {intakeForms.map((f) => (
                <label className="checkbox" key={f.id}>
                  <input
                    type="checkbox"
                    checked={forms.includes(f.id)}
                    disabled={f.id === "registration"}
                    onChange={(e) =>
                      setForms(
                        e.target.checked
                          ? [...forms, f.id]
                          : forms.filter((id) => id !== f.id),
                      )
                    }
                  />
                  {f.title}
                </label>
              ))}
            </div>
            <button
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  setDetail(null);
                  const p = await api("packets", { forms });
                  setInvite(p.invitation);
                  await load();
                })
              }
            >
              Utwórz link i osobny kod
            </button>
            {invite && (
              <div className="invitation">
                <p>
                  <strong>Link jednorazowy</strong>
                </p>
                <textarea readOnly value={link} aria-label="Link pacjenta" />
                <p>
                  <strong>Kod: {invite.pin}</strong>
                </p>
                <p>
                  Ważny do {new Date(invite.expires).toLocaleString("pl-PL")}.
                  Przekaż kod innym uzgodnionym kanałem niż link. Nie wysyłamy
                  wiadomości automatycznie.
                </p>
                <p className="fine">
                  Ten kod jest pokazywany tylko teraz. Otwieraj link wyłącznie
                  na urządzeniu pacjenta lub tablecie poczekalni; testowe
                  otwarcie zużyje zaproszenie.
                </p>
                <button
                  onClick={() => {
                    setInvite(null);
                  }}
                >
                  Ukryj link i kod
                </button>
              </div>
            )}
          </section>
          <section className="intake-card no-print">
            <h2>Przekazane i rozpoczęte formularze</h2>
            <p className="fine">
              Lista nie pokazuje danych osobowych. Odczyt odpowiedzi jest
              rejestrowany.
            </p>
            <div className="intake-actions">
              <button
                disabled={busy || offset === 0}
                onClick={() => void load(Math.max(0, offset - 100))}
              >
                ← Nowsze
              </button>
              <button
                disabled={busy || rows.length < 100}
                onClick={() => void load(offset + 100)}
              >
                Starsze →
              </button>
            </div>
            {rows.length ? (
              <div className="packet-list">
                {rows.map((row) => (
                  <div key={row.id}>
                    <button disabled={busy} onClick={() => void open(row.id)}>
                      {row.id.slice(0, 10)} ·{" "}
                      {row.status === "submitted" ? "Przekazany" : "Szkic"}
                      {row.revoked ? " · dostęp cofnięty" : ""}
                    </button>
                    <span>{new Date(row.created).toLocaleString("pl-PL")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nie utworzono jeszcze formularzy.</p>
            )}
          </section>
          {detail && (
            <section className="intake-card staff-detail">
              <h2>Materiał od pacjenta do weryfikacji</h2>
              <p>
                Identyfikator {detail.id} ·{" "}
                {detail.status === "submitted" ? "Przekazany" : "Szkic"} ·
                wersja {detail.formVersion}
              </p>
              <p className="fine">
                Nie stanowi podpisanej zgody na zabieg ani automatycznie
                zakończonego wpisu w dokumentacji medycznej.
              </p>
              {intakeForms
                .filter((f) => detail.forms.includes(f.id))
                .map((f) => (
                  <section key={f.id}>
                    <h3>{f.title}</h3>
                    <dl>
                      {f.fields.map((field) => (
                        <div key={field.id}>
                          <dt>{field.label}</dt>
                          <dd>{detail.answers[field.id] || "Nie podano"}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              <h3>Historia dokumentu</h3>
              <p>
                Informacja RODO: {detail.notice.version}
                <br />
                Przekazano:{" "}
                {detail.submittedAt
                  ? new Date(detail.submittedAt).toLocaleString("pl-PL")
                  : "Jeszcze nie przekazano"}
                <br />
                Suma kontrolna:{" "}
                <span className="hash">
                  {detail.submissionHash ?? "Brak — szkic"}
                </span>
              </p>
              {detail.review && (
                <p>
                  Zweryfikowano i wprowadzono do dokumentacji:{" "}
                  {detail.review.recordReference}
                  <br />
                  {detail.review.reviewedBy} · {detail.review.reviewedAt}
                </p>
              )}
              <details>
                <summary>Przekazana informacja o przetwarzaniu danych</summary>
                <p className="notice-text">{detail.notice.text}</p>
              </details>
              <div className="no-print">
                <div className="intake-actions">
                  {detail.status === "draft" && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          const p = await api("packets/" + detail.id, {
                            action: "reissue",
                          });
                          setDetail(null);
                          setInvite(p.invitation);
                          await load();
                        })
                      }
                    >
                      Wznów szkic — nowy link i kod
                    </button>
                  )}
                  <button onClick={() => window.print()}>
                    Drukuj lub zapisz PDF
                  </button>
                  <button
                    onClick={() => {
                      setDetail(null);
                      setIdentity(false);
                      setImported(false);
                      setReference("");
                    }}
                  >
                    Ukryj dane
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Cofnąć dostęp pacjenta? Zachowana dokumentacja pozostanie dostępna personelowi.",
                        )
                      )
                        void action(async () => {
                          await api("packets/" + detail.id, {
                            action: "revoke",
                          });
                          setDetail(null);
                          await load();
                        });
                    }}
                  >
                    Cofnij dostęp pacjenta
                  </button>
                </div>
                {detail.status === "submitted" && !detail.review && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void action(async () => {
                        await api("packets/" + detail.id, {
                          action: "review",
                          identityChecked: identity,
                          importConfirmed: imported,
                          recordReference: reference,
                        });
                        await open(detail.id);
                      });
                    }}
                  >
                    <h3>Potwierdzenie personelu</h3>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={identity}
                        onChange={(e) => setIdentity(e.target.checked)}
                        required
                      />
                      Potwierdziłem tożsamość i omówiłem odpowiedzi oraz
                      oświadczenia z pacjentem.
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={imported}
                        onChange={(e) => setImported(e.target.checked)}
                        required
                      />
                      Wprowadziłem właściwe informacje do systemu dokumentacji
                      medycznej.
                    </label>
                    <label>
                      Numer wpisu lub odwołanie do dokumentacji
                      <input
                        value={reference}
                        maxLength={160}
                        onChange={(e) => setReference(e.target.value)}
                        required
                      />
                    </label>
                    <button disabled={busy}>
                      Odnotuj weryfikację i przeniesienie
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
