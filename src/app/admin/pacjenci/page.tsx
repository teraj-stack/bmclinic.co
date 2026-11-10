import StaffPanel from "@/components/intake/StaffPanel";
export const metadata = {
  title: "Dokumenty pacjentów",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <StaffPanel />;
}
