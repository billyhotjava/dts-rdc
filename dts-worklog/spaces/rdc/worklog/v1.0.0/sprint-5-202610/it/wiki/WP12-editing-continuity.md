---
type: evidence
id: S5/Wiki/WP12-editing-continuity
covers: [S5/F3/T03, S5/F3/T06, S5/F3/T17, S5/F2/T12]
result: PASS
title: Private drafts, soft presence and final editor review
date: 2026-10-06
status: DONE
---
# Private drafts, soft presence and final editor review

A Clock-controlled presence unit case and five disposable-PostgreSQL editing
integration cases passed. Draft ownership, no autosave version, frozen/stale base,
atomic title/body publishing, matching-draft cleanup, late autosave, UTF-8 limits,
Git write rejection, reader denial and scoped trash pagination are covered.
The initial trash fixture missed required entity fields; the corrected fixture
passed. Presence endpoints also use short read transactions because OSIV is off.

Five editing/diff frontend cases passed; two complete-editor cases prove that
background refresh preserves unsaved body/title/base, explicit reload adopts the
newest data, and recovered drafts publish against their original base. One
properties case proves metadata fences/comments survive edits and recovered YAML
synchronizes without publishing. Four existing Git ownership cases passed.
The first complete-editor run reported an unhandled toast after jsdom teardown;
the toast fixture was corrected and the focused repeat passed without errors.
The final canonical test run will verify these together with real editor fixtures.

Browser API fixtures passed recovered source text, a ten-second autosave retaining
base1, soft presence and the409 conflict against published version2. Scoped trash
shows titles/timestamps with Git restore disabled. There were no console errors or
unexpected API calls. Reviewed screenshots: [draft](WP12-draft-recovery.png),
[conflict](WP12-draft-conflict.png), [trash](WP12-trash.png). These are browser
fixtures, not acceptance on the deployment host.

Review also repaired native title publishing, metadata delimiter loss and stale
property form state. Large Markdown matching now has a bounded DP fallback.
The home budget previously excluded a statically imported editor: the actual
closure was1,335KiB. The corrected chunking and recursive gate passed at293.5KiB
JS/0.4KiB CSS. This supersedes the previous292.5KiB claim; repeat the final gate.

Formal guide: Wiki `docs/editing.md`. Draft persistence starts after a page has an
ID; unsaved new-page titles are not draft data. Presence is single-instance and
advisory. No migration body was edited and drafts use the existing page_draft table.

The first canonical gate at72405ec passed all80 frontend cases,121 unit cases
and114 integration cases. Follow-up commitsf4f9819/a99b9f1 align create/save/MCP
limits, reject invalid titles before writes and keep generated copy titles valid.
The final r1 release gate is running with the additional integration case.

The r1 gate passed80 frontend/121 unit cases but115 integration cases found one
new fixture error: direct service access after MockMvc cleared its security
context. The copy assertion now exercises the real authenticated API instead;
commit688d6b9 changes only that fixture. A focused repeat and final r2 gate must
pass before definitive release acceptance. No r1 bundle was produced.

The six-case editing integration fixture repeat passed, as did the presence unit
case, after688d6b9. It covers authenticated copy-title length, not a direct service
call after security-context teardown. The final r2 gate is running from that tip.

## Definitive local result

Final r2 source688d6b9 passed the canonical80 frontend/121 unit/115 integration
cases, with zero failures/errors/skips. All six editing integration cases passed
in that full run. TypeScript, corrected home budget, architecture, static quality
and production JAR/frontend-byte checks passed. Bundle prepared and checksummed;
Wiki main was pushed and all ten session branches removed. This closes the local
editing-continuity task; runtime feature acceptance remainsF5/T10.
