# BM Clinic

Next.js clinic website with four themes, server-rendered published pages, a protected content editor and SQLite persistence. The reception is a concept visualization, not the real clinic address.

## Start

Node >=22.13, Python 3 for the optional legacy schema initializer.

```
npm ci
cp .env.example .env.local
npm run dev
```

For `/admin`, privately configure `ADMIN_PASSWORD` (at least 16 characters) and `SESSION_SECRET` (at least 32 characters; generate with `openssl rand -hex 32`). Never commit secrets. Use HTTPS in production: session cookies are Secure, HttpOnly and SameSite Strict. Sessions expire after 8 hours. Rotating the session secret invalidates sessions. The single-editor password is an initial admin solution, not a multi-user identity provider.

## Content

Create a draft in `/admin`; saved content persists across restarts. A publication requires explicitly choosing Published and entering the approving clinician. This records editorial approval, not verification of identity/PWZ. No fabricated authors, prices, citations or medical claims are seeded. To withdraw, save as Draft. Slugs stay stable when titles change. Each save creates an immutable database revision. The editor accepts plain text, not HTML. Sources must be HTTPS URLs. No patient data belongs in the editor.

Set `BOOKING_URL` to the real HTTPS booking system. Until then the site clearly states online booking is not connected. Set real `CLINIC_PHONE`, `CLINIC_EMAIL`, `CLINIC_ADDRESS` before public launch. `SITE_URL` must match the public origin and reverse proxy host. `SITE_INDEXABLE=true` explicitly enables indexing only after clinic, privacy and medical content have been completed.

## Persistence and deployment

Run `npm run build` then `npm start` on a Node server/container with a **persistent writable disk and a single application instance**. Mount the directory containing `DATABASE_PATH`. Local SQLite is not suitable for ephemeral/serverless deployment without replacing the storage adapter. The runtime initializes new `clinic_*_v1` tables additively. Existing legacy tables/databases are untouched. Do not use a build container's disposable disk for production data. Schedule encrypted backups using SQLite's backup API or `sqlite3 data/clinic.sqlite '.backup backup.sqlite'`; do not copy a live main database file alone in WAL mode. Test restoration before launch. Use the same data volume for all restarts.

`npm run db:init` now only creates missing **legacy** tables; it no longer deletes rows. It is not required by the new runtime. Old simulated dashboards and scoring code are archived under `docs/legacy` and are not served. Historical binary demo databases remain in repository history; never treat their synthetic scores as measured clinic performance.

## Measurements and privacy

Optional consent records `booking_opened` / `contact_opened` and technical Web Vitals samples (LCP, INP, CLS), a per-event random ID and time. No symptom, specialty, user ID, IP, patient text or revenue is accepted in the event schema. Repeated IDs are ignored. These counts are **not completed appointments**. Events and Web Vitals samples older than 90 days are pruned during ingestion. Dashboard queries independently exclude expired rows. To enforce retention during zero traffic, schedule `DELETE FROM clinic_events_v1 WHERE created_at < datetime('now','-90 days')` on the persistent database. Infrastructure access logs are a separate responsibility. Real Web Vitals collection is connected through the web-vitals package after consent; p75 and sample counts are shown without URLs or user identifiers. It describes the consented visitor sample, not a Google/CrUX report. A real booking callback and Search Console import require external integration; no fake values are displayed. The privacy page describes the implemented collection, but operator/contact/legal details must be completed for production.

Rate limiting is persistent and global: 20 login attempts per 5 minutes and 1000 events per minute. For larger traffic add trusted proxy per-client limiting/WAF. Do not trust arbitrary forwarded-IP headers. API writes validate same origin; missing admin credentials disable login. Public routes expose published documents only. No public content write endpoint exists.

## Checks

```
npm test
python3 tests/test_database_init.py
npm run typecheck
npm run build
```

The second repository is retained as a legacy demonstration. It is not a production AI model or a Google ranking measurement. Future improvements: verified booking callbacks, proper team identity/roles, revision restore UI, Search Console reporting. They require real provider configuration and must remain distinct from clinical recommendations.

Indexing metadata is generated during the production build: set SITE_URL and SITE_INDEXABLE in the build environment as well as runtime before launching. Docker builds default to noindex; configure build variables/rebuild when enabling indexing. Dockerfile is provided but a Docker image was not built in this workspace.

Web Vitals retention during zero traffic: also schedule `DELETE FROM clinic_vitals_v1 WHERE created_at < datetime('now','-90 days')`. Complete the privacy notice with the real data controller and contact details before public launch.
