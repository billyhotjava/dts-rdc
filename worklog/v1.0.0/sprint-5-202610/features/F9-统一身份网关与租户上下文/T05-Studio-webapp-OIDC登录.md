# T05: Studio webapp OIDC 登录

**优先级**: P1
**状态**: DRAFT
**依赖**: T01、T04

## 目标
Studio webapp（原 copilot webapp）使用 Keycloak OIDC（Authorization Code + PKCE）登录，替代现有的登录方式（`pages/auth` 目录），实现 F9 README 中的走查。

## 技术设计
- **库**：`oidc-client-ts` + `react-oidc-context`（新增依赖前检查许可证和维护状态）；配置 `authority=https://<kc>/realms/flower-test`、`client_id=dts-studio-web`、`redirect_uri=/auth/callback`、`silent_redirect_uri`；
- **API 调用**：`fetch` 封装中附加 `Authorization: Bearer <access_token>`，由网关转换为身份头；401 → 触发静默刷新，失败则跳转登录；
- **现有页面**：`pages/auth/*` 改为回调页和退出页；原有的 API Key 登录表单（如果存在）只在 `import.meta.env.DEV` 且开启开关时可用；
- **顶栏**：新增用户菜单组件，显示用户名与租户（从 id_token 中的 `organization` 读取，显示名称需要映射；映射表可以从 dts-auth 的 `/api/internal/auth/me` 获取，如果本期不做该接口，就显示租户 id）；
- **类型**：token claims 的 TS 类型写在 `src/types/auth.ts`。

## 验证
- [ ] 组件测试：未登录时跳转、回调成功、刷新失败
- [ ] Playwright：走查步骤 1–6 自动化（Keycloak 登录页使用测试账号）

## Definition of Done
- [ ] 四态截图与 Playwright 报告进入 `it/IT-03-gateway.md`
