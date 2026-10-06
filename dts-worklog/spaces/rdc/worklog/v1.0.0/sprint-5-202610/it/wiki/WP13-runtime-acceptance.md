---
type: evidence
id: S5/Wiki/WP13-runtime-acceptance
covers: [S5/F2/T08, S5/F5/T07, S5/F5/T10]
result: PARTIAL
title: Executable runtime acceptance and refreshed delivery probes
date: 2026-10-06
status: IN_PROGRESS
---
# Executable runtime acceptance and refreshed delivery probes

## Delivered source

Wiki commits `feab3e1` and `452021b` add credential-free-plan permission/history/
search/MCP smoke, a deployed-commit assertion and optional owned-page save
measurements. Save mode explicitly names a disposable space, validates create
ownership, uses exact base versions and soft-deletes only acknowledged probe
pages. Failed cleanup or measurements cannot report PASS; unacknowledged creates
and retained IDs remain in the report. Default latency execution stays read-only.
No business endpoint, migration or content contract changed.

The shared HTTP adapter retains CSRF cookies, bounds requests/responses, rejects
redirects and keeps response bodies/tokens out of reports. Sixteen isolated HTTP
regression cases passed, including failure cleanup, foreign-ID rejection, leaked
space detection, MCP tool errors, wrong deployed commits and insufficient scale.
Fixtures are not real target/identity/performance acceptance.

Wiki CI now invokes `build.sh verify` on the trusted Infra S2 `dts-x86` runner.
Only owning-repository main/feature/fix pushes and explicit dispatches trigger
the shared host; fork PR events do not. YAML/trigger/runner/gate checks passed.
Runner registration and the first real CI execution remain pending F2/T08 and
the owning Infra S2 workstream. Definitive local verification is recorded below.

## Actual target probes

Read-only probes on 2026-10-06, from the current build host:

| Probe | Actual result | Interpretation |
| --- | --- | --- |
| SSH `root@10.20.0.50`, batch/strict host-key/8-second connect limit | Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password) | Cannot inspect images, database, external configuration or install a bundle |
| v2 `/management/health` | HTTP 200, UP | Existing instance is reachable |
| v2 `/management/health/readiness` | HTTP 200, UP | Existing runtime readiness passes |
| v2 `/api/wiki/spaces`, no authentication | HTTP 401 | Anonymous protected API is rejected |
| v2 `/management/info` | Git abbrev `345083e`, describe `345083e-dirty`, build `0.0.1-SNAPSHOT` | Existing instance predates verified r2 `688d6b9` |
| v2 `/oauth2/authorization/oidc` | HTTP 302 to company SSO, realm `yuzhicloud` | Redirect begins; no real login/PKCE/account matrix was executed |
| Existing 18090 `/management/health` | HTTP 302 | Existing HTTP endpoint responds; application health was not established |

Only public health/build/redirect fields were recorded. No remote commands,
database reset, role assignment, content push, proxy change or mail were executed.
The missing target SSH prerequisite was requested from the user while independent
source work continued. Tokens remain external; no credential is in this evidence.

## Runtime remainder and release path

The existing application r2 bundle remains the deployment candidate. WP13 tools
ship as a separate checksummed operator toolkit. Preserve that application's
source/image identity; an updated local build does not install or replace it.

Follow [the runtime release plan](../../assets/wiki-release-plan.md) and Wiki
`docs/acceptance.md`. Real memberships/tokens, the read-only content key,
backup/restore and migration inspection, browser/SMTP/inbound/NFR acceptance and
the separately approved cutover window remain open. F2/T08, F5/T07 and F5/T10
retain IN_PROGRESS; no Feature or runtime gate is closed by these fixtures.

## Definitive local verification and toolkit

At 2026-10-06 13:45 Asia/Shanghai, `./build.sh verify` completed successfully:
16 operator HTTP tests, 80 frontend tests, 121 unit tests and 115 integration
tests, with zero failed Java cases/errors/skips. TypeScript, the 293.5 KiB JS /
0.4 KiB CSS budget, static quality/architecture gates and production JAR/frontend
byte matching passed. The JAR's build commit is `feab3e1`; the subsequent CI-only
trigger/document correction `452021b` passed its YAML/runner/trigger check. No
application or test source changed in that correction. Main is now `452021b`
and was pushed. [Verification output](WP13-verification.txt) retains the summary;
the original local log is `/tmp/dts-wiki-wp13-verify.sfntSX.log`.

The separate operator toolkit is `/tmp/dts-wiki-acceptance-wp13-20261006`, archive
`/tmp/dts-wiki-acceptance-wp13-20261006.tar.gz`, source
`452021bc025a68f8f430b94abdc954cdf2b3cbb3`. It contains three operator Python
files, the formal guide, a credential-free example plan and release properties.
All six internal checksums passed. Archive SHA-256:
`346cf61709716dfacf44cd85cc704d9aeb732d17e7ac57ba3bea01f9496cf259`.
The archive is 9,508 bytes and contains no runtime credentials or private keys.
It names the original r2 application candidate/source separately; it is not an
application image bundle. Temporary Docker socket access was removed after the
canonical gate; existing ACL entries and unrelated source files were preserved.

No runtime/CI completion is claimed. The local host has no `gh` executable, so
an authenticated Actions run/Runner result was not inspected in this session.
