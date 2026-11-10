import type { IntakeForm } from "./forms";
export const legacyV1Forms: IntakeForm[] = [
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
      "Pomaga lekarzowi w rozmowie. Nie zastępuje badania ani kwalifikacji. Jeśli nie wiesz, wpisz „nie wiem”. Nie zmieniaj samodzielnie leków.",
    fields: [
      {
        id: "healthReason",
        label: "Co Cię sprowadza i od kiedy występują dolegliwości?",
        type: "textarea",
      },
      {
        id: "healthConditions",
        label: "Choroby przewlekłe, przebyte operacje i hospitalizacje",
        type: "textarea",
      },
      {
        id: "healthMedicines",
        label: "Przyjmowane leki i suplementy wraz z dawkami",
        type: "textarea",
      },
      {
        id: "healthAllergies",
        label:
          "Uczulenia i wcześniejsze reakcje na znieczulenie, leki lub opatrunki",
        type: "textarea",
      },
      {
        id: "healthClotting",
        label: "Krwawienia, zaburzenia krzepnięcia, zakrzepica lub zatorowość",
        type: "textarea",
      },
      {
        id: "healthPregnancy",
        label: "Ciąża, możliwość ciąży lub karmienie, jeżeli dotyczy",
      },
      {
        id: "healthImplants",
        label:
          "Implanty, urządzenia medyczne, wcześniejsze zabiegi i problemy z gojeniem",
        type: "textarea",
      },
      {
        id: "healthOther",
        label: "Infekcje, wyniki badań i inne ważne informacje",
        type: "textarea",
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
