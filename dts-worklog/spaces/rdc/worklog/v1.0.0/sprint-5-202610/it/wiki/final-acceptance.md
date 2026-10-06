---
type: evidence
id: S5/Wiki/final-acceptance
covers: [S5/F2/T13, S5/F3/T17, S5/F4/T03, S5/F5/T10]
result: PARTIAL
title: Source completion and runtime acceptance register
date: 2026-10-06
status: IN_PROGRESS
---
# Source completion and runtime acceptance register

## Reviewed source scope

Wiki main is688d6b9 and Infra main is9cda723, both pushed. This session
merged and removed ten Wiki branches and two Infra branches, preserving the
separateS2 worktree and user files. Infra changes arebc65ebd and9cda723. No product content, credentials or fixed space
inventory were added to Wiki/Common. Git commands remain in the sync package.
A byte comparison against baseline11d01d5 passed for all33 existing changelog
files; only9006,9007 and9008 were added, with master includes. No current Java,
frontend, dependencies, deployment config or module guides retain JHipster.
Legacy migration authors and identity table names remain immutable evidence.

| Work package | Source/local result | Runtime remainder | Evidence |
| --- | --- | --- | --- |
| WP1 company foundation | Baseline and replacement framework/configuration complete; com.yuzhi namespace | Real configured boot/login | [WP1](WP1-baseline.md) |
| WP2 manifest inbound | Whole manifest validation, captured commit, root scope, reconcile, import and Git read-only | Three real spaces, history and increment within1min | [WP2](WP2-manifest-inbound.md) |
| WP3 source ownership UI | Native edit and Git read-only routes/actions verified | Real authenticated accounts | [WP3](WP3-read-only-ui.md) |
| WP4 space roles | Infra manifest-driven idempotent roles/groups script prepared | G2 membership confirmation and authorized real identity reconciliation | [WP4](WP4-space-roles.md) |
| WP5 deployment | Final r2 offline bundle prepared; target deployment pending | G0 SSH, G3 database approval, G4 readonly key | [S4a](S4a-sync.md) |
| WP6 structured query | Scoped filters/pagination, board, private llms.txt, raw Markdown complete; formatter nowWP10 | Real content/SSO acceptance | [WP6](WP6-structured-query.md) |
| WP7 retrieval/history | pg_bigm, attachment-name search, immutable history/diff/restore and activities complete | Scale/performance and deployed browser acceptance | [WP7](WP7-search-history.md) |
| WP8 personal MCP | Personal OAuth metadata/protocol, eight tools, permissions, native writes, diagrams complete | Real agent registration/consent and personal token | [WP8](WP8-personal-mcp.md) |
| WP9 operations | Tracked Compose/release/backup/restore, alerts/runbook and external legacy aliases prepared; isolated restore rehearsal passed | Real backup, rollback compatibility, proxy cutover and G5 | [WP9](WP9-release-operations.md) |
| WP10 editor/tools | Shared formatter, opaque diagram bundles, fallback and real editor fixtures complete | Real build/import/browser acceptance | [WP10](WP10-diagram-editor.md) |
| WP11 collaboration | Private favorite/recent views, comments/replies, mute/watch, current role checks, durable notices/mail worker complete | Readonly IdP credential, actual roles and verified SMTP | [WP11](WP11-collaboration.md) |
| WP12 continuity/review | Private drafts, stale-base recovery, presence, bounded diff, atomic title/body, metadata fences, scoped trash and corrected bundle gate | Deployed concurrency/editor acceptance | [WP12](WP12-editing-continuity.md) |

Source completion does not close F5/T10 runtime DoD. Archived outbound and conflict
cardsF4/T04,T06 remain DRAFT under inbound-only D10 A-prime. Product-realm packaging
F7/T27 remains the explicitly excluded product deployment shape in the handoff.
Current performance targets and honest gaps are in [the budget](../../assets/nfr-budget.md).

## Runtime gates

A final read-only SSH probe on2026-10-06 again returned Permission denied for
root@10.20.0.50. No command executed there. No database, company Keycloak, live
18090 Wiki, Jira or proxy was changed. No key/credential was stored in source.

| Gate | Pending concrete prerequisite | Impact |
| --- | --- | --- |
| G0 | Install the build host's public SSH key for the approved target access | Cannot inspect/preflight/upload v2 |
| G2 | Confirm membership for each manifest space and privileged test accounts | Cannot assign or prove real permission matrix |
| G3 | Explicitly approve backup, restore verification and reset of only the v2 acceptance database | No destructive reset is authorized by generic continuation |
| G4 | Externally provision one readonly GitHub content key and known_hosts | Cannot prove authenticated content fetch/import |
| G5 | Confirm the domain cutover/rollback window | No proxy change authorized |
| Collaboration | External readonly current-identity credential; optional verified SMTP | Real mention/notification/mail acceptance pending |

After gates pass, inspect the actual v2 state first, record counts and image IDs,
run the backup and isolated restore check, then perform only the approved reset
and deployment. Stop if actual data differs from the expected acceptance-only
fixture or restore verification fails. Record allowed/denied accounts for all
manifest spaces, personal MCP,1min inbound visibility, native edits/conflicts,
diagrams, collaboration and large-scale measurements. Cutover stays separate.

## Verification before final validation update

The initial canonical release gate at72405ec passed80 frontend tests,121 Java
unit tests and114 integration tests, all without failures/errors/skips. Its
production JAR matched every verified frontend asset. The corrected recursive
home budget measured293.5KiB JS and0.4KiB CSS. Real roundtrip fixtures all passed.
The first offline image bundle was produced locally without target operations.
A final small review aligns native-create/MCP size declarations with save limits,
returns400 for oversized titles, and safely copies200-character Unicode titles.
The final r1 bundle gate reruns this commit with one additional integration case.
Infra adapter tests also passed: four manifest/role cases and three personal
agent cases using a stateful kcadm fake; they do not establish real identity setup.

A dedicated readonly-content keypair was prepared only in external SSH storage.
Its public file is/home/devops/.ssh/dts-wiki-content-20261006.pub, fingerprint
SHA256:UoyuEy0YtZp/e6LrM/ncLra8Vuv19v1qrifd965hezY. No key was uploaded or
registered, and no private bytes were printed or copied to source/evidence.

Local browser fixture binary wasGoogle Chrome154.0.8037.97. Customer-browser
interoperability is not inferred from that version. The only remaining unrelated
Infra branch,feat/S2-dev-delivery, is checked out in another worktree and retained
with its user work. Source package/brand and33 historical migration-byte checks
passed; boundary and content lint also passed with two sealed archives untouched.

## Definitive local release verification

At2026-10-06 03:04 Asia/Shanghai, the final canonical gate completed at688d6b9:

- Frontend:80 tests in13 files, including all20 real-editor roundtrips; no failures
  or unhandled errors. TypeScript and production build passed.
- Backend:121 unit tests and115 integration tests,236 total; zero failures, errors
  and skips. Checkstyle, Modernizer and architecture gates passed.
- Production JAR: every frontend asset matched the tested dist bytes.
- Home static closure:293.5KiB JavaScript and0.4KiB CSS gzip. The editor is dynamic.
- Infra: four manifest/role and three agent-registration adapter cases passed.
- All33 historical changelog files were preserved byte for byte. Boundary and
  content checks passed; both sealed archives remained unchanged.
- The dedicated fixture benchmark validated read-only auth/worker execution and
  insufficient-scale rejection only; no deployment latency claim is made.

The final offline bundle is/tmp/dts-wiki-release-sprint5-20261006-r2, tag
sprint5-20261006-r2, source688d6b966ac9bbb9bdad11dc6bb63e2b823a696d. All eight
SHA256SUMS entries passed revalidation. The saved images archive is358MiB and
contains no runtime.env, credential or deploy key. The older72405ec bundle is
superseded for deployment; no r1 bundle exists.

Images archive SHA-256: `80ab7439309390cee9ae8588a8468f9db35c4198baaba969ffeabd89760579e5`.

Application image ID: `sha256:5093a0d01196f783f1a0537e206571a98456ba38542e2b24d775bb2735da3ce9`.

Database image ID: `sha256:64e356a00a525c827a3c0680633cb7e3f0380fb65cbfa628b82577c2dbbf2b4e`.

Source, artifact and fixture results are complete. The evidence remainsPARTIAL
because real runtime/identity/SMTP/scale/backup/cutover acceptance is pending.
The temporary browser/Vite processes and baseline worktree were removed; the
temporary Docker ACL is removed after artifact preparation. Public keys remain
in external SSH storage for the outstanding gates.

## WP13 follow-up: executable acceptance and actual runtime version

The subsequent user-authorized continuation added identity/permission/MCP smoke,
explicit deployed-commit checks, controlled owned-page save probes and trusted
Runner CI. Sixteen isolated HTTP cases passed. Canonical verification and the
operator toolkit are tracked in [WP13](WP13-runtime-acceptance.md).

Actual public HTTP probes now establish that existing v2 health/readiness are UP,
anonymous protected API reads return 401, and the login entry redirects to company
SSO. Its version metadata reports `345083e-dirty`, not the r2 candidate. SSH still
rejects the current build host. These new observations supersede any assumption
that a healthy v2 is already the verified new release; no deployment occurred.

Runtime/identity/data/SMTP/scale/backup/cutover acceptance remains PARTIAL under
[the concrete release plan](../../assets/wiki-release-plan.md). The original r2
image archive and its checksums remain the prepared application candidate.

WP13 canonical verification passed 16 operator/80 frontend/121 unit/115 integration
cases, plus the JAR/frontend byte check and unchanged bundle budget. Wiki main
`452021b` is pushed; its separately checksummed operator toolkit is ready. The
existing r2 application bundle remains the runtime candidate. See WP13 for
source/build provenance, artifact checksums and the unresolved real CI/access gates.

## WP14 follow-up: isolated key rejections and representative probes

Infra `44b1f98` adds selected-key SSH diagnostics and a server-side runbook. Actual
host/public-key matching and explicit offer checks isolate remote authorization
rejection for root; the separate GitHub content key also remains rejected. Wiki
`28f9622` adds public-only checks, dirty-build rejection and representative external
Markdown save measurements. All 22 operator HTTP and 9 SSH cases passed. The
prepared r2 image has clean `688d6b9` metadata; actual v2 still fails its expected
release assertion. No remote configuration or deployment occurred.

Actions can now be inspected through the GitHub connector: the current run is
queued, and the superseded run was cancelled by concurrency. No real CI PASS is
claimed. The updated checksummed operator toolkit includes the two public keys
and no private material. See [WP14](WP14-runtime-access.md) for actual outcomes,
artifact provenance and the administrator-access prerequisites that remain open.


## WP15 follow-up: lightweight reading and local Kubernetes acceptance

Wiki main `0f287e7` and Infra main `f847cc8` are pushed. Stable per-document
heading anchors, a collapsible outline and the corrected space-home creation
parent now support the lightweight knowledge workflow. The single-replica chart
uses external PG/OIDC contracts, a retained PVC, migration Job and separate
internal management listener. Source verification passed 25 operator, 84 frontend,
125 unit and 117 integration cases, plus production asset/metadata checks.

The final AMD64 candidate passed ten real local kind groups, including an actual
Prometheus scrape, native edits/conflicts/reader isolation, Pod replacement with
draft/history/attachment retention, dependency outage/recovery with zero app
restarts, private read-only Git key staging and PVC retention on uninstall. The
fixture namespace was cleaned up. Five local Chrome reading checks passed with
no console errors. These prove local deployment mechanics, not company identity,
customer Gateway/TLS/CNI, scale, backup restore or cutover.

S3 and multi-replica support remain open; HQ signing/ARM publication and actual
site PG extension compatibility remain release prerequisites. The exact Wiki
Actions run remains queued, and the earlier server-side SSH/content-key rejection
has not changed. No `.50` deployment or old-version/content deletion occurred.
See [WP15 evidence](WP15-kubernetes-reading.md) for final digests and actual reports.
