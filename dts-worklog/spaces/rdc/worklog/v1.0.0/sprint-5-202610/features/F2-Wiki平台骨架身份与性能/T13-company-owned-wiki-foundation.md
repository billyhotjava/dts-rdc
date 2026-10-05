---
type: task
id: S5/F2/T13
feature: S5/F2
title: Company-owned Wiki foundation
status: DONE
priority: P0
depends: [S5/F2/T05]
---
# T13: Company-owned Wiki foundation

Requested on 2026-10-05: review DTS Wiki and remove the JHipster framework and
generator elements. The company namespace is `com.yuzhi`; the existing application
namespace `com.yuzhi.dts.wiki` satisfies it.

Use Spring Boot configuration, security and problem responses directly. Remove
unused generator CRUD APIs and their supporting query/DTO layers; keep the Wiki
business APIs, persistence model, immutable versions and all applied migrations.
Replace generator instructions with handwritten entity changes and additive
Liquibase migrations. This supersedes the JDL-only rule in the archived F2 design
and in the development handoff for this authorized refactor.

Verification: establish the original backend/frontend baseline, run the final
backend and frontend suites and production bundle, verify company-owned imports,
compare existing migration bytes and run the repository boundary checker.

## Status changes

| Date | Status | Evidence |
| --- | --- | --- |
| 2026-10-05 | IN_PROGRESS | User request and source review at Wiki `11d01d5` |

| 2026-10-05 | DONE | Local full verification: [WP1](../../it/wiki/WP1-baseline.md); Wiki `8cf2353` |
