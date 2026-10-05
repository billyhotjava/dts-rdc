---
type: page
title: Wiki collaboration completion design
---
# Wiki collaboration completion

This implements the remaining F5/T03-T06 contracts. Favorites, views, comments,
watches and notification intent belong to Wiki's own database. They do not alter
Git-managed Markdown or enqueue outbound commits. Frontmatter tags remain the
only editable label source; existing metadata search consumes their projection.

Favorites/views reuse `jhi_user.id`, carry composite user/page keys and cascade
on physical deletion. Reading lists applies live page and current caller space
filters before count/pagination. View upsert locks the user row and trims to 50
in the same transaction. User identity comes only from the authentication context.

Comments allow currently readable pages, support one reply level and soft delete.
Only the author or an administrator can change a comment. The server validates
parent ownership, rejects deeper replies and renders Markdown with HTML disabled.
Git pages can have Wiki-only comments without changing their source/version.

Current target-user eligibility comes from an authenticated, read-only Keycloak
adapter: enabled account and effective Wiki client roles, including inherited
and composite roles. The local user projection narrows display candidates but
cannot authorize them. The adapter caches its client credential token, never a
recipient's permissions. Missing configuration or identity outages return an
explicit unavailable response; no stale role snapshot is used as a fallback.
The service credential remains external. Provisioning belongs to Infra.

Mention extraction ignores code, email addresses and repeated login tokens.
Page/comment transactions record stable notification event keys and automatic
watch intent only. Explicit unwatch persists `muted=true`; later saves/comments
cannot reverse it. Mention intent remains independent of watcher mute. A worker
checks target identity and current page permission outside the write transaction,
then records ALLOWED/SUPPRESSED; outages remain PENDING with bounded retry.
List/count/email/link access each checks current permission again.

SMTP is optional and external. Page update mail is grouped by recipient and page
within a ten-minute window; in-app read state is independent of delivery state.
Delivery retries reuse event/recipient/type keys. SMTP lacks atomic recipient
acknowledgement, so its ambiguous failure window must be documented separately
from database intent idempotency.

Verification uses disposable PostgreSQL, fake authenticated identity responses,
revocation/outage/disabled/group-change cases, concurrent view trimming, comment
ownership, mute persistence, repeated intent processing and mock SMTP. Browser
fixtures establish UI behavior only; real identity/SMTP acceptance is a separate
runtime gate.

References: [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html),
[effective client role implementation](https://github.com/keycloak/keycloak/blob/main/services/src/main/java/org/keycloak/services/resources/admin/ClientRoleMappingsResource.java).
