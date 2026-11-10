import PatientWizard from "@/components/intake/PatientWizard";
export const metadata = {
  title: "Demonstracja formularzy",
  robots: { index: false, follow: false },
};
export default function Demo() {
  return <PatientWizard demo />;
}
