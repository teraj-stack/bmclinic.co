import { notFound } from "next/navigation";
import SymptomMap from "@/components/symptoms/SymptomMap";
import TreatmentNavigator from "@/components/symptoms/TreatmentNavigator";
export const metadata = {
  title: "Mapa objawów — przygotuj się do konsultacji",
  robots: { index: false, follow: false },
};
export default async function Symptoms({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department } = await params;
  if (department !== "proktologia" && department !== "flebologia") notFound();
  return (
    <main id="main" className="symptom-route">
      <a href={"/" + department}>← Wróć do specjalizacji</a>
      <SymptomMap key={department} specialty={department} />
      <TreatmentNavigator specialty={department} />
    </main>
  );
}
