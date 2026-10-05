# Repository modularity review — 2026-10-02

## Scope and result

The user moved development into `/opt/prod/dts/dts-rdc` and authorized removal of
unrelated files/directories, with independent, loosely coupled modules and a small
Common module only where functionality is actually shared. This review changes the
local WSL source checkout; it does not deploy, publish artifacts, reset repositories,
complete pending architecture ADRs or establish production business acceptance.

The source was inventoried across RDC, Studio, Stack, App Stack/PRS, Infra and Wiki.
Existing branches, commits, submodule metadata, active worklogs, source prototypes,
industry assets and user changes were preserved. Stack's previously empty local
working branch now contains the independent analytics baseline on
`feature/stack/modular-baseline`; its old branch was not reset or synchronized to a
remote branch. Other repository branches were not switched.

## Findings addressed

| Finding | Change | Evidence |
|---|---|---|
| Studio built AI and analytics from the same Maven reactor | Moved analytics to `dts-stack/analytics`, using its own Boot parent and build | Stack's standalone build and 146 tests pass |
| Stack fell back from a failed Studio API request to reading `copilot_ai.data_source` | Removed `LocalAiDataSourceLookup` and the fallback; retained an explicit HTTP adapter | API mapping, unavailable/empty-result and migration isolation tests pass |
| Analytics startup seeds wrote Studio's schema | Excluded historical 0060/0067 from the active Stack master; preserved original files and checksums | Real PostgreSQL fresh and repeat migration completes without a Studio schema |
| Pack tools and schema resources required a Studio service/source layout | Extracted versioned schemas, validator, exception and deterministic CLI into `dts-common-pack:1.0.0` | 13 Common tests and 518 Studio tests pass; PRS builds with the standalone CLI |
| Imported driver discovery referenced another service's hardcoded source directory | Removed those fallback paths; retained explicit configuration and Stack-owned driver mounts | Stack build/driver tests pass; no sibling production source imports |
| Root contained obsolete Wiki/deployment and copied generated files | Removed verified obsolete outputs and placed live operational source in Infra | External source archive, movement byte comparisons and Git checks |

The shared module has exactly three production Java classes and eight JSON schemas.
It has no Spring annotations, JPA/entities, repositories, business service, database,
network calls or runtime deployment settings. Studio retains a thin Spring adapter
at its prior validator package; its business registry and Pack activation remain
local. Java packages, service API paths and existing AI/analytics Maven artifact IDs
are preserved outside the newly extracted contract library. PRS's framework-specific
`prs-common` stays inside PRS rather than coupling every DTS service to that framework.

Default database names are now `dts_studio` and `dts_stack`. Legacy schema names are
preserved. These are defaults for new deployments, not a live data migration:
existing installations must retain explicit database settings until their data
migration is separately reviewed. Optional AI/data-source API integrations still
require their configured upstream; fail-closed behavior does not imply those
optional operations work while Studio is unavailable.

## Cleanup and ownership

Removed after backup:

- `wiki/`: superseded static Wiki source/dependency tree; the separate `dts-wiki`
  application is preserved. This does not remove data from an existing deployment.
- `deploy/wiki/`: obsolete static Wiki deployment.
- `sandbox/`: unused placeholder directory.
- `.playwright-mcp/`: ignored browser captures.
- `dts-infra/bin/`, `dts-infra/coverage.out`: generated binaries/coverage output.
- `dts-wiki/target/`, `dts-wiki/frontend/node_modules/` and any generated frontend
  `dist/`: reproducible build/dependency outputs.
- `dts-studio/engine/deploy/legacy/`: unusable combined Copilot deployment requiring
  an absent webapp and obsolete shared runtime layout.

Moved:

- `deploy/{harbor,portainer,sso}` to `dts-infra/deploy/`.
- `dts-studio/engine/engine-analytics` to `dts-stack/analytics`.
- Studio's `protocol/` resources and pure Pack tools to `dts-common`.

The empty root `deploy/` was removed and the sandbox product-registry link retired.
Moved operational credentials/data remain ignored; no new unignored `.env`, private
key or PEM file was introduced. No Git directory, submodule marker, existing
business container or server configuration was removed. The uninitialized metro
submodule remains registered; it was not mistaken for unrelated disposable content.
New `target/` outputs produced by verification are ignored and intentionally kept
locally. No copied `node_modules`, cache or backup junk remains in the source tree.

## Verification

Toolchain: existing Java 21.0.10 and Maven 3.9.9 in WSL. Existing dependencies and
product toolchain versions were preserved. PostgreSQL regression explicitly used
the already-loaded `postgres:17.6` image; the wrappers' default remains 18.4. This is
not evidence of a PostgreSQL 18.4 execution. Test databases were loopback-only,
random-port, disposable containers; all created containers were removed afterward.

| Check | Result |
|---|---|
| Common `clean install` | 13 tests; zero failures/errors/skips; ordinary and standalone CLI JARs installed locally |
| Studio `build.sh verify` | 518 tests; zero failures/errors/skips; packaged AI JAR consumes Common resources |
| Stack `build.sh verify` | 146 tests; zero failures/errors/skips; packaged independent analytics JAR |
| Stack migration isolation | Full active master initializes and replays in a database with no `copilot_ai` schema |
| PRS standalone Pack build | `prs-flower@0.1.2`, 31 assets, strict validation, zero warnings |
| Studio compatibility CLI | Validates the same PRS archive using the installed Common CLI artifact |
| Boundary guard | 784 source/build files and 67 active Stack changelog files checked |
| Movement integrity | 393 unchanged moved files verified byte-for-byte; all 8 schemas and retired cross-schema migrations preserved |
| Shell/Git checks | Changed launchers pass `bash -n`; all affected repositories pass `git diff --check` |

Total: **677 automated tests passed**, plus Pack/build/boundary checks. JUnit XML is
in each module's ignored `target/surefire-reports/`; summary and full logs are in
the external review backup. Pack archive SHA256:
`47b5b6369b32cb3db73ab8e6bfc11a2e4a6a1f805ef54465d8f13943fa2ed69c`.

The explicitly invoked real HTTP/SSE bootstrap smoke suites require a pgvector
image, which is not loaded in this environment; they were not run. Existing Pack
registry PostgreSQL integration, migration checksum tests, and REST/service tests
were run by Studio's normal verification. The Java 25 Wiki/PRS rewrite and Go Infra
application suites were not rerun: those application sources were unchanged, and
their toolchains are not configured on this WSL PATH. Their active boundary/build
configuration was inspected; that inspection is not runtime acceptance.

## Delivery and remaining boundary work

- Common 1.0.0 is installed locally. It has not been published to a Maven registry.
  Studio CI now resolves that pinned release from `DTS_MAVEN_REPOSITORY_URL`, with
  optional credentials under server ID `dts-releases`. Publication and CI variable
  setup are prerequisites to remote consumer builds; no remote CI run is claimed.
- Stack's data-source adapter still uses the existing Studio API. Moving ownership
  to a Stack QueryGateway requires a separate API/identity migration, not reintroducing
  a shared database or copying implementation classes.
- Studio still contains inherited industry-specific SQL templates/JDBC tools and
  transitional finance/domain classes. Deleting them now would silently remove
  existing behavior. Their consumer migration remains BL-A/BL-D work; none was
  moved into Common. A Common library does not solve that domain boundary by itself.
- Authenticated gateway entry, tenant/data enforcement, audit publication, new
  Console/BFF integration and complete Iceberg/lakehouse implementation remain
  current Sprint/backlog work. This cleanup does not label those capabilities done.
- Legacy analytics industry/demo seeds remain Stack-local transition assets, not
  an endorsed production configuration. They should migrate through reviewed
  App/Data contracts before retiring applied migration history.

## Recovery and review

Backup directory: `/opt/prod/dts/review-backups/20261002-modularity` (owner-only).
`source-before.tar.gz` contains 3,616 original source/configuration files and was
verified readable before mutation. `.git`, generated dependency/build directories
and caches are excluded; Git histories remain in place. Private configuration in
this backup must remain private. `git-before.json` and per-repository binary patch
files capture the initial repository state. `changes.json` records every original
move/removal; build logs, `verification-summary.json` and the PRS archive preserve
review evidence. The compressed source archive is about 37 MiB.

To restore a retired source directory, extract its selected archive paths into a
separate temporary directory and compare with the current checkout before copying.
Do not unpack the entire backup over a changed checkout. Deleted dependencies and
outputs can be rebuilt from their lockfiles/toolchains. No commits, staging or
pushes were performed; changes are available for local review in their owning
repositories.
