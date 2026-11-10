"use client";
import { useEffect, useState } from "react";
import { departments } from "@/lib/departments";
import type { Content } from "@/lib/store";
const empty = {
  title: "",
  department: "proktologia",
  summary: "",
  body: "",
  status: "draft",
  reviewer: "",
  sources: "",
  preparation: "",
  aftercare: "",
};
export default function Editor() {
  const [logged, setLogged] = useState(false),
    [password, setPassword] = useState(""),
    [pages, setPages] = useState<Content[]>([]),
    [form, setForm] = useState<Record<string, string | number>>(empty),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [stats, setStats] = useState<Record<string, number>>({});
  const [vitals, setVitals] = useState<
    { metric: string; samples: number; p75: number | null }[]
  >([]);
  async function load() {
    try {
      const r = await fetch("/api/content", { cache: "no-store" });
      if (r.ok) {
        const p = await r.json();
        setLogged(true);
        setPages(p.pages);
        setStats(p.stats);
        setVitals(p.vitals ?? []);
      } else setLogged(false);
    } catch {
      setMessage("Nie udało się połączyć z panelem.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error);
      setPassword("");
      setMessage("");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Błąd logowania.");
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error);
      setForm(p.page);
      setMessage(
        p.page.status === "published"
          ? "Materiał opublikowany."
          : "Szkic zapisany.",
      );
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Nie udało się zapisać.");
    } finally {
      setBusy(false);
    }
  }
  function field(key: string, label: string, area = false) {
    return (
      <label>
        {label}
        {area ? (
          <textarea
            value={form[key] ?? ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            rows={key === "body" ? 10 : 3}
          />
        ) : (
          <input
            value={form[key] ?? ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required={["title", "summary"].includes(key)}
          />
        )}
      </label>
    );
  }
  return (
    <div className="editor">
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {!logged ? (
        <form onSubmit={login} className="login">
          <label>
            Hasło administratora
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button disabled={busy}>{busy ? "Logowanie…" : "Zaloguj się"}</button>
          <p className="fine">
            Panel jest dostępny po skonfigurowaniu hasła i sekretu sesji na
            serwerze.
          </p>
        </form>
      ) : (
        <>
          <div className="editor-toolbar">
            <button
              onClick={() => {
                setForm(empty);
                setMessage("");
              }}
            >
              Nowy materiał
            </button>
            <button
              onClick={async () => {
                await fetch("/api/session", { method: "DELETE" });
                setLogged(false);
                setPages([]);
                setForm(empty);
              }}
            >
              Wyloguj
            </button>
          </div>
          <p>
            Otwarcia rezerwacji: <b>{stats.booking_opened ?? 0}</b> · Otwarcia
            kontaktu: <b>{stats.contact_opened ?? 0}</b>. Wyłącznie zdarzenia za
            zgodą z ostatnich 90 dni. To nie są potwierdzone wizyty.
          </p>
          <section aria-label="Rzeczywista wydajność">
            <h2>Wydajność strony</h2>
            <p className="fine">
              Pomiary przeglądarek za zgodą, ostatnie 90 dni. Próba obejmuje
              wyłącznie osoby, które wyraziły zgodę; nie jest raportem Google.
            </p>
            <div className="steps">
              {vitals.map((v) => (
                <p key={v.metric}>
                  <b>{v.metric}</b>
                  <br />
                  {v.p75 === null
                    ? "Brak pomiarów"
                    : `p75: ${v.p75.toFixed(v.metric === "CLS" ? 3 : 0)} ${v.metric === "CLS" ? "" : "ms"}`}{" "}
                  · prób: {v.samples}
                </p>
              ))}
            </div>
          </section>
          <div className="editor-grid">
            <aside>
              <h2>Materiały ({pages.length})</h2>
              {pages.map((p) => (
                <button
                  className="document-button"
                  key={p.id}
                  onClick={() => {
                    setForm({ ...p, reviewedAt: p.reviewedAt ?? "" });
                    setMessage("");
                  }}
                >
                  {p.title}
                  <small>
                    {p.status === "published" ? "Opublikowany" : "Szkic"}
                  </small>
                </button>
              ))}
            </aside>
            <form onSubmit={save}>
              {field("title", "Tytuł")}
              <label>
                Dział
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              {field("summary", "Krótki opis", true)}
              {field("body", "Treść — akapity oddziel pustym wierszem", true)}
              {field("preparation", "Przygotowanie do wizyty", true)}
              {field("aftercare", "Opieka po zabiegu", true)}
              {field(
                "sources",
                "Źródła — adresy HTTPS, po jednym w wierszu",
                true,
              )}
              {field("reviewer", "Lekarz zatwierdzający")}
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">
                    Szkic — niewidoczny dla pacjentów
                  </option>
                  <option value="published">
                    Publikacja — treść sprawdzona przez podanego lekarza
                  </option>
                </select>
              </label>
              <p className="fine">
                Zmiana statusu na „Szkic” wycofuje materiał z publicznej strony.
                Każdy zapis zachowuje poprzednią wersję w historii bazy. Nie
                wpisuj danych pacjentów.
              </p>
              <button disabled={busy}>
                {busy ? "Zapisywanie…" : "Zapisz materiał"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
