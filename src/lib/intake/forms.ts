export type IntakeField = {
  id: string;
  label: string;
  type?: "textarea" | "email" | "tel" | "choice";
  options?: readonly string[];
  required?: boolean;
  hint?: string;
};
export type FormId =
  | "registration"
  | "health"
  | "authorizations"
  | "contact"
  | "records_request"
  | "withdrawal"
  | "data_request";
export const intakeForms: {
  id: FormId;
  title: string;
  description: string;
  fields: IntakeField[];
}[] = [
  {
    id: "registration",
    title: "Dane pacjenta",
    description:
      "Dane do przygotowania wizyty. Tożsamość potwierdzimy w klinice.",
    fields: [
      { id: "patientName", label: "Imię i nazwisko", required: true },
      {
        id: "identifier",
        label: "PESEL albo data urodzenia lub inny identyfikator",
        required: true,
      },
      { id: "address", label: "Adres zamieszkania" },
      { id: "email", label: "E-mail kontaktowy", type: "email" },
      { id: "phone", label: "Telefon kontaktowy", type: "tel" },
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
      { id: "dataResponse", label: "Preferowany bezpieczny sposób odpowiedzi" },
    ],
  },
];
export const FORM_VERSION = "patient-intake-2026-11-10-v1";
export function parseFormIds(raw: unknown): FormId[] {
  if (
    !Array.isArray(raw) ||
    !raw.length ||
    raw.length > 7 ||
    raw.some((id) => !intakeForms.some((f) => f.id === id)) ||
    new Set(raw).size !== raw.length ||
    !raw.includes("registration")
  )
    throw new Error("Wybierz formularze z kartą danych pacjenta.");
  return raw as FormId[];
}
export function parseAnswers(
  raw: unknown,
  forms: FormId[],
  final: boolean,
): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Błędne dane.");
  const fields = intakeForms
    .filter((f) => forms.includes(f.id))
    .flatMap((f) => f.fields);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const field = fields.find((f) => f.id === k);
    if (
      !field ||
      typeof v !== "string" ||
      v.length > 2500 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)
    )
      throw new Error("Nieprawidłowe pole formularza.");
    if (field.options && v && !field.options.includes(v))
      throw new Error("Nieprawidłowy wybór.");
    out[k] = v.trim();
  }
  if (final) {
    for (const f of fields.filter((f) => f.required))
      if (!out[f.id])
        throw new Error(
          "Uzupełnij imię i nazwisko oraz identyfikator pacjenta.",
        );
    for (const [choice, person] of [
      ["infoChoice", "infoPerson"],
      ["recordsChoice", "recordsPerson"],
    ])
      if (out[choice] === "Chcę wskazać osobę" && !out[person])
        throw new Error("Podaj osobę upoważnioną.");
  }
  if (Buffer.byteLength(JSON.stringify(out)) > 32000)
    throw new Error("Za duży formularz.");
  return out;
}
export const documentWorkflow = [
  [
    "Informacja RODO",
    "Wyświetlana z zatwierdzonej wersji kliniki; bez obowiązkowej zgody na prowadzenie dokumentacji.",
  ],
  [
    "Rejestracja, wywiad, upoważnienia i ustalenia kontaktowe",
    "Wypełnia pacjent. Personel potwierdza tożsamość i weryfikuje treść.",
  ],
  [
    "Wnioski i aktualizacja oświadczeń",
    "Wypełnia pacjent; personel rozpatruje w odpowiednim trybie.",
  ],
  [
    "Zabieg i znieczulenie",
    "Informacja swoista dla procedury i rozmowa z lekarzem. Wymagany podpis w odpowiednim systemie lub w placówce; ta aplikacja nie przyjmuje takiej zgody.",
  ],
  [
    "Karta konsultacji, zabiegu, wyniki i zalecenia",
    "Sporządza personel w systemie dokumentacji medycznej.",
  ],
  [
    "Fotografie publikowane i marketing",
    "Odrębne, konkretne, dobrowolne zgody; nie są częścią standardowej ankiety.",
  ],
] as const;
