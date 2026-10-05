---
type: evidence
id: S5/Wiki/WP1
covers: [S5/F2/T08, S5/F2/T13]
result: PASS
title: WP1 development baseline and company foundation
date: 2026-10-05
status: DONE
related: [S5/F2/T08, S5/F2/T13]
---
# WP1 development baseline and company foundation

## Baseline

Coordination repository: `70774ab`; Wiki source: `11d01d5`.
The original Wiki source was checked in a separate detached worktree, preserving
all source history and existing workspace changes.

- Java: 25.0.4-tem; Maven wrapper: 3.9.16; Node: 24.14.0; pnpm: 12.9.1.
- Original backend `./mvnw -B -ntp clean verify`: FAIL at compilation, before any
  test executed. Two calls in `SyncCycleService` omitted the `List<SyncRoot>`
  argument required by `InboundSyncService.inbound`.
- Frontend `pnpm install --frozen-lockfile`: initially rejected the esbuild build
  script under pnpm 12. After explicitly approving that pinned dependency with
  `--allow-build esbuild`, installation and `pnpm test` passed: 5 files, 52 tests.
  The permission is recorded in `frontend/pnpm-workspace.yaml`.
- Runtime SSH probe to the v2 target: public-key authentication unavailable.
  No remote service, database or runtime configuration was changed.

## Local database image

Built `dts-wiki-db:18-bigm` from the already-loaded `postgres:18.4` base and
pg_bigm commit `8c0a691b9e99c1f83d71ebd1bc066f0140fd1850`.
Registry metadata lookup for the old floating base timed out. Direct GitHub
clone from the build container was unavailable, so the development host fetched
the exact commit archive from codeload.github.com and supplied it to a temporary
Dockerfile. This changes the download route, not the extension version or source.

Image digest: `sha256:64e356a00a525c827a3c0680633cb7e3f0380fb65cbfa628b82577c2dbbf2b4e`.
Integration tests use this local image and disposable containers. They do not
connect to a business database. Docker socket access is temporary to this run.

## Review findings and changes

1. Generated entity CRUD APIs bypassed page versioning, content projection and
   the Wiki write rules. Removed those APIs and unused generated service, DTO,
   mapper and criteria layers. Retained business APIs and identity projections.
2. Removed the framework dependency and generator inputs. Application settings,
   profiles, caching and problem responses now use company-owned Spring code.
   Existing packages already use `com.yuzhi.dts.wiki`.
3. Preserved existing Liquibase changesets and legacy identity table names for
   database upgrade compatibility. Generator-only entity editing instructions
   are superseded by directly maintained entities and additive migrations.
4. Git commands previously drained stdout before stderr and only then checked
   timeout; file reads also stripped content whitespace. Added concurrent stream
   draining, bounded process lifetime and byte-preserving file reads.
5. Release builds now accept `JAVA_HOME` and use a temporary build directory
   rather than a developer-specific path. The database Dockerfile accepts a
   pinned base image.
6. The first final verification passed 111 unit tests, then identified 11
   existing Optional.get violations in the static-analysis gate. These were
   corrected without changing the corresponding behavior.

## Verification

- Main and test compilation: PASS.
- Git adapter regression: 3 tests PASS (UTF-8/CRLF/whitespace preservation,
  timeout, large stderr without deadlock). The whitespace test first failed
  against the old adapter.
- `python3 scripts/check-boundaries.py`: PASS, 3095 source/build files and 67
  active Stack changelogs checked.
- Existing migration diff: empty.
- Final backend `./mvnw -B -ntp clean verify`: PASS, 116 unit tests and 82
  integration tests (198 total), no failures/errors/skips. Checkstyle: 0 violations.
- Final frontend suite: PASS, 6 files and 56 tests. Production bundle: PASS,
  home JavaScript 286.7 KB gzip (300 KB budget), CSS 0.4 KB (60 KB budget).
- Foundation commit: Wiki `8cf2353`; manifest implementation: `b3c47ac`;
  read-only UI: `43418e6` and browser warning correction `4ea7451`.
- Original failed compilation and dependency installation are baseline failures;
  the final verification corrected them. Existing migration bodies remain intact.

This evidence describes local source verification. Runtime acceptance remains
subject to the handoff's SSH, repository key, backup/reset and cutover gates.
