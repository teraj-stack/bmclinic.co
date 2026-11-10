# Elektroniczne formularze pacjenta

## Ekrany i zakres

- `/pacjent`: indywidualny dostęp jednorazowym linkiem i osobnym PIN-em.
- `/pacjent/demo`: demonstracja z danymi fikcyjnymi, bez zapisu na serwerze.
- `public/formularze-demo.html`: demonstracja offline do otwarcia w przeglądarce; regeneracja: `node --import tsx scripts/build-intake-demo.ts`.
- `/admin/pacjenci`: panel operatora po logowaniu administratora i dodatkowym TOTP.

Recepcja wybiera potrzebne formularze: dane pacjenta, wywiad zdrowotny, dwa odrębne upoważnienia, ustalenia kontaktowe, wniosek o dokumentację, zmianę/cofnięcie oświadczeń, wniosek dotyczący danych. Link ważny 24 h; 5 błędnych PIN-ów blokuje dostęp. Po otwarciu link zostaje zużyty, a sesja trwa maksymalnie 20 min. Pacjent zapisuje szkic i przekazuje sprawdzone odpowiedzi. Przekazany formularz jest zablokowany; poprawki obsługuje personel w dokumentacji.

Wspólny tablet: po 5 min bezczynności dane znikają. Zakończenie usuwa sesję; brak potwierdzenia z serwera jest wyraźnie sygnalizowany. Nie wolno wtedy przekazać urządzenia następnej osobie bez cofnięcia dostępu przez recepcję. Odświeżenie strony nie odtwarza poprzedniego pacjenta. Recepcja może wznowić ten sam szkic nowym linkiem i kodem; stary dostęp zostaje unieważniony.

Personel weryfikuje tożsamość i oświadczenia, przenosi właściwe dane do EDM, zapisuje numer wpisu. Panel umożliwia druk / zapis PDF oraz stronicowanie starszych formularzy. Nie realizuje automatycznego importu do EDM ani automatycznego wysyłania SMS/e-mail.

## Granice

To moduł przygotowania dokumentów, nie kompletny system EDM ani usługa podpisu elektronicznego. Nie przyjmuje zgód zabiegowych, znieczulenia, publikacji zdjęć ani marketingu. Zgody na konkretne procedury wymagają właściwych informacji, rozmowy z lekarzem i formy podpisu odpowiedniej do procedury. Podpis należy realizować w placówce lub przez odrębnie wdrożoną usługę. Zaznaczenie „sprawdziłem odpowiedzi” nie jest przedstawiane jako taki podpis. Dokumentację kliniczną i zalecenia sporządza personel.

## Uruchomienie

Domyślnie wyłączone. Uzupełnij prywatnie zmienne z `.env.example`: jawny `SITE_URL` (HTTPS poza loopback), losowy klucz AES-256, osobny TOTP, nazwę operatora, ścieżkę i wersję kompletnej, zatwierdzonej informacji RODO. Informacja musi zawierać rzeczywiste dane podmiotu i procesów kliniki. Tekst z nawiasami zastępczymi nie jest akceptowany. Nie używaj przykładowych sekretów testowych. Plik informacji montuj przy uruchomieniu; nie jest pakowany automatycznie do buildu.

Ten wariant obsługuje jednego imiennie określonego operatora. Przed udostępnieniem wielu pracownikom należy wdrożyć indywidualne konta, role, osobne MFA i zarządzanie dostępem; nie współdzielić konta. Zewnętrzna usługa uwierzytelniania i integracja EDM nie są tutaj podłączone.

Serwer Node z trwałym dyskiem SQLite; nie używać efemerycznego dysku funkcji serverless. Baza pacjentów osobna od treści strony. Payloady AES-256-GCM z losowym nonce i AAD identyfikatora; klucz poza bazą. Linki i sesje w bazie wyłącznie jako skróty, PIN jako scrypt. Audyt odczytów i operacji bez treści medycznych. Kopie bazy i klucza przechowuj bezpiecznie i testuj odtworzenie. Utrata klucza uniemożliwia odczyt. Rotacja kluczy wymaga migracji — nie podmieniaj klucza istniejącej bazy.

Ustal retencję szkiców i obowiązki przenoszenia dokumentacji z osobą odpowiedzialną w klinice. Nie wdrożono automatycznego kasowania dokumentacji ani dowolnego terminu retencji. Osobno skonfiguruj kontrolę dostępu do hosta, kopii i eksportowanych PDF, aktualizacje oraz tryb kiosku tabletu bez zapamiętywania danych formularzy. Nie loguj treści żądań, odpowiedzi ani sekretów zaproszeń. Udostępniaj link i PIN różnymi uzgodnionymi kanałami.

Strony i API pacjenta bez telemetrii, bez cache, z no-referrer/noindex i CSP. Odpowiedzi nie są przechowywane w localStorage. Suma kontrolna przekazanego payloadu służy kontroli zmian; nie jest kwalifikowanym podpisem ani zewnętrznym znacznikiem czasu. Audyt nie jest niezależnym, odpornym na administratora rejestrem.

## Weryfikacja

`npm test`, `npm run build`, `python tests/intake_http_check.py` oraz dotychczasowy `python tests/http_check.py`. Testy używają wyłącznie syntetycznych danych i tymczasowych baz. Test HTTP sprawdza rzeczywisty serwer produkcyjny, MFA, CSRF, zużycie linku, zapis, konflikt wersji, blokadę po wysłaniu, odczyt przez personel, cofnięcie dostępu i nagłówki prywatności. Przegląd wizualny na rzeczywistych urządzeniach i integracja z docelowym EDM pozostają etapem uruchomienia.

## Szybkie odpowiedzi (wersja formularza v2)

Pytania wywiadu mają osobne, dobrowolne podpowiedzi do kliknięcia, pozostawiając edytowalną odpowiedź i możliwość omówienia sprawy z lekarzem. Nic nie jest zaznaczane domyślnie; brak odpowiedzi nie oznacza „nie”. Nie ma zbiorczego przycisku deklarującego zdrowie. Zastąpienie własnego tekstu podpowiedzią wymaga potwierdzenia. Pytanie o kolczyk dotyczy okolicy zabiegu i nie służy do odtwarzania domniemanego źródła zakażenia. Nowa wersja nie dodaje ankiety historii manicure, fryzjera ani tatuaży.

## Wywiad warunkowy (wersja v3)

Nowe zaproszenia otrzymują niezależne pytania o choroby przewlekłe, operacje i pozostałe pobyty szpitalne. Oddzielono też leki od suplementów, uczulenia od problemów ze znieczuleniem oraz poszczególne tematy wywiadu. Odpowiedzi „Nie”, „Tak”, „Nie wiem — omówię z lekarzem” i „Wolę omówić z lekarzem” są wybierane świadomie, bez domyślnej deklaracji zdrowia. Szczegóły rozwijają się po „Tak”; mogą być uzupełnione z lekarzem. Zmiana odpowiedzi usuwa nieaktualne szczegóły po potwierdzeniu pacjenta. Serwer również odrzuca nieprzydzielone pola i usuwa szczegóły bez aktywnego pytania nadrzędnego. Zamknięte pytania wspólnego i przydzielonego modułu wymagają odpowiedzi przed przekazaniem; można wybrać niepewność lub rozmowę zamiast zgadywać.

Personel dobiera moduł: konsultacja / do ustalenia, toksyna botulinowa, wypełniacz, laseroterapia lub zabieg chirurgiczny. To pytania pomocnicze, nie kompletna kwalifikacja według ChPL/IFU. Nie zawierają automatycznego uznania odpowiedzi za przeciwwskazanie ani terminów odstawienia leków. Dokładne wymagania wynikają z wybranego preparatu, urządzenia, procedury i oceny lekarza. Oryginalna strona medycyny estetycznej nie została przebudowana.

Opcjonalne pytanie o obawy oraz preferencję dokładnego omówienia służy przygotowaniu rozmowy. Istotna informacja o zabiegu i ryzyku pozostaje obowiązkiem niezależnym od wybranej preferencji. Panel lekarza wyróżnia odpowiedzi „Tak”, niepewność, potrzebę rozmowy i obawy; pełny wywiad wraz z brakami pozostaje dostępny.

Każdy nowy pakiet ma zapisany w szyfrowanym payloadzie schemat pytań i przydzielony moduł. Istniejące pakiety v1/v2 zachowują swój wcześniejszy zestaw pytań; nie są automatycznie przeliczane na nowy wywiad. Odpowiedzi i formularze przekazane wcześniej nie są nadpisywane.

Kolejną wizytę inicjuje wyłącznie personel po sprawdzeniu tożsamości tej samej osoby, ze zweryfikowanego przekazanego wywiadu. Powstaje nowy pakiet, nowy link/PIN, kopia wcześniejszych odpowiedzi i odwołanie do źródła; pobierana jest aktualna informacja RODO. Pacjent musi przejrzeć i potwierdzić aktualność odpowiedzi po naniesieniu zmian; nie stosujemy automatycznego oświadczenia „bez zmian”. Dla porównywalności pytań zachowuje się moduł i schemat źródłowy. Przy innym zabiegu lub potrzebie nowego zestawu pytań personel tworzy nowy wywiad. Nie ma automatycznego kojarzenia pacjentów na podstawie samego nazwiska. Panel pokazuje zmienione pola oraz datę potwierdzenia aktualności; lekarz nadal potwierdza aktualny stan przed zabiegiem.

## Proktologia i zabiegi operacyjne (wersja v4)

Proktologia jest pierwszą opcją panelu i demonstracji. Odrębne ścieżki to konsultacja proktologiczna, LHP / operacyjne leczenie hemoroidów oraz operacyjne leczenie żylaków. Ogólna chirurgia nie jest określana jako „drobny zabieg”. Tryb ambulatoryjny nie oznacza małego zakresu ani małego ryzyka. Aktualny rejestr ma 9 rodzajów formularzy, w tym niezależny wywiad proktologiczny i część przedoperacyjną.

Serwer automatycznie przypisuje wywiad ogólny i proktologiczny dla konsultacji proktologicznej; dla LHP również część operacyjną. Dla operacyjnego leczenia żylaków i chirurgii przypisuje wywiad ogólny oraz operacyjny. Tych wymaganych części nie da się pominąć wyborem recepcji ani przez bezpośrednie wywołanie API. Zabiegów proktologicznych nie obsługuje moduł estetycznej laseroterapii skóry.

Wywiad proktologiczny dotyczy m.in. krwawienia, bólu, wypadania tkanek, wycieku, świądu, rytmu wypróżnień, trzymania gazów i stolca, wcześniejszego nieskutecznego leczenia i operacji, chorób zapalnych jelit, anemii, zmiany rytmu wypróżnień, utraty masy ciała, wywiadu rodzinnego i wcześniejszej diagnostyki. Pacjent nie określa samodzielnie stopnia choroby; wcześniejsze rozpoznanie może podać pomocniczo.

Część operacyjna zawiera pytania o leczenie przeciwkrzepliwe/przeciwpłytkowe, wcześniejszy krwotok zabiegowy, transfuzje, immunosupresję i poważne powikłania znieczulenia. Dla żylaków odrębnie zbiera dolegliwości po prawej/lewej stronie, wcześniejsze leczenie, owrzodzenia, mobilność, rodzinny wywiad zakrzepowy i dostępne USG. Odpowiedź pacjenta o nodze nie wyznacza strony operacji.

Zapisana wraz ze schematem informacja wstępna obejmuje poważne powikłania, w tym krwotok mogący zagrozić życiu i prowadzić do zgonu, konieczność hospitalizacji, transfuzji i ponownej operacji. Zależnie od modułu wymienia także zakażenie, powikłania miejscowe, trzymanie stolca/gazów i zwężenie lub zakrzepicę/zatorowość i uszkodzenia nerwów/tkanek. Nie podaje wymyślonych częstości ani nie zastępuje indywidualnej informacji o ryzyku. Każdy pacjent otrzymuje tę część, niezależnie od deklarowanego poziomu obaw. Są wskazówki o pilnej pomocy i jasne zastrzeżenie, że ankieta nie jest monitorowana w trybie nagłym.

LHP (laser hemorrhoidoplasty / laserowa hemoroidoplastyka), mucopeksja/hemoroidopeksja i wycięcie tkanek nie są traktowane jako synonimy. Chirurg ma opisać każdy planowany element procedury łączonej, rozpoznanie, zakres i znieczulenie w dokumentacji i indywidualnej zgodzie. Zestaw pytań nie zawiera automatycznej kwalifikacji stopnia III/IV ani odmowy leczenia na podstawie samego stopnia.

Panel pokazuje przedoperacyjną listę zagadnień do uzupełnienia w dokumentacji klinicznej. Potwierdzenie odbioru ankiety NIE oznacza gotowości do zabiegu, kwalifikacji, uzyskania zgody na operację lub znieczulenie. Podpisy i indywidualny plan operacji nie zostały zastąpione tym modułem. Treści wstępne pozostają materiałem do zatwierdzenia i dopasowania przez operatora przed uruchomieniem.

Historyczne v1/v2/v3 mają zachowane wcześniejsze schematy. Przy kolejnej wizycie zachowywane są wcześniejsze pytania w istniejących częściach, a nowe obowiązkowe części wynikające z przypisanej procedury są dodawane. Wcześniejsze przekazane dokumenty nie są zmieniane.

Źródła pomocnicze: ASCRS 2024, https://www.ascrsu.com/ascrs/view/ASCRS-Evidence-Based-Guidelines-and-Expert-Consensus/3982022/12/Management_of_Hemorrhoids__2024_ ; rekomendacje LHP 2024, https://doi.org/10.1007/s10151-024-03022-1 (rozróżnienie LHP i technik łączonych, ograniczenia danych); materiały o leczeniu żył, https://www.hey.nhs.uk/patient-leaflet/vascular-surgery-treatment-of-the-superficial-veins-of-the-leg-including-radiofrequency-ablation-laser-ablation-foam-sclerotherapy-surgical-ligation-and-stripping-phlebectomy-endovenous-glue/ . Nie zastępują one własnego protokołu operatora ani instrukcji urządzenia/preparatu.
