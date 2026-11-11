import { ImageResponse } from 'next/og';

export const alt = 'BM Clinic (bmclinic.co) — Klinika Chirurgii Małoinwazyjnej i Laserowej';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background: 'linear-gradient(135deg, #060b14 0%, #0d1d31 55%, #112233 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'rgba(0, 229, 255, 0.2)',
                border: '2px solid #00e5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 900,
                color: '#e2c799',
              }}
            >
              BM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', color: '#00e5ff', fontWeight: 700, letterSpacing: '2px' }}>
                BMCLINIC.CO • DIGITAL TWIN 3D & VI WAYFINDING
              </span>
              <span style={{ fontSize: '24px', color: '#e2c799', fontWeight: 700 }}>
                Klinika Chirurgii Małoinwazyjnej i Laserowej
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(184, 255, 1, 0.14)',
              border: '1px solid #b8ff01',
              color: '#b8ff01',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            WCAG AAA • HRTF 3D Audio • LiDAR WHI-3D
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.12, color: '#ffffff' }}>
            4 Działy Zabiegowe 1 Dnia + Model Przestrzenny 3D Kliniki
          </div>
          <div style={{ fontSize: '24px', color: '#cbd5e1', lineHeight: 1.4 }}>
            Medycyna Estetyczna • Flebologia EVLT 1470nm • Proktologia LHP/FiLaC • Chirurgia Ogólna RF
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            'GAB-101 • Medycyna Estetyczna (528 Hz)',
            'GAB-102 • Flebologia Doppler (594 Hz)',
            'GAB-103 • Proktologia 1 Dnia (660 Hz)',
            'GAB-104 • Chirurgia RF (792 Hz)',
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: '12px 18px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                fontSize: '15px',
                fontWeight: 700,
                color: '#e2e8f0',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
