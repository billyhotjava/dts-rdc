# W5b content evidence (F3/T13)

Date: 2026-09-28 · Branch `feat/W1-scaffold` (commit `dc160a3`) · Image `w6a6` on .50:18091

## B1 content analysis
- `content/` package: FrontmatterParser (shared rule incl. CRLF), ContentSchemaRegistry
  (6 schemas from `content-schemas/`), MarkdownText (commonmark + gfm tables; code kept,
  links text-only), ContentService STRICT/LENIENT + duplicate doc_id check.
- `ContentServiceTest`: 11 tests (every type valid + ≥3 invalid, YAML error, no-FM,
  CRLF, dup id, title derivation). json-schema-validator 3.0.7 is a rewritten API
  (SchemaRegistry/Schema/Error on Jackson 3 `tools.jackson` 3.2.1 pinned + fasterxml
  annotations 2.22 for JsonApplyView); date validation via `pattern` (3.x `format`
  is annotation-only by default). SnakeYAML timestamps normalized to YYYY-MM-DD strings.
- FRONTMATTER_INVALID → 422 + `{errorKey, errors[]}` (WikiExceptionHandler).

## B2 page_meta + B6 search
- `9004_page_meta.xml` (page_meta + 3 indexes, non-entity JdbcTemplate DAO),
  `9005_page_version_via_agent.xml` (incremental, JDL updated with hand-applied note).
- `PageService.addVersion` analyzes (STRICT web, LENIENT restore/import) and upserts meta +
  search doc in the same transaction (flush before FK insert); delete removes both, restore re-analyzes.
- `SearchIndexService`: title = title + tags + doc_id, body = frontmatter-free plain text.
- `ContentReindexJob` (ShedLock, hourly + boot): backfilled the .50 demo page twice
  (first run flagged invalid demo id S6/DEMO as designed; after fix S6/F9/T99 valid=t).
  Scheduling disabled in tests (`wiki.scheduling.enabled=false`) for hermeticity.

## B4 viaAgent
- `X-Wiki-Agent` header (`^[A-Za-z0-9._-]{1,50}$`, else 400) → version.viaAgent;
  history UI shows "经 <agent>" in W6 (F3/T10-11).

## Critical fix found by this work
- `@Lob` String on PostgreSQL TEXT + Hibernate 7: cross-transaction reads fail with
  "Bad value for type long" (OID-locator path); same-transaction reads hit L1 and masked it,
  so all 500+ existing tests were green while PROD page reads were broken. Removed @Lob
  from 7 fields (columnDefinition TEXT, no DDL change); regression tests pin reloads.
  Lesson recorded: content-reading tests must cross persistence-context boundaries.

## Deferred to W6.5 (§5)
- B3 remaining endpoints (markdown by id/path, query, llms.txt — schemas + by-doc-id done in W5b
  because F3 needs them), MCP backlog, archify card/frame.
