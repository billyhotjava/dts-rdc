# it/wiki/baseline.md — Sprint-5 交付基线（W3，F2/T01 + F2/T08）

Date: 2026-09-27 (UTC+8) · Instance: 10.20.0.50 `/data/dts-wiki-v2` · Images: `dts-wiki-app:w6a1` (484MB), `dts-wiki-db:18-bigm` (457MB)

## 1. 构建（本机，全部通过）
- `./mvnw -Pprod verify`: unit 140/140, integration 384/384, BUILD SUCCESS (Java 25.0.4, Boot 4.0.7)
- `frontend/`: `pnpm test` 1/1, `tsc --noEmit` clean, `pnpm build` 5.58s
- `docker build` 双镜像成功；app 镜像验证：uid 1001(wiki)、git/java25 就绪、无 env 时因缺 issuer 快速失败（符合预期）

## 2. 传输与启动（.50，真实输出）
- `docker save | gzip | ssh gunzip | docker load` → `Loaded image: dts-wiki-app:w6a1`, `Loaded image: dts-wiki-db:18-bigm`
- `/data/dts-wiki-v2/{db,repos,secrets,attachments}` created; repos/secrets/attachments → 1001:1001, secrets 700
- `.env` (600, server-side only): random `WIKI_DB_PASSWORD`, `WIKI_OIDC_CLIENT_SECRET` copied from `/data/dts-wiki/.env`, `APP_TAG=w6a1`, `DB_TAG=18-bigm`, `WIKI_PUBLIC_URL=http://10.20.0.50:18091`
- `docker compose up -d`: `wiki-db` healthy, `wiki-app` Up, port `0.0.0.0:18091->8080`
- App log: `Started DtsWikiApp in 10.431 seconds` (Liquibase 含 9000–9003，dev 机已验证入库；prod 库表由 Liquibase 同步创建)
- `curl http://10.20.0.50:18091/` → `200` + `<title>DTS Wiki`
- 现网零影响：`http://10.20.0.50:18090/` → 302（与上线前一致）；未动 dockerd/Jira/Keycloak 容器

## 3. Keycloak（`deploy/keycloak/wiki-v2.sh`，.50 已执行，输出存档）
- `redirect URIs updated (legacy callback kept for rollback)` — 3 URIs（旧 oauth2-proxy + 新 prod + 18091验收）
- `mapper client-roles-to-roles created` — verified: `oidc-usermodel-client-role-mapper`, claim `roles`,
  multivalued, in id/access/userinfo tokens, client `dts-wiki`; roles reader/editor/admin/space-dts/space-prs 均已存在
- 执行中发现并修复（已写回脚本）：容器默认 kcadm 配置损坏须 `--config` 到新文件；
  `attributes.post.logout.redirect.uris` 的 key 必须加引号（沿用现网写法）；post-logout 暂只留 prod URI（验收期从 18091 登出会落到 prod 站，无害）
- 登录链（机器验证）：`GET :18091/oauth2/authorization/oidc` → `302` →
  `https://sso.yuzhicloud.com/realms/yuzhicloud/...auth?client_id=dts-wiki...redirect_uri=http://10.20.0.50:18091/login/oauth2/code/oidc...`（PKCE S256）

## 4. 登录问题排查与修复（2026-09-27）
- 现象：浏览器打开 `:18091/` 只显示首页空壳（"你好， "），不跳登录页。
- 根因（headless Chrome + netlog 取证）：带 session 的匿名 API 请求被 oauth2Login 的默认入口
  **302 到登录页 `/`**，axios 静默跟随并把首页 HTML 当作 account JSON 成功解析 → 误判"已登录"。
  curl 因无 session 而走 401，看不出问题。
- 修复：`SecurityConfiguration` 加 `defaultAuthenticationEntryPointFor(401, /api/**)`
  （Security 7 用 `PathPatternRequestMatcher`，`AntPathRequestMatcher` 已移除）；
  镜像 `dts-wiki-app:w6a2` 重建、传输、`.50` 热更新（`.env` APP_TAG=w6a2）。
- 修复后链路（headless 取证）：`/` 200 → JS 200 → `/api/account` **401** →
  `/oauth2/authorization/oidc` **302** → Keycloak `.../auth` **200**，
  落页标题 "Sign in to Yuzhicloud"，含 username/password 表单。

## 5. 人工确认（Gate G0 交付基线）— PASS（2026-09-27）
- 用户浏览器登录成功：Header 显示用户名（`billyxie…`），首页 "你好，xiezm"
- 服务端验证：`jhi_user` 同步 `xiezm/billy/billy.xie@yuzhicloud.com`；
  `jhi_user_authority` = `ROLE_USER + ROLE_EDITOR + ROLE_ADMIN`（`roles` claim 映射全对）
- F2/T01 → DONE；Gate G0 交付基线 PASS。"首页无链接"符合预期：W1 只有空壳，空间列表/树在 W4。
