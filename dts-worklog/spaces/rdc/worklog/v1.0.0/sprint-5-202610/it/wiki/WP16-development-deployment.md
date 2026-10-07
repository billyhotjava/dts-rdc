---
type: evidence
id: S5/Wiki/WP16-development-deployment
covers: [S5/F5/T07, S5/F2/T08, S5/F2/T10, S5/F2/T11]
result: PARTIAL
title: Development Wiki architecture review and target deployment preflight
date: 2026-10-07
status: IN_PROGRESS
---
# Development Wiki architecture review and target deployment preflight

## Requested runtime

The user explicitly requested a development Wiki on `10.20.0.50`, using the
Keycloak already running on that host. Runtime deployment is authorized by this
request. Existing data must be inspected before selecting an additive upgrade;
database reset and old-instance deletion are not part of this operation.

The documented development target is `/data/dts-wiki-v2`, application port
18091. The older Wiki on 18090 and the shared identity service remain separate.
The live host's Compose configuration, storage and image IDs cannot yet be
inspected because SSH authentication fails.

## Reviewed architecture

Sources reviewed include Wiki `README.md`, `docs/operations.md`,
`docs/kubernetes.md`, `deploy/compose.yml`, authentication and authority-mapping
code, the active company-owned/inbound synchronization designs, Infra
`deploy/sso/compose.yml`, SSO adapters and `deploy/ssh/README.md`.

| Responsibility | Current contract | Deployment implication |
| --- | --- | --- |
| Application | Spring Boot 4, Java 25, bundled React UI | One application image; no separate frontend service is required. |
| Wiki persistence | Dedicated PostgreSQL with pg_bigm; pages, immutable versions, drafts and collaboration | Inspect the existing database and migration ledger; never use the Keycloak database. |
| File persistence | Attachment blobs and Git working copies | Preserve and back up the existing directories; container UID 1001 needs the documented access. |
| Content input | External Git repository and `dts-worklog/spaces.yml`, pinned Common Pack 1.1.0 | Provision the dedicated repository key and pinned known_hosts externally; imported content remains read-only. |
| Identity | Keycloak OIDC browser sessions and audience-validated bearer tokens | Keep the issuer's published HTTPS URL, exact browser callback and existing approved role grants. |
| Kubernetes delivery | Infra chart 0.1.1, ordered migration Job, retained PVC, internal management port 9091 | Use one replica/Recreate; qualify site PG extensions, storage and TLS before migration to Kubernetes. |

Compose uses the `prod` profile with startup migrations. Kubernetes uses
`prod,kubernetes` with a separate migration Job and disabled application
migrations. These are distinct deployment entry points for the same verified
binary. No applied migration body/checksum is changed by this operation.

## Actual public preflight

Observed on 2026-10-07 around 09:53 Asia/Shanghai:

- `http://10.20.0.50:18091/management/info` returned 200 and identified the
  running source as `345083e-dirty`, branch `feat/W1-scaffold`, build time
  `2026-09-27T00:54:26.563Z`, profile `prod`. It is not the new candidate.
- Health, liveness and readiness returned 200 with status UP. Anonymous
  `/api/wiki/spaces` returned 401.
- The Keycloak discovery endpoint on `.50:18081` returned 200 and declared
  issuer `https://sso.yuzhicloud.com/realms/yuzhicloud`. Discovery at that
  canonical HTTPS origin also returned 200. Do not replace the configured issuer
  with the internal HTTP address; it would differ from the provider's issuer.
- The existing development Wiki authorization endpoint returned 302 to that
  realm with client `dts-wiki`, code flow and callback
  `http://10.20.0.50:18091/login/oauth2/code/oidc`.
- Direct authorization requests for that exact development callback and the
  existing `https://wiki.yuzhicloud.com/oauth2/callback` both returned 200 with
  the Keycloak login form. Neither returned an invalid-redirect error.

These are unauthenticated routing/discovery checks, not a completed user login.
No OAuth code, token, cookie value or credential is retained in evidence.

The historical realm bootstrap replaces callback lists and migrates legacy
roles. Do not rerun it for this deployment. The browser callback currently passes;
inspect existing client configuration first and preserve old callbacks, secrets
and memberships. Wiki maps the `roles`/`groups` claims to reader/editor/admin and
manifest space authorities. Verify the client-role mapper includes the roles
claim in UserInfo, ID tokens and access tokens; login routing alone does not
prove space authorization.

## Access result

The owning Infra selected-key probe for root used the externally configured
deployment identity `/home/devops/.ssh/id_ed25519_dts_e2`:

- Fingerprint: `SHA256:OzaRe2k5vcrdgPYvoOxeWMB5aU7sIi/xLCsl7tg2aas`.
- Connection established, known-host verification passed, selected key offered.
- Selected key accepted: false; authenticated: false.
- Result GAP, stage `SERVER_KEY_REJECTED`, probe exit 1. Direct SSH exited 255.

The ordinary configured `dts-e1` alias also failed. The local password-store
inventory reported no store; no password or private key was requested in chat.
The public-key handoff was sent to the user for installation through existing
authorized access. The current probe takes precedence over documentation's
earlier generic access claims. No command executed on the target and no target
configuration changed.

## Prepared artifact and local proof

The new private local bundle is
`/tmp/dts-wiki-release-sprint5-20261007-r3`. It reuses Wiki source
`0f287e79790e6c3fb57fb496dc3c3954852de245`, whose 351 source tests and eleven
kind groups are recorded in [WP15](WP15-kubernetes-reading.md). Source and JAR
remain unchanged; JAR SHA-256 is
`9ac347f442861cfe02a4a50ba6630c291425252d745b170611dc616974434eef`.

Application tag: `dts-wiki-app:sprint5-20261007-r3`. Its verified source image
manifest is `sha256:493a67fe81ff631bd186469f018f0c476bed8331132725c3c0b30c23e3e735ef`.
The bundle also contains the preloaded `dts-wiki-db:18-bigm` candidate,
Compose templates, backup/restore helpers, source/image metadata and checksums.
It contains no live `.env`, login credential or content key. Source-image
identity was checked before retagging; all eight bundle checksums passed.

`images.tar.gz` is 386,817,649 bytes; SHA-256:
`78f438cef55822f53c05163525b96793bc59c45e0d5cd2fb743c2c17a2faa5ae`.
The saved Docker manifest contains both expected tags, Linux AMD64 configs and
the application's `wiki` user. Loading on the actual target remains pending.

Local `docker compose config --format json`, using disposable placeholder
configuration, passed. Selected effective fields are project `dts-wiki-v2`,
application port 18091 to 8080, no published database port, `prod` profile,
the canonical realm issuer, client `dts-wiki`, and outbound sync false.
The placeholders were removed and no real environment configuration was printed.

## Execution after access is restored

1. Inspect only the Wiki/Keycloak service identities, safe effective connection
   fields, image IDs, Wiki counts, migration ledger and file ownership. Confirm
   host architecture and database major version before loading or selecting images.
2. Capture a consistent Wiki database/attachment backup and verify an isolated
   restore with the existing helpers. Preserve current Compose/image selections.
   If the live DB does not match the prepared PG major version, retain the live
   DB image and revise the application-only deployment instead of upgrading it.
3. Reuse the existing Keycloak realm/client and external client secret. Inspect
   the role/audience mappers and approved memberships; repair only a proven
   missing Wiki contract without replacing existing callback lists or grants.
4. Provision the dedicated content key, matching public file and known_hosts
   externally for UID 1001; verify repository read access with strict host checking.
5. Verify transferred bundle checksums, load the approved images and start only
   the development Wiki with the documented helper or an inspected application-only
   override. Check readiness and deployed source `0f287e7` before opening it for use.
6. Verify a real browser login against the shared Keycloak, allowed/denied space
   access, content import, native edit/version, search and attachment behavior.
   Record the target results separately from local source/kind evidence.

Runtime deployment remains incomplete solely at the currently observed SSH
access boundary; later database/identity acceptance must still be measured after
access. No public proxy cutover or old-version/content cleanup has occurred.
