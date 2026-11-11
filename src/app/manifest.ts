import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BM Clinic (bmclinic.co) — Klinika Chirurgii Małoinwazyjnej i Laserowej',
    short_name: 'BM Clinic',
    description:
      '4 Działy Kliniczne: Medycyna Estetyczna, Flebologia, Proktologia, Chirurgia Ogólna. Cyfrowy Bliźniak 3D + Nawigacja HRTF VI + Skaner 3D LiDAR.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060b14',
    theme_color: '#060b14',
    lang: 'pl',
    categories: ['medical', 'health', 'navigation'],
  };
}
