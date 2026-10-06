---
type: evidence
id: S5/Wiki/WP14-runtime-access
covers: [S5/F2/T08, S5/F4/T03, S5/F5/T07, S5/F5/T10]
result: PARTIAL
title: SSH authorization diagnosis and representative acceptance probes
date: 2026-10-06
status: IN_PROGRESS
---
# SSH authorization diagnosis and representative acceptance probes

## Selected host-login key

Read-only checks from the build host on 2026-10-06 establish that the local
ED25519 private/public key pair matches. The private key is owner-readable only
(0600), the SSH directory is 0700, and strict known-host verification succeeds.
The remote banner is OpenSSH 8.0. TCP connection, Curve25519 key exchange and
ED25519 host verification succeed; the explicitly selected public key is
offered and rejected before the signature stage for `root@10.20.0.50`.

| Observation | Actual value |
| --- | --- |
| External login public file | `/home/devops/.ssh/id_ed25519.pub` |
| Login fingerprint | `SHA256:0vWu5fWgyYnsS4dXXMxu8ik1A0iCvuO1/2CdMNfn43w` |
| Verified target host fingerprint | `SHA256:VgF9YsR0s/EcZ3QrL/a1NTWM55xkmDQ2g6LCSyradlo` |
| Explicit selected-key offer | true |
| Selected-key acceptance / authentication | false / false |
| Classified stage / result | SERVER_KEY_REJECTED / GAP |

The empty agent is not the cause established by these observations: the server
has already rejected the public offer before any private-key signing attempt.
The exact remote cause remains unverified. Missing/wrong authorized-key source,
account policy, file ownership/mode, key restrictions or SELinux enforcement
require server-side evidence. No sshd configuration, key, account or service was
changed; no remote command executed. The user confirmed that the approved target
account is root. The remaining prerequisite is existing console/administrator
access to inspect the rejection or install the approved public key at the
effective authorization source; sanitized target logs were requested.

Infra commit `44b1f98` owns the reusable, bounded selected-key probe and
[server-side diagnosis/repair runbook](https://github.com/billyhotjava/dts-infra/blob/44b1f98146d117ea81259d22c6b9ba9affb808cd/deploy/ssh/README.md).
The probe retains strict host checking, limits execution to 20 seconds, permits
only public-key authentication, disables forwarding/connection reuse and runs
only `id -u` after successful login. It reports classifications/fingerprints,
never raw logs, public comments or key material. Nine isolated tests passed.
The actual target retry reproduced SERVER_KEY_REJECTED. Existing unrelated Infra
WireGuard work and its commit history were preserved.

## Separate content-repository key

A read-only `git ls-remote` HEAD attempt against `billyhotjava/dts-rdc` used only
the external dedicated content identity, strict host verification and no prompts.
It offered fingerprint `SHA256:UoyuEy0YtZp/e6LrM/ncLra8Vuv19v1qrifd965hezY`, but
GitHub rejected it before signing. Repository read access remains GAP. This is
separate from host SSH login; neither key can substitute for the other.

Register `/home/devops/.ssh/dts-wiki-content-20261006.pub` as the approved
repository's read-only deploy key, with Allow write access disabled. Record the
actual setting separately: a successful read alone cannot prove read-only policy.
The available GitHub connector has no deploy-key administration capability, and
no external GH_TOKEN/GITHUB_TOKEN or Git credential helper is configured. No key
was registered, no write attempt was made, and no private material was copied to
source, evidence or toolkit.

## Acceptance improvement and actual runtime/CI state

Wiki commit `28f9622` adds token-free `--public-only` health/readiness/version/
anonymous checks. Successful public checks report PARTIAL and keep identity
acceptance GAP. Expected-commit checks reject dirty build metadata. An actual
probe against port 18091 passed health, readiness and anonymous API rejection,
and failed the r2 expected commit `688d6b9`. The earlier public metadata remains
`345083e-dirty`; no target deployment occurred. The prepared r2 image was inspected
without starting it: embedded Git metadata is clean `688d6b9`.

The save benchmark accepts `--save-content-file` only with an explicit disposable
`--save-space`. It validates a nonempty regular UTF-8 file up to 1,000,000 bytes
before network access, preserves the body and adds a changing revision comment.
Only body size/SHA-256 and maximum revision size reach the report. Existing
ownership validation, exact base versions and own-page soft cleanup remain.
Representative UTF-8, invalid/missing/oversized content, absent write authorization,
dirty metadata and public-only status tests passed: 22 isolated HTTP cases total.
These are harness checks, not runtime latency or identity acceptance. No business
API, application/UI source or migration changed; the prior canonical application
verification is unchanged and was not repeated for operator-only changes.

The GitHub connector now provides actual Actions evidence. The first run
[`37420271477`](https://github.com/billyhotjava/dts-wiki/actions/runs/37420271477)
at `452021b` was observed queued. The main push at `28f9622` superseded it through
the configured concurrency policy; its final status is cancelled. The current run
[`37434648851`](https://github.com/billyhotjava/dts-wiki/actions/runs/37434648851)
is queued with no conclusion. There is no successful Runner execution result.
This supersedes WP13's inability to inspect Actions through the local `gh` CLI;
Runner registration/access still belongs to Infra S2/F2-T08.

## Reviewable handoff and remaining prerequisites

The new operator toolkit is `/tmp/dts-wiki-acceptance-wp14-20261006`, archive
`/tmp/dts-wiki-acceptance-wp14-20261006.tar.gz`. It includes Wiki tools/guides,
the Infra SSH probe/runbook, a neutral plan, separate source identities, an
access plan and the two public keys with nonpersonal comments. All 12 internal
SHA-256 entries passed. The 17,800-byte archive's SHA-256 is:
`89268b3da39f580c1d11dd5faa361ac20c21fdf8948f70b46d806b333972941b`.
Public fingerprints were revalidated after export. No private key, token, runtime
environment file or company document body is included. The original r2 application
image bundle is retained unchanged; this archive has no application images.

The approved host account is confirmed as root. Remote authorization diagnosis/
repair and read-only deploy-key registration still require existing administrator access.
Once established, follow [the release plan](../../assets/wiki-release-plan.md)
to inspect v2, verify backup/isolated restore and perform additive deployment
and real identity/import/performance acceptance. Database reset and proxy cutover
are separate scoped decisions. F2/T08, F5/T07 and F5/T10 remain IN_PROGRESS.
[Verification summary](WP14-verification.txt) records local and remote outcomes.
