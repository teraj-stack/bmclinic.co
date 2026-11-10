import Link from "next/link";
import { notFound } from "next/navigation";
import { departmentById } from "@/lib/departments";
import { getStore } from "@/lib/store";
import ProblemPicker from "@/components/ProblemPicker";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const d = departmentById((await params).department);
  return d
    ? {
        title: d.name,
        description: d.description,
        alternates: { canonical: "/" + d.id },
      }
    : {};
}
export default async function Department({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const d = departmentById((await params).department);
  if (!d) notFound();
  const pages = getStore()
    .published()
    .filter((p) => p.department === d.id);
  return (
    <main id="main" className={"department-page " + d.theme}>
      <section className="room">
        <div className="room-window" aria-hidden="true" />
        <div className="room-copy">
          <Link href="/">← Wróć do recepcji</Link>
          <p className="eyebrow">BM CLINIC · {d.name.toUpperCase()}</p>
          <h1>{d.lead}</h1>
          <p>{d.description}</p>
          <a className="button" href="#tematy">
            Wybierz swój temat ↓
          </a>
        </div>
        <span className="room-number" aria-hidden="true">
          {d.mark}
        </span>
      </section>
      <div className="section" id="tematy">
        <ProblemPicker problems={d.problems} department={d.id} />
        <section className="articles">
          <p className="eyebrow">INFORMACJE DLA PACJENTA</p>
          <h2>Przygotuj się do rozmowy.</h2>
          {pages.length ? (
            <div className="article-grid">
              {pages.map((p) => (
                <Link
                  className="article-card"
                  href={"/procedury/" + p.slug}
                  key={p.id}
                >
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <span>Czytaj dalej ↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <p>
              Materiały tego działu są przygotowywane do weryfikacji lekarskiej.
              Informacje o wizycie uzyskasz przez kontakt z kliniką.
            </p>
          )}
          <Link href={"/" + d.id + "/kontakt"}>Informacje organizacyjne →</Link>
        </section>
      </div>
    </main>
  );
}
