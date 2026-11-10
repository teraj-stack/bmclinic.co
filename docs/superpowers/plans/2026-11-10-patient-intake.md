# Electronic patient intake

Approved goal: phone/tablet forms for before the visit and the waiting room, based on the supplied patient document pack. Extend the existing clinic review branch; do not deploy or collect real data until configured.

Implementation: structured registration, health questionnaire, authorizations, contact settings and patient request forms. Clinical consents requiring written form remain review/signature tasks, not checkbox signatures. Clinical notes remain clinician-only. No photography/marketing blanket consents.

Privacy: no analytics on patient or patient-admin routes; no PHI in URLs/browser persistence. One-time invitation token in fragment and separate PIN, time-limited HttpOnly session; encryption at rest (AES-256-GCM key outside DB); staff password plus TOTP step-up; same-origin writes; strict bounded validation; immutable submitted snapshot, audit events and clinician verification/import workflow. Configuration fails closed when actual privacy notice, encryption key and staff MFA are absent. Initial single-staff model documented; deployment, backup/retention procedures and processor arrangements remain clinic configuration.

Checks: failing tests then persistence/encryption/token expiry/replay/PIN lockout/submission immutability/version checks; API auth/CSRF; production build; HTTP flow using temporary database and test-only secrets; independent review.

Deliver a non-submitting demo for interface review. Keep real patient collection disabled by default.
