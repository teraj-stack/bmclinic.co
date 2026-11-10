import Link from "next/link";
import { bookingUrl, departmentById } from "@/lib/departments";
export default function Booking({ department }: { department?: string }) {
  const url = bookingUrl(),
    d = department ? departmentById(department) : undefined;
  return (
    <main id="main" className={d ? "department-page " + d.theme : ""}>
      <div className="section reading">
        <p className="eyebrow">
          BM CLINIC · {d?.name.toUpperCase() ?? "KONSULTACJA"}
        </p>
        <h1>Znajdź czas dla siebie.</h1>
        {url ? (
          <>
            <p>
              Wybierz dostępny termin w systemie rezerwacji kliniki.
              Potwierdzenie wizyty otrzymasz w tym systemie.
            </p>
            <a className="button" href={url} rel="noopener noreferrer">
              Otwórz kalendarz wizyt ↗
            </a>
          </>
        ) : (
          <>
            <p>
              Rezerwacja online nie jest jeszcze uruchomiona. Ta strona nie
              przyjmuje ani nie potwierdza terminów.
            </p>
            <Link
              className="button"
              href={d ? "/" + d.id + "/kontakt" : "/kontakt"}
            >
              Sprawdź możliwości kontaktu →
            </Link>
          </>
        )}
        <p className="fine">
          Wybór metody leczenia wymaga indywidualnej kwalifikacji podczas
          konsultacji.
        </p>
      </div>
    </main>
  );
}
