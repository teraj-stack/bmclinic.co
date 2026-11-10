import { notFound } from "next/navigation";
import { departmentById } from "@/lib/departments";
import Contact from "@/components/Contact";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kontakt",
  alternates: { canonical: "/kontakt" },
};
export default async function Page({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department } = await params;
  if (!departmentById(department)) notFound();
  return <Contact department={department} />;
}
