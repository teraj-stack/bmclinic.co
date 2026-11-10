# Adaptive patient intake implementation plan

**Goal:** Implement the user-approved five-part flow: short conditional interview, staff-assigned procedure module, review/update on later visits, optional concerns and prioritized clinician summary.

**Architecture:** Keep encrypted packets and current authentication. Snapshot assigned questions inside each new packet; retain the previous schema for existing packets. Conditional detail fields are cleared when their parent answer changes and are filtered/validated on the server. Follow-up is a new encrypted draft copied only by identity-confirming staff from a submitted reviewed record; original submissions stay immutable.

**Tech Stack:** Existing Next.js / TypeScript / React / SQLite.

- [x] Schema and tests: independent yes/no/unsure questions, relevant details only, staff procedure whitelist, conditional server validation, immutable question snapshots.
- [x] Persistence and tests: procedure assignment, later-visit copy with explicit patient review and new invitation, source record and change summary. Never match patients by name alone.
- [x] UI: patient buttons and conditional details, optional concerns, repeat review screen; staff procedure selector and prioritized summary.
- [x] Refresh standalone synthetic-data demo, documentation; run unit/build/HTTP checks; independent review; update GitHub PR #2.

**Constraints:** No automatic healthy defaults; no automatic medical qualification; no bypass of informed consent; no automated merging of patient identities; previous records never overwritten; production remains disabled until configured.
