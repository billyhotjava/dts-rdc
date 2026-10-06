---
type: evidence
id: S5/Wiki/WP15-kubernetes-reading
covers: [S5/F3/T02, S5/F3/T03, S5/F5/T07, S5/F5/T10, S5/F7/T27]
result: PARTIAL
title: Lightweight Wiki reading and Kubernetes deployment acceptance
date: 2026-10-07
status: IN_PROGRESS
---
# Lightweight Wiki reading and Kubernetes deployment acceptance

## Delivered source

Wiki main `0f287e79790e6c3fb57fb496dc3c3954852de245` contains three commits:
`28b54e0` adds document navigation and Kubernetes runtime contracts; `9f8931c`
isolates Liquibase from identity autoconfiguration; `0f287e7` fixes the space-home
parent parameter and disposable-save root selection. Main is pushed.
Infra main `f847cc8` is pushed and supplies `charts/dts-wiki`, chart-spec v1 checks and an excluded local kind
fixture harness. The chart owns external PG/OIDC connection Secrets, a retained
single-writer PVC, one Recreate application replica, migration hooks, Gateway API
business routing, internal management Service and optional ServiceMonitor.

No applied migration changed. Common Pack remains pinned at 1.1.0. Wiki contains
no product documents, content inventory or credentials. Source/fixtures do not
change the existing `.50` runtime, identity provider, archived worklogs or assets.

## Product and security checks

[Local Chrome report](WP15-reading-browser.json) records five PASS groups with
zero console errors: outline IDs match Unicode/duplicate headings, collapse and
expand work, the correct repeated heading scrolls into view, SPA revisits preserve
IDs, and direct deep links scroll after asynchronous rendering. Chrome 154 uses
mocked read APIs; it is not real company login or Chrome 95 acceptance.
[Outline screenshot](WP15-reading-outline.png) records the verified product view.

The space-home-to-editor regression now saves beneath the existing root instead
of attempting a second root. Save measurement workers validate the root's native
write permission and never authorize its deletion. Git-owned roots produce no
probe creation. Separate management-origin operator checks send no identity token
to health/info. Git enforces BatchMode and externally pinned host verification.

Runtime testing found and corrected two deployment defects: non-web Boot still
initialized OIDC until migration imports were limited to datasource/Liquibase;
non-root init could not chmod a mount root until keys were staged in an owned
subdirectory and the application mounted that subPath read-only. A directory's
inherited setgid bit does not grant group access; permission checks verify 0700
access bits and UID 1001, plus exactly 0600 key/known_hosts files.

## Definitive source verification

At 2026-10-07 01:10:21 Asia/Shanghai, `./build.sh verify` passed on clean source
`0f287e7`: 25 operator HTTP, 84 frontend, 125 unit and 117 integration tests,
zero Java failures/errors/skips. Integration tests use disposable preloaded
PostgreSQL/pg_bigm containers only. The migration regression covers a fresh
non-web boot with no OIDC client ID, idempotent repeat and disabled-migration
failure. Management tests cover listener separation, forged forwarded ports,
write rejection and unrelated actuator/business paths.

TypeScript, Checkstyle, architecture checks and production JAR/frontend byte
matching passed. Home gzip remains within budget: 293.6 KB JS / 0.5 KB CSS.
Production metadata is `abbrev=0f287e7`, `describe=0f287e7`, without dirty suffix.
JAR SHA-256: `9ac347f442861cfe02a4a50ba6630c291425252d745b170611dc616974434eef`.
The full local log is `/tmp/wp15-canonical-final.log`; the committed verification
summary is [WP15-verification.txt](WP15-verification.txt).

## Kubernetes acceptance and artifact boundary

[Final kind report](WP15-kind-acceptance.json) records all ten PASS groups on
candidate `0f287e7` in 152.8 seconds: fresh and repeated migrations, restricted
boot, listener/API isolation, actual Prometheus scrape, native editing/conflict/
reader isolation, durable draft/history/attachment after Pod replacement,
database outage/recovery without application restart, private read-only Git-key
staging and retained PVC after Helm uninstall. The migration ledger has 40 rows,
and application restart count remains zero. The fixture namespace
`wiki-smoke-d65f353974` was deleted after the checks; existing cluster services
were preserved. No patched deployment was used in this definitive fresh run.
The test uses existing `kind-dts-local` Kubernetes 1.35.8, a randomly owned
namespace, generated OIDC/PG/SSH fixtures and preloaded image layers through the
existing local registry mirror. No cluster-wide registry or middleware settings
are changed. Standard platform CNPG is not claimed compatible with pg_bigm.
Gateway/TLS and policy enforcement are not exercised by default kind networking.

The local AMD64 image candidate is `sprint5-wp15-20261007-r3`, with verified OCI
manifest SHA-256 `493a67fe81ff631bd186469f018f0c476bed8331132725c3c0b30c23e3e735ef`.
Its digest was checked against the registry response, not inferred from an image
ID. The index contains AMD64 plus build provenance, not an ARM application image.
The chart archive is `/tmp/dts-wiki-kubernetes-wp15-20261007/dts-wiki-0.1.0.tgz`,
10 files with no fixture `hack/`, bytecode or credentials; SHA-256
`13193a4e91303615d4629a6cb8715dcce951efc00c27572d8f95f3fae7d074e6`.
`dtsctl chart check` and all chartcheck tests passed. This is a locally verified
candidate, not an HQ-signed complete offline/customer release.

## Remaining acceptance

F7/T27 remains IN_PROGRESS: S3 migration is unfinished. The deployment currently
requires one replica; distributed sessions/presence/storage need another design.
HQ signed multi-architecture publication, actual PG provider extension support,
Gateway/TLS/SSO, enforced network policies/egress restrictions, representative
scale/NFR, backup/restore and previous-binary compatibility remain open.

GitHub Actions run [37501600148](https://github.com/billyhotjava/dts-wiki/actions/runs/37501600148)
for exact source `0f287e7` is queued as observed at 01:12 Asia/Shanghai; no CI PASS
is claimed. Local tests are complete independently of that runner queue.

The latest selected-key probe below supersedes WP14's content-repository
rejection. Target-machine root authorization remains unresolved. No `.50` access
was assumed, no production deployment/cutover occurred, and no old version/content
deletion occurred without an identified scope and access.

## Coordination gates

`check-boundaries.py` passed: 3,129 source/build files and 67 active Stack
changelogs checked. Content lint passed: 3 spaces, 608 files, 149 frontmatter
files, 2 sealed archives, zero errors. Archive content and applied migrations
remain intact. Module changes and evidence are recorded in their owning repos.


## Public-key display follow-up: chart 0.1.1

Infra main `13b8a4f` is pushed. The final chart version is **0.1.1**. Init derives `content.key.pub` from the
externally supplied private key and stages it with owner-only permissions before
the application mounts the directory read-only. The existing administrator
public-key endpoint can then read the matching key without trying to create a new
keypair on that mount. No new Wiki binary or external SSH/Git authorization changed.

[Final public-key kind report](WP15-kind-public-key.json) records **eleven PASS
groups**, including the configured-key administrator read, all previous lifecycle
and permission checks, and preserved PVC after uninstall. Exact application commit
remains `0f287e7`; elapsed time is 147.7 seconds. Fixture namespace
`wiki-smoke-b85e7f7d46` was cleaned up. The earlier 0.1.0 report/package remains
historical evidence; this verified 0.1.1 candidate supersedes it for installation.

The final archive is `/tmp/dts-wiki-kubernetes-wp15-20261007/dts-wiki-0.1.1.tgz`,
SHA-256 `9895930a8f7a6ade662b00d85bba90c4fcecc3226de5ce005330dc7b1aac6341`.
Chart-spec and chartcheck tests pass; the package excludes fixtures and credentials.
External authorization is assessed separately in the selected-key probe below.

## Selected-key access follow-up

At 2026-10-07 01:29 Asia/Shanghai, fresh read-only probes used BatchMode,
StrictHostKeyChecking, IdentitiesOnly and IdentityAgent=none with explicit keys:

- Target login with the existing host key to `root@10.20.0.50` exited 255 with
  `Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password)`.
  No command executed on the target.
- `git ls-remote git@github.com:billyhotjava/dts-rdc.git refs/heads/main` with
  the dedicated external content key `dts-wiki-content-20261006` exited 0 and
  returned `0b0c9f33fa63bd6d489e68b572bfe99fe976c443 refs/heads/main`.
  This proves repository read access with that selected key. It supersedes the
  earlier content-key rejection; it does not establish its write privileges.

No key material was printed and no remote configuration changed. Target-runtime
Secret provisioning, real content import/update latency and company identity
acceptance remain unverified. No production deployment or old-content cleanup
occurred.

Final coordination checks after chart 0.1.1 passed: boundary validation covers
3,129 source/build files and 67 active Stack changelogs; content lint covers
3 spaces, 609 files, 149 frontmatter files and 2 sealed archives with zero errors.
