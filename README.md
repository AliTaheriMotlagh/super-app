# Ali Super App

A single Nx monorepo containing **44 product ideas** behind one **Angular 22 Super App**, grouped into **9 Native Federation micro-frontends** and backed by **11 NestJS 12 domain microservices**.

This is no longer a localStorage-only mock. The production baseline includes:

- Angular 22.2 standalone applications
- Native Federation micro-frontends
- NestJS 12.1 API gateway + TCP microservices
- PostgreSQL persistence for every app record
- email/password registration and signed JWT sessions
- public publishing for marketplace/social/catalog apps
- timed file upload + server-enforced unlock/download
- live FX through Frankfurter
- real OpenStreetMap/Overpass restaurant lookup
- optional LibreTranslate-backed Wikipedia translation
- browser camera capture + configurable grid overlay
- Web Audio cleanup chain
- real geofenced message checking
- Chrome extensions for Siktir Capture and currency conversion
- Nginx production hosting
- Docker production topology

## Architecture

```text
                                 ┌────────────────────────────┐
Browser ── HTTPS ───────────────▶│ Nginx / Super App         │
                                 │ Angular shell             │
                                 │ + 9 federation remotes    │
                                 └─────────────┬──────────────┘
                                               │ /api
                                               ▼
                                 ┌────────────────────────────┐
                                 │ NestJS API Gateway         │
                                 │ auth / routing / uploads   │
                                 └─────────────┬──────────────┘
                                               │ Nest TCP
            ┌────────────┬────────────┬────────┼────────┬────────────┐
            ▼            ▼            ▼        ▼        ▼            ▼
        commerce       social       geo      media   finance      ...11 services
            └────────────┴────────────┴────────┼────────┴────────────┘
                                               ▼
                                          PostgreSQL
```

### Frontend micro-frontends

| Domain | Project | Dev port |
|---|---|---:|
| commerce | `mfe-commerce` | 4300 |
| finance | `mfe-finance` | 4301 |
| games | `mfe-games` | 4302 |
| impact | `mfe-impact` | 4303 |
| life | `mfe-life` | 4304 |
| local | `mfe-local` | 4305 |
| media | `mfe-media` | 4306 |
| social | `mfe-social` | 4307 |
| utilities | `mfe-utilities` | 4308 |

### Backend services

| Service | TCP port |
|---|---:|
| utility-service | 5001 |
| commerce-service | 5002 |
| productivity-service | 5003 |
| geo-service | 5004 |
| social-service | 5005 |
| media-service | 5006 |
| finance-service | 5007 |
| content-service | 5008 |
| notification-service | 5009 |
| game-service | 5010 |
| impact-service | 5011 |

Gateway: HTTP `5000`.

## Production run

Create `.env` first:

```bash
cp .env.example .env
```

At minimum replace `JWT_SECRET` and the PostgreSQL password for an Internet-facing deployment.

Then:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

Health endpoint:

```text
http://localhost:5000/api/health
```

The Docker stack builds the Angular shell/remotes once, assembles them under one Nginx origin, builds all backend apps into a reusable backend image, starts PostgreSQL, and runs LibreTranslate for the Wikipedia workflow.

## Local development

Dependencies:

```bash
npm install
```

Infrastructure:

```bash
docker compose up -d postgres libretranslate
```

Then use three terminals:

```bash
npm run start:services
npm run start:api
npm run start:all
```

Open `http://localhost:4200`.

## Authentication and data

Registration/login lives on the gateway:

```text
POST /api/auth/register
POST /api/auth/login
```

All private records use a bearer token. Each micro-app is routed to its declared Nest domain service from the typed registry:

```text
libs/contracts/src/lib/projects.ts
```

Shared records are stored in PostgreSQL as JSONB under `(service, app_slug, user_id)` so tiny apps can ship quickly without creating 44 schema migrations. Apps that prove valuable can later graduate to dedicated tables/modules without changing the shell route.

## Public pages

Apps supporting public records expose:

```text
/public/<slug>
```

Examples:

```text
/public/mini-ecommerce
/public/gomshodami
/public/rapkhone
/public/class-venue
/public/book-social
```

Timed files use:

```text
/file/<file-id>
```

The download endpoint checks the unlock timestamp on the server, not only in the browser.

## Chrome extensions

Two installable Manifest V3 extensions live in:

```text
extensions/siktir-extension
extensions/tabdile-pool-extension
```

Load them with **Chrome → Extensions → Developer mode → Load unpacked**.

Siktir Capture can log in through the Super App gateway and save selected text/links. Tabdile Pool uses live Frankfurter rates and adds a selection context-menu converter.

## Production feature matrix

See [`docs/production-status.md`](docs/production-status.md) for what each of the 44 items actually does.

## Important platform boundary

`Silent Zang Khor` can store and schedule silent-mode rules in the web Super App. A browser cannot change Android/iOS call interruption policy. Actual call/DND control must be shipped as an Android native/Capacitor companion with Notification Policy access. The repo does not pretend otherwise.

## Checks

```bash
npm run check:catalog
npm run check
```

The repository also contains Docker/Nginx deployment config and production federation manifests.

## Verification performed in this generated bundle

The environment used to assemble this repository could not reach `registry.npmjs.org` (`EAI_AGAIN`), so a complete `npm install` + Nx compilation could not be executed there. The following checks **were** completed:

- all 44 catalog entries present
- every catalog domain has a federation remote
- every catalog service has a Nest application
- TypeScript syntax parsing across all TypeScript source files
- JavaScript/MJS syntax validation for tools and extensions
- external import/package declaration consistency

Run `npm install && npm run build:prod` in a networked environment before deploying.
