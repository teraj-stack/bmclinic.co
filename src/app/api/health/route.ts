import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    domain: 'bmclinic.co',
    service: 'BM Clinic — Klinika Chirurgii Małoinwazyjnej i Laserowej',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    departments: [
      '/medycyna-estetyczna',
      '/flebologia',
      '/proktologia',
      '/chirurgia-ogolna',
    ],
    modules: [
      '3D Spatial Clinic Digital Twin & VI HRTF Wayfinding',
      '6-Parameter 3D LiDAR Clinical Diagnostic Analyzer (WHI-3D / CEI)',
      'Transparent Pricing & Walk-In/Walk-Out Recovery Calculator',
      'Google Search (NavBoost, E-E-A-T, GEO/AIO, CWV) AI Agent Scoring Engine',
    ],
    timestamp: new Date().toISOString(),
  });
}
