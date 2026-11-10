import type { Specialty } from "./model";
export type TreatmentIntent = {
  id: string;
  title: string;
  need: string;
  intro: string;
  discuss: string[];
  prepare: string[];
  cta: string;
};
export const treatmentIntents: Record<Specialty, TreatmentIntent[]> = {
  flebologia: [
    {
      id: "visible-capillaries",
      title: "Chcę usunąć pajączki i drobne naczynka",
      need: "Przeszkadza mi ich wygląd — nawet jeśli nie bolą.",
      intro:
        "Niewielka widoczna zmiana może mieć dla Ciebie duże znaczenie. Chęć poprawy wyglądu nóg jest wystarczającym powodem, by porozmawiać o możliwościach leczenia. Nie musisz czekać, aż naczynka staną się większe lub zaczną boleć.",
      discuss: [
        "Które naczynka chcesz zmienić i jakiego efektu oczekujesz.",
        "Czy właściwa będzie skleroterapia, laser przezskórny lub inny sposób postępowania — po ocenie zmiany.",
        "Liczba etapów, możliwe odczucia, gojenie, ograniczenia i ryzyko.",
      ],
      prepare: [
        "Wskaż miejsca, które najbardziej Ci przeszkadzają.",
        "Powiedz o wcześniejszych zabiegach i ich efektach.",
        "Zgłoś również ból, obrzęk albo krwawienie, jeśli występują.",
      ],
      cta: "Umów ocenę naczynek i możliwości zabiegu",
    },
    {
      id: "varicose-treatment",
      title: "Szukam zabiegu na żylaki",
      need: "Chcę poznać metodę i konkretny plan leczenia.",
      intro:
        "Jeśli jesteś już zdecydowana lub zdecydowany szukać leczenia, konsultacja może służyć ustaleniu rozpoznania, wskazań, zakresu i planu zabiegu. Wygląd nóg i dolegliwości omawiamy razem, bez pomniejszania żadnego z tych powodów.",
      discuss: [
        "Zakres diagnostyki i badanie USG potrzebne do zaplanowania leczenia.",
        "Możliwości leczenia wewnątrzżylnego, zabiegów uzupełniających lub innych metod, zależnie od kwalifikacji.",
        "Strona i zakres operacji, znieczulenie, powrót do aktywności oraz ryzyka, w tym krwawienia i zakrzepicy.",
      ],
      prepare: [
        "Przynieś wcześniejsze USG i opis poprzedniego leczenia, jeśli je masz.",
        "Przygotuj listę leków, zwłaszcza wpływających na krzepnięcie.",
        "Powiedz, jaki problem chcesz rozwiązać i czego obawiasz się przed zabiegiem.",
      ],
      cta: "Umów kwalifikację do leczenia żylaków",
    },
    {
      id: "after-vein-treatment",
      title: "Zostały zmiany lub problem wrócił po leczeniu",
      need: "Chcę wiedzieć, co można zrobić dalej.",
      intro:
        "Możesz zgłosić pozostałe naczynka, ponownie widoczne żyły albo utrzymujące się dolegliwości. Najpierw ustalamy, co obecnie wymaga oceny — bez zakładania z góry przyczyny i bez obietnicy jednego zabiegu dla wszystkich.",
      discuss: [
        "Co było leczone, jaką metodą i kiedy.",
        "Które zmiany są obecnie widoczne i czy towarzyszą im dolegliwości.",
        "Czy potrzebna jest dalsza diagnostyka i jaki plan uzupełniający można zaproponować.",
      ],
      prepare: [
        "Przygotuj dokumentację poprzednich zabiegów.",
        "Wskaż, co pozostało, a co pojawiło się później.",
        "Powiedz, z jakiego efektu byłabyś lub byłbyś zadowolony.",
      ],
      cta: "Umów ocenę po wcześniejszym leczeniu",
    },
  ],
  proktologia: [
    {
      id: "hemorrhoid-treatment",
      title: "Szukam zabiegowego leczenia hemoroidów",
      need: "Chcę omówić metody i ustalić plan.",
      intro:
        "Nie musisz samodzielnie wybierać techniki ani oceniać stopnia choroby. Podczas kwalifikacji omawiamy rozpoznanie i zakres leczenia, w tym możliwość LHP lub procedury łączonej, jeśli są odpowiednie w Twojej sytuacji.",
      discuss: [
        "Rozpoznanie, stopień zaawansowania i inne możliwe przyczyny dolegliwości.",
        "Co miałoby obejmować leczenie: laser, podwieszenie tkanek, wycięcie lub inne elementy — zgodnie z planem chirurga.",
        "Korzyści, alternatywy, znieczulenie i ryzyka, w tym poważne krwawienie, oraz opieka pooperacyjna.",
      ],
      prepare: [
        "Przynieś wyniki badań i opisy wcześniejszych zabiegów.",
        "Powiedz o krwawieniu, wypadaniu tkanek i kontroli gazów lub stolca.",
        "Przygotuj listę leków i pytania, na które chcesz uzyskać odpowiedź.",
      ],
      cta: "Umów kwalifikację do leczenia zabiegowego",
    },
    {
      id: "persistent-proctology",
      title: "Dotychczasowe leczenie nie pomogło",
      need: "Problem jest zaawansowany, długo trwa lub nawraca.",
      intro:
        "Możesz przyjść z pełną historią dotychczasowego leczenia, także jeśli objawy są złożone i utrudniają codzienność. Celem konsultacji jest ponowna ocena sytuacji i ustalenie możliwych dalszych kroków, bez oceniania, dlaczego leczenie trwało długo.",
      discuss: [
        "Co już rozpoznawano i jakie leczenie zastosowano.",
        "Co zmieniło się po leczeniu, co pozostało i czy potrzebna jest dodatkowa diagnostyka.",
        "Możliwości dalszego leczenia, ograniczenia poszczególnych metod i indywidualny plan.",
      ],
      prepare: [
        "Zbierz opisy operacji, badań i dotychczasowych zaleceń.",
        "Wskaż problem, który najbardziej utrudnia życie.",
        "Powiedz o wcześniejszych powikłaniach i obawach.",
      ],
      cta: "Umów konsultację z oceną możliwości dalszego leczenia",
    },
    {
      id: "other-proctology",
      title: "Chcę omówić inny zabieg proktologiczny",
      need: "Mam rozpoznanie lub zalecenie leczenia operacyjnego.",
      intro:
        "Jeśli masz już rozpoznanie lub skierowanie, możesz zacząć od niego. Nie wymagamy samodzielnego dopasowania nazwy zabiegu do objawów. Ostateczną technikę i zakres dobieramy po ocenie lekarskiej.",
      discuss: [
        "Dotychczasowe rozpoznanie i wskazania do leczenia.",
        "Zakres badania i dokumenty potrzebne przed decyzją.",
        "Możliwe metody, alternatywy, ryzyka i organizację opieki.",
      ],
      prepare: [
        "Przygotuj rozpoznanie, wyniki i wcześniejsze opisy leczenia.",
        "Powiedz, czy dolegliwości obecnie się nasilają.",
        "Zapisz swoje pytania o zabieg i znieczulenie.",
      ],
      cta: "Umów konsultację zabiegową",
    },
  ],
};
