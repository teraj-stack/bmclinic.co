# Clinic Foundation Implementation Plan

> Implement natively in this session using executing-plans. Scope approved by the user's request to implement the preceding assessment.

**Goal:** replace demonstrations with a working clinic website, durable content workflow and honest measurements.
**Architecture:** one Next.js application, SQLite on persistent disk, server-rendered published pages, protected editor.
**Tech Stack:** Next.js, React, TypeScript, SQLite, Node test runner.
**Spec:** docs/superpowers/specs/2026-11-10-clinic-design.md

## Global Constraints
- Preserve current production branch; prepare a review branch.
- Never erase existing database rows during initialization.
- Publication requires a reviewer and review date; statistics start at zero.
- Do not invent contact details, booking confirmations or medical credentials.

## Review Focus
- Reinitialization preserves both old and new records.
- Unauthenticated writes and cross-origin requests are rejected.
- Draft content cannot be retrieved through public routes.
- Repeated or invalid telemetry cannot fabricate bookings or capture health text.
- Missing secrets/booking configuration fail closed with truthful UI.

### Task 1: persistence and validation
- [x] Write failing persistence, initialization, workflow, slug and telemetry tests.
- [x] Implement versioned SQLite tables, transactions, revisions and strict validation.
- [x] Run the full test suite.
### Task 2: site and editor
- [x] Add four themes, reception, problem navigation, published procedure routes and configurable booking/contact.
- [x] Add protected editor, signed session cookie, CSRF validation and content APIs.
- [x] Add metadata, sitemap, robots, accessible navigation and mobile styles.
- [x] Run typecheck, production build and HTTP integration checks.
### Task 3: legacy and handoff
- [x] Make legacy seed non-destructive and API truthful; mark demo outputs and disable unsafe medical generator.
- [x] Document deployment, environment and integration requirements.
- [x] Review, push isolated branches and open pull requests.

## Verification record
10 TypeScript tests; additive Python initializer regression; legacy seed preservation regression; production build and typecheck; production HTTP checks for all main routes, auth/CSRF, draft → publication → withdrawal. npm audit production dependencies: zero reported vulnerabilities. Independent source review found two telemetry issues (90-day stats and untracked booking CTA), both corrected. Further real Web Vitals API, persistence and p75 tests pass. Docker and visual browser QA not executed. External booking, real clinic contact details, legal controller details and Search Console require operator configuration; no claims of live deployment.
