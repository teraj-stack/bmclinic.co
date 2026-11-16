import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import RutaProktologia from '@/components/ruta/RutaProktologia';
import { ADDITIONAL_RUTA, type RutaDepartmentSlug } from '@/data/ruta-specializacje';

type Params = { params: Promise<{ department: string }>; searchParams: Promise<{ objaw?: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { department } = await params;
  const item = ADDITIONAL_RUTA[department as keyof typeof ADDITIONAL_RUTA];
  return { title: item ? `RUTA — ${item.name}` : 'RUTA', robots: { index: false, follow: false } };
}
export default async function RutaDepartmentPage({ params, searchParams }: Params) {
  const { department } = await params;
  if (!(department in ADDITIONAL_RUTA)) notFound();
  const { objaw } = await searchParams;
  return <RutaProktologia key={department} department={department as RutaDepartmentSlug} initialSymptom={objaw} />;
}
