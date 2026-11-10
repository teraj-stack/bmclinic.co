import type { IntakeForm } from "./forms";
export const legacyForms: IntakeForm[] = [
  {
    id: "registration",
    title: "Dane pacjenta",
    description:
      "Dane do przygotowania wizyty. Tożsamość potwierdzimy w klinice.",
    fields: [
      {
        id: "patientName",
        label: "Imię i nazwisko",
        required: true,
      },
      {
        id: "identifier",
        label: "PESEL albo data urodzenia lub inny identyfikator",
        required: true,
      },
      {
        id: "address",
        label: "Adres zamieszkania",
      },
      {
        id: "email",
        label: "E-mail kontaktowy",
        type: "email",
      },
      {
        id: "phone",
        label: "Telefon kontaktowy",
        type: "tel",
      },
      {
        id: "representative",
        label: "Przedstawiciel ustawowy, jeżeli dotyczy",
        hint: "Podaj imię i nazwisko oraz podstawę reprezentacji. Dokumenty potwierdzimy podczas wizyty.",
      },
    ],
  },
  {
    id: "health",
    title: "Ankieta zdrowotna",
    description:
      "Kilka krótkich pytań przed wizytą lub drobnym zabiegiem. Możesz kliknąć gotową odpowiedź albo napisać własną. Niczego nie zaznaczamy za Ciebie. Nie musisz znać medycznych nazw — wątpliwości omówimy podczas wizyty. Nie zmieniaj samodzielnie leków.",
    fields: [
      {
        id: "healthReason",
        label: "Co Cię sprowadza i od kiedy występują dolegliwości?",
        type: "textarea",
        quickAnswers: [
          "Planowany drobny zabieg — bez dolegliwości",
          "Konsultacja — opiszę podczas wizyty",
        ],
        hint: "Jeśli masz dolegliwości, opisz je własnymi słowami i podaj, od kiedy trwają. Możesz też wpisać nazwę planowanego zabiegu.",
      },
      {
        id: "healthConditions",
        label: "Choroby przewlekłe, przebyte operacje i pobyty w szpitalu",
        type: "textarea",
        quickAnswers: [
          "Nie choruję przewlekle i nie miałem operacji ani pobytów w szpitalu",
          "Nie wiem — omówię z lekarzem",
          "Wolę omówić z lekarzem",
        ],
        hint: "Jeżeli coś dotyczy Ciebie, podaj krótko co i kiedy, np. nadciśnienie leczone tabletką lub operacja wyrostka w dzieciństwie. Nie musisz pamiętać dokładnych dat. Kolczyka nie opisuj jako operacji — miejsce na takie informacje jest niżej.",
      },
      {
        id: "healthMedicines",
        label: "Czy przyjmujesz leki lub suplementy?",
        type: "textarea",
        quickAnswers: [
          "Nie przyjmuję leków ani suplementów",
          "Nie pamiętam nazw — podam podczas wizyty",
          "Wolę omówić z lekarzem",
        ],
        hint: "Uwzględnij także leki brane doraźnie i bez recepty. Jeśli przyjmujesz leki, wpisz nazwy i dawki, o ile je znasz. Nie odstawiaj ich samodzielnie.",
      },
      {
        id: "healthAllergies",
        label:
          "Czy masz uczulenia lub miałeś reakcję na lek, znieczulenie albo opatrunek?",
        type: "textarea",
        quickAnswers: [
          "Nie znam u siebie uczuleń ani takich reakcji",
          "Nie wiem — omówię z lekarzem",
          "Wolę omówić z lekarzem",
        ],
        hint: "Jeżeli tak, napisz na co i co się wydarzyło, np. wysypka po leku lub podrażnienie po plastrze. Nie musisz samodzielnie rozstrzygać, czy była to alergia.",
      },
      {
        id: "healthClotting",
        label:
          "Czy miałeś problemy z krzepnięciem, nadmiernym krwawieniem, zakrzepicę lub zatorowość?",
        type: "textarea",
        quickAnswers: [
          "Nie miałem takich problemów",
          "Nie wiem — omówię z lekarzem",
          "Wolę omówić z lekarzem",
        ],
        hint: "Jeśli rozpoznano u Ciebie zaburzenia krzepnięcia lub występowało trudne do zatrzymania krwawienie, napisz o tym. Zwykłego drobnego skaleczenia nie musisz opisywać.",
      },
      {
        id: "healthPregnancy",
        label: "Ciąża, możliwość ciąży lub karmienie piersią — czy dotyczy?",
        quickAnswers: [
          "Nie dotyczy",
          "Jestem w ciąży lub ciąża jest możliwa",
          "Karmię piersią",
          "Wolę omówić z lekarzem",
        ],
        hint: "Jeśli nie masz pewności, możesz napisać o tym lub omówić to z lekarzem.",
      },
      {
        id: "healthImplants",
        label:
          "Implanty, urządzenia medyczne, kolczyki w okolicy zabiegu lub problemy z gojeniem",
        type: "textarea",
        quickAnswers: [
          "Nie mam nic do zgłoszenia w tym zakresie",
          "Nie wiem, czy to istotne — omówię z lekarzem",
          "Wolę omówić z lekarzem",
        ],
        hint: "Wpisz np. rozrusznik, implant, kolczyk lub świeże przekłucie w okolicy planowanego zabiegu. Podaj też wcześniejsze zabiegi w tej okolicy i problemy z gojeniem. Nie pytamy o listę wszystkich kolczyków, tatuaży ani wizyt kosmetycznych.",
      },
      {
        id: "healthOther",
        label:
          "Czy jest coś jeszcze, o czym lekarz powinien wiedzieć przed zabiegiem?",
        type: "textarea",
        quickAnswers: [
          "Nie mam nic do dodania",
          "Nie wiem — omówię z lekarzem",
          "Wolę omówić z lekarzem",
        ],
        hint: "Możesz podać np. obecną infekcję, gorączkę, zmianę skórną w miejscu zabiegu, rozpoznane zakażenie lub ważny wynik badania. Jeśli temat jest dla Ciebie prywatny, wybierz rozmowę z lekarzem.",
      },
    ],
  },
  {
    id: "authorizations",
    title: "Osoby upoważnione",
    description:
      "Informacja o zdrowiu i dostęp do dokumentacji to dwa odrębne upoważnienia. Możesz nie wskazywać nikogo. Klinikę obowiązuje weryfikacja oświadczeń i uprawnienia wynikające z ustawy.",
    fields: [
      {
        id: "infoChoice",
        label: "Informacja o stanie zdrowia",
        type: "choice",
        options: ["Nie wskazuję osoby", "Chcę wskazać osobę"],
      },
      {
        id: "infoPerson",
        label: "Osoba do informacji o zdrowiu i dane do jej weryfikacji",
        type: "textarea",
      },
      {
        id: "infoScope",
        label: "Zakres i ograniczenia upoważnienia do informacji",
        type: "textarea",
      },
      {
        id: "recordsChoice",
        label: "Dostęp do dokumentacji",
        type: "choice",
        options: ["Nie wskazuję osoby", "Chcę wskazać osobę"],
      },
      {
        id: "recordsPerson",
        label: "Osoba do dokumentacji i dane do jej weryfikacji",
        type: "textarea",
      },
      {
        id: "recordsScope",
        label: "Zakres i ograniczenia dostępu do dokumentacji",
        type: "textarea",
      },
    ],
  },
  {
    id: "contact",
    title: "Kontakt w sprawie wizyty",
    description:
      "Ustalenia organizacyjne, bez zgód marketingowych. Dokumentację przekazujemy tylko uzgodnionym bezpiecznym kanałem.",
    fields: [
      {
        id: "contactChannel",
        label: "Preferowany kontakt",
        type: "choice",
        options: ["Telefon", "SMS", "E-mail", "Osobiście"],
      },
      {
        id: "contactRestrictions",
        label: "Ograniczenia kontaktu lub szczególne potrzeby",
        type: "textarea",
        quickAnswers: [
          "Nie mam dodatkowych potrzeb",
          "Wolę ustalić to podczas wizyty",
        ],
      },
      {
        id: "documentsChannel",
        label: "Odbiór dokumentów i wyników",
        type: "choice",
        options: ["Odbiór osobisty", "Uzgodnię bezpieczny kanał z kliniką"],
      },
    ],
  },
  {
    id: "records_request",
    title: "Wniosek o dokumentację",
    description:
      "Formularz jest pomocniczy. Możesz złożyć wniosek także w inny sposób. Nie musisz podawać celu żądania. Sprawdzimy tożsamość i uprawnienie wnioskodawcy.",
    fields: [
      {
        id: "requestRole",
        label: "Składam wniosek jako",
        type: "choice",
        options: ["Pacjent", "Przedstawiciel ustawowy", "Osoba upoważniona"],
      },
      {
        id: "requestAuthority",
        label: "Podstawa uprawnienia, jeżeli dotyczy",
        type: "textarea",
      },
      {
        id: "requestScope",
        label: "Zakres dokumentacji i okres świadczeń",
        type: "textarea",
      },
      {
        id: "requestDelivery",
        label: "Wnioskowana forma i bezpieczny sposób odbioru",
        type: "textarea",
      },
    ],
  },
  {
    id: "withdrawal",
    title: "Zmiana upoważnienia lub cofnięcie zgody",
    description:
      "Dotyczy zgód dobrowolnych i upoważnień. Nie usuwa automatycznie dokumentacji wymaganej prawem. Odmowę leczenia omów bezpośrednio z lekarzem.",
    fields: [
      {
        id: "withdrawalSubject",
        label: "Której zgody lub którego upoważnienia dotyczy zmiana?",
        type: "textarea",
      },
      {
        id: "withdrawalScope",
        label:
          "Zakres zmiany lub cofnięcia i oznaczenie wcześniejszego oświadczenia",
        type: "textarea",
      },
    ],
  },
  {
    id: "data_request",
    title: "Wniosek dotyczący danych osobowych",
    description:
      "Możesz złożyć wniosek bez używania tego wzoru. Prawa dotyczące danych podlegają ograniczeniom, w tym obowiązkom prowadzenia dokumentacji medycznej.",
    fields: [
      {
        id: "dataRight",
        label: "Rodzaj żądania",
        type: "choice",
        options: [
          "Dostęp lub kopia danych",
          "Sprostowanie",
          "Ograniczenie",
          "Usunięcie w dopuszczalnym zakresie",
          "Przeniesienie, jeżeli przysługuje",
          "Sprzeciw",
          "Inne",
        ],
      },
      {
        id: "dataScope",
        label: "Opis żądania i zakres danych",
        type: "textarea",
      },
      {
        id: "dataResponse",
        label: "Preferowany bezpieczny sposób odpowiedzi",
      },
    ],
  },
];
