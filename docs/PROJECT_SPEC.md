# mObywatel 2.0 — specyfikacja projektu
Data: 2026-11-14. Wersja 0.1. Zapis ustaleń i proponowanego zakresu MVP.

## 1. Wizja i zasady
Jedno państwo. Jedna aplikacja. Wszystkie Twoje sprawy.
- Jeden interfejs do dokumentów, USC, e-Urzędu Skarbowego, IKP, ZUS/eZUS, rodziny, pojazdów i e-Doręczeń. Nie tylko odsyłacze: docelowo operacje usługowe w aplikacji; istniejące systemy pozostają źródłami danych i decyzji.
- Asystent rozumie potrzebę, pobiera uprawnione dane, pyta o brakujące informacje, weryfikuje kompletność, przygotowuje dokument, pozwala go poprawić, autoryzować i wysłać. Śledzi status, obsługuje uzupełnienia, informuje o wyniku i odbiorze. Wizyta tylko wtedy, gdy procedura jej wymaga.
- Terminy i ważność dokumentów: przypomnienia, także PUSH; opcjonalne automatyczne przygotowanie roboczych wniosków przed terminem. Zawsze kontrola i akceptacja przed wysyłką.
- Oś życia, radar potencjalnych świadczeń i ulg, jedna skrzynka z wyjaśnieniami pism i przygotowaniem odpowiedzi, delegowanie pomocy bliskim, tryb seniora, zdarzenia kryzysowe, historia dostępu do danych.
- Moduły pomocnicze to propozycje rozwijane po uzgodnieniu szczegółów. AI nie wydaje decyzji urzędowych ani nie zastępuje lekarza.

## 2. Wymagania konkursu (materiały organizatora)
Źródło: https://mobywatel.ai/ oraz zrzuty przekazane przez autora.
- Termin zgłoszeń: 30 listopada 2026.
- Klikalny prototyp w Figma, Framer, na własnej stronie lub jako aplikacja w przeglądarce. Same grafiki, szkice, opis lub film nie wystarczą. Film może być dodatkowym linkiem.
- Publiczny link bez logowania, działający do ogłoszenia wyników.
- Poprzeczką jest prototyp Janusza Cieszyńskiego; cel: prostszy, wygodniejszy, bardziej dostępny lub obsługujący więcej spraw.
- Autorzy dziesięciu najlepszych koncepcji zaprezentują je w Sejmie; termin prezentacji zostanie przekazany e-mailem.
- Polskie modele/technologie (np. Bielik, PLLuM) mile widziane; wybór nie może blokować działającego demo.
- Zgłoszenie opisuje problem i odbiorców. Przed publikacją zweryfikować aktualne zasady i licencje pierwowzoru; nie kopiować chronionych grafik i oznaczeń bez podstawy.

## 3. Zakres MVP (propozycja)
| Scenariusz | Przebieg i kryterium ukończenia |
|---|---|
| Narodziny dziecka | Rozmowa/formularz, dane rodziców i dziecka, weryfikacja karty urodzenia i właściwego USC, podgląd i zatwierdzenie, symulowane wysłanie, status, wynik, elektroniczny odpis lub informacja o odbiorze; następnie 800+ i ścieżki ubezpieczenia/IKP. |
| Wymiana dowodu | Przypomnienie, roboczy wniosek, aktualne zdjęcie, sprawdzenie danych, autoryzacja demo, wymagane czynności osobiste, status i odbiór. |
| PIT | Odczyt fikcyjnego rozliczenia, pytania o ulgi, podgląd zmian, zatwierdzenie, symulowane potwierdzenie i status zwrotu. |
| IKP | Fikcyjne recepty, skierowania i wizyty, profil własny/dziecka w zakresie uprawnień, przypomnienia i symulacja rejestracji dostępnej wizyty. |

Ekrany: start, asystent, sprawy, dokumenty, rodzina, usługi (US/IKP/ZUS), terminy, powiadomienia, profil/prywatność. Oś życia, radar i skrzynka jako elementy wspierające scenariusze; zaawansowane pełnomocnictwa i kryzysy później, jeśli czas pozwoli.
Wszystkie cztery scenariusze to cel MVP, z narodzinami dziecka jako priorytetem. Nie deklarować gotowości niewdrożonych funkcji.

## 4. Architektura (propozycja)
- React + TypeScript + Vite; mobile-first, statyczne demo z routingiem kompatybilnym z hostingiem pod ścieżką repozytorium.
- Silnik procesów: jawne definicje kroków, walidacja, stany draft/ready/authorized/submitted/received/in_review/needs_information/completed/collection_ready, możliwość wznowienia i korekty.
- Interfejsy adapterów instytucji; w demo deterministyczne mocki. Wynik urzędu nie jest wymyślany przez AI. Rozróżnić oficjalny status od symulacji.
- Asystent: tekst i opcjonalnie głos; kontrolowana nawigacja po procesach, narzędzia o ograniczonych uprawnieniach, źródła i wersje reguł. Tryb bez modelu zawsze dostępny. Opcjonalny Python i polski LLM po dostarczeniu stabilnego demo; bez kluczy API w frontendzie.
- Powiadomienia: wewnętrzna skrzynka, demonstracyjne zdarzenia push; rzeczywisty Web Push opcjonalny, wymaga zgody, HTTPS, service workera i infrastruktury. Powiadomienia nie zastępują prawnego doręczenia.
- Hosting: GitHub Pages jako kandydat; sprawdzić dostępność i limity przed wyborem. Brak logowania, kluczy i realnych danych w publicznym demo.
- Struktura: frontend/, workflows/, integrations/, mock-data/, tests/, docs/; backend/ opcjonalnie.

## 5. Prywatność, bezpieczeństwo i dostępność
- Wyłącznie fikcyjne dane demonstracyjne; widoczny komunikat o symulacji. Nie zbierać rzeczywistych PESEL, danych medycznych ani dokumentów.
- Docelowo osobne zakresy dostępu dla US, IKP, ZUS i rejestrów, minimalizacja danych, audyt, uwierzytelnianie i autoryzacja zgodna z procedurami. Nie zakładać, że istnieją publiczne API do wszystkich operacji.
- Przed wysłaniem wyraźny podgląd, korekta, sprawdzenie adresata, wymaganych danych i załączników, właściwa autoryzacja. Brak duplikatów i samoczynnych wysyłek.
- Powiadomienia bez szczegółów wrażliwych na ekranie blokady. Pełnomocnictwa ograniczone do prawnie dopuszczalnych uprawnień.
- Prosty język, powiększenie tekstu, czytelny kontrast, obsługa klawiatury, etykiety dla czytników ekranowych, widoczny fokus, alternatywa dla głosu. Testy WCAG 2.2 AA jako cel jakościowy; nie deklarować zgodności bez audytu.

## 6. Plan i bramka wydania
1. Inicjalizacja repozytorium i dokumentacji.
2. Audyt pierwowzoru: uruchomienie, porównanie przebiegu spraw, dostępności i liczby kroków.
3. Wspólny interfejs, adaptery demo i silnik spraw; pełna ścieżka narodzin.
4. Dowód, PIT, IKP; przypomnienia, powiadomienia i oś życia.
5. Testy scenariuszy poprawnych i błędów, mobilne i desktopowe, dostępność.
6. Publikacja publicznego linku, kontrola w oknie incognito bez logowania i przygotowanie zgłoszenia przed 30 listopada.

Bramka: jury może wejść na publiczny link i samodzielnie przejść od potrzeby do wyniku; każdy przycisk w głównych ścieżkach działa, dane są fikcyjne, nie ma rzeczywistej wysyłki, statusy i powiadomienia są wyraźnie oznaczone, demo działa po odświeżeniu i można je zresetować. Zmierzyć różnicę względem pierwowzoru na porównywalnych zadaniach; nie twierdzić, że jest lepszy bez testów.

## 7. Otwarte kwestie
Audyt pierwowzoru i licencji, szczegółowe procedury urzędowe do weryfikacji w aktualnych źródłach, wybór hostingu i ewentualnego polskiego modelu, dostępność integracji produkcyjnych i zakres prawny. Na dzień dokumentu nie ma działającego MVP ani wyników testów.
