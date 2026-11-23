Wygeneruj test porównawczy A/B/C/D czterech lokalnych modeli podstron dla zabiegu: **$ARGUMENTS** w projekcie **BM Clinic (`bmclinic.co`)**.

1. Dla wskazanego zabiegu utwórz 4 warianty lokalnych modeli podstron — po jednym dla każdego archetypu:
   - `INTERACTIVE_3D_PROCEDURE_MODEL`
   - `TRANSPARENT_PRICING_CALCULATOR`
   - `DOCTOR_QA_CASE_STUDY_BEFORE_AFTER`
   - `SPATIAL_3D_CLINIC_TOUR`
2. Użyj skryptu `npm run model:generate` dla każdego z 4 wariantów.
3. Zestaw w tabeli wyniki `compositeGoogleSeoScore`, `navboostScore`, `eeatScore`, `geoScore` oraz `agentRlReward` i wskaż zwycięski model podstrony.
