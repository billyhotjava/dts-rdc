---
type: evidence
id: S5/Wiki/WP17-development-runtime
covers: [S5/F5/T07, S5/F2/T08, S5/F2/T10, S5/F2/T11]
result: PASS
title: Development Wiki deployment and shared Keycloak acceptance
date: 2026-10-07
status: DONE
---
# Development Wiki deployment and shared Keycloak acceptance

## Completed scope

The requested development Wiki is running at `http://10.20.0.50:18091`, under
`/data/dts-wiki-v2`, using the existing company Keycloak. The selected root SSH
identity was accepted after the user installed its public key. This supersedes
the access boundary observed in [WP16](WP16-development-deployment.md).

Only the v2 application was upgraded. The live PostgreSQL 18.6 image, container
and storage were retained. Original Wiki 18090, Jira, Keycloak, Docker daemon,
host DNS/firewall and public website proxy were not replaced or reconfigured.
Container IDs for the retained database, shared Keycloak and older Wiki services
match the inspected pre-upgrade instances. Final app and DB restart counts are 0.

## Artifact and runtime identities

| Item | Verified value |
| --- | --- |
| Application source | `0f287e79790e6c3fb57fb496dc3c3954852de245`, clean build metadata |
| Application tag | `dts-wiki-app:sprint5-20261007-r4` |
| OCI index | `sha256:493a67fe81ff631bd186469f018f0c476bed8331132725c3c0b30c23e3e735ef` |
| Loaded Docker image config ID | `sha256:a23e44bf4239b4b1600278b7639b106a5a69614a4f305cc4e03b3c845adb4dda` |
| Retained database image ID | `sha256:035e74c24b1bfc67ff01cc35d3d9854f7c97490b3626d8c07f60617db19b0f0b` |
| JAR SHA-256 | `9ac347f442861cfe02a4a50ba6630c291425252d745b170611dc616974434eef` |
| App-only image archive | 226,345,357 bytes; SHA-256 `c42c6733ac0f3e6687fa8ad1f4b4fee49ab9fec47e29dccb8069df2ab4ff2631` |
| Operator source | Wiki `d0d25b5`; no Java/frontend binary change |

The r4 app-only bundle passed all eight checksums before transfer and on the
target. It is retained at `/data/dts-wiki-v2/releases/sprint5-20261007-r4`.
The prepared r3 database candidate was PostgreSQL 18.4; it was neither loaded
nor selected over the live 18.6 database. OCI index and Docker config IDs identify
different artifact levels and are recorded separately.

The application-only rollout used `docker compose up -d --no-deps --pull never
wiki-app`. The live override pins the retained DB image, application tag and
`dts-wiki` bearer-token audience. External `.env` remains outside Git and evidence.
Readiness and health return UP; `/management/info` reports `0f287e7`, and anonymous
Wiki API access returns 401.

## Data retention and recovery proof

The pre-upgrade backup is
`/data/dts-wiki-v2/backups/wp17-20261007-preupgrade`. It contains a consistent
DB dump, attachment archive, counts, image identity and checksums. Private runtime
configuration escrow stays on the target and was not copied into source/docs.
Initial counts were 3 pages, 1 version, 0 attachments and 35 applied changesets.

The restored database used the exact preloaded live image in a disposable
container with no network and no published ports. Counts, pg_bigm, blob digests
and attachment references passed. A second isolated restored fixture applied
the candidate migrations: 35 became 40, the original 35 checksums were identical,
and all original page/version/attachment rows were preserved. Both owned fixtures
were removed. No applied migration body or checksum was edited.

The original native spaces `1050/dts` and `1100/prs` had no Git source or sync
roots. The manifest collision guard correctly refused automatic adoption.
Their original metadata and native row digests were saved in the private backup;
a guarded transaction assigned only those two verified spaces the configured
repository and branch. The normal reconciler then applied roles and import roots.
Original page IDs 1150, 1200 and 1250 and the original page version retain identical
row digests. Native content remains writable outside Git-owned mounts.

## Shared Keycloak and real browser acceptance

Canonical issuer remains `https://sso.yuzhicloud.com/realms/yuzhicloud`, served by
the existing Keycloak on .50. Client `dts-wiki`, its external secret, callback
lists, audience and roles mappers were preserved. The missing `space-rdc` client
role was added and granted to the existing R&D group, which already held `editor`.
Existing real users and group memberships were not changed. The historical
realm bootstrap was not rerun.

Three disposable identities exercised actual Keycloak browser login and the
development callback. Ten checks passed with no browser runtime exceptions:

- R&D developer sees only `rdc`; native creation, save, stale-write 409,
  immutable history and version restore pass.
- Native attachment upload/download preserves bytes; content search and the
  rendered heading outline pass.
- Imported Git content rejects writes with 409.
- R&D reader sees only `rdc` and receives 403 on native writes.
- An unassigned identity sees no space and receives 404 for `rdc`; R&D identities
  also receive 404 for another product space.

All three temporary SSO users were deleted. The owned attachment was deleted and
the owned native page soft-deleted, retaining its immutable acceptance history.
The report contains no credentials, cookies or tokens:
[browser report](WP17-site-browser.json),
[live native reading screenshot](WP17-live-native-page.png).

## Content identity correction and transport

The earlier WP15 dedicated-key success was incorrectly attributed: a configured
developer identity could also be offered. The isolated probe with `ssh -F
/dev/null`, `IdentitiesOnly=yes`, `IdentityAgent=none` and the dedicated content
key returned `Permission denied (publickey)`. This supersedes that key attribution;
host deployment access and repository import are separate identities.

The manifest repository is public, so this runtime uses anonymous HTTPS at
`https://github.com/billyhotjava/dts-rdc.git`. No content private key, personal
GitHub key, agent or token was copied into Wiki. TLS verification remains enabled.
The resolver-selected GitHub peer `20.205.243.166` timed out on this host. A
verified GitHub peer succeeded; the Wiki-only external Git setting temporarily
uses `http.curloptResolve=github.com:443:140.82.112.3`. Remove this override after
normal DNS-route reachability is repaired. No global network setting changed.

A verified snapshot seeded working copies at content commit
`9e23bdf8d5a5520a22d0571ec7cd61fe01dbd356`; subsequent real HTTPS fetches succeeded.
All five roots across three manifest spaces report OK at that commit.
Two samples 40 seconds apart show a later successful fetch for every root and
unchanged counts: 616 pages, 943 versions and 24 attachment records. The counts
include retained deleted acceptance records; 23 attachments are active. See
[unchanged-cycle report](WP17-unchanged-cycle.json).

## Operator corrections and remaining release scope

The first application start exposed a separate Liquibase connection without its
password. Removing `SPRING_LIQUIBASE_URL` lets Boot reuse the primary datasource;
the corrected final container is stable. The isolated restore found a helper
query using `sha256` instead of the schema's `sha_256`; the corrected checker
passed against the restored backup. Compose also configures the Wiki audience.
Rendered Compose credentials/audience/ports and shell syntax pass. Boundary
verification checks 3,129 source/build files and 67 active Stack changelogs.
Content lint reports three spaces, 614 files, 151 frontmatter documents, two
sealed archives and zero errors.

Corrected operators were installed separately at `releases/sprint5-20261007-r4/
operators-wp17`, with four passing checksums; the original artifact stays immutable.
Python is absent on the runtime host, so the restore checker ran from the trusted
build host with copied artifacts and an explicit remote Docker wrapper. It used
only preloaded, disposable target containers. The Wiki operations guide records
this path, public HTTPS deployment and the scoped legacy adoption procedure.

This closes the requested development deployment and basic real SSO/data
acceptance. Kubernetes chart 0.1.1 and its eleven local kind groups remain the
future deployment path, with separate migration Job, one replica and retained
storage. The .50 development runtime currently uses Compose. Customer cluster
PG extensions/storage/Gateway/TLS, representative NFR, S3/multiple replicas,
previous-binary read/write rollback compatibility, directory revocation, personal
MCP and optional SMTP qualification remain separate open Sprint work. No public
cutover or old-instance/content deletion was performed by this deployment.

## Final Git transport follow-up

A real newly published content update exposed intermittent direct GitHub routing
after the successful unchanged cycles. The peer pin timed out and did not import
root commit `0850765`; it was insufficient for sustained incremental delivery.
The existing .6 loopback proxy works. Infra `3bcfe46` adds a dedicated, bounded
relay on `10.20.0.6:10819`, accepting only source `10.20.0.50` and forwarding to
the unchanged local proxy on 10818. The unit is enabled at boot, runs as devops
with a 64 MB limit and restarts on failure. It does not modify existing proxy
listeners, SSH policy, host DNS/firewall or .50 services. Two real TCP tests pass,
including a 256 KB bidirectional half-close and source rejection; systemd unit
validation passes. The actual .50 container fully fetched `0850765` through this
relay, while a different source was rejected before upstream contact.

Final external Git settings replace the peer pin with
`http.https://github.com/.proxy=http://10.20.0.6:10819`. This scopes routing to Git
requests for GitHub; the canonical HTTPS URL and certificate verification remain.
Keycloak/DB connections do not use it. The relay is a development dependency on
.6 and its existing proxy, not the customer Kubernetes egress contract. Monitor
service availability and import freshness, and remove the owned relay only after
a full direct fetch and incremental import pass. See the owning
[Infra runbook](https://github.com/billyhotjava/dts-infra/blob/main/deploy/wiki-git-proxy/README.md).

The final proxy runtime reports UP readiness and app restart count 0. All five
roots advanced to published commit `0850765`, and the new WP17 document was
imported. The full ten-check browser suite passed again on the final container;
all original native row digests still match, and the IdP API reports zero
remaining temporary WP17 users. Two owned native acceptance pages and their
attachments were soft-deleted across the successful runs, retaining history.
The [final proxy cycle report](WP17-proxy-cycle.json) shows later successful
fetches with unchanged counts over 40 seconds: 618 pages, 952 versions and 26
attachment records. Wiki `72770f1` documents the final connection; its binary
remains `0f287e7`. The earlier peer-pin observations above are historical, and
this restricted proxy is the final effective Git route.
