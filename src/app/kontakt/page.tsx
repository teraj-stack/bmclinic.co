import Contact from "@/components/Contact";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kontakt",
  alternates: { canonical: "/kontakt" },
};
export default function Page() {
  return <Contact />;
}
