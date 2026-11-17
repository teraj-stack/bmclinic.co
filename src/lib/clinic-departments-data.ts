import type { DepartmentRoomNode } from '@/components/BmClinicSpatialModel3D';
import type { BmClinicPageConfig, BmClinicTelemetry } from '@/lib/seo-scoring-engine';

export interface DepartmentProcedureSpec {
  slug: string;
  title: string;
  shortDesc: string;
  durationMin: string;
  anesthesia: string;
  recoveryWalkOut: string;
  pricePln: number;
  technologyBadge: string;
  aioQuestion: string;
  aioDirectAnswerPassage: string;
}

export interface DepartmentClinicalProfile {
  slug: string;
  deptName: DepartmentRoomNode['deptName'];
  roomCode: string;
  brailleCode: string;
  beaconFreqHz: number;
  badge: string;
  heroSubtitle: string;
  leadPhysician: string;
  pwzNumber: string;
  clinicalSummaryAio: string;
  indications: string[];
  technologies: string[];
  procedures: DepartmentProcedureSpec[];
  faqs: Array<{ q: string; a: string }>;
}

export const DEPARTMENT_PROFILES: Record<string, DepartmentClinicalProfile> = {
  'medycyna-estetyczna': {
    slug: 'medycyna-estetyczna',
    deptName: 'Medycyna Estetyczna',
    roomCode: 'GAB-101',
    brailleCode: '⠃⠍⠁⠚⠁',
    beaconFreqHz: 528,
    badge: 'DZIAŁ 01 • LASEROTERAPIA HI-TECH & REGENERACJA 3D',
    heroSubtitle:
      'Zaawansowana laseroterapia frakcyjna, komputerowe skanowanie mikrotekstury skóry 3D LiDAR (Ra µm) i autologiczne terapie regeneracyjne o potwierdzonym profilu bezpieczeństwa.',
    leadPhysician: 'Dane lekarza prowadzącego do uzupełnienia',
    pwzNumber: 'Numer PWZ do potwierdzenia',
    clinicalSummaryAio:
      'Zabiegi medycyny estetycznej i laseroterapii hi-tech w BM Clinic poprzedzone są 6-parametrowym skanem diagnostycznym 3D LiDAR oceniającym głębokość zmian, perfuzję tkankową oraz chropowatość powierzchni skóry (Ra w µm). Zastosowanie wiązki frakcyjnej oraz biostymulacji osoczem bogatopłytkowym (PRP) pozwala na precyzyjną przebudowę kolagenu przy zachowaniu nienaruszonych stref regeneracyjnych, co skraca czas rekonwalescencji do minimum i umożliwia powrót do codziennych obowiązków tego samego dnia.',
    indications: [
      'Blizny potrądzikowe, pooperacyjne i pourazowe (ocena głębokości LiDAR w mm)',
      'Fotostarzenie, utrata gęstości skóry i poszerzone pory (analiza mikrotekstury Ra)',
      'Zmiany naczyniowe, rumień napadowy i przebarwienia posłoneczne',
      'Profilaktyka anti-aging i biostymulacja autologiczna (PRP / fibryna bogatopłytkowa)',
    ],
    technologies: [
      'Platforma Laserowa Frakcyjna CO2 / Er:YAG z chłodzeniem kontaktowym',
      'Skaner Diagnostyczny 3D LiDAR (pomiar WHI-3D oraz parametru Ra µm)',
      'System separacji osocza bogatopłytkowego PRP i fibryny I-PRF',
    ],
    procedures: [
      {
        slug: 'laserowy-resurfacing-frakcyjny-3d',
        title: 'Laserowy Resurfacing Frakcyjny 3D + Skan LiDAR',
        shortDesc:
          'Frakcyjna przebudowa kolagenu i redukcja blizn pod kontrolą mapy głębokości 3D LiDAR.',
        durationMin: '40 min',
        anesthesia: 'Krem znieczulający + krio-chłodzenie',
        recoveryWalkOut: '0 dni (ochrona SPF 50+, lekki rumień 24–48h)',
        pricePln: 1500,
        technologyBadge: 'LASER FRAKCYJNY + LIDAR 3D',
        aioQuestion:
          'Na czym polega laserowy resurfacing frakcyjny 3D w BM Clinic i jak przebiega regeneracja skóry?',
        aioDirectAnswerPassage:
          'Laserowy resurfacing frakcyjny 3D w BM Clinic polega na kontrolowanym wytworzeniu tysięcy mikrokolumn termicznych w skórze właściwej przy zachowaniu otaczających wysepek zdrowej tkanki. Przed zabiegiem lekarz wykonuje skan 3D LiDAR mierzący mikroteksturę powierzchni (Ra w µm) oraz głębokość blizn, co pozwala indywidualnie dobrać energię impulsu. Procedura trwa około 40 minut w znieczuleniu miejscowym kremem, a dzięki szybkiemu gojeniu frakcyjnemu pacjent opuszcza klinikę bezpośrednio po zabiegu.',
      },
      {
        slug: 'mezoterapia-osoczem-bogatoplytkowym-prp',
        title: 'Biostymulacja Osoczem Bogatopłytkowym PRP & Fibryną 3D',
        shortDesc:
          'Autologiczna terapia czynnikami wzrostu przyspieszająca odnowę naskórka i mikrokrążenie.',
        durationMin: '35 min',
        anesthesia: 'Znieczulenie miejscowe kremem',
        recoveryWalkOut: 'Powrót do pracy tego samego dnia',
        pricePln: 1200,
        technologyBadge: 'AUTOLOGICZNE PRP HD',
        aioQuestion:
          'Jakie efekty daje biostymulacja osoczem bogatopłytkowym PRP i kiedy widać przebudowę skóry?',
        aioDirectAnswerPassage:
          'Biostymulacja osoczem bogatopłytkowym PRP w BM Clinic wykorzystuje autologiczny koncentrat płytek krwi pacjenta bogaty w czynniki wzrostu (PDGF, TGF-beta, VEGF), które aktywują fibroblasty do syntezy nowego kolagenu typu I i III oraz pobudzają angiogenezę. Zabieg trwa 35 minut, jest w pełni biokompatybilny i wyklucza ryzyko alergii. Pierwsza poprawa napięcia oraz nawilżenia widoczna jest po 10–14 dniach, natomiast pełny efekt zagęszczenia struktury skóry narasta przez 4–6 tygodni.',
      },
    ],
    faqs: [
      {
        q: 'Czy zabiegi laserowe w Gabinecie 101 wymagają zwolnienia lekarskiego?',
        a: 'Nie — wszystkie procedury medycyny estetycznej w BM Clinic wykonywane są w trybie walk-in / walk-out. Pacjent wraca do aktywności tego samego dnia, stosując zalecaną fotoprotekcję SPF 50+.',
      },
      {
        q: 'W jaki sposób skaner 3D LiDAR pomaga dobrać parametry lasera?',
        a: 'Skaner mierzy 6 obiektywnych parametrów tkankowych, w tym chropowatość powierzchni Ra (w mikrometrach) oraz głębokość zmian w milimetrach, dzięki czemu lekarz precyzyjnie kalibruje gęstość i głębokość wiązki lasera.',
      },
    ],
  },
  flebologia: {
    slug: 'flebologia',
    deptName: 'Flebologia',
    roomCode: 'GAB-102',
    brailleCode: '⠃⠍⠁⠚⠃',
    beaconFreqHz: 594,
    badge: 'DZIAŁ 02 • EVLT 1470NM & DIAGNOSTYKA USG DOPPLER 3D',
    heroSubtitle:
      'Małoinwazyjne wewnątrznaczyniowe leczenie żylaków kończyn dolnych laserem radialnym 1470 nm pod kontrolą USG Doppler 3D — bez nacięć chirurgicznych i bez hospitalizacji.',
    leadPhysician: 'Dane lekarza prowadzącego do uzupełnienia',
    pwzNumber: 'Numer PWZ do potwierdzenia',
    clinicalSummaryAio:
      'Wewnątrznaczyniowa ablacja laserowa żylaków (EVLT 1470 nm) w BM Clinic zastępuje klasyczne chirurgiczne wyrywanie żył (stripping) zabiegiem jednego dnia wykonywanym przez nakłucie igłą pod kontrolą USG Doppler 3D. Włókno radialne emituje energię 360 stopni zamykającą niewydolny pień żylny w znieczuleniu tumescencyjnym. Pacjent wstaje z fotela zabiegowego bezpośrednio po procedurze i wychodzi z kliniki o własnych siłach po około 45 minutach.',
    indications: [
      'Niewydolność zastawkowa żyły odpiszczelowej (GSV) i odstrzałkowej (SSV)',
      'Żylaki kończyn dolnych, obrzęki wieczorne i przewlekła niewydolność żylna (CEAP C2–C6)',
      'Teleangiektazje (pajączki naczyniowe) i żyły siatkowate',
      'Owrzodzenia żylne podudzi (monitorowane wskaźnikiem WHI-3D i CEI)',
    ],
    technologies: [
      'Laser Wewnątrznaczyniowy EVLT 1470 nm z włóknem radialnym 2-Ring',
      'Ultrasonograf Dopplerowski 3D/4D wysokiej rozdzielczości',
      'Pompa do znieczulenia tumescencyjnego i skleroterapia piankowa Tessari',
    ],
    procedures: [
      {
        slug: 'laserowe-leczenie-zylakow-evlt-1470nm',
        title: 'Wewnątrznaczyniowe Laserowe Leczenie Żylaków EVLT 1470 nm',
        shortDesc:
          'Zamknięcie niewydolnych pni żylnych światłowodem radialnym pod kontrolą USG Doppler 3D w 45 minut.',
        durationMin: '45 min',
        anesthesia: 'Miejscowe tumescencyjne pod kontrolą USG',
        recoveryWalkOut: 'Walk-in / Walk-out (spacer 30 min bezpośrednio po zabiegu)',
        pricePln: 3800,
        technologyBadge: 'LASER RADIALNY EVLT 1470NM',
        aioQuestion:
          'Jak przebiega laserowe usuwanie żylaków metodą EVLT 1470 nm i kiedy można chodzić po zabiegu?',
        aioDirectAnswerPassage:
          'Laserowe leczenie żylaków metodą EVLT 1470 nm w BM Clinic polega na wprowadzeniu cienkiego światłowodu radialnego do światła niewydolnej żyły przez pojedyncze nakłucie skóry pod stałą kontrolą USG Doppler. Zastosowanie znieczulenia tumescencyjnego chroni okoliczne tkanki i całkowicie eliminuje ból bez potrzeby narkozy. Cała procedura trwa około 45 minut, nie pozostawia blizn ani szwów, a pacjent rozpoczyna chodzenie natychmiast po założeniu pończochy uciskowej i opuszcza klinikę tego samego dnia.',
      },
      {
        slug: 'skleroterapia-piankowa-pod-kontrola-usg',
        title: 'Skleroterapia Piankowa pod Kontrolą USG (Echo-Skleroterapia)',
        shortDesc:
          'Małoinwazyjna obliteracja krętych dopływów żylnych i pajączków naczyniowych bez nacięć.',
        durationMin: '30 min',
        anesthesia: 'Niewymagane (mikroigła 30G)',
        recoveryWalkOut: '0 dni (natychmiastowy powrót do aktywności)',
        pricePln: 950,
        technologyBadge: 'ECHO-SKLEROTERAPIA USG',
        aioQuestion:
          'Czym różni się skleroterapia piankowa pod kontrolą USG od klasycznego zamykania pajączków?',
        aioDirectAnswerPassage:
          'Skleroterapia piankowa pod kontrolą USG (echo-skleroterapia) w BM Clinic wykorzystuje spieniony środek obliterujący podawany bezpośrednio do głębszych, niewidocznych gołym okiem gałęzi żylnych pod obrazowaniem ultrasonograficznym Doppler. Pianka wypiera krew z naczynia i równomiernie obkurcza jego ścianę, co zapewnia wysoką skuteczność zamykania poszerzonych żył. Zabieg trwa 30 minut, nie wymaga znieczulenia i pozwala na natychmiastowy powrót do pracy.',
      },
    ],
    faqs: [
      {
        q: 'Czy przed zabiegiem EVLT 1470 nm konieczne jest badanie USG Doppler?',
        a: 'Tak — każde leczenie flebologiczne w Gabinecie 102 rozpoczyna się od dokładnego mapowania hemodynamicznego żył w USG Doppler 3D, które wyznacza punkty refluksu i średnicę pni żylnych.',
      },
      {
        q: 'Jak długo nosi się pończochę uciskową po laserowym zamknięciu żylaków?',
        a: 'Standardowo pończochę kompresyjną II klasy ucisku stosuje się przez 7–10 dni w ciągu dnia, co przyspiesza przebudowę zamkniętego naczynia i minimalizuje obrzęk.',
      },
    ],
  },
  proktologia: {
    slug: 'proktologia',
    deptName: 'Proktologia',
    roomCode: 'GAB-103',
    brailleCode: '⠃⠍⠁⠚⠉',
    beaconFreqHz: 660,
    badge: 'DZIAŁ 03 • PROKTOLOGIA LASEROWA LHP / FILAC 1 DNIA',
    heroSubtitle:
      'Małoinwazyjna proktologia laserowa jednego dnia (LHP 1470 nm, FiLaC, SiLaC) oraz bezbolesna diagnostyka wideo-anoskopowa HD w warunkach pełnej dyskrecji.',
    leadPhysician: 'Dane lekarza prowadzącego do uzupełnienia',
    pwzNumber: 'Numer PWZ do potwierdzenia',
    clinicalSummaryAio:
      'Proktologia laserowa jednego dnia w BM Clinic (metody LHP 1470 nm oraz FiLaC) pozwala na skuteczne leczenie choroby hemoroidalnej II–IV stopnia oraz przetok okołoodbytniczych bez wycinania tkanek i bez zakładania szwów w kanale odbytu. Wiązka światłowodu stożkowego zamyka naczynia zasilające guzki krwawnicze od wewnątrz, zachowując integralność śluzówki i zwieraczy. Zabieg trwa 30 minut, a pacjent wraca do domu tego samego dnia z minimalnym dyskomfortem pooperacyjnym.',
    indications: [
      'Choroba hemoroidalna II, III oraz wybrane przypadki IV stopnia (Laser LHP)',
      'Przetoki okołoodbytnicze i zatoka włosowata / torbiel pilonidalna (FiLaC / SiLaC)',
      'Przewlekła szczelina odbytu (laserowa plastyka + toksyna botulinowa)',
      'Bezbolesna diagnostyka krwawień i zmian kanału odbytu (Wideo-Anoskopia HD)',
    ],
    technologies: [
      'Stacja Laserowa Biolitec Leonardo Dual 1470 nm (światłowody LHP i FiLaC)',
      'Tor Wideo-Anoskopii i Rektoskopii Wysokiej Rozdzielczości HD',
      'Zestaw do gumkowania metodą Barrona i radiochirurgii RF',
    ],
    procedures: [
      {
        slug: 'laserowa-plastyka-hemoroidow-lhp-1470nm',
        title: 'Laserowa Plastyka Hemoroidów LHP 1470 nm (Chirurgia 1 Dnia)',
        shortDesc:
          'Wewnątrztkankowa koagulacja laserowa guzków krwawniczych bez wycinania śluzówki i bez szwów.',
        durationMin: '30 min',
        anesthesia: 'Miejscowe tumescencyjne lub krótkotrwała analgosedacja',
        recoveryWalkOut: '1–2 dni (wyjście do domu po 60 min od zabiegu)',
        pricePln: 3600,
        technologyBadge: 'BIOLITEC LHP 1470NM',
        aioQuestion:
          'Na czym polega laserowe usuwanie hemoroidów metodą LHP 1470 nm i dlaczego boli znacznie mniej niż operacja klasyczna?',
        aioDirectAnswerPassage:
          'Laserowa plastyka hemoroidów LHP (Laser Hemorrhoidoplasty) w BM Clinic polega na wprowadzeniu cienkiego światłowodu 1470 nm bezpośrednio w podśluzówkową poduszkę naczyniową przez 2-milimetrowe punktowe nakłucie. Energia lasera zamyka tętniczki doprowadzające krew i powoduje obkurczenie guzka krwawniczego o 60–80% bez wycinania wrażliwej anodermy ani zakładania szwów. Dzięki zachowaniu ciągłości błony śluzowej oraz zwieraczy ból pooperacyjny jest wielokrotnie mniejszy niż po klasycznej operacji Milligana-Morgana.',
      },
      {
        slug: 'laserowe-zamkniecie-przetoki-filac-silac',
        title: 'Laserowe Leczenie Przetok i Torbieli Włosowatej (FiLaC / SiLaC)',
        shortDesc:
          'Oszczędzające zwieracze zamknięcie kanału przetoki światłowodem radialnym 360°.',
        durationMin: '35 min',
        anesthesia: 'Miejscowe lub analgosedacja dożylna',
        recoveryWalkOut: '1–3 dni (brak rozległych ran otwartych)',
        pricePln: 3900,
        technologyBadge: 'FILAC / SILAC 360°',
        aioQuestion:
          'Jak działa zabieg FiLaC / SiLaC w leczeniu przetoki okołoodbytniczej i torbieli pilonidalnej?',
        aioDirectAnswerPassage:
          'Procedura FiLaC (Fistula-tract Laser Closure) oraz SiLaC w BM Clinic wykorzystuje elastyczny światłowód radialny 1470 nm emitujący wiązkę obwodową 360 stopni wewnątrz kanału przetoki lub zatoki włosowatej. Kontrolowana energia termiczna niszczy nabłonek patologicznego kanału i obkurcza włókna kolagenowe, zamykając światło zmiany bez przecinania mięśni zwieraczy. Metoda ta eliminuje ryzyko nietrzymania stolca oraz konieczność wielotygodniowej zmiany sączków w otwartej ranie.',
      },
    ],
    faqs: [
      {
        q: 'Jak przygotować się do pierwszej wizyty proktologicznej i wideo-anoskopii w Gabinecie 103?',
        a: 'Pierwsza konsultacja i wideo-anoskopia HD nie wymagają drastycznego oczyszczania jelita ani głodówki. Gabinet 103 posiada prywatną śluzę sanitarną zapewniającą pacjentowi 100% dyskrecji i komfortu.',
      },
      {
        q: 'Po jakim czasie od zabiegu LHP można wrócić do pracy biurowej?',
        a: 'Większość pacjentów wraca do pracy biurowej i prowadzenia samochodu w ciągu 24–48 godzin po zabiegu laserowym LHP.',
      },
    ],
  },
  'chirurgia-ogolna': {
    slug: 'chirurgia-ogolna',
    deptName: 'Chirurgia Ogólna',
    roomCode: 'GAB-104',
    brailleCode: '⠃⠍⠁⠚⠙',
    beaconFreqHz: 792,
    badge: 'DZIAŁ 04 • CHIRURGIA 1 DNIA & RADIOCHIRURGIA RF 4.0 MHZ',
    heroSubtitle:
      'Małoinwazyjne zabiegi chirurgii jednego dnia, dermatochirurgia onkologiczna z badaniem histopatologicznym i radiochirurgia RF w znieczuleniu miejscowym.',
    leadPhysician: 'Dane lekarza prowadzącego do uzupełnienia',
    pwzNumber: 'Numer PWZ do potwierdzenia',
    clinicalSummaryAio:
      'Sala zabiegowa Chirurgii Jednego Dnia (Gabinet 104) w BM Clinic realizuje procedury wycięcia zmian skórnych, podskórnych (tłuszczaki, kaszaki, włókniaki, znamiona barwnikowe) oraz plastykę wrastających paznokci przy użyciu noża radiochirurgicznego RF 4.0 MHz i lasera chirurgicznego. Cięcie falami radiowymi minimalizuje strefę martwicy bocznej do kilkunastu mikrometrów, zapewniając bezkrwawe pole operacyjne, doskonały efekt kosmetyczny oraz pełną weryfikację histopatologiczną każdego pobranego wycinka.',
    indications: [
      'Znamiona barwnikowe, zmiany podejrzane onkologicznie (wycięcie z marginesem + histopatologia)',
      'Tłuszczaki, kaszaki (torbiele naskórkowe), włókniaki i brodawki łojotokowe',
      'Wrastające paznokcie (plastyka wałów okołopaznokciowych / matriksektomia laserowa)',
      'Korekta blizn przerosłych i chirurgiczne opracowanie ran przewlekłych pod kontrolą LiDAR',
    ],
    technologies: [
      'Nóż Radiochirurgiczny RF 4.0 MHz (mikrocięcie atraumatyczne z koagulacją)',
      'Tor Wizyjny 4K + Dermatoskop Cyfrowy z archiwizacją 3D',
      'Autoklaw Klasy B oraz pełny pakiet diagnostyki histopatologicznej',
    ],
    procedures: [
      {
        slug: 'radiochirurgiczne-usuwanie-zmian-skornych-rf',
        title: 'Chirurgiczne i Radiochirurgiczne Usuwanie Znamion z Histopatologią',
        shortDesc:
          'Atraumatyczne wycięcie znamion, kaszaków i tłuszczaków ze szwem kosmetycznym i badaniem hist-pat.',
        durationMin: '30 min',
        anesthesia: 'Znieczulenie miejscowe nasiękowe (lidokaina)',
        recoveryWalkOut: '0 dni (powrót do pracy bezpośrednio po zabiegu)',
        pricePln: 1800,
        technologyBadge: 'RADIOCHIRURGIA RF 4.0 MHZ + HIST-PAT',
        aioQuestion:
          'Kiedy znamię skórne wymaga wycięcia chirurgicznego z badaniem histopatologicznym zamiast lasera?',
        aioDirectAnswerPassage:
          'Każde znamię barwnikowe wykazujące asymetrię, nieregularne granice, niejednolity kolor lub dynamikę wzrostu w badaniu dermatoskopowym musi zostać usunięte w całości chirurgicznie lub radiochirurgicznie z zachowaniem marginesu zdrowej tkanki i przekazane do badania histopatologicznego. W BM Clinic zabieg wykonywany jest w znieczuleniu miejscowym przy użyciu atraumatycznej techniki szwu śródskórnego kosmetycznego, co trwa 30 minut i gwarantuje jednocześnie pełne bezpieczeństwo onkologiczne oraz estetyczną, mało widoczną bliznę.',
      },
      {
        slug: 'laserowa-plastyka-wrastajacych-paznokci',
        title: 'Laserowa i Radiochirurgiczna Plastyka Wrastających Paznokci',
        shortDesc:
          'Trwałe usunięcie stanu zapalnego wału paznokciowego bez zdejmowania całej płytki paznokcia.',
        durationMin: '30 min',
        anesthesia: 'Znieczulenie przewodowe palca (Obersta)',
        recoveryWalkOut: '1 dzień (chodzenie w obuwiu z szerokim noskiem)',
        pricePln: 1400,
        technologyBadge: 'PLASTYKA WAŁU + LASER',
        aioQuestion:
          'Na czym polega małoinwazyjna plastyka wrastającego paznokcia w BM Clinic bez zrywania płytki?',
        aioDirectAnswerPassage:
          'Małoinwazyjna plastyka wrastającego paznokcia w BM Clinic polega na precyzyjnym opracowaniu przerośniętego wału okołopaznokciowego lub selektywnej koagulacji bocznego fragmentu macierzy przy użyciu wiązki laserowej bądź fali radiowej RF 4.0 MHz w znieczuleniu przewodowym. W przeciwieństwie do przestarzałego zrywania całej płytki paznokciowej procedura ta zachowuje naturalny wygląd paznokcia, natychmiast likwiduje ból oraz stan zapalny i zabezpiecza przed nawrotem dolegliwości.',
      },
    ],
    faqs: [
      {
        q: 'Czy każda usunięta chirurgicznie zmiana skórna trafia na badanie histopatologiczne?',
        a: 'Tak — w BM Clinic obowiązuje bezwzględny standard bezpieczeństwa onkologicznego: każdy wycięty chirurgicznie materiał tkankowy jest badany przez lekarza patomorfologa.',
      },
      {
        q: 'Czy przed zabiegiem w znieczuleniu miejscowym trzeba być na czczo?',
        a: 'Nie — do zabiegów wykonywanych w znieczuleniu miejscowym pacjent nie musi być na czczo i może przyjąć swoje stałe leki zgodnie z zaleceniem lekarza.',
      },
    ],
  },
};

export const DEPARTMENT_LIST = Object.values(DEPARTMENT_PROFILES);

export function buildFlagshipSeedEntries(): Array<{
  id: number;
  page: BmClinicPageConfig;
  telemetry: BmClinicTelemetry;
  insight: string;
}> {
  return [
    {
      id: 101,
      page: {
        slug: 'laserowy-resurfacing-frakcyjny-3d',
        urlPath: '/procedury/laserowy-resurfacing-frakcyjny-3d',
        servicePillar: 'Medycyna Estetyczna',
        procedureTitle: 'Laserowy Resurfacing Frakcyjny 3D + Skan LiDAR',
        contentArchetype: 'INTERACTIVE_3D_PROCEDURE_MODEL',
        h1Headline: 'Laserowy Resurfacing Frakcyjny 3D — BM Clinic (Medycyna Estetyczna)',
        h2AioQuestion:
          'Na czym polega laserowy resurfacing frakcyjny 3D w BM Clinic i jak przebiega regeneracja skóry?',
        aioDirectAnswerPassage:
          DEPARTMENT_PROFILES['medycyna-estetyczna'].procedures[0].aioDirectAnswerPassage,
        aioWordCount: 148,
        leadPhysicianName: DEPARTMENT_PROFILES['medycyna-estetyczna'].leadPhysician,
        physicianSpecialty: 'Medycyna Estetyczna',
        pwzVerified: false,
        clinicalStudiesCited: 6,
        originalAssetsCount: 8,
        effortScore: 96,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 94,
        clickDepth: 1,
        siteFocusScore: 0.97,
        siteRadiusDelta: 0.03,
        basePricePln: 1500,
      },
      telemetry: {
        impressions: 420,
        totalClicks: 48,
        goodClicks: 45,
        badClicks: 3,
        lastLongestClicks: 36,
        avgDwellTimeSec: 215,
        avgScrollDepthPct: 88,
        interactive3dOrCalcUses: 31,
        onlineBookings: 6,
        phoneCalls: 2,
        calculatorLeads: 3,
        revenuePln: 16500,
        lcpMs: 1180,
        inpMs: 48,
        clsScore: 0.01,
        ttfbMs: 145,
      },
      insight:
        'GAB-101 • Połączenie skanera 3D LiDAR (parametr Ra µm) z kalkulatorem zwiększa Dwell Time do 215s.',
    },
    {
      id: 102,
      page: {
        slug: 'laserowe-leczenie-zylakow-evlt-1470nm',
        urlPath: '/procedury/laserowe-leczenie-zylakow-evlt-1470nm',
        servicePillar: 'Flebologia',
        procedureTitle: 'Wewnątrznaczyniowe Laserowe Leczenie Żylaków EVLT 1470 nm',
        contentArchetype: 'TRANSPARENT_PRICING_CALCULATOR',
        h1Headline: 'Laserowe Leczenie Żylaków EVLT 1470 nm — BM Clinic (Flebologia)',
        h2AioQuestion:
          'Jak przebiega laserowe usuwanie żylaków metodą EVLT 1470 nm i kiedy można chodzić po zabiegu?',
        aioDirectAnswerPassage: DEPARTMENT_PROFILES.flebologia.procedures[0].aioDirectAnswerPassage,
        aioWordCount: 154,
        leadPhysicianName: DEPARTMENT_PROFILES.flebologia.leadPhysician,
        physicianSpecialty: 'Flebologia',
        pwzVerified: false,
        clinicalStudiesCited: 6,
        originalAssetsCount: 8,
        effortScore: 97,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 95,
        clickDepth: 1,
        siteFocusScore: 0.97,
        siteRadiusDelta: 0.03,
        basePricePln: 3800,
      },
      telemetry: {
        impressions: 610,
        totalClicks: 64,
        goodClicks: 61,
        badClicks: 3,
        lastLongestClicks: 50,
        avgDwellTimeSec: 240,
        avgScrollDepthPct: 91,
        interactive3dOrCalcUses: 44,
        onlineBookings: 9,
        phoneCalls: 4,
        calculatorLeads: 5,
        revenuePln: 68400,
        lcpMs: 1210,
        inpMs: 52,
        clsScore: 0.01,
        ttfbMs: 150,
      },
      insight:
        'GAB-102 • Transparentny kalkulator EVLT 1470nm + USG Doppler generuje najwyższy współczynnik konwersji.',
    },
    {
      id: 103,
      page: {
        slug: 'laserowa-plastyka-hemoroidow-lhp-1470nm',
        urlPath: '/procedury/laserowa-plastyka-hemoroidow-lhp-1470nm',
        servicePillar: 'Proktologia',
        procedureTitle: 'Laserowa Plastyka Hemoroidów LHP 1470 nm (Chirurgia 1 Dnia)',
        contentArchetype: 'DOCTOR_QA_CASE_STUDY_BEFORE_AFTER',
        h1Headline: 'Laserowa Plastyka Hemoroidów LHP 1470 nm — BM Clinic (Proktologia)',
        h2AioQuestion:
          'Na czym polega laserowe usuwanie hemoroidów metodą LHP 1470 nm i dlaczego boli znacznie mniej niż operacja klasyczna?',
        aioDirectAnswerPassage: DEPARTMENT_PROFILES.proktologia.procedures[0].aioDirectAnswerPassage,
        aioWordCount: 156,
        leadPhysicianName: DEPARTMENT_PROFILES.proktologia.leadPhysician,
        physicianSpecialty: 'Proktologia',
        pwzVerified: false,
        clinicalStudiesCited: 6,
        originalAssetsCount: 8,
        effortScore: 95,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 93,
        clickDepth: 1,
        siteFocusScore: 0.96,
        siteRadiusDelta: 0.04,
        basePricePln: 3600,
      },
      telemetry: {
        impressions: 530,
        totalClicks: 55,
        goodClicks: 52,
        badClicks: 3,
        lastLongestClicks: 43,
        avgDwellTimeSec: 228,
        avgScrollDepthPct: 89,
        interactive3dOrCalcUses: 35,
        onlineBookings: 8,
        phoneCalls: 3,
        calculatorLeads: 4,
        revenuePln: 54000,
        lcpMs: 1240,
        inpMs: 50,
        clsScore: 0.01,
        ttfbMs: 152,
      },
      insight:
        'GAB-103 • Nawigacja 3D pokazująca dyskretną śluzę gabinetu proktologicznego redukuje lęk pacjenta przed wizytą.',
    },
    {
      id: 104,
      page: {
        slug: 'radiochirurgiczne-usuwanie-zmian-skornych-rf',
        urlPath: '/procedury/radiochirurgiczne-usuwanie-zmian-skornych-rf',
        servicePillar: 'Chirurgia Ogólna',
        procedureTitle: 'Chirurgiczne i Radiochirurgiczne Usuwanie Znamion z Histopatologią',
        contentArchetype: 'SPATIAL_3D_CLINIC_TOUR',
        h1Headline: 'Usuwanie Znamion i Zmian Skórnych RF 4.0 MHz — BM Clinic (Chirurgia 1 Dnia)',
        h2AioQuestion:
          'Kiedy znamię skórne wymaga wycięcia chirurgicznego z badaniem histopatologicznym zamiast lasera?',
        aioDirectAnswerPassage:
          DEPARTMENT_PROFILES['chirurgia-ogolna'].procedures[0].aioDirectAnswerPassage,
        aioWordCount: 151,
        leadPhysicianName: DEPARTMENT_PROFILES['chirurgia-ogolna'].leadPhysician,
        physicianSpecialty: 'Chirurgia Ogólna',
        pwzVerified: false,
        clinicalStudiesCited: 6,
        originalAssetsCount: 8,
        effortScore: 95,
        schemaTypes: ['MedicalClinic', 'Physician', 'MedicalProcedure', 'FAQPage'],
        entityDensityScore: 93,
        clickDepth: 1,
        siteFocusScore: 0.96,
        siteRadiusDelta: 0.04,
        basePricePln: 1800,
      },
      telemetry: {
        impressions: 390,
        totalClicks: 42,
        goodClicks: 39,
        badClicks: 3,
        lastLongestClicks: 31,
        avgDwellTimeSec: 198,
        avgScrollDepthPct: 85,
        interactive3dOrCalcUses: 27,
        onlineBookings: 5,
        phoneCalls: 2,
        calculatorLeads: 3,
        revenuePln: 18000,
        lcpMs: 1190,
        inpMs: 49,
        clsScore: 0.01,
        ttfbMs: 148,
      },
      insight:
        'GAB-104 • Wyraźna informacja o pełnym badaniu histopatologicznym wzmacnia sygnał E-E-A-T / YMYL.',
    },
  ];
}
