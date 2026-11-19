# Zasady pracy GitHub Copilot i agentów AI (BM Clinic — bmclinic.co)

## ZASADA NADRZĘDNA: ZERO SAMOWOLKI

1. **Zakaz jakichkolwiek zmian bez pisemnej zgody właściciela projektu.**
   Bez wyraźnej, pisemnej akceptacji użytkownika NIE WOLNO:
   - tworzyć, edytować ani usuwać żadnych plików,
   - instalować ani aktualizować pakietów (`npm`, `pnpm`, `bun`, `pip`),
   - uruchamiać migracji bazy danych ani zmieniać jej schematu,
   - wykonywać `git commit`, `git push`, `git reset` ani zmieniać gałęzi.

2. **Obowiązkowy tryb pracy: Propozycja → Pisemna Zgoda → Wykonanie → Kontrola Lokalna.**
   - Najpierw przedstaw krótką listę planowanych plików i zmian.
   - Dopiero po otrzymaniu pisemnej zgody wprowadź dokładnie zatwierdzony zakres.
   - Po zmianach zweryfikuj projekt lokalnie (`npm run build` / `tsc --noEmit`) i oddaj do kontroli.

3. **Zasady dotyczące modułów i slotów.**
   - Moduł `src/modules/data-analytics` jest jedynym wspólnym źródłem danych i analityki.
   - Moduł `src/modules/control-center` obsługuje ruch pacjentów, panel CEO oraz AEO/SEO.
   - Sloty zarezerwowane (`tools-inventory` — obrót narzędzi i zużyć; `post-op-care` — prowadzenie pooperacyjne) pozostają wyłącznie kontraktami bez instalacji dodatkowych modułów aż do osobnej pisemnej zgody po pierwszym pushu na Gita.

4. **Język komunikacji.**
   - Komunikuj się z właścicielem projektu wyłącznie po polsku.
