# Møteplass

[![CI](https://github.com/Khhashi/eventhub/actions/workflows/ci.yml/badge.svg)](https://github.com/Khhashi/eventhub/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)

Fullstack-applikasjon for å opprette, finne og delta på arrangementer. Bygget med React og Vite i frontend, Express og MongoDB i backend, innlogging med Google OAuth og sanntidsoppdateringer med Socket.IO.

**[Live demo ↗](https://eventmeeting-f3eu.onrender.com/events)**<br>
<sub>Åpner med en gang på hverdager kl. 07–20. Ellers kan første besøk ta opptil ett minutt.</sub>

## Hvorfor jeg bygde det

Jeg ville lage et sted der folk kan finne hverandre og samles rundt noe de bryr seg om, enten det er en fotballkamp, en kodekveld eller en tur. Det krevde innlogging, tilgangskontroll og sanntidsoppdateringer, slik at alle ser med en gang når noen melder seg på. Jeg bygde det i React og Node for å bli bedre på fullstack i JavaScript.

## Grensesnitt

Her er grensesnittet til nettsiden, fra oversikten over arrangementer og detaljsiden med kart til skjemaet for nye arrangementer og profilsiden.

<table>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/4f964660-76b5-4377-8cd2-a1496416da05" alt="Oversikt over arrangementer med søk, filtre og kart" /></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/500ad7ab-1d2b-46f3-ad47-d7ef5f30019e" alt="Detaljside for et arrangement med kart, påmelding og deling" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/e9299d04-965d-43da-90dc-54d154394664" alt="Skjema for å opprette et nytt arrangement" /></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/d0fe9742-11d4-4c91-8cc0-51df48495a68" alt="Profilside med egne arrangementer og påmeldinger" /></td>
  </tr>
</table>

## Funksjoner

**Uten innlogging**
- Se, søke i og filtrere arrangementer på kategori og dato
- Se detaljer, adresse og kart for hvert arrangement

**Med innlogging**
- Melde seg på og av arrangementer
- Opprette arrangementer med adressesøk via OpenStreetMap
- Redigere og slette egne arrangementer
- Dele arrangementer og legge dem til i kalenderen
- Profilside med egne arrangementer, påmeldinger og profilbilde
- Listen oppdateres i sanntid når andre oppretter, endrer, sletter eller melder seg på

## Teknologi

**React, React Router, Vite · Node.js, Express 5 · MongoDB, Mongoose · Google OAuth 2.0, JWT · Socket.IO · Vitest, Testing Library, Supertest · GitHub Actions, Render**

## Tekniske valg

- **Sikker innlogging:** Etter innlogging med Google utsteder serveren en JWT som lagres i en `httpOnly`-cookie. Tokenet sendes aldri i URL-en og kan ikke leses av JavaScript i nettleseren.
- **Tilgangskontroll på serveren:** Serveren sjekker eierskap, så bare arrangøren eller en admin kan endre eller slette et arrangement, også ved direkte API-kall. Rollen settes alltid på serveren: brukere som logger inn med Google får rollen `organizer` og kan opprette arrangementer, `admin` tildeles manuelt, og rollen kan aldri settes fra klienten. Bare redigerbare felt kan oppdateres.
- **Sanntid med innlogging:** Socket.IO-tilkoblinger krever gyldig innlogging, så bare innloggede brukere får sanntidsoppdateringer.
- **Robust kartvisning:** Hvis en adresse ikke kan finnes, vises en tydelig melding i stedet for at siden krasjer.

Se [arkitekturdokumentet](docs/ARCHITECTURE.md) for diagrammer, sanntidsflyt, tilgangsstyring og designbeslutninger.

## Tester og CI

25 automatiserte tester dekker innlogging, roller, tilgangskontroll, arrangementer, påmelding, profil og feilhåndtering i backend (Vitest og Supertest), og innlasting, kart, oppretting, redigering, beskyttede ruter og 404 i frontend (Vitest og Testing Library). GitHub Actions kjører testene på hver pull request og push til `main`.

## Arbeidsflyt

Hver oppgave starter som et issue og utvikles på en egen feature-branch. Endringen går gjennom en pull request og merges til `main` når testene er grønne i GitHub Actions.

## Kjør lokalt

Krever Node.js 20, MongoDB og en Google OAuth-klient.

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Opprett filen `server/.env`:

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/moteplass
JWT_SECRET=velg-en-lang-tilfeldig-verdi
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=din-google-client-id
GOOGLE_CLIENT_SECRET=din-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Registrer redirect-adressen over i Google Cloud Console, og start appen:

```bash
npm run dev
```

Frontend kjører på `http://localhost:5173`, og backend på `http://localhost:3000`. Kjør testene med `npm test`.
