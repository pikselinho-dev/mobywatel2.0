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
Wersja 0.2.0: frontend i silnik spraw, demonstracyjne narodziny dziecka oraz 800+, zgłoszenie do ubezpieczenia i wybór POZ. 13 scenariuszy testowych logiki zaliczonych w izolowanym środowisku JavaScript; kompilacja Vite i testy przeglądarkowe niezweryfikowane. Hosting i rzeczywiste integracje nie są gotowe.

## Uruchomienie lokalne
```sh
cd frontend
npm install
npm test
npm run dev
```

`npm run build` tworzy statyczną wersję do publikacji. Poprzednie dane demo v0.1 nie są migrowane do nowego klucza v2. Wszystkie działania są symulacją, w tym powiadomienia (nie rzeczywisty PUSH). Po zakończeniu rejestracji USC kolejne sprawy są dostępne także przed odbiorem papierowego odpisu.
