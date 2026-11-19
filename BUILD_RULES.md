# Zasady Prowadzenia Budowy — BM Clinic (`bmclinic.co`)

## 1. Brak samowolki (Zasada Pisemnej Zgody)
Żaden agent AI (Copilot, Antigravity, Claude ani inne narzędzie) nie ma prawa wprowadzać zmian w kodzie, konfiguracji, bazie danych ani w historii Git bez wcześniejszej, wyraźnej **pisemnej zgody** właściciela projektu.

## 2. Etapy prac
1. **Budowa lokalna** — prace realizowane wyłącznie lokalnie bez `git push` i bez instalowania dodatkowych modułów.
2. **Kontrola projektu** — właściciel weryfikuje działanie lokalne, architekturę i zakres zmian.
3. **Pierwszy push na Gita** — dopiero po formalnej akceptacji po kontroli projektu.
4. **Instalacja dodatkowych modułów** — dopiero po pierwszym pushu i na podstawie osobnej zgody dla każdego modułu.

## 3. Architektura bazowa
- **`src/modules/data-analytics/`** — jeden zunifikowany moduł łączący bazę danych i element analizujący (jedno źródło prawdy).
- **`src/modules/control-center/`** — moduł sterujący operowaniem:
  - ruchem pacjentów (kolejka, etapy, obłożenie gabinetów),
  - panelem CEO (KPI, przychód, konwersja, alerty),
  - AEO / SEO (Answer Engine Optimization, AI Overviews, Schema.org, NavBoost).
- **Zarezerwowane sloty (`src/modules/control-center/slots.ts`)**:
  - `tools-inventory` — **Obrót narzędzi i zużyć** (do podpięcia po pierwszym pushu),
  - `post-op-care` — **Prowadzenie pooperacyjne** (do podpięcia po pierwszym pushu).

## 4. Ochrona istniejącego kodu
Istniejące ekrany, API i konfiguracja nie są modyfikowane ani nadpisywane bez osobnej pisemnej zgody.
