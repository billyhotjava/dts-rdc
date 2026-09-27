# W2 identity evidence (F2/T09 part + F2/T10)

Date: 2026-09-26 · Branch: `feat/W1-scaffold` (dts-wiki repo; W2 committed on same branch)

## Code (all `// DTS-WIKI: customized` marked)
- `security/KeycloakAuthorityMapper.java` (new): `reader→ROLE_USER`, `editor→ROLE_EDITOR`,
  `admin→ROLE_ADMIN`, `space-<slug>→ROLE_SPACE_<SLUG>` (upper, `-`→`_`); `ROLE_*` passthrough;
  unknown roles dropped. Both auth paths (oauth2Login `userAuthoritiesMapper`, resource-server
  `authenticationConverter`) funnel through `SecurityUtils.extractAuthorityFromClaims` → single change point.
- `security/SecurityUtils.java`: role→authority conversion delegates to the mapper.
- `security/AuthoritiesConstants.java`: added `EDITOR`.
- `service/wiki/SpaceAccessService.java` (new): `canRead`/`canWrite`/`readableSpaceIds`
  (SQL-filter source, never post-filter), `requireRead`→`SpaceNotVisibleException`(→404),
  `requireWrite`→404 when unreadable / `AccessDeniedException`(→403) when read-only.
  `service/wiki/SpaceNotVisibleException.java` (new).
- `config/SecurityConfiguration.java`: generated entity endpoints (`/api/spaces`, `/api/pages`, … full list,
  incl. `/api/users/**`) → `ROLE_ADMIN`; `/api/wiki/**` → authenticated; `/api/admin/**` stays ADMIN;
  `/management/prometheus` no longer permitAll (per 03 §3.3, `/management/**` ADMIN);
  `/v3/api-docs/**` public only with `api-docs` profile; frontend shell permitAll (W1).
- `deploy/keycloak/wiki-v2.sh` (new, +x, `bash -n` ok): idempotent; merges 3 redirect URIs
  (legacy oauth2-proxy callback kept for rollback), 2 web origins, post-logout URIs;
  creates `client-roles-to-roles` mapper (claim `roles`, multivalued, no prefix, into ID/access/userinfo);
  ensures roles reader/editor/admin/space-dts/space-prs. NOT executed (needs .50 Keycloak; W3 step).
- Tests: `KeycloakAuthorityMapperTest` (5), `SpaceAccessServiceTest` (5, matrix A/B/C/D),
  `web/rest/SecurityPathIT` (5: entity-ADMIN 403/403/200, `/api/admin/**` rule, account 401-anon).
  14 generated `*ResourceIT` switched to `@WithMockUser(authorities={"ROLE_ADMIN"})` (entity endpoints now ADMIN-only).

## Test results
- `./mvnw verify`: unit **140/140**, integration **384/384**, BUILD SUCCESS.

## Deferred (tracked)
- 07 §2 rows needing business endpoints (spaces list, read/save page, attachments, comments,
  search, history, @mentions) → W4/W7 when those endpoints land.
- Real browser login → after `wiki-v2.sh` runs on .50 (Keycloak admin action) + client secret into new `.env` (W3).
- F2/T11 provisioner (P1) untouched.
