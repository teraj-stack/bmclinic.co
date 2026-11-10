import { notFound } from "next/navigation";
import Link from "next/link";
import { getStore } from "@/lib/store";
import { departmentById } from "@/lib/departments";
import TrackedLink from "@/components/TrackedLink";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getStore().findPublished((await params).slug);
  return p
    ? {
        title: p.title,
        description: p.summary,
        alternates: { canonical: "/procedury/" + p.slug },
      }
    : {};
}
export default async function Procedure({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getStore().findPublished((await params).slug);
  if (!p) notFound();
  const d = departmentById(p.department)!;
  return (
    <main id="main" className={"department-page " + d.theme}>
      <article className="reading section">
        <Link href={"/" + d.id}>← {d.name}</Link>
        <p className="eyebrow">BM CLINIC · INFORMACJE DLA PACJENTA</p>
        <h1>{p.title}</h1>
        <p className="lead">{p.summary}</p>
        <div className="prose">
          {p.body.split(/\n\s*\n/).map((v, i) => (
            <p key={i}>{v}</p>
          ))}
        </div>
        {p.preparation && (
          <section>
            <h2>Przygotowanie do wizyty</h2>
            <p className="prose">{p.preparation}</p>
          </section>
        )}
        {p.aftercare && (
          <section>
            <h2>Opieka po zabiegu</h2>
            <p className="prose">{p.aftercare}</p>
          </section>
        )}
        <div className="review">
          <p>
            Zatwierdzenie lekarskie: <strong>{p.reviewer}</strong>
          </p>
          <p>
            Aktualizacja: {new Date(p.updatedAt).toLocaleDateString("pl-PL")}
          </p>
        </div>
        {p.sources && (
          <section>
            <h2>Źródła</h2>
            <ul>
              {p.sources
                .split("\n")
                .filter(Boolean)
                .map((s) => (
                  <li key={s}>
                    <a href={s} rel="noopener noreferrer" target="_blank">
                      {s}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        )}
        <TrackedLink
          href={"/" + d.id + "/rezerwacja"}
          event="booking_opened"
          className="button"
        >
          Umów konsultację ↗
        </TrackedLink>
        <p className="fine">
          Materiał informacyjny nie zastępuje indywidualnej konsultacji.
        </p>
      </article>
    </main>
  );
}
