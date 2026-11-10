import { notFound } from "next/navigation";
import { departmentById } from "@/lib/departments";
import Booking from "@/components/Booking";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Rezerwacja konsultacji",
  alternates: { canonical: "/rezerwacja" },
};
export default async function Page({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department } = await params;
  if (!departmentById(department)) notFound();
  return <Booking department={department} />;
}
