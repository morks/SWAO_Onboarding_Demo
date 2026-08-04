# Gewinnspiel Demo App — SWAO Scan Demo

Eine realistische Gewinnspiel-Registrierungs-App für Accenture SWAO-Demo-Zwecke. Die App produziert gezielte SWAO-Findings (sowohl kritische Blocker als auch positive Signale).

## Schnellstart

```bash
chmod +x setup.sh && ./setup.sh
```

**Voraussetzungen:** Docker Desktop, openssl (macOS: vorinstalliert)

Nach dem Setup:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

## SWAO-Findings (Übersicht)

| Signal | Severity | Datei |
|--------|----------|-------|
| **EGR-01** | 🔴 Critical | `backend/src/services/priceApi.ts` — Egress zu `api.alphavantage.co` (US) |
| **CRYPTO-weak** | 🔴 High | `backend/src/services/avatar.ts` — `createHash('md5')` für Gravatar |
| **STATE-04** | 🟠 High | `docker-compose.yml` — Single-node, kein Kubernetes |
| **CRYPTO-JWT** | 🟡 Medium | `backend/src/routes/auth.ts` — HS256 (symmetrisch) |
| **TF-02** | 🟡 Medium | `docker-compose.yml` — Public Docker Hub Images |
| **TF-04** | 🟡 Medium | `backend/src/index.ts` — `console.log` statt strukturiertes Logging |
| **SBOM** | 🟡 Medium | `backend/package.json` — `csurf` (deprecated) |
| **TF-05** | 🟢 Low | `backend/src/index.ts` — kein `/health` Endpoint |
| **DYN-08** | 🟡 Medium | `frontend/src/App.tsx` — kein Cookie-Consent-Banner |
| **DYN-05** | 🟡 Medium | Login/Register/Dashboard — kein `autocomplete`-Attribut auf PII-Feldern |
| **DATA** | 🟡 Medium | `backend/src/routes/profile.ts` — kein `DELETE /api/profile` (GDPR Art.17) |
| **CRYPTO+** | ✅ Positiv | `backend/src/routes/auth.ts` — `bcrypt.hash(password, 12)` |
| **TF-01** | ✅ Positiv | `.env.example` vorhanden |

## Tech Stack

- **Backend:** Node.js 20 + Express + TypeScript + Prisma ORM
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + Lucide-react
- **Datenbank:** PostgreSQL 15
- **Auth:** JWT HS256 (symmetrisch — intentional für SWAO-Demo)
- **Container:** Docker Compose (kein K8s — intentional für SWAO-Demo)

## API-Endpunkte

```
POST /api/auth/register   Registrierung (email, password)
POST /api/auth/login      Anmeldung → JWT
GET  /api/profile         Profil lesen (Auth)
PUT  /api/profile         Profil speichern (Auth)
POST /api/sweepstakes/enter    Gewinnspiel-Teilnahme (Auth)
GET  /api/sweepstakes/entries  Meine Teilnahmen (Auth)
GET  /api/sweepstakes/prize    Aktueller Preis via Alphavantage (EGR-01)
```

## Datenmodell

- **User** — email, bcrypt-password, MD5-avatarHash
- **Profile** — firstName, lastName, dateOfBirth, phone, street, postalCode, city, country, consent
- **SweepstakesEntry** — userId, campaignId, enteredAt

## Stoppen & Aufräumen

```bash
docker compose down          # Container stoppen
docker compose down -v       # Container + Volumes löschen
```
