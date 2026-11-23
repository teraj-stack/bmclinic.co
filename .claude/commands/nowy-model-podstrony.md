Wygeneruj nowy lokalny model podstrony medycznej dla kliniki **BM Clinic (`bmclinic.co`)** na podstawie opisu: **$ARGUMENTS**

Wykonaj kolejno następujące kroki:

1. Dobierz właściwy dział kliniki (`medycyna-estetyczna`, `flebologia`, `proktologia` lub `chirurgia-ogolna`), gabinet 3D (`GAB-101`..`GAB-104`) oraz najlepszy archetyp (`INTERACTIVE_3D_PROCEDURE_MODEL`, `TRANSPARENT_PRICING_CALCULATOR`, `DOCTOR_QA_CASE_STUDY_BEFORE_AFTER` lub `SPATIAL_3D_CLINIC_TOUR`).
2. Przygotuj pytanie `h2AioQuestion` oraz samodzielny blok odpowiedzi bezpośredniej `aioDirectAnswerPassage` o długości **dokładnie 130–170 słów** (pod Google AI Overviews / GEO i standard YMYL / E-E-A-T).
3. Uruchom generator modelu podstrony:
   ```bash
   npm run model:generate -- --dept "<dzial>" --slug "<slug>" --title "<tytul>" --archetype "<archetyp>" --price <cena_pln> --question "<pytanie_h2>" --passage "<blok_130_170_slow>"
   ```
4. Zweryfikuj wyliczony wynik `compositeGoogleSeoScore` (cel: `>= 90/100`) oraz `agentRlReward`, a następnie podaj bezpośredni link do lokalnego podglądu:
   - Podgląd modelu podstrony: `http://localhost:3002/procedury/<slug>`
   - Studio modeli podstron: `http://localhost:3002/modele`
   - Analityka sesji VibeKit: `http://localhost:3001`
