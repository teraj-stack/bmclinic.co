import PatientWizard from "@/components/intake/PatientWizard";
export const metadata = {
  title: "Dokumenty pacjenta",
  robots: { index: false, follow: false },
};
export default function Patient() {
  return <PatientWizard />;
}
