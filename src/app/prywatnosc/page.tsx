export const metadata = {
  title: "Prywatność",
  robots: { index: false, follow: false },
};
export default function Privacy() {
  return (
    <main id="main" className="section reading">
      <h1>Prywatność i ustawienia</h1>
      <p>
        Strona działa bez zgody na opcjonalny pomiar. Jeśli wyrazisz zgodę,
        zapisujemy typ otwarcia: rezerwacja lub kontakt oraz techniczne pomiary
        wydajności LCP, INP i CLS, losowy identyfikator zdarzenia oraz czas. Nie
        zapisujemy w tych zdarzeniach danych kontaktowych, adresu IP, wybranej
        specjalizacji, objawów ani treści medycznych. Zdarzenia są usuwane po 90
        dniach podczas przyjmowania kolejnych zdarzeń.
      </p>
      <p>
        Decyzja o zgodzie pozostaje lokalnie w Twojej przeglądarce. Możesz
        zmienić ją przyciskiem „Ustawienia prywatności”. Odrzucenie wyłącza
        kolejne zdarzenia.
      </p>
      <p>
        Panel redakcyjny używa niezbędnego pliku cookie sesji administratora,
        ważnego przez 8 godzin. Zewnętrzny system rezerwacji ma własne zasady
        przetwarzania danych.
      </p>
      <p>
        W sprawach dotyczących prywatności skorzystaj z danych kontaktowych
        kliniki.
      </p>
    </main>
  );
}
