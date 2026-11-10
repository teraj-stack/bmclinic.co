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
