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
      id: "recurring-toilet-distress",
      title: "Znowu boli albo krwawi. Ile można?",
      need: "Wraca co jakiś czas. Mam dość kolejnej takiej sytuacji.",
      intro:
        "Jeśli ten problem wraca od miesięcy lub lat, nie musisz zaczynać od szukania nazwy zabiegu. Powiedz, co się dzieje, co już stosowano i co najbardziej utrudnia Ci życie. Podczas konsultacji ocenimy przyczynę dolegliwości i możliwości dalszego leczenia.",
      discuss: [
        "Co wraca, jak często i co działo się podczas ostatniego nasilenia.",
        "Co pomagało tylko na chwilę, co nie pomogło i czy potrzebne są dodatkowe badania.",
        "Jakie leczenie można zaproponować w Twojej sytuacji, z jakim znieczuleniem, ryzykiem i czasem gojenia.",
      ],
      prepare: [
        "Możesz powiedzieć: „Wraca to kilka razy w roku i boję się kolejnej toalety”.",
        "Powiedz o krwi na papierze, w muszli lub na ubraniu — tak, jak to zapamiętałeś.",
        "Jeśli masz wyniki lub opisy leczenia, weź je ze sobą. Nie musisz znać medycznych określeń.",
      ],
      cta: "Chcę porozmawiać o najbliższym terminie",
    },
    {
      id: "prolapse-every-toilet",
      title: "Po każdej toalecie muszę to odprowadzać",
      need: "To wychodzi na zewnątrz. Całe moje życie zaczyna się wokół tego kręcić.",
      intro:
        "Jeśli po wypróżnieniu potrzebujesz prysznica, chłodnej wody lub czasu, żeby wrócić do codziennych zajęć, opowiedz o tym wprost. To ważna informacja o wpływie dolegliwości na Twoje życie. Nie wymagamy samodzielnej oceny stopnia choroby ani wyboru metody leczenia.",
      discuss: [
        "Kiedy tkanki się wysuwają, czy wracają samoistnie i co zwykle musisz robić po wypróżnieniu.",
        "Co wykazuje badanie i jakie są możliwości leczenia, w tym operacyjnego, jeśli są wskazania.",
        "Na czym polega proponowana metoda, co może obejmować zabieg i jak wygląda opieka po nim.",
      ],
      prepare: [
        "Możesz powiedzieć: „Po każdej toalecie tracę dużo czasu, żeby móc znów normalnie funkcjonować”.",
        "Powiedz, czy pojawia się ból, krwawienie albo trudność z utrzymaniem gazów lub stolca.",
        "Opisuj dotychczasowe sytuacje. Nie próbuj niczego odprowadzać ani wywoływać objawu na potrzeby konsultacji.",
      ],
      cta: "Chcę ustalić, co można z tym zrobić",
    },
    {
      id: "daily-life-disrupted",
      title: "Nie mogę już normalnie pracować",
      need: "Chcę w końcu mieć to za sobą, ale boję się leczenia i pobytu w szpitalu.",
      intro:
        "Czasem decyzja o szukaniu pomocy przychodzi po krwawieniu poza domem, kolejnym bolesnym wypróżnieniu lub sytuacji, która uniemożliwia pracę. Możesz od razu zapytać o najbliższy termin konsultacji. Nie musisz wcześniej decydować się na zabieg — najpierw spokojnie omówimy Twoją sytuację i możliwości leczenia.",
      discuss: [
        "Co obecnie najbardziej utrudnia pracę, wyjście z domu lub zwykłe codzienne czynności.",
        "Czy w Twoim przypadku możliwe jest leczenie ambulatoryjne, jaka opieka będzie potrzebna i jak zaplanować czas po zabiegu.",
        "Czego się obawiasz: bólu, znieczulenia, powikłań, utraty kontroli czy dłuższej przerwy w pracy.",
      ],
      prepare: [
        "Możesz powiedzieć: „Nie mogę sobie pozwolić na dłuższy pobyt w szpitalu. Jakie mam możliwości?”.",
        "Powiedz o obowiązkach i ograniczeniach organizacyjnych, które trzeba uwzględnić w planie leczenia.",
        "Zapytaj o termin konsultacji i organizację dalszego leczenia. Termin i kwalifikacja do zabiegu wymagają osobnego ustalenia.",
      ],
      cta: "Zapytaj o najbliższy termin konsultacji",
    },
  ],
};
