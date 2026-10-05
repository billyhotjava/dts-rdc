---
type: evidence
id: S5/Wiki/WP7-search-history
covers: [S5/F5/T01, S5/F5/T02, S5/F3/T10, S5/F3/T11, S5/F3/T12]
result: PARTIAL
title: Scoped Chinese search and immutable page history
date: 2026-10-06
status: IN_PROGRESS
---
# Search, history and activity

Wiki commit: `a23430b`.

Eight database integration cases passed (four search/history and four content
API cases). Eleven focused frontend cases passed. The production frontend
passed TypeScript and the bundle budget: home JavaScript 290.9 KB gzip, CSS
0.4 KB. Local Chrome walks passed search results and version comparison with
mocked API fixtures and no console error.

- [Search fixture](WP7-search.png)
- [Version comparison fixture](WP7-version-comparison.png)

Search includes title, current Markdown and attachment filenames, literal query
escaping, current space scopes and filters before count/pagination. Restore
appends an immutable RESTORE version, checks the supplied base version and
rejects Git-page writes. Version lists omit document bodies and personal email.

Review corrected an attachment search join: space ownership belongs to its
page, not an attachment column. The additive `9007_history_activity.xml` migration
backfills activity and adds the scoped chronological index; no historical
migration body changed.

Actual content volume/latency and runtime authorization acceptance remain
pending. Fixture screenshots do not establish production acceptance.
