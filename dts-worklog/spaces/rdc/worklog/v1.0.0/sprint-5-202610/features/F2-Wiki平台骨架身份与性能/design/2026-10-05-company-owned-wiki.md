---
type: page
title: Company-owned Wiki implementation
---
# Company-owned Wiki implementation

This revises the archived F2 designs 01, 03 and 08. The user authorized removing
JHipster on 2026-10-05. Spring Boot 4.0.7, Java 25, React and PostgreSQL remain the
implementation stack; application code belongs to `com.yuzhi.dts.wiki`.

The generated entity CRUD APIs are unused by the Wiki UI and can change pages
without enforcing immutable versions, Git read-only rules or search projections.
Remove them and their generated service/DTO/query layers. Keep the domain,
repositories, identity service and `/api/wiki/**` business operations. Removed
legacy entity URLs must return 404 rather than expose an alternative write path.

Use application-owned configuration under `application.*`, Spring task execution
and synchronous Boot Liquibase initialization. Database migrations finish before
the service becomes ready. Use Spring `ProblemDetail` for error responses and
Spring cache keys for the local in-process caches. Applied migration files and
their original author/table names remain byte-identical.

The remaining work follows handoff WP1-WP9. Manifest ingestion reads the pinned
wiki-content v1 contract from Common 1.1.0, validates the entire manifest and all
roots before reconciliation, and disables removed roots without deleting pages.
Roles come from the manifest; native spaces retain their independent lifecycle.
Git-bound pages and attachments reject writes with 409 `GIT_PAGE_READ_ONLY`.
Outbound sync is disabled by default and must not enqueue work in that mode.

Review also identified Git process handling defects: streams are drained before
the timeout is checked, and `strip()` changes imported source bytes. The Git
adapter must drain both streams concurrently, enforce timeouts and expose raw
file bytes separately from command metadata. Local bare repositories exercise
import history, incremental updates, root boundaries and byte fidelity.

WP5 database reset and WP9 domain cutover retain the handoff's explicit approval
gates. The currently unavailable SSH login does not block local implementation.
