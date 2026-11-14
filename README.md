# mObywatel 2.0

**Jedno państwo. Jedna aplikacja. Wszystkie Twoje sprawy.**

Niezależny projekt konkursowy mObywatel.ai, nieoficjalny prototyp. Nie jest usługą państwową.

## Cel
Obywatel opisuje potrzebę. Asystent zbiera brakujące dane, przygotowuje wniosek, pomaga go zweryfikować i zatwierdzić, a następnie śledzi sprawę do końca i powiadamia o wyniku. Wnioski nie są wysyłane bez wymaganej akceptacji.

## Wizja
- Jeden interfejs: dokumenty, USC, e-Urząd Skarbowy, IKP, ZUS, rodzina, e-Doręczenia.
- Zdarzenia życiowe i kompletne procesy urzędowe.
- Terminy, przypomnienia PUSH i robocze wnioski przygotowywane z wyprzedzeniem.
- Oś życia, radar uprawnień, zrozumiałe pisma, pomoc bliskich, prywatność i dostępność.

## Wersja konkursowa
Klikalny prototyp przeglądarkowy React + TypeScript + Vite, bez logowania, na fikcyjnych danych. Publiczny link musi działać do ogłoszenia wyników. Termin zgłoszeń według materiałów organizatora: 30 listopada 2026.

Proponowane główne scenariusze: narodziny dziecka, wymiana dowodu, PIT, zdrowie. Wysyłki, integracje i statusy są demonstracyjne. Model AI nie może być warunkiem działania podstawowych ścieżek.

## Dokumentacja
[Specyfikacja projektu: wizja, wymagania konkursowe, MVP, architektura, bezpieczeństwo i plan](docs/PROJECT_SPEC.md)

## Status
Wersja 0.3.0: narodziny dziecka i dalsze formalności, wspólny silnik spraw oraz centrum terminów i wymiana dowodu. 22/22 przypadki testowe logiki zaliczone w izolowanym środowisku JavaScript na kodzie repozytorium; kompilacja Vite i testy przeglądarkowe niezweryfikowane. Hosting i rzeczywiste integracje nie są gotowe.

## Uruchomienie lokalne
```sh
cd frontend
npm install
npm test
npm run dev
```

`npm run build` tworzy statyczną wersję do publikacji. Poprzednie dane demo v0.1 nie są migrowane do nowego klucza v2. Wszystkie działania są symulacją, w tym powiadomienia (nie rzeczywisty PUSH). Po zakończeniu rejestracji USC kolejne sprawy są dostępne także przed odbiorem papierowego odpisu.

## Scenariusz proaktywny v0.3
Otwórz Moje terminy. Zegar demo startuje 14.11.2026, 100 dni przed końcem ważności. Przesuń o 10 i 30 dni, sprawdź przypomnienie i automatyczny szkic. Uzupełnij urząd, zdjęcie demo, podpis osobisty i kontakt; zatwierdź. Zasymuluj przyjęcie, wymaganą wizytę, weryfikację, wydanie i odbiór. Wizyta po ponad 30 dniach blokuje wniosek, dostępne jest ponowne rozpoczęcie. Po odbiorze aktualizuje się termin ważności od daty wydania. Przypomnienia i szkice mają niezależne ustawienia, dane v0.2 są zachowane w tym samym kluczu. Jeden cykl wymiany w demonstracji, bez prawdziwego zegara w tle i Web Push.
