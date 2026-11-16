import type { RutaNode } from './ruta-proktologia';

export type RutaDepartmentSlug = 'proktologia' | 'flebologia' | 'chirurgia-ogolna' | 'medycyna-estetyczna';
export type RutaDepartment = { name: string; caution: string; nodes: RutaNode[] };

const flebologia: RutaDepartment = {
  "name": "Flebologia",
  "caution": "Nagły jednostronny obrzęk nogi, ból łydki, zaczerwienienie lub duszność wymagają pilnej oceny medycznej; przy duszności lub bólu w klatce piersiowej należy wezwać pomoc.",
  "nodes": [
    {
      "id": "obrzek",
      "parentId": null,
      "type": "symptom",
      "label": "Obrzęk nóg",
      "description": "Obrzęk wokół kostki, łydki lub całej kończyny.",
      "links": [
        "obrzek-pytania"
      ]
    },
    {
      "id": "obrzek-pytania",
      "parentId": "obrzek",
      "type": "question",
      "label": "Kiedy pojawia się obrzęk?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Rano",
        "Wieczorem",
        "Nagły, jednostronny",
        "Obie nogi przez cały dzień"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "ciezkosc",
      "parentId": null,
      "type": "symptom",
      "label": "Ciężkość nóg",
      "description": "Uczucie zmęczenia i rozpierania po długim staniu lub siedzeniu.",
      "links": [
        "ciezkosc-pytania"
      ]
    },
    {
      "id": "ciezkosc-pytania",
      "parentId": "ciezkosc",
      "type": "question",
      "label": "Co nasila uczucie ciężkości?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Długie stanie",
        "Pod koniec dnia",
        "Przy wysiłku",
        "Bez wyraźnego związku"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "zylaki",
      "parentId": null,
      "type": "symptom",
      "label": "Żylaki",
      "description": "Poszerzone, kręte żyły widoczne pod skórą.",
      "links": [
        "zylaki-pytania"
      ]
    },
    {
      "id": "zylaki-pytania",
      "parentId": "zylaki",
      "type": "question",
      "label": "Co zauważasz?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Wystające żyły",
        "Tkliwość wzdłuż żyły",
        "Zmiany skórne",
        "Problem głównie estetyczny"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "pajaczki",
      "parentId": null,
      "type": "symptom",
      "label": "Pajączki",
      "description": "Drobne, powierzchowne naczynka na skórze nóg.",
      "links": [
        "pajaczki-pytania"
      ]
    },
    {
      "id": "pajaczki-pytania",
      "parentId": "pajaczki",
      "type": "question",
      "label": "Czy występują inne objawy?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Tylko wygląd naczynek",
        "Ciężkość nóg",
        "Obrzęk",
        "Ból"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "mrowienie",
      "parentId": null,
      "type": "symptom",
      "label": "Mrowienie nóg",
      "description": "Drętwienie, kłucie lub zmienione czucie kończyn.",
      "links": [
        "mrowienie-pytania"
      ]
    },
    {
      "id": "mrowienie-pytania",
      "parentId": "mrowienie",
      "type": "question",
      "label": "Kiedy występuje mrowienie?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Podczas siedzenia",
        "Po wysiłku",
        "W nocy",
        "Niemal stale"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "wyglad",
      "parentId": null,
      "type": "symptom",
      "label": "Wygląd nóg",
      "description": "Niepokoi Cię kształt, obwód lub wygląd skóry nóg.",
      "links": [
        "wyglad-pytania"
      ]
    },
    {
      "id": "wyglad-pytania",
      "parentId": "wyglad",
      "type": "question",
      "label": "Co najbardziej przeszkadza?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Widoczne naczynka",
        "Grube łydki",
        "Asymetria",
        "Inne zmiany wyglądu"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "co-dalej",
      "parentId": null,
      "type": "information",
      "label": "Kiedy zgłosić się na konsultację?",
      "description": "RUTA służy uporządkowaniu objawów i pytań. Nie ustala rozpoznania ani nie dobiera leczenia. Lekarz ocenia wskazania podczas konsultacji.",
      "links": [
        "kontakt"
      ]
    },
    {
      "id": "kontakt",
      "parentId": "co-dalej",
      "type": "action",
      "label": "Wróć do działu kliniki",
      "description": "Zapoznaj się z informacjami o konsultacjach i możliwościach kontaktu.",
      "links": []
    }
  ]
};

const chirurgia_ogolna: RutaDepartment = {
  "name": "Chirurgia ambulatoryjna",
  "caution": "Szybko narastające zaczerwienienie, gorączka z objawami zakażenia, intensywne krwawienie lub silny ból wymagają pilnej konsultacji.",
  "nodes": [
    {
      "id": "paznokiec",
      "parentId": null,
      "type": "symptom",
      "label": "Wrastający paznokieć",
      "description": "Ból i podrażnienie wału paznokciowego.",
      "links": [
        "paznokiec-pytania"
      ]
    },
    {
      "id": "paznokiec-pytania",
      "parentId": "paznokiec",
      "type": "question",
      "label": "Jakie objawy występują?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Ból przy chodzeniu",
        "Zaczerwienienie",
        "Wydzielina",
        "Problem nawracający"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "rana",
      "parentId": null,
      "type": "symptom",
      "label": "Rana, która się nie goi",
      "description": "Rana utrzymująca się lub pogłębiająca mimo pielęgnacji.",
      "links": [
        "rana-pytania"
      ]
    },
    {
      "id": "rana-pytania",
      "parentId": "rana",
      "type": "question",
      "label": "Jak długo trwa problem?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Kilka dni",
        "Kilka tygodni",
        "Powyżej miesiąca",
        "Rana się pogarsza"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "znamie",
      "parentId": null,
      "type": "symptom",
      "label": "Zmiana skórna",
      "description": "Nowa lub zmieniająca się zmiana na skórze.",
      "links": [
        "znamie-pytania"
      ]
    },
    {
      "id": "znamie-pytania",
      "parentId": "znamie",
      "type": "question",
      "label": "Co się zmieniło?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Rozmiar",
        "Kolor lub kształt",
        "Krwawienie",
        "Zmiana przeszkadza mechanicznie"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "guzek",
      "parentId": null,
      "type": "symptom",
      "label": "Guzek pod skórą",
      "description": "Wyczuwalny guzek lub zgrubienie tkanek.",
      "links": [
        "guzek-pytania"
      ]
    },
    {
      "id": "guzek-pytania",
      "parentId": "guzek",
      "type": "question",
      "label": "Jak zachowuje się guzek?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Powiększa się",
        "Jest bolesny",
        "Jest od dawna",
        "Pojawił się nagle"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "blizna",
      "parentId": null,
      "type": "symptom",
      "label": "Blizna",
      "description": "Dolegliwości lub ograniczenia związane z blizną.",
      "links": [
        "blizna-pytania"
      ]
    },
    {
      "id": "blizna-pytania",
      "parentId": "blizna",
      "type": "question",
      "label": "Co najbardziej przeszkadza?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Ściąganie",
        "Świąd",
        "Wygląd",
        "Ból"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "bol-miejscowy",
      "parentId": null,
      "type": "symptom",
      "label": "Miejscowy ból",
      "description": "Ból wybranego obszaru skóry lub tkanek miękkich.",
      "links": [
        "bol-miejscowy-pytania"
      ]
    },
    {
      "id": "bol-miejscowy-pytania",
      "parentId": "bol-miejscowy",
      "type": "question",
      "label": "Co towarzyszy bólowi?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Obrzęk",
        "Zaczerwienienie",
        "Gorączka",
        "Brak innych objawów"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "co-dalej",
      "parentId": null,
      "type": "information",
      "label": "Kiedy zgłosić się na konsultację?",
      "description": "RUTA służy uporządkowaniu objawów i pytań. Nie ustala rozpoznania ani nie dobiera leczenia. Lekarz ocenia wskazania podczas konsultacji.",
      "links": [
        "kontakt"
      ]
    },
    {
      "id": "kontakt",
      "parentId": "co-dalej",
      "type": "action",
      "label": "Wróć do działu kliniki",
      "description": "Zapoznaj się z informacjami o konsultacjach i możliwościach kontaktu.",
      "links": []
    }
  ]
};

const medycyna_estetyczna: RutaDepartment = {
  "name": "Medycyna estetyczna",
  "caution": "Gwałtowny obrzęk, narastający ból, zaburzenia widzenia, objawy infekcji lub gwałtowne zmiany zabarwienia skóry po zabiegu wymagają pilnej oceny lekarskiej.",
  "nodes": [
    {
      "id": "przebarwienia",
      "parentId": null,
      "type": "symptom",
      "label": "Przebarwienia",
      "description": "Niejednolity koloryt, plamy lub ciemniejsze obszary skóry.",
      "links": [
        "przebarwienia-pytania"
      ]
    },
    {
      "id": "przebarwienia-pytania",
      "parentId": "przebarwienia",
      "type": "question",
      "label": "Od kiedy występują zmiany?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Po słońcu",
        "Po stanie zapalnym",
        "Od dawna",
        "Pojawiły się niedawno"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "naczynka",
      "parentId": null,
      "type": "symptom",
      "label": "Widoczne naczynka",
      "description": "Rumień i drobne naczynka widoczne na skórze.",
      "links": [
        "naczynka-pytania"
      ]
    },
    {
      "id": "naczynka-pytania",
      "parentId": "naczynka",
      "type": "question",
      "label": "Jak wyglądają zmiany?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Stały rumień",
        "Pojedyncze naczynka",
        "Napadowe zaczerwienienie",
        "Zmiany mieszane"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "blizny",
      "parentId": null,
      "type": "symptom",
      "label": "Blizny",
      "description": "Blizny potrądzikowe, pourazowe lub pozabiegowe.",
      "links": [
        "blizny-pytania"
      ]
    },
    {
      "id": "blizny-pytania",
      "parentId": "blizny",
      "type": "question",
      "label": "Jaki problem dominuje?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Zagłębienia",
        "Wypukłość",
        "Zmiana koloru",
        "Napięcie skóry"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "struktura",
      "parentId": null,
      "type": "symptom",
      "label": "Struktura skóry",
      "description": "Nierówna powierzchnia lub poszerzone pory.",
      "links": [
        "struktura-pytania"
      ]
    },
    {
      "id": "struktura-pytania",
      "parentId": "struktura",
      "type": "question",
      "label": "Które określenie pasuje?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Nierówna tekstura",
        "Poszerzone pory",
        "Suchość",
        "Wiotkość"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "zmarszczki",
      "parentId": null,
      "type": "symptom",
      "label": "Zmarszczki",
      "description": "Linie i bruzdy związane z mimiką lub wiekiem.",
      "links": [
        "zmarszczki-pytania"
      ]
    },
    {
      "id": "zmarszczki-pytania",
      "parentId": "zmarszczki",
      "type": "question",
      "label": "Gdzie są najbardziej widoczne?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Czoło",
        "Okolica oczu",
        "Okolica ust",
        "Wiele obszarów"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "regeneracja",
      "parentId": null,
      "type": "symptom",
      "label": "Regeneracja skóry",
      "description": "Potrzeba poprawy komfortu i kondycji skóry.",
      "links": [
        "regeneracja-pytania"
      ]
    },
    {
      "id": "regeneracja-pytania",
      "parentId": "regeneracja",
      "type": "question",
      "label": "Co jest najważniejsze?",
      "description": "Wybierz odpowiedź, która najlepiej opisuje Twoje doświadczenie.",
      "options": [
        "Nawilżenie",
        "Jakość skóry",
        "Regeneracja po zabiegu",
        "Konsultacja możliwości"
      ],
      "links": [
        "co-dalej"
      ]
    },
    {
      "id": "co-dalej",
      "parentId": null,
      "type": "information",
      "label": "Kiedy zgłosić się na konsultację?",
      "description": "RUTA służy uporządkowaniu objawów i pytań. Nie ustala rozpoznania ani nie dobiera leczenia. Lekarz ocenia wskazania podczas konsultacji.",
      "links": [
        "kontakt"
      ]
    },
    {
      "id": "kontakt",
      "parentId": "co-dalej",
      "type": "action",
      "label": "Wróć do działu kliniki",
      "description": "Zapoznaj się z informacjami o konsultacjach i możliwościach kontaktu.",
      "links": []
    }
  ]
};

export const ADDITIONAL_RUTA: Record<Exclude<RutaDepartmentSlug, 'proktologia'>, RutaDepartment> = {
  flebologia,
  'chirurgia-ogolna': chirurgia_ogolna,
  'medycyna-estetyczna': medycyna_estetyczna,
};
