# Centrum terminów i wymiana dowodu — v0.3.0

## Decyzje projektowe
- Fikcyjny zegar od 14.11.2026; dowód ważny jeszcze 100 dni. Przyciski +10, +30, +60 dni. Nie jest to zegar systemowy ani rzeczywisty harmonogram powiadomień.
- Progi 90/60/30/7/0 dni są umowne; na 60 dni przed terminem powstaje szkic (o ile włączono opcję). Po dużym skoku czasu emitowane jest jedno najpilniejsze przypomnienie i ewentualnie osobne powiadomienie o szkicu. Wysłanie zawsze wymaga weryfikacji i zatwierdzenia.
- Dane fikcyjne; brak przesyłania zdjęć, biometrii, rzeczywistych danych kontaktowych, podpisów i połączeń z urzędem. Przykładowy dorosły obywatel, standardowa procedura wymiany.
- Wniosek zawiera powód, fikcyjny profil, urząd, zdjęcie demo, wybór certyfikatu podpisu osobistego i kontakt. Statusy: draft → review → submitted → visit_required → received → in_review → collection_ready → completed; możliwe wezwanie do uzupełnienia i stan expired. Odciski i podpis muszą zostać potwierdzone demonstracyjnie przed dalszą obsługą. Termin 30 dni od wysyłki; dzień 30 dopuszczalny, 31 blokuje. Restart po upływie terminu zastępuje poprzedni szkic (demo nie prowadzi archiwum prób).
- Dokument gotowy do odbioru nie oznacza odebranego. Po odbiorze data ważności aktualizowana w demo o 10 lat od symulowanej daty wydania, nie odbioru. Tylko jeden cykl wymiany, bez automatycznego tworzenia kolejnego wniosku za 10 lat.
- Przypomnienia i automatyczne szkice niezależne, ustawienia oraz historia spraw zachowywane w localStorage; migracja danych v0.2 przez uzupełnienie nowego pola deadline. Powiadomienia wewnętrzne; Web Push wymaga osobnego wdrożenia.
- Źródło procedury: https://www.gov.pl/web/gov/uzyskaj-dowod-osobisty (sprawdzone 14.11.2026). Rzeczywiste wysłanie wymaga właściwego podpisu elektronicznego i kanału urzędowego; w typowym przypadku dorosłego wizyta po wniosku online i osobisty odbiór. Nie modelujemy wyjątków medycznych, terminów szczególnych ani pełnego formularza.

## Weryfikacja
13 wcześniejszych testów + 9 nowych testów terminów: 22/22 zaliczone w izolowanym środowisku JavaScript, z wykorzystaniem tych samych funkcji testowych i uproszczonych asercji. Testy w repo są przygotowane dla node:test (npm test). Nie wykonano npm install/build ani E2E, brak dostępu sieciowego kontenera do GitHub/npm. Potrzebny test na laptopie i w przeglądarce, w tym widok mobilny, nawigacja klawiaturą i odświeżenie.

## Następny etap
Rozliczenie PIT w module US: adapter fikcyjnego zeznania, pytania o ulgi, podgląd zmian, oddzielne zatwierdzenie, status i zwrot. Następnie rozszerzony IKP, wspólna oś życia i publikacja publiczna.
