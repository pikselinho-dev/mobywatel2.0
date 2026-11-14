# Audyt pierwowzoru — 2026-11-14

Źródło: przekazane archiwum mobywatel-ai (1).zip, pliki README.md, LICENSE, mockup/index.html, scenarios.js, agent.js, core.js, serwer/server.py, akcje.py, persony.py. Audyt statyczny i smoke test HTTP, nie pełny E2E.

## Potwierdzone
- Python standard library, frontend HTML/CSS/JS, port 8790. Bez kluczy tryb skryptowy; z kluczami agent, narzędzia, zależnie od konfiguracji głos/tłumaczenia. Polski model zgodny z API Chat Completions wymaga obsługi tool calling i dużego kontekstu.
- Istniejące funkcje: dokumenty, przypomnienia, zdarzenia, wnioski o dowód/paszport, urodzenie, 800+, pismo, płatności, PCC-3, pojazdy, zastrzeganie, kilka profili demo, 15 języków poza polskim.
- scenarios.js: dziecko/dz2 — imię, karta potwierdzenia, zgłoszenie wysłane, propozycja 800+ i KDR. W skrypcie nazwisko zależy od końcówki imienia, data/miejsce/rodzic ustalone z góry. W akcje.py zglos_urodzenie podgląd i wykonanie; wynik pesel_nadany=False, kolejny krok po sporządzeniu aktu. Nie znaleziono pełnej ścieżki wydania aktu z trwałym statusem i powiadomieniem.
- Przypomnienia i pisma już istnieją (scenarios.js todo, letter, dowodWaz); nie uznawać samych przypomnień lub tłumaczenia pism za nowość.
- W przeszukanym JS localStorage służy do języka i profilu; sessionStorage do identyfikatora urządzenia. Brak znalezionego mechanizmu trwałego zapisu historii spraw po odświeżeniu ani Service Worker/Web Push. Nie jest to dowód braku funkcji poza analizowaną paczką.
- README ostrzega: brak logowania i limitów serwera, log rozmów/STT/narzędzi, dane do dostawcy modelu. Nie wystawiać z kluczami bez zabezpieczeń.
- MIT obejmuje kod, nie godło, logo/nazwę, wygląd dokumentów, zdjęcia i treści gov.pl. Zachować licencję/autorstwo przy wykorzystaniu kodu, przygotować własne zasoby, wyraźnie oznaczyć nieoficjalny prototyp.

## Testy wykonane
- Uruchomienie serwer/server.py bez kluczy: OK.
- GET /aplikacja, /komputer, /api/health, /scenarios.js, /core.js: HTTP 200.
- /api/health: agent=false, stt=false, tts=false.
- node --check dla mockup/*.js: OK. python -m compileall serwer: OK.
- Próba Playwright/Chromium: ERR_BLOCKED_BY_ADMINISTRATOR podczas nawigacji do localhost; test klikania nie został wykonany. Nie testowano płatnego AI, głosu, dostępności ani urządzenia mobilnego. Nie deklarować przewagi na podstawie niepełnych testów.

## Kierunek naszego MVP
1. Jawny silnik procesów z walidacją, kontrolą obywatela, trwałymi statusami i obsługą braków.
2. Narodziny: zebranie danych, podgląd, autoryzacja demo, USC, symulowane nadanie PESEL i wydanie odpisu, powiadomienia, potem osobne zatwierdzone świadczenia i zdrowie. Nie mylić wysłania z zakończeniem.
3. Centrum terminów z automatycznymi szkicami, ponowną weryfikacją, możliwością korekty; wspólne sprawy US/IKP/ZUS, oś życia.
4. Dostępna nawigacja bez konieczności rozmowy, publiczne demo bez kluczy, fikcyjne dane, reset. Polski model opcjonalny.
5. Porównać oba prototypy na tych samych zadaniach: liczba kroków, czas, możliwość wznowienia, ścieżki błędów, dostępność. Zweryfikować procedury w aktualnych oficjalnych źródłach przed publikacją.

Decyzja: nowy frontend React, bez kopiowania zasobów wizualnych pierwowzoru. Ocena końcowa dopiero po porównawczych testach E2E.
