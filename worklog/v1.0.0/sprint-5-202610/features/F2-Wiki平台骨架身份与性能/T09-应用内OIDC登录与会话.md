# T09: 应用内 OIDC 登录与会话

**原编号**: Sprint-6 F2/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: IN_PROGRESS · **依赖**: T05

2026-09-27 已有证据：`it/wiki/baseline.md` §3～5 记录回调配置脚本执行、真实登录及角色同步；不重复列为待配置。尚待完整登出/会话过期、Cookie 与撤权验证，因此不将整项标 DONE。

## 技术设计
- Spring Security OAuth2 Client（授权码 + PKCE），本期单实例内存会话；PG 会话/多副本留后续；生产 Cookie `HttpOnly; Secure; SameSite=Lax`；内网 HTTP 验收配置与生产 Secure 配置分开验证。
- 从 ID/Access Token 提取：`preferred_username`、`name`、`email`、已配置的 `roles` claim → `KeycloakAuthorityMapper` → `jhi_user`/authorities。
- 首次登录时 upsert `jhi_user`（用户名、显示名、邮箱，用于 @提及与作者显示）。
- 登出：本地会话失效 + Keycloak RP-initiated logout（`post_logout_redirect_uri`）。
- 前端：`/api/wiki/bootstrap` 返回账户与可读空间（既有 `/api/account` 用于账户兼容）；未登录时后端 401 → 前端整页跳转 `/oauth2/authorization/oidc`。
- 替代现网 oauth2-proxy（W-ADR-6），部署时边缘代理直达 app，前端由同 jar 提供。

## 验证
- [ ] 集成测试：用 Keycloak Testcontainer（或 WireMock JWKS）模拟 token，断言角色映射
- [ ] 浏览器：登录 → 显示用户名 → 登出 → 回到登录页
