# Wiki non-functional budget

## Scope and evidence profile

This budget revisits F2/T04 after the current company foundation and collaboration
review. It retains the archived targets, while separating measured local checks
from pending runtime acceptance. The manifest currently declares three spaces;
content-lint reported 584 files and 140 frontmatter documents before this final
handoff update. This inventory is not evidence of a ten-thousand-page deployment.
Only disposable PostgreSQL fixtures were used locally. No business database,
company identity server or SMTP delivery was used for these checks.

Commands below run from dts-wiki, with Java 25, Node 24, pnpm 12 and preloaded
Testcontainers images. `./build.sh verify` reruns all named Java and frontend
checks; the release evidence records its final result.

| Dimension | Budget | Executable fitness function | Owner | State |
| --- | --- | --- | --- | --- |
| Home transfer | All static dependencies: JS <=300 KiB and CSS <=60 KiB gzip; editor loaded dynamically | `pnpm --dir frontend build`, recursive `scripts/check-bundle-size.mjs` | F2/T12 | Local PASS in final gate |
| Structured query | Explicit authorized scope; size <=200; invalid pagination 400 | `WikiContentResourceIT.queryCombinesFiltersAndProvidesStablePagination` | F3/T15 | Local PASS |
| Personal lists | Authorized rows before count/pagination; <=50 views per user, including simultaneous visits | `WikiNotificationIT.simultaneousVisitsCannotExceedFifty`; `WikiCollaborationIT` | F5/T03 | Local PASS |
| Private drafts | UTF-8 <=2,000,000 bytes; caller ownership; no version on autosave; stale base cannot silently overwrite | `WikiEditingIT`; `page-editor-continuity.test.tsx` | F3/T17 | Local PASS |
| Large editor diff | Common-edge trim; bounded LCS; 3,000 paragraphs and many replacements retain untouched bytes | `editing-continuity.test.tsx`; `roundtrip.test.tsx` | F3/T06, F3/T17 | PASS including final real roundtrip gate |
| Soft presence | 30-second heartbeat; 90-second expiry; no hard lock | `WikiEditingServiceTest.presenceExpiresAfterNinetySecondsWithoutHardLocks` | F3/T17 | Local PASS |
| Trash | Space filter before pagination; size capped at50; denied spaces404; native restore permission checked | `WikiEditingIT.trashListsScopedTitlesAndReadOnlyItemsBeforePagination` | F3/T03 | Local PASS |
| Write concurrency | Optimistic version conflict; identical body creates no new body version | `PageServiceIT`, `WikiPageResourceIT`, `WikiEditingIT` | F3/T04 | Local PASS |
| Identity visibility | No recipient role snapshot authorization; disabled/revoked targets suppressed; outage503; IO outside DB transaction | `CurrentIdentityServiceTest`, `WikiNotificationIT`, `WikiCollaborationIT` | F5/T05, F5/T06 | Local PASS with identity fixture |
| MCP | Personal subject, issuer/audience/client/scopes; writes limited60/subject/min; Git writes409 | `WikiMcpIT`, `McpWriteLimiterTest` | F3/T16 | Local PASS with JWT fixtures |
| Diagram security | Same-space attachment access, stable triple, inert SVG rejection and opaque HTML sandbox | `WikiMcpIT.diagramArtifactsAreScopedAndServedWithSandboxPolicy`, `diagrams-format.test.tsx` | F3/T14 | Local PASS; browser fixture inspected |
| Inbound idempotency | Valid complete manifest at pinned commit; outside-root paths excluded; unchanged cycle no duplicates | `ManifestInboundIT` and `SpaceManifestParserTest` | F4/T01, F4/T03 | Local PASS |
| Audit | Immutable content versions identify personal author/source/agent; lifecycle activities scoped | `WikiMcpIT.toolsUseCallerSpacePermissionsAndPersonalVersionAuthor`; `WikiSearchHistoryIT` | F3/T10, F3/T12 | Local PASS |
| Delivery and failure | Durable deduplicated intents; ten-minute update grouping; bounded retries and expired claim recovery | `WikiNotificationIT` | F5/T06 | Local PASS with SMTP fixture; real transport GAP |
| Data scale/API latency | At least10,000 authorized pages,50 workers; page P95<200ms, search P95<800ms | `tools/acceptance-benchmark --base-url <origin> --page-id <native-id> --search <approved-term>` | F5/T07 | GAP: no runtime access/data/authentication |
| Render latency | Page interactive P95<500ms, record browser/cache/network/scale | Runtime browser performance trace on approved v2 origin | F5/T07 | GAP: no runtime trace; fixture timings not accepted |
| Save latency | Database commit P95<1s; include conflict-free edits and representative Markdown | Timestamp API write measurements on disposable acceptance pages | F5/T07 | GAP: no runtime save harness/result yet |
| Index/query plans | pg_bigm and filtered metadata/personal indexes; measured plans at10,000-page scale | Runtime `EXPLAIN (ANALYZE, BUFFERS)` on approved disposable acceptance data | F5/T07 | GAP: migrations exercised, large-scale plans unmeasured |
| Memory | One replica; container768MiB; target Java RSS<400MiB | Runtime `docker stats --no-stream` and Java process RSS sampling | F5/T07 | GAP: limit configured, RSS unmeasured |
| Browser compatibility | Current Chrome fixture smoke; no customer Chrome95 result claimed | Reviewed WP3/WP10/WP11/WP12 fixture browser checks | F5/T10 | Local PASS; actual supported customer-browser acceptance GAP |

## Remaining gate treatment

Every runtime GAP remains owned by F5/T07 or F5/T10. The initial-budget task can
close after documenting the targets; performance acceptance cannot close without
real measurements. Render/save and query-plan harnesses still require the approved
instance and disposable acceptance data; the rows above explicitly identify that
missing executable automation. They are not green fitness checks.

`tools/acceptance-benchmark` is read-only, refuses insufficient authorized scale,
uses an externally supplied `WIKI_BENCHMARK_TOKEN`, limits responses and timeouts,
and refuses redirects. Its localhost HTTP fixture passed worker execution and
scale rejection. This proves the harness only; it does not prove Wiki capacity.
Run at the default50 workers/10 requests each with a representative native page
and search term on approved data. Never seed or reset the business database to
satisfy the benchmark. Store its JSON result without the token.

## Reviewed fixed limits

Identity connects/requests have2-second limits and each asynchronous response has
a3-second overall wait and1MB body cap. A lookup can require a credential and two
requests, so this is not a3-second aggregate lookup promise. SMTP defaults are
2-second connect and5-second read/write, eight attempts with bounded backoff.
These are code/config limits; outage fixtures prove fail-closed behavior, while
real upstream timeout/SMTP interoperability remains part of F5/T06 acceptance.
Single-instance presence has a10,000-entry cap and exposes at most50 others.
Multi-replica presence is outside this release. No hardware throughput estimate
is inferred from local functional test durations.

## Review correction

The previous bundle gate skipped an editor chunk even when statically reachable
from the home entry. The expanded review found this would transfer1,335KiB gzip.
Explicit Rollup chunk ownership removed that static dependency; the corrected,
recursive gate measured293.5KiB JS and0.4KiB CSS locally. Final r2 production output matched293.5KiB JS/0.4KiB CSS, as recorded in
final-acceptance.md, replacing earlier292.5KiB budget claims.

Final gate at688d6b9 passed80 frontend,121 unit and115 integration cases. Runtime
GAP rows remain open; no large-scale latency/RSS/SMTP result is inferred.
