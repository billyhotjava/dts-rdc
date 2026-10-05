---
type: evidence
id: S5/Wiki/WP11-collaboration
covers: [S5/F5/T03, S5/F5/T04, S5/F5/T05, S5/F5/T06]
result: PARTIAL
title: Personal pages and collaboration
date: 2026-10-06
status: IN_PROGRESS
---
# Personal pages and collaboration

Five collaboration API cases and five committed notification/concurrency cases
passed against disposable PostgreSQL. Identity eligibility and SMTP were fakes.
Three adapter unit cases passed with a real authenticated localhost HTTP fixture
or direct parser/config checks. Eight focused frontend cases passed, including
four unchanged Git ownership checks. The production frontend build passed at
a reported292.5 KB home JavaScript gzip, subsequently invalidated by WP12
review: the gate skipped a statically reachable editor. WP12 fixed chunking and
the recursive gate; final home transfer is293.5 KB against its300 KB budget.

Checks cover idempotent scoped favorites, atomic fifty-view pruning (including
51 simultaneous visits), Wiki-only Git comments, one reply level, author/admin
ownership, tombstones, persistent watch mute, independent mentions, current
identity revocation/outage, notification/link/count filtering, repeated intent,
mail grouping, failure retry and expired sending claims. Committed fixtures
asserted that identity and SMTP IO had no active database transaction.

Review exposed and fixed missing transaction commits in the background worker:
Hikari has autoCommit disabled. Status/retry updates now use explicit short
transactions. Mail intent remains independent of read state and SMTP's ambiguous
acknowledgement window is documented as at least once. New migration 9008 adds
personal tables, mute and notification state; previous migrations were untouched.

Browser fixtures verified favorite/watch toggles, comment posting, inert raw HTML,
a mention notification and favorite navigation. There were no console errors or
unexpected API requests. Reviewed screenshots: [comments](WP11-comments.png),
[notifications](WP11-notifications.png), [personal pages](WP11-personal-pages.png).
These fixtures do not prove real company identity or SMTP interoperability.

Additional Git diagram review found the JSON/HTML import whitelist was missing.
It now shares a source policy between initial and incremental import, limits
JSON/HTML to 2 MB/5 MB and excludes SVG. The bare-repository case verifies source
replacement and HTML deletion while PNG remains readable. Runtime inbound and
real diagram build-to-import-to-browser acceptance are still pending.

Formal configuration and operations are in Wiki's `docs/collaboration.md`.
Runtime needs the external read-only identity credential, actual effective-role
acceptance and optional verified SMTP configuration; no company identity/runtime
was modified by this work. Final canonical verification passed at688d6b9 as recorded below.

Wiki commit51435c8; the initial final gate at72405ec passed80 frontend cases,
121 unit cases and114 integration cases with no failures/errors/skips. The final
validation follow-up reruns the canonical gate and is reported in the register.

## Definitive source/artifact verification

Final r2 at688d6b9 passed80 frontend,121 unit and115 integration cases, all with
zero failures/errors/skips; production assets matched the JAR byte for byte and
the home budget passed293.5KiB JS/0.4KiB CSS. The358MiB offline image bundle
prepared successfully and all checksums passed. The source is on pushed main;
real runtime gates remain pending in final-acceptance.md.
