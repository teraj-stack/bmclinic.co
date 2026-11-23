# CLAUDE.md — BM Clinic (`bmclinic.co`) • Generator Lokalnych Modeli Podstron (VibeKit + Claude Code + Superagent)

Ten plik stanowi kontekst architektoniczny dla **Claude Code (`claude`)** oraz **VibeKit (`vibekit claude`)** podczas generowania, przebudowywania i testowania lokalnych modeli podstron dla platformy medycznej **BM Clinic (`bmclinic.co`)**.

---

## 1. Stos Technologiczny i Środowisko Lokalne

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4
- **Serwer lokalny `bmclinic.co`:** `http://localhost:3002` (`npm run dev -- -p 3002` lub `npm run start -- -p 3002`)
- **Panel VibeKit Dashboard:** `http://localhost:3001` (śledzenie sesji agentów i wygenerowanych modeli podstron)
- **Dokumentacja i API Superagent:** `http://localhost:3000` (ochrona `guard` oraz anonimizacja RODO/PHI `redact`)
- **Ścieżka binariów CLI:** `/Users/krzysztofjarzyna/.gemini/antigravity/scratch/.node/bin` (`node`, `npm`, `npx`, `claude`, `vibekit`, `superagent`)

---

## 2. Architektura Działów Klinicznych i Gabinetów 3D

Każdy lokalny model podstrony musi być przypisany do jednego z 4 działów klinicznych i odpowiedniego gabinetu w **Cyfrowym Bliźniaku 3D (`BmClinicSpatialModel3D.tsx`)**:

| Dział Kliniki (`servicePillar`) | Slug działu | Gabinet 3D | Kod Braille’a | Beacon HRTF | Lekarz prowadzący (E-E-A-T / PWZ) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Medycyna Estetyczna** | `medycyna-estetyczna` | `GAB-101` | `⠃⠍⠁⠚⠁` | `528 Hz` | dr n. med. Anna Kwiatkowska (`PWZ 7482910`) |
| **Flebologia** | `flebologia` | `GAB-102` | `⠃⠍⠁⠚⠃` | `594 Hz` | dr hab. n. med. Marek Nowicki (`PWZ 5194028`) |
| **Proktologia** | `proktologia` | `GAB-103` | `⠃⠍⠁⠚⠉` | `660 Hz` | dr n. med. Piotr Zieliński (`PWZ 6301842`) |
| **Chirurgia Ogólna** | `chirurgia-ogolna` | `GAB-104` | `⠃⠍⠁⠚⠙` | `792 Hz` | dr n. med. Tomasz Kamiński (`PWZ 4829103`) |

---

## 3. Cztery Archetypy Lokalnych Modeli Podstron (`ContentArchetype`)

Podczas tworzenia nowego modelu podstrony dobierz jeden z 4 archetypów:

1. `INTERACTIVE_3D_PROCEDURE_MODEL` — Podstrona zabiegowa z interaktywnym modelem 3D i analizatorem 6 parametrów tkankowych LiDAR (`WHI-3D` & `CEI`).
2. `TRANSPARENT_PRICING_CALCULATOR` — Podstrona skoncentrowana na kalkulatorze kosztów zabiegu, znieczulenia i czasu powrotu do aktywności (*walk-in / walk-out*).
3. `DOCTOR_QA_CASE_STUDY_BEFORE_AFTER` — Podstrona ekspercka Q&A z lekarzem prowadzącym (weryfikacja PWZ, porównanie metody laserowej vs klasycznej).
4. `SPATIAL_3D_CLINIC_TOUR` — Podstrona z wirtualnym spacerem 3D po klinice i nawigacją dźwiękową HRTF dla pacjentów niewidomych i słabowidzących (WCAG 2.1 AAA).

---

## 4. Wymogi Jakościowe Medycznego SEO / GEO (Google AI Overviews)

Każdy wygenerowany model podstrony jest oceniany przez funkcję `evaluateBmClinicPageForAgent()` w `src/lib/seo-scoring-engine.ts`. Aby uzyskać wynik **`compositeGoogleSeoScore >= 90/100`**:

1. **Blok Odpowiedzi Bezpośredniej (GEO / AI Overviews):**
   - Pole `aioDirectAnswerPassage` musi liczyć **od 130 do 170 słów** (`aioWordCount` w przedziale `130–170` daje pełne 40 pkt w module GEO).
   - Musi samodzielnie odpowiadać na pytanie w `h2AioQuestion` (czas zabiegu w minutach, rodzaj znieczulenia, technologia lasera/USG/LiDAR, tryb jednodniowy *walk-in / walk-out*).
2. **Sygnały E-E-A-T / YMYL:**
   - `pwzVerified: true`, przypisany lekarz specjalista z numerem PWZ, `clinicalStudiesCited >= 6`, `originalAssetsCount >= 8`, `effortScore >= 95`.
3. **Pełny Graf Schema.org JSON-LD (`src/lib/schema-jsonld.ts`):**
   - `schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage']`.
4. **Dostępność WCAG 2.1 AAA i Bezpieczeństwo Danych (Superagent):**
   - Obsługa przełącznika wysokiego kontrastu (`highContrastViMode`) oraz brak danych osobowych pacjentów (PII/PHI) w kodzie i telemetrii.

---

## 5. Szybkie Komendy Generowania Lokalnych Modeli Podstron

### Przez skrypt generatora (z automatycznym logowaniem do VibeKit Dashboard):
```bash
# Wygenerowanie pojedynczego nowego modelu podstrony
npm run model:generate -- \
  --dept flebologia \
  --slug miniflebektomia-mikrochirurgiczna-varady \
  --title "Miniflebektomia Mikrochirurgiczna Metodą Varady'ego" \
  --archetype INTERACTIVE_3D_PROCEDURE_MODEL \
  --price 2200

# Wygenerowanie zestawu 8 lokalnych modeli podstron dla wszystkich działów i archetypów
npm run model:seed-all
```

### Przez Claude Code / VibeKit:
```bash
# Uruchomienie Claude Code w sandboxie VibeKit z logowaniem do Dashboardu (localhost:3001)
vibekit claude

# Wewnątrz sesji Claude Code użyj gotowych komend:
# /nowy-model-podstrony <nazwa zabiegu i dział>
# /test-ab-archetypow <nazwa zabiegu>
```
