import Link from "next/link";
import Editor from "@/components/Editor";
export const metadata = {
  title: "Panel redakcyjny",
  robots: { index: false, follow: false },
};
export default function Admin() {
  return (
    <main id="main" className="section">
      <p className="eyebrow">BM CLINIC · REDAKCJA</p>
      <h1>Treści pod kontrolą lekarza.</h1>
      <p>
        <Link href="/admin/pacjenci">
          Dokumenty pacjentów i indywidualne linki →
        </Link>
      </p>
      <Editor />
    </main>
  );
}
