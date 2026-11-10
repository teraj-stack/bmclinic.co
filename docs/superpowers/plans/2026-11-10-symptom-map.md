# Interactive symptom map plan

**Goal:** Implement the approved spatial map: readable overview, expanding explanations, animated zoom out, navigation and a patient-controlled picture of coexisting symptoms.

**Design:** Three groups of six topics per specialty. Selecting a topic opens four spatial arms: description, timing/location, accompanying features and preparation for discussion. The camera moves from the topic to the whole constellation; pan, zoom, reset, a reading view and selected-topic summary preserve orientation. Connections mean organization, never diagnosis or causal inference. Proctology first; the same map engine supports phlebology.

**Architecture:** Shared typed educational content, pure camera/selection helpers, a dependency-free React viewport. Existing department picker mounts the map only for proctology and phlebology. Standalone offline HTML uses the same component and data, bundled with installed esbuild. No symptom data in telemetry, URLs, browser storage or server API.

- [x] Content and tests: all topic IDs, grouping, four arms, privacy-preserving summaries, safe clinical language and visible emergency advice.
- [x] Camera engine and tests: fit bounds, cursor-anchored zoom, scale limits and quadratic easing.
- [x] React interface: animated expansion, mouse/touch pan and pinch, keyboard controls, readable list alternative, multi-selection, characteristics and export/clear.
- [x] Department integration, offline demonstrator, tests/build/HTTP check and independent review.
- [x] Save source and demonstrator on GitHub with an accurate description; do not claim public clinic deployment.

**Clinical scope:** Education and preparation for consultation, not an automated diagnosis, triage engine or treatment recommendation. No automatic exclusion of thrombosis or attribution of rectal bleeding to hemorrhoids. Content remains for clinic review before clinical publication.

## Accepted direction during implementation

The user prioritized procedure-seeking patients over a symptom-led first screen. Department pages now lead with three treatment-intent paths; the symptom map is a secondary expandable aid. Phlebology validates the wish to change visible small vessels without implying that cosmetic concerns require truncal-vein ablation. Proctology includes patients seeking hemorrhoid procedures or assessment after unsuccessful treatment. Comfort copy recognizes individual pain thresholds and discusses anesthesia and communication, without a universal painless guarantee. These are intent hypotheses, not search-volume findings. No rankings, equipment models or procedure prices are invented.
