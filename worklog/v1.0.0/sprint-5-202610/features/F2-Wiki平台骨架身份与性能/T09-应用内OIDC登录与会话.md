# T09: 应用内 OIDC 登录与会话

**原编号**: Sprint-6 F2/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: IN_PROGRESS（2026-09-26：应用侧完成——双路径共用 `KeycloakAuthorityMapper`，302 跳转已用真实 Keycloak 验证，见 `it/wiki/W2-identity.md`；待 Keycloak 侧执行 `dts-wiki/deploy/keycloak/wiki-v2.sh` 注册回调后做真实登录；注：回调路径以实现为准 `/login/oauth2/code/oidc`（JHipster registrationId `oidc`），本文档的 `.../code/keycloak` 已 stale；会话为单实例内存（01 §1），PG 会话待多实例时做） · **依赖**: T05

## 技术设计
- Spring Security OAuth2 Client（授权码 + PKCE），会话存 PG（Spring Session JDBC），支持多副本；Cookie `HttpOnly; Secure; SameSite=Lax`。
- 从 ID/Access Token 提取：`preferred_username`、`name`、`email`、`resource_access.dts-wiki.roles` → `WikiUser`。
- 首次登录时 upsert `app_user`（用户名、显示名、邮箱，用于 @提及与作者显示）。
- 登出：本地会话失效 + Keycloak RP-initiated logout（`post_logout_redirect_uri`）。
- 前端：`/api/me` 返回用户与可见空间；未登录时后端 401 → 前端整页跳转 `/oauth2/authorization/keycloak`。
- 替代现网 oauth2-proxy（W-ADR-6），部署时 web 直接反代到 app。

## 验证
- [ ] 集成测试：用 Keycloak Testcontainer（或 WireMock JWKS）模拟 token，断言角色映射
- [ ] 浏览器：登录 → 显示用户名 → 登出 → 回到登录页
