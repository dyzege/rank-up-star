# Team Performance Hub

Stwórz kompletną, działającą aplikację webową typu „WORKER RANKING”. Aplikacja ma służyć do cotygodniowej oceny pracowników. System ma być nowoczesny, szybki, responsywny i działać dobrze zarówno na komputerze, jak i telefonie.

1. TECHNOLOGIA

Aplikacja ma być przygotowana tak, aby można było ją wdrożyć całkowicie za darmo na Cloudflare.

Preferowana architektura:

frontend: HTML/CSS/JavaScript lub React

backend: Cloudflare Workers

baza danych: Cloudflare D1

dane mają być przechowywane w bazie, a nie w localStorage

przygotuj strukturę projektu gotową do wdrożenia na Cloudflare

nie używaj płatnych zewnętrznych usług

Jeżeli Lovable nie może bezpośrednio skonfigurować Cloudflare D1, przygotuj aplikację tak, aby backend API można było łatwo podłączyć do Cloudflare Workers + D1.

2. WYGLĄD

Interfejs ma wyglądać profesjonalnie, ciemno i minimalistycznie.

Styl:

ciemne tło

czarne / grafitowe karty

białe napisy

subtelne szare obramowania

czerwone akcenty

nowoczesny wygląd panelu administracyjnego

delikatne animacje hover

zaokrąglone karty

czytelna typografia

responsywność mobile

żadnych przesadnych gradientów

żadnego „gamingowego” chaosu

Nazwa systemu:

WORKER RANKING

Na stronie głównej pokaż:

logo/nazwę WORKER RANKING

menu: Ranking / Panel administratora

krótki opis systemu

aktualny ranking pracowników

3. PUBLICZNY RANKING

Strona / ma być dostępna publicznie bez logowania.

Wyświetl ranking wszystkich aktywnych pracowników.

Każdy pracownik powinien mieć kartę zawierającą:

miejsce w rankingu

imię i nazwisko

stanowisko

wynik tygodnia

punkty zasługi

wynik całkowity

aktualną cenę towaru

Ranking sortuj malejąco według wyniku całkowitego.

Przykład:

#1
Paco Cane
Kierownik
Wynik tygodnia: 87/100
Punkty zasługi: +15
Wynik całkowity: 102
Cena towaru: $10,200

4. SYSTEM OCENY TYGODNIOWEJ

Każdy pracownik raz w tygodniu otrzymuje ocenę.

Ocena składa się z 5 kategorii:

Produktywność — 0–20

Jakość pracy — 0–20

Zaangażowanie — 0–20

Praca zespołowa — 0–20

Dyscyplina — 0–20

Łącznie:

100 punktów.

Panel administratora musi umożliwiać wybranie:

pracownika

tygodnia

wszystkich 5 ocen

opcjonalnej notatki

System automatycznie oblicza wynik tygodnia.

Nie pozwalaj zapisać wartości mniejszej niż 0 ani większej niż 20.

Jeżeli pracownik otrzyma ocenę za konkretny tydzień ponownie, aktualizuj istniejącą ocenę zamiast tworzyć duplikat.

5. PUNKTY ZASŁUGI

Administrator może w dowolnym momencie przyznać pracownikowi dodatkowe punkty zasługi.

Formularz:

Pracownik
Liczba punktów
Powód

Przykład:

Paco Cane
+10
„Wyróżnienie za wzorowe wykonanie zlecenia”

Punkty zasługi są kumulowane.

Każde przyznanie punktów powinno być zapisywane osobno w historii.

Administrator powinien móc zobaczyć historię przyznanych punktów:

data

pracownik

liczba punktów

powód

6. OBLICZANIE WYNIKU

Wynik całkowity:

WYNIK TYGODNIA + WSZYSTKIE PUNKTY ZASŁUGI

Przykład:

Wynik tygodnia: 82
Punkty zasługi: 15

Wynik całkowity = 97

Ranking powinien automatycznie aktualizować się po zmianie oceny lub dodaniu punktów zasługi.

7. CENA TOWARU

Cena towaru zależy od wyniku całkowitego.

Zastosuj następującą formułę:

Minimalna cena: $4,000

Cena bazowa: $5,000

Jeżeli wynik jest większy niż 50:

Cena = 5000 + (wynik - 50) × 100

Przykłady:

50 punktów → $5,000
60 punktów → $6,000
70 punktów → $7,000
80 punktów → $8,000
90 punktów → $9,000
100 punktów → $10,000

Cena nigdy nie może spaść poniżej $4,000.

Umieść logikę obliczania ceny po stronie backendu, aby użytkownik nie mógł jej zmienić poprzez frontend.

8. PANEL ADMINISTRATORA

Utwórz osobną stronę:

/admin

Dostęp zabezpieczony logowaniem.

Hasło administratora:

braciazkubytodebile

Nie umieszczaj hasła bezpośrednio w kodzie frontendowym.

Hasło powinno być przechowywane jako sekret/zmienna środowiskowa po stronie Cloudflare.

Po zalogowaniu administrator otrzymuje dostęp do panelu.

Panel powinien zawierać:

DASHBOARD

Pokaż:

liczba aktywnych pracowników

najlepszy pracownik

średni wynik

łączna liczba punktów zasługi

najwyższa cena towaru

PRACOWNICY

Administrator może:

dodać pracownika

podać imię i nazwisko

podać stanowisko

aktywować/dezaktywować pracownika

Dodawanie pracownika:

Imię i nazwisko:
[____________]

Stanowisko:
[____________]

[ DODAJ PRACOWNIKA ]

Dezaktywacja pracownika nie powinna usuwać jego historii.

9. OCENA PRACOWNIKA

Dodaj sekcję:

„Ocena tygodniowa”

Formularz:

Pracownik:
[SELECT]

Tydzień:
[DATA]

Produktywność:
[0–20]

Jakość:
[0–20]

Zaangażowanie:
[0–20]

Praca zespołowa:
[0–20]

Dyscyplina:
[0–20]

Notatka:
[TEXTAREA]

Wynik:
0/100

Wynik powinien aktualizować się na żywo podczas wpisywania wartości.

Przycisk:

[ ZAPISZ OCENĘ ]

10. PUNKTY ZASŁUGI

Sekcja:

„Dodaj punkty zasługi”

Pracownik:
[SELECT]

Punkty:
[NUMBER]

Powód:
[TEXTAREA]

[ PRZYZNAJ PUNKTY ]

Po zapisaniu pokaż komunikat sukcesu.

11. HISTORIA

Dodaj możliwość przeglądania historii pracownika.

Po kliknięciu pracownika administrator powinien zobaczyć:

Historia ocen

tydzień

wynik

wszystkie 5 kategorii

komentarz

Historia punktów zasługi

data

liczba punktów

powód

Historia ceny

wynik

wyliczona cena

data

12. BAZA DANYCH

Przygotuj schemat Cloudflare D1.

Tabela employees:

id

name

role

active

created_at

Tabela weekly_reviews:

id

employee_id

week_start

productivity

quality

engagement

teamwork

discipline

note

created_at

Tabela merit_points:

id

employee_id

points

reason

created_at

Tabela sessions:

id

token_hash

expires_at

created_at

Tabela audit_log:

id

action

employee_id

details

created_at

Dodaj odpowiednie klucze obce, indeksy i ograniczenie, aby jeden pracownik nie miał dwóch ocen za ten sam tydzień.

13. API

Przygotuj backendowe endpointy:

GET /api/ranking

POST /api/login

POST /api/logout

GET /api/admin/me

GET /api/admin/employees

POST /api/admin/employees

DELETE /api/admin/employees?id=ID

POST /api/admin/merit

POST /api/admin/review

GET /api/admin/history?id=ID

Wszystkie endpointy /api/admin/* muszą wymagać autoryzacji.

14. BEZPIECZEŃSTWO

Zadbaj o:

hasło administratora wyłącznie po stronie backendu

sesje HttpOnly

Secure cookies

SameSite cookies

wygasanie sesji

haszowanie tokenów sesji

walidację wszystkich danych po stronie backendu

ochronę endpointów administratora

brak możliwości modyfikowania cen przez frontend

brak możliwości przyznawania sobie punktów przez użytkownika publicznego

brak ujawniania sekretów w kodzie JavaScript

Dodaj podstawowy audit log dla:

logowania administratora

dodania pracownika

dezaktywacji pracownika

przyznania punktów

dodania/edycji oceny

15. UX

Dodaj:

loading states

komunikaty sukcesu

komunikaty błędów

potwierdzenie przed dezaktywacją pracownika

potwierdzenie przed przyznaniem punktów

walidację formularzy

automatyczne odświeżanie rankingu po zmianach

możliwość wylogowania

Na telefonie panel administracyjny powinien nadal być wygodny.

16. RANKING – DODATKOWE INFORMACJE

Przy każdym pracowniku pokaż wizualnie:

MIEJSCE
IMIĘ I NAZWISKO
STANOWISKO

WYNIK TYGODNIA
████████░░ 82/100

PUNKTY ZASŁUGI
+15

WYNIK CAŁKOWITY
97

CENA TOWARU
$9,700

Pierwsze trzy miejsca mogą mieć subtelnie wyróżniony wygląd.

17. BRAK DANYCH

Jeżeli nie ma jeszcze pracowników:

„Brak pracowników w rankingu.”

Jeżeli pracownik nie ma jeszcze oceny:

„Brak oceny za bieżący tydzień.”

Jeżeli nie ma punktów zasługi:

„Brak punktów zasługi.”

18. WAŻNE

Nie twórz tylko makiety.

Chcę pełną działającą aplikację z prawdziwym backendem, bazą danych, logowaniem, API i panelem administratora.

Kod powinien być uporządkowany i gotowy do wdrożenia.

Na końcu przygotuj:

kompletną strukturę plików projektu

cały kod aplikacji

schemat SQL dla Cloudflare D1

instrukcję konfiguracji Cloudflare Workers

instrukcję konfiguracji Cloudflare D1

instrukcję dodania sekretów:

ADMIN_PASSWORD

SESSION_SECRET

instrukcję wdrożenia

instrukcję pierwszego logowania

instrukcję dodania pierwszego pracownika

Aplikacja ma być gotowa do uruchomienia po wykonaniu tych kroków.

Nie dodawaj płatnych usług ani zbędnych zależności.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rank-up-star.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/abfcc42e-7aa5-4735-8514-9ebe49f23586).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
