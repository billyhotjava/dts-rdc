---
type: evidence
id: S5/Wiki/WP2-manifest-inbound
covers: [S5/F4/T02, S5/F4/T03, S5/F4/T05]
result: PASS
title: Manifest-driven inbound content
date: 2026-10-05
status: DONE
---
# Manifest-driven inbound content

Wiki commit: `b3c47ac`.

- Whole-manifest validation uses the pinned company contract artifact 1.1.0.
  Space inventories, display names, roles and roots are configuration-driven.
- Invalid inventory or invalid root stops the entire cycle before reconciliation.
  Removed entries retain pages/history and stop synchronization.
- Native pages remain editable; every Git mutation and attachment write returns
  409 `GIT_PAGE_READ_ONLY`; default inbound cycles create no outbox.
- Raw UTF-8/CRLF/whitespace and immutable versions are preserved. Initial import
  captures Git history and author times; same SHA creates no additional version.
- Declared roots are isolated. Symlinks, gitlinks, hidden/control/checksum files
  are ignored. Supported binary assets are imported into the real scoped store.
- Lenient invalid frontmatter remains readable with `valid=false`.

## Verification

Full backend: 116 unit + 82 integration tests PASS. Dedicated manifest suite:
6 scenarios PASS using local bare Git fixtures and disposable PostgreSQL with
pg_bigm. Cases cover import/history/renames, incremental content/assets, invalid
and removed inventories, paused/resumed roots, root isolation, read-only HTTP
writes, native edits, permission 404 and empty outbox. Legacy opt-in outbound:
8 scenarios PASS. Existing applied migration diff is empty; only additive
`9006_manifest_spaces.xml` was introduced.

This is local source evidence. `.50` import, real repository key and real user
permission checks remain pending the handoff gates.
