import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/departments";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: process.env.SITE_INDEXABLE === "true" ? "/" : undefined,
      disallow:
        process.env.SITE_INDEXABLE === "true"
          ? ["/admin", "/api/", "/pacjent", "/prywatnosc"]
          : ["/"],
    },
    sitemap: siteUrl() + "/sitemap.xml",
  };
}
