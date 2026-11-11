import type { MetadataRoute } from 'next';
import { DEPARTMENT_LIST } from '@/lib/clinic-departments-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bmclinic.co';
  const now = new Date();

  const departmentEntries: MetadataRoute.Sitemap = DEPARTMENT_LIST.map((dept) => ({
    url: `${baseUrl}/${dept.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const procedureEntries: MetadataRoute.Sitemap = DEPARTMENT_LIST.flatMap((dept) =>
    dept.procedures.map((proc) => ({
      url: `${baseUrl}/procedury/${proc.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }))
  );

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...departmentEntries,
    ...procedureEntries,
  ];
}
