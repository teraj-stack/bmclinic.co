import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="section reading">
      <h1>Nie znaleźliśmy tej strony.</h1>
      <p>
        Materiał mógł zostać przeniesiony lub nie jest jeszcze opublikowany.
      </p>
      <Link className="button" href="/">
        Wróć do recepcji →
      </Link>
    </main>
  );
}
