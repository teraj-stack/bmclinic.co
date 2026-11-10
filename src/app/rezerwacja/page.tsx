import Booking from "@/components/Booking";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Rezerwacja konsultacji",
  alternates: { canonical: "/rezerwacja" },
};
export default function Page() {
  return <Booking />;
}
