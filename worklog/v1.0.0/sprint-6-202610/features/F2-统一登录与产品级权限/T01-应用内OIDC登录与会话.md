# T01: 应用内 OIDC 登录与会话

**优先级**: P0 · **状态**: DRAFT · **依赖**: F1/T01

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
