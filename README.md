# Møteplass

Møteplass er en fullstack-applikasjon for å opprette, finne og delta på arrangementer. Applikasjonen er laget med React og Vite i frontend, Express og MongoDB i backend, og Google OAuth for innlogging.

## Hva kan brukeren gjøre?

Uten innlogging kan brukeren:

- Se alle arrangementer
- Søke etter arrangementer
- Filtrere på kategori og dato
- Se detaljer og adresse på et arrangement
- Se arrangementet på kart

Etter innlogging kan brukeren:

- Melde seg på og av arrangementer
- Se egen profil
- Se egne arrangementer og påmeldinger
- Opprette nye arrangementer

En arrangør kan redigere og slette egne arrangementer. Serveren kontrollerer eierskap, slik at en bruker ikke kan endre andres arrangementer ved å sende egne API-kall.

## Kart og adresser

Når en bruker skriver inn et sted, søker applikasjonen etter adresser med OpenStreetMap Nominatim. Brukeren velger et forslag, og applikasjonen lagrer en kort adresse med gate, husnummer, postnummer og by.

Kartet geokoder adressen og viser et OpenStreetMap-kart med markør og riktig zoom. Hvis adressen ikke kan finnes, vises en tydelig fallback i stedet for at siden krasjer.

## Teknologi

- React, React Router og Vite
- Express 5 og Node.js
- MongoDB med Mongoose
- JWT for server-side identitet
- Google OAuth 2.0
- httpOnly-cookie for OAuth-sesjonen
- Vitest, Testing Library og Supertest
- Socket.IO for oppdateringer ved event-endringer

## Prosjektstruktur

```text
client/     React-frontend, sider, komponenter og frontend-tester
server/     Express-API, modeller, middleware og backend-tester
```

Viktige API-ruter:

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
POST   /api/events/:id/register
POST   /api/events/:id/unregister
GET    /api/auth/me
GET    /api/auth/profile
GET    /api/auth/google
```

## Lokal oppstart

### Forutsetninger

- Node.js 20 eller nyere
- MongoDB lokalt eller en tilgjengelig MongoDB-instans
- Google OAuth-klient for innlogging

### 1. Installer avhengigheter

Kjør kommandoen fra prosjektroten:

```bash
npm install
```

### 2. Konfigurer miljøvariabler

Kopier `server/.env.example` til `server/.env` og fyll inn verdiene:

```dotenv
PORT=3000
JWT_SECRET=velg-en-lang-og-hemmelig-verdi
MONGO_URI=mongodb://127.0.0.1:27017/pg6301
CLIENT_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_CLIENT_ID=din-google-client-id
GOOGLE_CLIENT_SECRET=din-google-client-secret
```

I Google Cloud Console må denne redirect URI-en være registrert nøyaktig:

```text
http://localhost:3000/api/auth/google/callback
```

### 3. Start applikasjonen

Kjør frontend og backend samtidig fra prosjektroten:

```bash
npm run dev
```

Frontend kjører normalt på `http://localhost:5173`, og backend kjører på `http://localhost:3000`.

Hvis en av portene allerede er i bruk, kan Vite starte frontend på `5174`. Bruk da adressen som står i terminalen.

## Tester og build

Kjør alle tester:

```bash
npm test
```

Kjør bare frontend- eller backend-tester:

```bash
npm test --prefix client -- --run
npm test --prefix server -- --run
```

Bygg frontend for produksjon:

```bash
npm run build --prefix client
```

## Produksjonsdeploy med Render

Applikasjonen er deployet som en web service på Render:

```text
https://eventmeeting-f3eu.onrender.com
```

Render bruker disse kommandoene fra prosjektroten:

```text
Build Command: npm run build
Start Command: npm start
```

Build-kommandoen bygger frontend til `client/dist`, og startkommandoen installerer
serveravhengighetene før Express-serveren starter.

Følgende miljøvariabler må settes i Render, uten å committes til Git:

```dotenv
NODE_ENV=production
PORT=10000
JWT_SECRET=din-hemmelige-verdi
MONGO_URI=din-mongodb-atlas-url
CLIENT_URL=https://eventmeeting-f3eu.onrender.com
GOOGLE_REDIRECT_URI=https://eventmeeting-f3eu.onrender.com/api/auth/google/callback
GOOGLE_CLIENT_ID=din-google-client-id
GOOGLE_CLIENT_SECRET=din-google-client-secret
```

Den samme `GOOGLE_REDIRECT_URI`-verdien må være registrert som en godkjent
redirect URI i Google Cloud Console.

## Sikkerhet

- Nye brukere får alltid rollen `user` ved registrering.
- Oppdatering av arrangementer tillater bare redigerbare felt.
- Bare eier eller admin kan redigere og slette et arrangement.
- CORS bruker adressen fra `CLIENT_URL`.
- OAuth-token lagres i en `httpOnly`-cookie og sendes ikke i URL-en.
- `.env`-filer skal aldri committes til Git.

## Før produksjonssetting

Ved deploy må du sette produksjonsverdier for `CLIENT_URL`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` og `GOOGLE_REDIRECT_URI`.

Produksjon bør bruke HTTPS. Da kan OAuth-cookie settes med `secure`-flagget, og Google OAuth må ha riktig produksjons-redirect URI registrert.