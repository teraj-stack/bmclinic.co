import type { MetadataRoute } from "next";
import { getStore } from "@/lib/store";
import { departments, siteUrl } from "@/lib/departments";
export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_INDEXABLE !== "true") return [];
  return [
    ...[
      "",
      "/kontakt",
      "/rezerwacja",
      ...departments.map((d) => "/" + d.id),
    ].map((path) => ({ url: siteUrl() + path })),
    ...getStore()
      .published()
      .map((p) => ({
        url: siteUrl() + "/procedury/" + p.slug,
        lastModified: p.updatedAt,
      })),
  ];
}
