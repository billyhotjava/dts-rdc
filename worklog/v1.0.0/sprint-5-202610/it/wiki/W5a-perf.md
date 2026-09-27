# W5a performance evidence (F2/T12)

Date: 2026-09-27 · Image: `dts-wiki-app:w6a4` (2nd deploy) on .50:18091

## B7 compression + cache (06 S2.3 commands, real output)
- entry JS: `Cache-Control: max-age=31536000, public, immutable` + `Content-Encoding: gzip` — PASS
- `/` (index.html): `Cache-Control: no-cache` — PASS
- entry download gz: 191,614 bytes (includes full home graph; local budget check 286 KB — PASS)
- fixes applied: `text/javascript` added to compression mime-types (Spring serves .js as
  `text/javascript`, the legacy `application/javascript` entry never matched);
  `WebConfigurer` resource handler for `/index.html` must use a directory location
  (`classpath:/static/`, not the file path); second SecurityFilterChain disables
  Spring's default `no-store` for `/assets/**` + `/index.html`; `release.sh` now uses
  `clean verify` (stale hashed assets polluted the jar); compose.yml shipped with `mem_limit`.

## F5 bundle
- home JS gzip **286.0 KB** (budget 300 KB) — PASS (`pnpm build` gate `check-bundle-size.mjs`)
- home CSS gzip 0.4 KB (budget 60 KB) — PASS
- deviations from 10 S4.5 (documented, budget outranks chunk naming): no forced `vendor-antd`
  chunk (hoisting dragged space-only Tree/Modal/Dropdown into home); axios replaced by a 60-line
  fetch client (same contract incl. XSRF/401, ~11 KB saved); `PageTree` lazy (sider).
- data: `useBootstrap` single startup call; tree hover 150 ms prefetch; `staleTime: 30s`;
  `keepPreviousData` on page query.

## F6 look
- light header (white + 1px divider), light sider, gray content well; reading CSS
  (16px/1.75, h1 32/h2 24+divider/h3 20, 880px, zebra tables, code style);
  kind as icon, syncStatus only when PENDING_PUSH/CONFLICT; empty folder shows child cards;
  delete moved into `⋯` menu. Screenshots vs live wiki: pending user-acceptance browsing
  (bundled with W4 acceptance below).

## C7 JVM
- flags: `-XX:+UseSerialGC -XX:MaxRAMPercentage=50 -XX:MaxMetaspaceSize=192m -Xss512k
  -XX:+ExitOnOutOfMemoryError`; `mem_limit: 768m`; Hikari max pool 10.
- RSS: **416 MiB / 768 MiB** vs 400 target — PARTIAL (+4%). Heap headroom is fine and OOM
  exits safely; remaining gap is metaspace/native baseline. Follow-up: AppCDS evaluation in W9.
  (Was 650 MB with defaults.)

## Regression
- `./mvnw -Pprod clean verify`: unit 142/142, integration 401/401, BUILD SUCCESS.
- login chain re-verified after deploy (`/oauth2/authorization/oidc` → 302, `/api/wiki/spaces` → 401).
