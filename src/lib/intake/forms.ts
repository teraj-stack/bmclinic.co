import { legacyV1Forms } from "./legacy-v1";
import { legacyForms } from "./legacy-forms";
export type IntakeField = {
  id: string;
  label: string;
  type?: "textarea" | "email" | "tel" | "choice";
  options?: readonly string[];
  required?: boolean;
  hint?: string;
  quickAnswers?: readonly string[];
  buttons?: boolean;
  when?: { id: string; values: string[] };
};
export type FormId =
  | "registration"
  | "health"
  | "authorizations"
  | "contact"
  | "records_request"
  | "withdrawal"
  | "data_request";
export type IntakeForm = {
  id: FormId;
  title: string;
  description: string;
  fields: IntakeField[];
};
export function question(
  id: string,
  label: string,
  detailId: string,
  detailLabel: string,
  hint?: string,
  notApplicable = false,
): IntakeField[] {
  return [
    {
      id,
      label,
      type: "choice",
      buttons: true,
      required: true,
      options: [
        "Nie",
        "Tak",
        ...(notApplicable ? ["Nie dotyczy"] : []),
        "Nie wiem — omówię z lekarzem",
        "Wolę omówić z lekarzem",
      ],
      hint,
    },
    {
      id: detailId,
      label: detailLabel,
      type: "textarea",
      when: { id, values: ["Tak"] },
      hint: "Opisz krótko, jeśli możesz. Szczegóły można uzupełnić podczas rozmowy.",
    },
  ];
}
export const intakeForms: IntakeForm[] = [
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
    title: "Krótki wywiad przed wizytą",
    description:
      "Odpowiedz osobno na każde pytanie. Szczegóły rozwiną się tylko tam, gdzie będą potrzebne. Jeśli nie masz pewności, wybierz rozmowę z lekarzem. Nie odstawiaj samodzielnie leków.",
    fields: [
      {
        id: "healthReason",
        label: "Z czym przychodzisz?",
        hint: "Możesz podać cel wizyty lub opisać dolegliwość i od kiedy trwa.",
        type: "textarea",
        quickAnswers: [
          "Planowany zabieg — bez dolegliwości",
          "Opiszę podczas wizyty",
        ],
      },
      ...question(
        "conditionsCheck",
        "Czy chorujesz przewlekle?",
        "healthConditions",
        "Jakie choroby rozpoznano?",
        "Podaj nazwy, o ile je znasz, np. nadciśnienie lub cukrzyca.",
      ),
      ...question(
        "operationsCheck",
        "Czy miałeś operację?",
        "healthOperations",
        "Jaka operacja i mniej więcej kiedy?",
        "Uwzględnij również dawne operacje, np. wyrostka. Nie musisz pamiętać dokładnej daty. Kolczyk nie jest tutaj traktowany jako operacja.",
      ),
      ...question(
        "hospitalCheck",
        "Czy byłeś w szpitalu z innego powodu niż podana operacja?",
        "healthHospital",
        "Z jakiego powodu i mniej więcej kiedy?",
        "Nie musisz powtarzać pobytu związanego z już opisaną operacją.",
      ),
      ...question(
        "medicinesCheck",
        "Czy przyjmujesz leki?",
        "healthMedicines",
        "Jakie leki i dawki, jeśli je znasz?",
        "Uwzględnij także leki doraźne, bez recepty i stosowane na skórę. Jeśli nie pamiętasz nazw, wybierz odpowiedź o rozmowie z lekarzem.",
      ),
      ...question(
        "supplementsCheck",
        "Czy stosujesz suplementy lub preparaty ziołowe?",
        "healthSupplements",
        "Jakie preparaty?",
      ),
      ...question(
        "allergiesCheck",
        "Czy znasz u siebie uczulenia?",
        "healthAllergies",
        "Na co jesteś uczulony i jakie były objawy?",
        "Nie musisz samodzielnie rozstrzygać, czy reakcja była alergią — możesz wybrać „Nie wiem”.",
      ),
      ...question(
        "anesthesiaCheck",
        "Czy wystąpił problem podczas wcześniejszego znieczulenia?",
        "healthAnesthesia",
        "Co się wydarzyło?",
        "Jeśli nigdy nie było znieczulenia, wybierz „Nie dotyczy”.",
        true,
      ),
      ...question(
        "bleedingCheck",
        "Czy miałeś nadmierne lub trudne do zatrzymania krwawienie?",
        "healthBleeding",
        "W jakiej sytuacji?",
        "Np. po zabiegu lub usunięciu zęba. Zwykłego drobnego skaleczenia nie musisz opisywać.",
      ),
      ...question(
        "clottingCheck",
        "Czy rozpoznano u Ciebie zaburzenia krzepnięcia?",
        "healthClotting",
        "Jakie zaburzenia?",
      ),
      ...question(
        "thrombosisCheck",
        "Czy przebyłeś zakrzepicę?",
        "healthThrombosis",
        "Kiedy i jak ją leczono?",
      ),
      ...question(
        "embolismCheck",
        "Czy przebyłeś zatorowość?",
        "healthEmbolism",
        "Kiedy i jak ją leczono?",
      ),
      ...question(
        "pregnancyCheck",
        "Czy jesteś w ciąży lub ciąża jest możliwa?",
        "healthPregnancy",
        "Co chcesz przekazać lekarzowi?",
        "Jeśli pytanie Cię nie dotyczy, wybierz „Nie dotyczy”.",
        true,
      ),
      ...question(
        "breastfeedingCheck",
        "Czy karmisz piersią?",
        "healthBreastfeeding",
        "Dodatkowa informacja dla lekarza",
        undefined,
        true,
      ),
      ...question(
        "devicesCheck",
        "Czy masz wszczepione urządzenie medyczne?",
        "healthDevices",
        "Jakie urządzenie?",
        "Np. rozrusznik lub inne urządzenie elektroniczne.",
      ),
      ...question(
        "implantsCheck",
        "Czy masz implant w okolicy planowanego zabiegu?",
        "healthImplants",
        "Jaki implant i w którym miejscu?",
      ),
      ...question(
        "piercingCheck",
        "Czy masz kolczyk lub świeże przekłucie w okolicy zabiegu?",
        "healthPiercing",
        "W którym miejscu?",
        "Nie pytamy o listę wszystkich kolczyków, tatuaży ani wizyt kosmetycznych.",
      ),
      ...question(
        "healingCheck",
        "Czy wcześniej występowały problemy z gojeniem?",
        "healthHealing",
        "Jakie problemy i po czym?",
      ),
      ...question(
        "infectionCheck",
        "Czy obecnie masz infekcję?",
        "healthInfection",
        "Jaką infekcję i czy jest leczona?",
      ),
      ...question(
        "feverCheck",
        "Czy obecnie masz gorączkę?",
        "healthFever",
        "Od kiedy i jaka jest temperatura?",
      ),
      {
        id: "healthOther",
        label: "Czy chcesz przekazać coś jeszcze lekarzowi?",
        type: "textarea",
        quickAnswers: ["Nie mam nic do dodania", "Wolę omówić z lekarzem"],
      },
      {
        id: "concerns",
        label: "Czego najbardziej się obawiasz?",
        type: "textarea",
        hint: "Opcjonalnie. Możesz zaznaczyć potrzebę rozmowy, bez opisywania prywatnych szczegółów.",
        quickAnswers: [
          "Nie mam szczególnych obaw",
          "Obawiam się bólu",
          "Obawiam się powikłań",
          "Wolę omówić z lekarzem",
        ],
      },
      {
        id: "explanationPreference",
        label: "Jak chcesz omówić zabieg?",
        type: "choice",
        buttons: true,
        options: [
          "Standardowe omówienie i czas na pytania",
          "Chcę dokładnie omówić przebieg zabiegu",
          "Ustalę to z lekarzem",
        ],
        hint: "Każdy pacjent otrzymuje istotne informacje o zabiegu i ryzyku. Ten wybór pomaga przygotować rozmowę.",
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
      { id: "dataResponse", label: "Preferowany bezpieczny sposób odpowiedzi" },
    ],
  },
];
export const FORM_VERSION = "patient-intake-2026-11-10-v3";
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
  schema: IntakeForm[] = intakeForms,
): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Błędne dane.");
  const fields = schema
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
  for (const field of fields)
    if (!fieldVisible(field, out)) delete out[field.id];
  if (final) {
    for (const f of fields.filter((f) => f.required && fieldVisible(f, out)))
      if (!out[f.id]) throw new Error("Odpowiedz na pytanie: " + f.label);
    for (const [choice, person] of [
      ["infoChoice", "infoPerson"],
      ["recordsChoice", "recordsPerson"],
    ])
      if (out[choice] === "Chcę wskazać osobę" && !out[person])
        throw new Error("Podaj osobę upoważnioną.");
  }
  if (new TextEncoder().encode(JSON.stringify(out)).length > 32000)
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

export const procedures = [
  { id: "general", label: "Konsultacja / zabieg do ustalenia" },
  { id: "botulinum", label: "Toksyna botulinowa" },
  { id: "filler", label: "Wypełniacz" },
  { id: "laser", label: "Laseroterapia" },
  { id: "minor_surgery", label: "Drobny zabieg chirurgiczny" },
] as const;
export type ProcedureId = (typeof procedures)[number]["id"];
export function parseProcedure(value: unknown): ProcedureId {
  if (value === undefined) return "general";
  if (!procedures.some((p) => p.id === value))
    throw Error("Nieznany moduł zabiegu.");
  return value as ProcedureId;
}
const procedureQuestions: Record<ProcedureId, IntakeField[]> = {
  general: [],
  botulinum: [
    ...question(
      "botulinumPreviousCheck",
      "Czy wcześniej podawano Ci toksynę botulinową?",
      "botulinumPrevious",
      "Kiedy, w jakiej okolicy i jaki preparat, jeśli wiesz?",
    ),
    ...question(
      "botulinumReactionCheck",
      "Czy po takim zabiegu wystąpiła niepożądana reakcja?",
      "botulinumReaction",
      "Jaka reakcja?",
      undefined,
      true,
    ),
    ...question(
      "musclesCheck",
      "Czy rozpoznano u Ciebie chorobę mięśni lub złącza nerwowo-mięśniowego?",
      "muscles",
      "Jaką chorobę?",
    ),
    ...question(
      "swallowingCheck",
      "Czy występują u Ciebie trudności z połykaniem?",
      "swallowing",
      "Jakie trudności?",
    ),
  ],
  filler: [
    ...question(
      "fillerPreviousCheck",
      "Czy w okolicy planowanego zabiegu podawano już wypełniacz?",
      "fillerPrevious",
      "Gdzie, kiedy i jaki preparat, jeśli wiesz?",
    ),
    ...question(
      "fillerReactionCheck",
      "Czy po wypełniaczu wystąpiło powikłanie lub niepożądana reakcja?",
      "fillerReaction",
      "Co się wydarzyło?",
      undefined,
      true,
    ),
    ...question(
      "localSkinCheck",
      "Czy w miejscu planowanego zabiegu jest obecnie zmiana skórna lub stan zapalny?",
      "localSkin",
      "Opisz zmianę własnymi słowami.",
    ),
  ],
  laser: [
    ...question(
      "tanningCheck",
      "Czy ostatnio opalałeś skórę w miejscu planowanego zabiegu?",
      "tanning",
      "Kiedy ostatnio i w jaki sposób?",
      "Uwzględnij słońce i solarium.",
    ),
    ...question(
      "herpesCheck",
      "Czy miewasz opryszczkę?",
      "herpes",
      "Gdzie i kiedy ostatnio?",
    ),
    ...question(
      "lightReactionCheck",
      "Czy wystąpiła wcześniej nietypowa reakcja skóry na światło?",
      "lightReaction",
      "Jaka reakcja?",
    ),
    ...question(
      "laserPreviousCheck",
      "Czy w tej okolicy był już zabieg laserowy?",
      "laserPrevious",
      "Jaki, kiedy i czy wystąpiły problemy?",
    ),
    ...question(
      "localSkinCheck",
      "Czy w miejscu planowanego zabiegu jest obecnie zmiana skórna lub stan zapalny?",
      "localSkin",
      "Opisz zmianę własnymi słowami.",
    ),
  ],
  minor_surgery: [
    ...question(
      "localProcedureCheck",
      "Czy wcześniej operowano lub leczono zabiegowo tę okolicę?",
      "localProcedure",
      "Jaki zabieg i kiedy?",
    ),
    ...question(
      "localSkinCheck",
      "Czy w miejscu planowanego zabiegu jest obecnie zmiana skórna lub stan zapalny?",
      "localSkin",
      "Opisz zmianę własnymi słowami.",
    ),
  ],
};
export function schemaForProcedure(procedure: ProcedureId): IntakeForm[] {
  return intakeForms.map((f) =>
    f.id === "health"
      ? {
          ...f,
          fields: [
            ...f.fields.filter(
              (q) => !["concerns", "explanationPreference"].includes(q.id),
            ),
            ...procedureQuestions[procedure],
            ...f.fields.filter((q) =>
              ["concerns", "explanationPreference"].includes(q.id),
            ),
          ],
        }
      : f,
  );
}
export type SchemaPacket = {
  forms: FormId[];
  formVersion: string;
  schema?: IntakeForm[];
  procedure?: ProcedureId;
};
export function packetForms(packet: SchemaPacket): IntakeForm[] {
  const schema =
    packet.schema ??
    (packet.formVersion === FORM_VERSION
      ? schemaForProcedure(packet.procedure ?? "general")
      : packet.formVersion === "patient-intake-2026-11-10-v1"
        ? legacyV1Forms
        : legacyForms);
  return schema.filter((f) => packet.forms.includes(f.id));
}
export function fieldVisible(
  field: IntakeField,
  answers: Record<string, string>,
): boolean {
  return (
    !field.when || field.when.values.includes(answers[field.when.id] ?? "")
  );
}
export function updateAnswer(
  answers: Record<string, string>,
  id: string,
  value: string,
  schema: IntakeForm[],
): Record<string, string> {
  const next = { ...answers, [id]: value };
  for (const field of schema.flatMap((f) => f.fields))
    if (!fieldVisible(field, next)) delete next[field.id];
  return next;
}
export function attentionItems(
  schema: IntakeForm[],
  answers: Record<string, string>,
) {
  return schema
    .flatMap((f) => f.fields)
    .filter(
      (f) =>
        fieldVisible(f, answers) &&
        answers[f.id] &&
        ((f.buttons &&
          (answers[f.id] === "Tak" || /omówi|dokładnie/.test(answers[f.id]))) ||
          (f.id === "concerns" &&
            answers[f.id] !== "Nie mam szczególnych obaw") ||
          (f.id === "explanationPreference" &&
            answers[f.id] === "Chcę dokładnie omówić przebieg zabiegu")),
    )
    .map((f) => ({
      label: f.label,
      value: answers[f.id],
      detail: schema
        .flatMap((f) => f.fields)
        .filter((d) => d.when?.id === f.id)
        .map((d) => answers[d.id])
        .filter(Boolean)
        .join("; "),
    }));
}
