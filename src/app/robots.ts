import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['Googlebot', 'Google-Extended', 'OAI-SearchBot', 'PerplexityBot'],
        allow: '/',
      },
    ],
    sitemap: 'https://bmclinic.co/sitemap.xml',
    host: 'https://bmclinic.co',
  };
}
