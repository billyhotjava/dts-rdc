---
type: evidence
id: S5/Wiki/WP6-structured-query
covers: [S5/F3/T15]
result: PARTIAL
title: Authorized structured content query and sprint board
date: 2026-10-06
status: IN_PROGRESS
---
# Structured content query and sprint board

Wiki commit: `f680670`.

Four database-backed integration cases passed for query filtering/pagination,
raw Markdown version headers, deleted-page exclusion, path resolution and
permission checks before conditional responses. Two board component cases
passed. The local Chrome board walk-through passed with mocked API fixtures
and no unexpected API or console error.

[Board fixture screenshot](WP6-sprint-board.png).

The board is derived from current `page_meta`, paginated, with status/owner/
priority/type filters. Markdown remains the versioned source. `llms.txt` is
private and revalidated against current caller permissions.

The shared formatter and `tools/mdfmt` completed in WP10, including20 real editor
roundtrip fixtures and atomic UTF-8 file formatting. Runtime SSO/content acceptance
remains outstanding; this is not a completion claim for all F3/T15 acceptance items.
