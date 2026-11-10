import type { IntakeForm, IntakeField, FormId } from "./forms";
type Ask = (
  id: string,
  label: string,
  detailId: string,
  detailLabel: string,
  hint?: string,
  notApplicable?: boolean,
) => IntakeField[];
export function specialistIds(procedure: string): FormId[] {
  if (procedure === "lhp") return ["health", "proctology", "operative"];
  if (procedure === "proctology") return ["health", "proctology"];
  if (["venous_surgery", "minor_surgery"].includes(procedure))
    return ["health", "operative"];
  return [];
}
export function specialistForms(procedure: string, ask: Ask): IntakeForm[] {
  const forms: IntakeForm[] = [];
  if (["proctology", "lhp"].includes(procedure))
    forms.push({
      id: "proctology",
      title: "Wywiad proktologiczny",
      description:
        "Możesz zgłaszać także zaawansowane lub długo leczone dolegliwości. Nie musisz samodzielnie rozpoznawać choroby ani jej stopnia. Każde zagadnienie ma osobne pytanie; odpowiedź „Nie wiem” kieruje je do rozmowy z lekarzem.",
      information: {
        title: "Kiedy nie czekać na odczyt formularza",
        paragraphs: [
          "Formularz nie jest monitorowany w trybie pilnym. Przy obfitym lub nieustępującym krwawieniu, omdleniu lub znacznym osłabieniu szukaj natychmiastowej pomocy. Przy silnym narastającym bólu z gorączką potrzebna jest pilna ocena lekarska. W zagrożeniu życia dzwoń pod 112 lub 999.",
          "Krwawienie z odbytu nie oznacza automatycznie hemoroidów. Przyczynę, potrzebę dalszej diagnostyki i zakres leczenia ustala lekarz.",
        ],
      },
      fields: [
        {
          id: "proctoDuration",
          label: "Od kiedy występują dolegliwości?",
          type: "textarea",
          quickAnswers: [
            "Od kilku dni",
            "Od kilku tygodni",
            "Od kilku miesięcy",
            "Od ponad roku",
            "Wolę opisać lekarzowi",
          ],
        },
        ...ask(
          "proctoBleedingCheck",
          "Czy występuje krwawienie z odbytu?",
          "proctoBleeding",
          "Kiedy występuje, jak często i jak dużo krwi zauważasz?",
          "Opisz własnymi słowami; np. ślad na papierze, krew w muszli lub skrzepy.",
        ),
        ...ask(
          "proctoPainCheck",
          "Czy występuje ból okolicy odbytu?",
          "proctoPain",
          "Kiedy boli i jak bardzo utrudnia to codzienne funkcjonowanie?",
        ),
        ...ask(
          "proctoProlapseCheck",
          "Czy tkanka lub guzek wysuwa się na zewnątrz odbytu?",
          "proctoProlapse",
          "Czy wraca samoistnie, wymaga odprowadzenia ręką, czy pozostaje na zewnątrz?",
          "Nie próbuj odprowadzać zmiany na potrzeby ankiety.",
        ),
        ...ask(
          "proctoDischargeCheck",
          "Czy występuje wyciek z okolicy odbytu?",
          "proctoDischarge",
          "Jaki wyciek zauważasz?",
        ),
        ...ask(
          "proctoItchingCheck",
          "Czy występuje świąd okolicy odbytu?",
          "proctoItching",
          "Od kiedy i w jakich sytuacjach?",
        ),
        ...ask(
          "proctoConstipationCheck",
          "Czy masz zaparcia?",
          "proctoConstipation",
          "Jak często oddajesz stolec i czy musisz silnie przeć?",
        ),
        ...ask(
          "proctoDiarrheaCheck",
          "Czy masz biegunki?",
          "proctoDiarrhea",
          "Od kiedy i jak często?",
        ),
        ...ask(
          "proctoGasControlCheck",
          "Czy masz trudności z utrzymaniem gazów?",
          "proctoGasControl",
          "Jak często to się zdarza?",
        ),
        ...ask(
          "proctoStoolControlCheck",
          "Czy masz trudności z utrzymaniem stolca?",
          "proctoStoolControl",
          "Jakiego rodzaju trudności występują?",
        ),
        ...ask(
          "proctoTreatmentCheck",
          "Czy wcześniej leczono te dolegliwości?",
          "proctoTreatment",
          "Co stosowano i jaki był efekt?",
          "Wpisz także brak poprawy lub nawrót po leczeniu.",
        ),
        ...ask(
          "proctoProceduresCheck",
          "Czy wcześniej wykonywano zabieg w okolicy odbytu?",
          "proctoProcedures",
          "Jaki zabieg, kiedy i czy wystąpiły powikłania?",
          "Np. gumkowanie, skleroterapia, laser, operacja hemoroidów, przetoki lub ropnia.",
        ),
        ...ask(
          "proctoIbdCheck",
          "Czy rozpoznano u Ciebie chorobę zapalną jelit?",
          "proctoIbd",
          "Jaką chorobę i jak jest leczona?",
          "Np. choroba Crohna lub wrzodziejące zapalenie jelita grubego.",
        ),
        ...ask(
          "proctoAnemiaCheck",
          "Czy rozpoznano u Ciebie niedokrwistość (anemię)?",
          "proctoAnemia",
          "Kiedy i czy znasz wynik morfologii lub hemoglobiny?",
        ),
        ...ask(
          "proctoBowelChangeCheck",
          "Czy ostatnio zmienił się Twój zwykły rytm wypróżnień?",
          "proctoBowelChange",
          "Na czym polega zmiana i od kiedy trwa?",
        ),
        ...ask(
          "proctoWeightLossCheck",
          "Czy ostatnio chudniesz bez zamierzonej zmiany diety?",
          "proctoWeightLoss",
          "Ile i w jakim czasie?",
        ),
        ...ask(
          "proctoFamilyCancerCheck",
          "Czy u bliskich krewnych rozpoznano raka jelita grubego?",
          "proctoFamilyCancer",
          "U kogo i w jakim wieku, jeśli wiesz?",
        ),
        ...ask(
          "proctoEndoscopyCheck",
          "Czy wykonywano u Ciebie kolonoskopię lub inne badanie jelita?",
          "proctoEndoscopy",
          "Kiedy i jaki był wynik?",
          "Wyniki można przedstawić podczas wizyty; ten formularz nie przyjmuje załączników.",
        ),
        {
          id: "proctoPreviousAssessment",
          label: "Co dotychczas rozpoznawano i czego nie udało się poprawić?",
          type: "textarea",
          hint: "Możesz napisać o wcześniejszych konsultacjach i leczeniu, także jeśli problem jest złożony lub zaawansowany.",
        },
      ],
    });
  if (specialistIds(procedure).includes("operative")) {
    const lhp = procedure === "lhp",
      veins = procedure === "venous_surgery";
    forms.push({
      id: "operative",
      title: lhp
        ? "Przed operacyjnym leczeniem hemoroidów — LHP / procedura łączona"
        : veins
          ? "Przed operacyjnym leczeniem żylaków kończyny dolnej"
          : "Przed zabiegiem chirurgicznym",
      description:
        "To wywiad przed kwalifikacją, nie podpisana zgoda operacyjna. Zabieg ambulatoryjny może być rozległy i obarczony poważnym ryzykiem. Ostateczne rozpoznanie, wskazania, metodę, zakres i znieczulenie ustala lekarz.",
      information: {
        title: "Informacja wstępna o ryzyku i dalszym przygotowaniu",
        paragraphs: [
          lhp
            ? "LHP (laserowa hemoroidoplastyka), podwieszenie tkanek szwami (mucopeksja / hemoroidopeksja) i wycięcie tkanek to różne elementy leczenia. Mogą być łączone, ale nie zakładamy, że każdy pacjent wymaga wszystkich tych elementów. Dokładny zakres, także w zaawansowanej chorobie, określa chirurg."
            : veins
              ? "Operacja lub ablacja żylaków może obejmować rozległy obszar kończyny oraz kilka technik. Stronę, leczone żyły, odcinki i ewentualne dodatkowe procedury określa chirurg na podstawie kwalifikacji i diagnostyki."
              : "Zakres operacji i jej ryzyko zależą od rozpoznania, techniki, obszaru zabiegu i stanu zdrowia. Nie kwalifikujemy każdego zabiegu chirurgicznego jako „drobnego”.",
          "Możliwe jest krwawienie lub krwotok wymagający pilnego leczenia, hospitalizacji, przetoczenia krwi albo kolejnej operacji. Ciężki krwotok może zagrażać życiu i prowadzić do zgonu.",
          lhp
            ? "Do zagadnień wymagających omówienia należą także ból, zakażenie (w tym ciężkie zakażenie zagrażające życiu), zatrzymanie moczu, uszkodzenie tkanek, zwężenie kanału odbytu, zaburzenia trzymania gazów lub stolca, utrzymywanie się dolegliwości, nawrót oraz potrzeba dalszego leczenia."
            : veins
              ? "Omówienia wymagają także zakrzepica, zatorowość płucna (mogąca zagrażać życiu), uszkodzenie nerwów, oparzenie lub inne uszkodzenie skóry i tkanek, zakażenie, problemy z gojeniem, nawrót i potrzeba dalszego leczenia."
              : "Należy omówić także zakażenie, uszkodzenie tkanek i struktur sąsiednich, zaburzenia gojenia, zakrzepicę lub zatorowość oraz potrzebę dalszego leczenia, odpowiednio do konkretnej operacji.",
          "To nie jest kompletna lista powikłań ani indywidualna ocena ich prawdopodobieństwa. Przed zabiegiem lekarz omówi plan, korzyści, alternatywy, możliwość odstąpienia od leczenia, istotne ryzyka i postępowanie po zabiegu. Zgoda na operację i zgoda na znieczulenie są odrębnym etapem; kliknięcie w tej ankiecie ich nie zastępuje.",
          "Nie odstawiaj samodzielnie leków przeciwkrzepliwych ani przeciwpłytkowych. Przygotowanie, ewentualne badania, schemat leków i zasady znieczulenia ustala zespół prowadzący.",
          "Po zabiegu nie czekaj na odczyt formularza w razie obfitego lub nieustępującego krwawienia, omdlenia, duszności, bólu w klatce piersiowej albo gwałtownego pogorszenia stanu. W zagrożeniu życia dzwoń pod 112 lub 999. Pozostałe objawy alarmowe i kontakt pooperacyjny otrzymasz w indywidualnych zaleceniach.",
        ],
      },
      fields: [
        ...ask(
          "operativeAntithromboticCheck",
          "Czy przyjmujesz lek przeciwkrzepliwy lub przeciwpłytkowy?",
          "operativeAntithrombotic",
          "Jaki lek, w jakiej dawce i z jakiego powodu?",
          "Np. Acard/Polocard, klopidogrel, apiksaban, rywaroksaban, dabigatran, warfaryna, acenokumarol lub heparyna. Jeśli nie wiesz, wybierz rozmowę z lekarzem. Nie odstawiaj leków samodzielnie.",
        ),
        ...ask(
          "operativeBleedingComplicationCheck",
          "Czy po wcześniejszym zabiegu wystąpił krwotok?",
          "operativeBleedingComplication",
          "Po jakim zabiegu i jakiego leczenia wymagał?",
        ),
        ...ask(
          "operativeTransfusionCheck",
          "Czy wcześniej przetaczano Ci krew?",
          "operativeTransfusion",
          "Z jakiego powodu i czy wystąpiła reakcja?",
        ),
        ...ask(
          "operativeImmunosuppressionCheck",
          "Czy stosujesz leczenie hamujące odporność?",
          "operativeImmunosuppression",
          "Jakie leczenie?",
          "Np. leczenie immunosupresyjne, biologiczne, chemioterapia lub przewlekłe steroidy — jeśli wiesz. Lekarz wyjaśni znaczenie leczenia.",
        ),
        ...ask(
          "operativeAnesthesiaComplicationCheck",
          "Czy wcześniejsze znieczulenie spowodowało poważne powikłanie?",
          "operativeAnesthesiaComplication",
          "Jaki rodzaj znieczulenia i co się wydarzyło?",
          undefined,
          true,
        ),
        {
          id: "operativeDocuments",
          label:
            "Jakie wyniki i wcześniejsze dokumenty możesz przedstawić lekarzowi?",
          type: "textarea",
          quickAnswers: [
            "Przedstawię podczas wizyty",
            "Nie mam wyników",
            "Nie wiem, co będzie potrzebne — ustalę z lekarzem",
          ],
        },
        ...(lhp
          ? [
              {
                id: "lhpKnownDiagnosis",
                label:
                  "Jakie rozpoznanie i stopień choroby podano Ci wcześniej, jeśli wiesz?",
                type: "textarea" as const,
                hint: "Nie wymagamy samodzielnej oceny stopnia hemoroidów. Obecne rozpoznanie i kwalifikację ustala chirurg.",
              },
            ]
          : []),
        ...(veins
          ? [
              {
                id: "venousSymptomsSide",
                label: "Której nogi dotyczą dolegliwości?",
                type: "choice" as const,
                buttons: true,
                required: true,
                options: [
                  "Prawa",
                  "Lewa",
                  "Obie",
                  "Nie wiem — ustalę z lekarzem",
                ],
                hint: "Ta odpowiedź nie wyznacza strony operacji. Stronę i zakres potwierdza chirurg.",
              },
              ...ask(
                "venousPreviousTreatmentCheck",
                "Czy wcześniej leczono zabiegowo żylaki?",
                "venousPreviousTreatment",
                "Którą nogę, jaką metodą i kiedy?",
              ),
              ...ask(
                "venousUlcerCheck",
                "Czy występuje rana lub owrzodzenie na nodze?",
                "venousUlcer",
                "Gdzie, od kiedy i jak jest leczone?",
              ),
              ...ask(
                "venousMobilityCheck",
                "Czy masz ograniczoną możliwość chodzenia?",
                "venousMobility",
                "Co ogranicza chodzenie?",
              ),
              ...ask(
                "venousFamilyClotCheck",
                "Czy u bliskich krewnych występowała zakrzepica lub zatorowość?",
                "venousFamilyClot",
                "U kogo i w jakich okolicznościach?",
              ),
              ...ask(
                "venousDuplexCheck",
                "Czy wykonywano USG Doppler żył kończyn dolnych?",
                "venousDuplex",
                "Kiedy i gdzie?",
                "Przedstaw wynik i mapowanie żył, jeśli je masz. Zakres diagnostyki przed operacją ustala chirurg.",
              ),
            ]
          : []),
        {
          id: "operativeQuestions",
          label: "Co chcesz wyjaśnić przed decyzją o zabiegu?",
          type: "textarea",
          quickAnswers: [
            "Chcę dokładnie omówić ryzyko krwawienia",
            "Chcę omówić znieczulenie",
            "Chcę omówić alternatywy",
            "Przygotuję pytania podczas wizyty",
          ],
        },
      ],
    });
  }
  return forms;
}
export const operativeChecklist = [
  "Rozpoznanie, stopień zaawansowania i wskazania ustalone przez chirurga.",
  "Dokładna technika, strona i zakres: dla LHP oddzielnie laser, mucopeksja/hemoroidopeksja, wycięcie i inne planowane elementy; dla żylaków leczone żyły/odcinki i techniki uzupełniające.",
  "Indywidualna ocena krwawienia, zakrzepicy i znieczulenia; uzgodniony plan leków oraz diagnostyki.",
  "Omówione korzyści, alternatywy, zaniechanie, poważne ryzyka (w tym zagrożenie życia), możliwe dodatkowe leczenie i pytania pacjenta.",
  "Uzyskana właściwa, indywidualna zgoda operacyjna oraz zgoda dotycząca znieczulenia w odpowiednim procesie — poza tą ankietą.",
  "Ustalone zalecenia, objawy alarmowe, kontakt pooperacyjny i ścieżka pilnej pomocy.",
];
