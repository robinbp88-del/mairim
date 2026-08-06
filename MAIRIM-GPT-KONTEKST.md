# Mairim — kontekst for GPT / videreutvikling

Bruk denne filen som bakgrunn når du hjelper med Mairim. Oppdatert: august 2026.

## Hva er Mairim?

Norsk personlig budsjett-assistent (React CRA). Hjelper brukeren å se hvor mye som er disponibelt frem til neste lønn, med dags-/ukesbudsjett, regninger, sparing og en kort økonomisk vurdering.

- Repo / lokal mappe: `mairim`
- GitHub Pages: `homepage` er `/mairim/`
- Data lagres **kun lokalt** i `localStorage` (`mairim-state`) — ingen sky i vanlig bruk
- Scripts: `npm start`, `npm run build`, `npm test` (ingen egen lint-script)

## Stack

- React 18 + `react-scripts` (CRA)
- Lucide-ikoner, CSS-moduler (`Step.module.css`, `OnboardingFlow.module.css`)
- Mørkt fintech-uttrykk via CSS-variabler i `index.css`
- Backend (`backend/`) finnes, men brukes **ikke** av hoved-UI

## Navigasjon / flyt

Entry: `src/index.js` → `OnboardingFlow`.

| Steg | Komponent | Rolle |
|------|-----------|--------|
| 0 | Velkomst | «Kom i gang» |
| 1 | `Step1Economy` | Voksne, barn, inntekt, saldo, neste utbetaling |
| 2 | `Step3Expenses` | Faste utgifter (kan hoppes over) |
| 3 | `Step4Goals` | Sparemål (kan hoppes over) |
| 4 | `Step6Budget` | Forhåndsvisning av budsjettforslag → Fullfør |
| 5 | `BudgetDashboard` | **Hovedside** etter oppsett |

### Persistens og routing

- Lagres: `{ profile, step }` via `src/utils/storage.js`
- Når oppsett fullføres (`Step6Budget` → Fullfør): `onboardingComplete: true` + `budgetPlan`
- Ved senere besøk: hvis `onboardingComplete` (eller gammel `budgetPlan`) **og** nødvendige felt finnes → direkte til dashboard (steg 5)
- Nødvendige felt: `balance`, `nextPayoutDate`, `adults`
- «Start oppsett på nytt» tømmer localStorage og går til steg 0

## Datamodell (`profile`)

```text
balance, income, nextPayoutDate, adults, children, diet
expenses[]: { name, amount, paid }          // faste utgifter
bills[]:    { name, amount, due, paid }     // paid default false; mangler paid = ubetalt
goals[]:    { item, price, targetDate, saved, active }
shoppingLog[]: { date, amount }             // handleturer
unexpected[]:  { note, amount }             // uforutsette
budgetPlan:    resultat fra buildBudgetPlan(...)
budgetPeriod:  { start, end }
onboardingComplete: boolean
```

## Budsjettmotor (`src/utils/budgetEngine.js`)

Ren logikk, ingen UI. Funksjon: `buildBudgetPlan(profile, balanceOverride?)`.

Rekkefølge:

1. Start med dagens saldo
2. Dager til neste utbetaling
3. Trekk **forpliktelser** før lønn:
   - ubetalte faste utgifter (`expenses` der `paid` er falsk)
   - ubetalte regninger (`paid !== true`) med forfall **på eller før** neste lønn
   - regninger med forfall **etter** lønn: ikke med i denne perioden
4. Liten sikkerhetsbuffer hvis økonomien tillater
5. Sparemål skalert til perioden; trappes ned hvis daglig budsjett blir for lavt; aldri spare slik at mat/transport ikke dekkes
6. Output: disponibelt, daglig, ukentlig, forventet saldo ved lønn, fordeling, vurdering, naturlig kommentar

Terskler ligger i `BUDGET_THRESHOLDS` (criticalDaily 150, tightDaily 250, goodDaily 400, minDailyWithSavings 200, …).

Hjelper: `summarizeBills(profile)` → ubetalte før lønn (kr), antall betalte, neste forfall.

### Vurdering (tekst, ikke emoji i UI)

- **Stram økonomi** / **Litt stramt** / **God kontroll**

Kommentar skal være rådgiver-tone, ikke teknisk («algoritmen…»).

## Saldo som «live lommebok» (viktig)

På dashboard trekkes **saldo** automatisk når brukeren:

- legger til **handletur**
- legger til **uforutsett utgift**
- markerer **regning** eller **fast utgift** som betalt

Markeres regning som **ubetalt** igjen → beløpet legges tilbake på saldo.

Ny regning (ubetalt) trekker **ikke** saldo; den er forpliktelse i motoren til den betales.

Budsjettplanen **omregnes automatisk** på dashboard når saldo, regninger, utgifter, mål, utbetalingsdato eller husholdning endres.

### Unngå dobbelttelling (`budgetTotals.js`)

Fordi saldo allerede er justert for handletur / uforutsett / betalt:

- «Loggført brukt» = historikk (shopping + unexpected + betalte regninger + betalte faste)
- «Gjenstår» ≈ disponibelt fra planen (trekker **ikke** loggførte beløp på nytt)

## Dashboard (`BudgetDashboard.js`) — hovedside

Viser øverst: saldo, dager til lønn, disponibelt, daglig/ukentlig, vurdering, kommentar.

Regninger: oppsummering (ubetalte før lønn / betalte / neste forfall), legg til, marker betalt/ubetalt.

«Rediger grunnopplysninger»: neste utbetaling, inntekt, voksne, barn — uten å kjøre hele oppsettet på nytt.

## Datoer (`DateInput` + `utils/dates.js`)

Fleksibel norsk input:

- `150826` eller `15082026` (kun sifre; punktum settes inn mens man skriver)
- `15.08.26`, `15/8/26`, `15-08-2026`
- Todelt årstall: 00–79 → 20xx, 80–99 → 19xx

## Designregler (ikke bryt uten at brukeren ber om det)

- Behold dagens visuelle design: farger, spacing, kort, typografi, komponentstruktur
- Ikke redesign; ikke flytt elementer unødvendig
- Ikke finn på tall — bruk kun data som finnes; forklar antakelser (f.eks. mat-estimat)
- Ikke commit/push med mindre brukeren ber om det

## Viktige filer

```text
src/OnboardingFlow.js       # steg + routing + persistens
src/Step1Economy.js
src/Step3Expenses.js
src/Step4Goals.js
src/Step6Budget.js          # forhåndsvisning + onboardingComplete
src/BudgetDashboard.js      # hovedside
src/AdviceOverlay.js        # «Få råd»
src/components/DateInput.js
src/components/ExpenseList.js
src/utils/budgetEngine.js
src/utils/budgetTotals.js
src/utils/storage.js
src/utils/dates.js
src/utils/numbers.js
src/Step.module.css
src/index.css
```

## Hvordan teste raskt

1. Start oppsett på nytt → fullfør → land på dashboard
2. Oppdater siden → skal lande på dashboard
3. Legg til ubetalt regning før lønn → dagsbudsjett synker (saldo uendret)
4. Marker betalt → saldo trekkes, planen oppdateres
5. Handletur / uforutsett → saldo trekkes
6. Endre saldo / neste utbetaling → ny beregning uten oppsett

## Ting som bevisst er enkle / mangler

- Ingen ekte bank-integrasjon
- Matkost er estimat fra husholdning (diet/adults/children), ikke kvitteringer
- Backend/Ollama er ikke del av aktiv UI
- Tester er minimale (`App.test.js` sjekker velkomst)

## Ønsket stil når du endrer kode

- Små, trygge steg
- Match eksisterende mønstre
- Norsk UI-tekst
- Etter endringer: `npm test` / `npm run build` når det er relevant
