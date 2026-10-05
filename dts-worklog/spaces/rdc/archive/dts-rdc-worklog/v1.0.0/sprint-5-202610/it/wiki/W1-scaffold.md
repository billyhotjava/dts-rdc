# W1 scaffold evidence (F2/T01 part + F2/T05–T07)

Date: 2026-09-26 · Branch: `feat/W1-scaffold` (dts-wiki repo) · Java 25.0.4-tem, Maven 3.9.16, pnpm 10.33.0, node v24.14.1

## Backend generation
- `npx generator-jhipster@9.2.0 jdl jhipster/dts-wiki.jdl` (D2: 9.3.0 released 2026-08-30, not yet 30 days old on 09-26 → 9.2.0).
- Generated Spring Boot is **4.0.7** (not 3.5.15 as design/00 D2 parenthetical claims) — accepted per D2's rule
  ("Boot 由 JHipster 管理，不单独升级"); 4.0.7 is a stable patch, R-012 satisfied. D2 parenthetical needs a factual fix.
- `pom.xml`: `java.version` 21→25 (+ `// DTS-WIKI: customized` marker).
- JDL fix: `skipUserManagement false`→`true` (+ comment). `false` made 9.2.0 emit a password-based
  `DomainUserDetailsService` that cannot compile against the oauth2 User (no password field, no email finder;
  template has zero oauth2 branches). Stale password/mail cluster deleted (13 main + 2 IT + mail templates).
- `Page` entity vs Spring Data `Page` clash in 7 files: Spring's Page fully qualified (+ markers), entity untouched.
- Custom: Liquibase `9000_extensions/9001_constraints/9002_search/9003_shedlock.xml` (design 02 S3),
  registered at end of `master.xml`; `web/SpaForwardController`; ArchUnit rule
  `web.rest.wiki → repository` forbidden (+ `allowEmptyShould` until W4); `DatabaseTestcontainer`
  uses `dts-wiki-db:18-bigm` (design 07 S1) with `asCompatibleSubstituteFor("postgres")`;
  `SecurityConfiguration`: frontend shell permitAll (rest of 03 S3 in W2).
- `PageResourceIT.getAllPagesByParentIsEqualToSomething` adjusted to invariants I1/I4
  (dedicated root parent + fixture as child).

## Test results
- `./mvnw -Pprod verify`: unit **130/130**, integration **379/379**, BUILD SUCCESS.
  (Env notes: `_JAVA_OPTIONS=-Djava.io.tmpdir=...` needed — root-owned `/tmp/spring.log`;
  `-Dlogging.file.name=...` for the same reason. Both are dev-machine-only issues.)
- `frontend/`: `pnpm test` 1/1, `tsc --noEmit` clean, `pnpm build` ok (5.58s, chunk-size warning only).
- Versions pinned: react 19.3.0, antd 6.6.5, react-router 8.4.0, vite 7.2.4, frontend-maven-plugin 1.15.4
  (node v24.14.1 + pnpm 10.33.0 via plugin, npmmirror registry).

## Dev联调 (backend :8080 + vite :5173 + PG dts-wiki-db on :5433)
- `Started DtsWikiApp in ~11s`; Liquibase 9000–9003 confirmed in `databasechangelog`.
- `/` → 200 "DTS Wiki" (jar frontend shell); `/s/prs` → 200 (SpaForwardController); `/api/account` → 401.
- `/oauth2/authorization/oidc` → 302 to `https://sso.yuzhicloud.com/realms/yuzhicloud/...auth?client_id=dts-wiki...redirect_uri=http://localhost:8080/login/oauth2/code/oidc`.
- Blocker for real login (W2): that `redirect_uri` is not registered on the Keycloak `dts-wiki` client
  (only `https://wiki.yuzhicloud.com/oauth2/callback`), and no dev client secret on this machine.

## Commits
Not committed (no explicit request). Files live in working tree: dts-wiki branch `feat/W1-scaffold`;
worklog updates (assets/*-spike.md, design 00 D9/D11, README W-ADR-8, task statuses) in dts-rdc working tree.
