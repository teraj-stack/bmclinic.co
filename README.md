# BM Clinic (`bmclinic.co`) — Next.js 15 + 3D Digital Twin & VI Wayfinding + LiDAR 3D + AI SEO Engine

Kompletna aplikacja webowa **Next.js 15 (App Router, React 19, Tailwind CSS)** dla **BM Clinic (`bmclinic.co` — Klinika Chirurgii Małoinwazyjnej i Laserowej)**, przygotowana do zbudowania i weryfikacji na platformie **Vercel** przed publikacją na domenie głównej.

---

## 1. Zawartość i Architektura Strony (`bmclinic.co`)

1. **4 Działy Zabiegowe Kliniki (Strona główna `/` oraz dedykowane huby `/{department}`)**:
   - **Medycyna Estetyczna** (`/medycyna-estetyczna` • `GAB-101` • Braille `⠃⠍⠁⠚⠁` • Beacon HRTF `528 Hz`)
   - **Flebologia** (`/flebologia` • `GAB-102` • Braille `⠃⠍⠁⠚⠃` • Beacon HRTF `594 Hz`)
   - **Proktologia** (`/proktologia` • `GAB-103` • Braille `⠃⠍⠁⠚⠉` • Beacon HRTF `660 Hz`)
   - **Chirurgia Ogólna** (`/chirurgia-ogolna` • `GAB-104` • Braille `⠃⠍⠁⠚⠙` • Beacon HRTF `792 Hz`)
2. **8 Dedykowanych Podstron Procedur Medycznych (`/procedury/[slug]`)**:
   - Samodzielne bloki odpowiedzi bezpośredniej **Google AI Overviews (GEO) 130–170 słów**, weryfikacja **PWZ (E-E-A-T)** oraz pełny graf **Schema.org JSON-LD** (`MedicalClinic`, `Physician`, `MedicalProcedure`, `FAQPage`).
3. **Cyfrowy Bliźniak 3D Kliniki & Nawigacja dla Niewidomych (`BmClinicSpatialModel3D.tsx`)**:
   - Rzut izometryczny 3D oraz widok 1st-Person POV pacjenta,
   - Dźwięk przestrzenny 3D **Web Audio API HRTF (`PannerNode`)**, orientacja zegarowa (godziny 1–12), komunikaty głosowe TTS PL oraz tryb wysokiego kontrastu **WCAG 2.1 AAA**.
4. **6-Parametrowy Skaner Diagnostyczny 3D LiDAR (`BmClinicLidarDiagnosticAnalyzer.tsx`)**:
   - Wyliczanie indeksów **WHI-3D** i **CEI**, siatka 3D LiDAR, wykres radarowy 6-osiowy oraz eksport rekordu medycznego JSON (`PAC-2026-0419`).
5. **Transparentny Kalkulator Kosztów i Rekonwalescencji (`BmClinicPricingAndRecoveryCalculator.tsx`)** + **System Rezerwacji Online 24/7 (`BmClinicBookingModal.tsx`)**.
6. **Punkty Końcowe API & SEO (Serverless-Safe na Vercel)**:
   - `GET /api/health` — diagnostyka i Smoke Test przed publikacją,
   - `GET / POST / DELETE /api/pages` — stan bazy Agenta AI (obsługa `/tmp` na środowisku serverless Vercel),
   - `GET / POST /api/telemetry` — rejestracja zdarzeń konwersji i NavBoost,
   - `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`.

---

## 2. Jak Zbudować Stronę w Vercel Przed Publikacją (Staged Build / Preview)

### Sposób A: Przez Panel Vercel Dashboard (Z Repozytorium GitHub `teraj-stack/bmclinic.co`)
1. Wejdź na [vercel.com/new](https://vercel.com/new) i wybierz repozytorium **`teraj-stack/bmclinic.co`**.
2. Vercel automatycznie wykryje **Next.js 15** z pliku `vercel.json` i wykona zdalne budowanie (`npm install && npm run build`).
3. **Budowanie przed publikacją na domenie głównej**:
   - W ustawieniach projektu Vercel (*Settings → Git → Ignored Build Step / Production Branch* lub *Deployment Checks*) każde wypchnięcie kodu buduje wersję podglądową pod adresem `https://bmclinic-co-*.vercel.app`.
   - Dopiero po sprawdzeniu zbudowanej strony klikasz **„Promote to Production”**, aby przepiąć ruch na domenę `bmclinic.co` (natychmiastowo, bez ponownego budowania).

### Sposób B: Przez Vercel CLI (Staged Production `--skip-domain`)
Uruchom gotowy skrypt w katalogu projektu:
```bash
./scripts/vercel-build-before-publish.sh
```
lub wykonaj kroki ręcznie:
```bash
# 1. Zbuduj stronę i wyślij na Vercel BEZ przypisywania domeny bmclinic.co:
vercel build --prod
STAGED_URL=$(vercel deploy --prebuilt --prod --skip-domain)

# 2. Sprawdź zbudowaną stronę pod adresem $STAGED_URL
vercel curl /api/health --deployment "$STAGED_URL"

# 3. Opublikuj sprawdzony build na domenie głównej bmclinic.co:
vercel promote "$STAGED_URL"
```
