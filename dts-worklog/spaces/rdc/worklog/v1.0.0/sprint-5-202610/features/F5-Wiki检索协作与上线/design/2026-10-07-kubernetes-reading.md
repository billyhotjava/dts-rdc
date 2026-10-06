---
type: page
title: Lightweight Wiki reading and Kubernetes runtime design
---
# Lightweight Wiki reading and Kubernetes runtime

The 2026-10-07 product direction is a lightweight Confluence-style workspace
that will deploy on Kubernetes. Existing space authorization, Markdown editing,
immutable versions, templates, comments, favorites, watches and private drafts
remain the product core. This slice improves long-document navigation and makes
that existing application installable through the owning Infra contracts.

## Scenarios and acceptance

1. A reader visits a long document, selects a Unicode or repeated heading in the
   outline and returns through its deep link. Heading IDs stay stable across
   visits and other documents. Raw Markdown HTML remains disabled.
2. An operator installs the chart using external PG/OIDC contracts. The migration
   Job applies the unchanged changelog and exits before application readiness;
   repeated upgrade is idempotent. Migration failure blocks the new rollout.
3. Kubernetes replaces the Pod. Pages, immutable history and private drafts remain
   in the database; attachment bytes remain on the PVC. No Git key is needed for
   native-only use. Browser login and presence are intentionally ephemeral.
4. PostgreSQL becomes unavailable. Readiness fails, liveness stays healthy and the
   application does not restart because of that dependency. Recovery restores
   readiness. Probes and metrics use an internal listener; only the business HTTP
   listener reaches the Gateway.

5. A user creates a page from the space home. The editor/save request preserves
   the existing root as its parent. Disposable save measurements likewise validate
   a writable native root and create children; they never create a second root or
   authorize deletion of the root.

## Ownership and decisions

| Decision | Reason and consequence |
| --- | --- |
| Wiki owns Java profiles/migration entry point; Infra owns chart | Deployment stays out of Common and Wiki business source |
| One replica, Recreate, single-writer PVC | Sessions/presence/blob store are not distributed; brief upgrade downtime and fresh login are explicit |
| PG is an external connection contract | Dedicated Wiki database; no cross-service database fallback |
| PostgreSQL requires pg_bigm | Standard CNPG image cannot be claimed compatible without extension qualification; local fixture uses the preloaded extension image |
| A non-web bootstrap runs Liquibase only | Migration does not require OIDC, JPA, content workers or notifications; applied checksums stay unchanged |
| Separate 9091 management listener | GET health/info/Prometheus accessible internally; unrelated actuators/writes denied; business port retains authorization |
| Non-root, read-only root filesystem, writable tmp/PVC | Enforces chart-spec restricted runtime without package installs on customer nodes |
| External projected Git key staged into emptyDir | Private material stays out of PVC/source; pinned known_hosts and strict host verification work on read-only mounts |
| Per-document Markdown slugger and collapsible outline | Fixes heading IDs accumulating across page reads; creates stable links without a new frontend dependency |

Initial resource budget is 250m CPU/384 MiB requested, 2 CPU/768 MiB limited,
startup allowance 300 seconds and graceful shutdown 30 seconds within 45-second
termination grace. These are deployment defaults, not representative 10,000-page
performance acceptance. Readiness exercises the PG dependency; management security
unit tests exercise both local listener ports and forged forwarded headers.

The chart renders Gateway API HTTPRoute and optional ServiceMonitor, follows
`global.*` overrides and reads external connection Secrets. Ingress NetworkPolicy
requires a policy-enforcing CNI. Egress allowlists belong to the site profile;
local kind does not establish either full offline closure or policy enforcement.
The app image and migrations run from the same immutable manifest digest.

## Delivery and remaining boundaries

Source/build and local kind acceptance are separate evidence. Use a random owned
test namespace, generated database/identity credentials, preloaded image layers,
no business database, and clean up only those fixtures. Verify migration ordering,
repeat upgrade, secured internal management, native write/conflict/permission
flows, attachment/draft/history retention, dependency outage and retained PVC.

F7/T27 stays IN_PROGRESS: PVC deployment is the first slice; S3 migration remains
open. Multi-replica sessions/presence/object storage need a separate design.
HQ signed multi-architecture image/chart publication, actual Gateway/TLS/SSO,
provider extension compatibility, network policies, backup restore, prior-binary
rollback and target cutover remain acceptance work. Existing `.50:18090`, v2
runtime, archives and industry assets are preserved. Earlier old-content deletion
needs an identified scope and access; it is not part of this Kubernetes fixture.
