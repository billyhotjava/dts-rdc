# T05: Console OIDC 登录

**原编号**: Sprint-5 F9/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T01、T04

## 目标
DTS Console 使用 Keycloak OIDC（Authorization Code + PKCE）登录，完成真实身份、租户、深链与退出流程。旧 copilot webapp 不迁移。

## 技术设计
- **库**：`oidc-client-ts` + `react-oidc-context`（新增依赖前检查许可证和维护状态）；配置 `authority=https://<kc>/realms/flower-test`、`client_id=dts-studio-web`、`redirect_uri=/auth/callback`、`silent_redirect_uri`；
- **API 调用**：`fetch` 封装中附加 `Authorization: Bearer <access_token>`，由网关转换为身份头；401 → 触发静默刷新，失败则跳转登录；
- **页面**：Console 提供回调/退出页面；真实 BFF 模式不包含 API Key 登录或 mock 身份切换。
- **顶栏**：消费 BL-C/T01 的公开 `/me` 契约展示用户名、角色和租户；不从未经定稿的 organization claim 猜测租户，不让浏览器调用 internal auth API。OIDC 登录本身不依赖 BFF /me，就绪后的身份展示在 BL-C/T08 验收，避免循环。
- **类型**：token claims 的 TS 类型写在 `src/types/auth.ts`。

## 验证
- [ ] 组件测试：未登录时跳转、回调成功、刷新失败
- [ ] Playwright：走查步骤 1–6 自动化（Keycloak 登录页使用测试账号）

## Definition of Done
- [ ] 四态截图与 Playwright 报告进入 `it/IT-03-gateway.md`
