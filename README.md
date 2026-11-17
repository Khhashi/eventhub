# Møteplass

[![CI](https://github.com/Khhashi/eventhub/actions/workflows/ci.yml/badge.svg)](https://github.com/Khhashi/eventhub/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Khhashi/eventhub?include_prereleases)](https://github.com/Khhashi/eventhub/releases)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)

Fullstack-applikasjon for å opprette, finne og delta på arrangementer. Bygget med React og Vite i frontend, Express og MongoDB i backend, innlogging med Google OAuth og sanntidsoppdateringer med Socket.IO.

**[Live demo ↗](https://eventmeeting-f3eu.onrender.com/events)** | **[Arkitektur](docs/ARCHITECTURE.md)**

## Funksjoner

**For alle**
- Se, søke i og filtrere arrangementer
- Detaljer, adresse og kart for hvert arrangement

**Med innlogging**
- Melde seg på/av arrangementer
- Opprette, redigere og slette arrangementer
- Profil med egne arrangementer og påmeldinger
- Sanntidsoppdateringer når noen melder seg på

## Teknologi

React, React Router, Vite · Node.js, Express 5 · MongoDB, Mongoose · Google OAuth 2.0, JWT · Socket.IO · Vitest, Testing Library, Supertest · GitHub Actions, Render

## Kjør lokalt

Krever Node.js 20, MongoDB og Google OAuth-klient.

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Opprett `server/.env`:

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/moteplass
JWT_SECRET=velg-en-lang-tilfeldig-verdi
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=din-google-client-id
GOOGLE_CLIENT_SECRET=din-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

Start appen:

```bash
npm run dev
```

Frontend: `http://localhost:5173` | Backend: `http://localhost:3000` | Tester: `npm test`

## Sikkerhet og arkitektur

- **JWT i httpOnly-cookie** – Tokenet kan ikke leses av JavaScript
- **Tilgangskontroll på serveren** – Bare arrangøren eller admin kan endre arrangement
- **Socket.IO krever innlogging** – Bare innloggede får sanntidsoppdateringer
- **Robust feilhåndtering** – Graceful degradation ved feil (f.eks. ukjent adresse)

Se [arkitekturdokumentet](docs/ARCHITECTURE.md) for UML-diagrammer og designbeslutninger.
