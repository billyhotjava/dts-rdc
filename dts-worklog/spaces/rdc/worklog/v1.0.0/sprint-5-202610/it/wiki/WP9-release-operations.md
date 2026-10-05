---
type: evidence
id: S5/Wiki/WP9-release-operations
covers: [S5/F5/T07, S5/F5/T08, S5/F5/T09]
result: PARTIAL
title: Release and backup preparation
date: 2026-10-06
status: IN_PROGRESS
---
# Release and backup preparation

Wiki commit: `592c003`. Shell syntax and Compose configuration validation passed.
An application-image preflight build used the locally preloaded JRE and performed
no remote-host pull. This preflight image is not the final release artifact.

The real backup/restore scripts passed an isolated rehearsal using disposable
PostgreSQL, pg_bigm, one page, two versions, one attachment, one migration marker
and a real blob digest. The rehearsal verified application stop/resume, schema
and count checks, blob validation, rejection of tampered checksums and cleanup
of its own containers. It does not prove restoration of a production database.

The first canonical build passed all 63 frontend tests, frontend bundling and
117 backend unit tests; 97 integration tests exposed one new legacy-fixture
failure. The corrected fixture and architecture checks then passed their seven
focused cases. A final canonical build remains required after collaboration
implementation; the first full build must not be reported as PASS.

Deployment, database reset, real backup, readonly content key, permission
acceptance and domain cutover remain behind the handoff's G0/G2/G3/G4/G5 gates.
No business database or existing Wiki/Keycloak/Jira runtime was changed. Formal
release, restore, alert and rollback instructions are in Wiki's
`docs/operations.md`.

The subsequent canonical release at72405ec passed80 frontend cases,121 unit
cases and114 integration cases with no failures/errors/skips, plus exact
production JAR/frontend comparison and local offline image preparation. The
final r1 bundle incorporates the additional validation review; its definitive
commit, image IDs and checksums are recorded in final-acceptance.md.

The r1 validation follow-up did not complete preparation: one of115 integration
cases exposed the new fixture's cleared security context. The corrected fixture
is688d6b9; final r2 verification is pending. No failed run is reported as PASS.

## Definitive source/artifact verification

Final r2 at688d6b9 passed80 frontend,121 unit and115 integration cases, all with
zero failures/errors/skips; production assets matched the JAR byte for byte and
the home budget passed293.5KiB JS/0.4KiB CSS. The358MiB offline image bundle
prepared successfully and all checksums passed. The source is on pushed main;
real runtime gates remain pending in final-acceptance.md.
