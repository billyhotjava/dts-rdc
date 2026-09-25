# F9: 统一身份、网关与租户上下文

**优先级**: P0
**波次**: B
**状态**: DRAFT（依赖 ADR-008）

## 目标
兑现铁律 #2：Studio、stack、prs 三个系统的外部请求**只经过一个网关**（Traefik + forwardAuth → dts-auth），
身份与租户通过统一的 `X-DTS-*` 头传递；头脑不再接受"持有 API Key 就可以自报用户身份"。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 身份头 | ADR-008 定义的唯一版本 | `X-DTS-User-Id`、`X-DTS-User-Name`、`X-DTS-Display-Name`、`X-DTS-Roles`、`X-DTS-Tenant-Id`、`X-DTS-Dept`、`X-DTS-Trace-Id`、`X-DTS-Service` |
| 鉴权端点 | `GET /api/internal/auth/forward`（dts-auth，由 prs-auth 演进而来，账本#27） | 2xx 并在响应头中返回上述头；401 未认证；403 无权访问该路由 |
| Keycloak | realm `flower` / `flower-test`；clients：`dts-studio-web`（public + PKCE）、`prs-app`（已有）、`dts-stack-web`、`dts-brain-svc`（confidential，服务间调用） | token claims：`sub`、`preferred_username`、`organization`（租户）、`realm_access.roles` |
| 路由 | Traefik 动态配置 `dts-gateway/dynamic/*.yml` | `studio.*` → engine-ai / webapp；`stack.*` → platform/analytics；`prs.*` → prs 服务；全部挂 forwardAuth 中间件，白名单仅包括健康检查与 OIDC 回调 |
| 服务间 | `X-DTS-Service: <name>` + 服务 token（client_credentials 或 API Key） | 服务调用**不得**携带用户身份头，除非是"代用户调用"并且带有网关签发的上下文（本期仅允许头脑 → stack BI、头脑 → prs action 两条路径，F7/T05、F5/T05） |

## UI/UX 规格（T05）
- **入口**：访问 Studio webapp → 未登录时跳转 Keycloak 登录页（使用 realm 的主题）→ 登录后回到原来的深链。
- **四态**：跳转中（全屏 loading "正在登录"）/ 登录失败（Keycloak 错误页，带"返回"链接）/ token 过期（静默刷新；刷新失败时弹出"会话已过期，请重新登录"）/ 成功（右上角显示用户名、租户名，以及退出菜单）。
- **走查**：1. 浏览器打开 `https://studio.<domain>/workspace` → 2. 跳转到登录页 → 3. 输入 alice/test1234 → 4. 回到工作台，右上角显示"alice · t1" → 5. 提问 → 6. 退出后再访问，重新跳转到登录页。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | Keycloak 实例、realm 与 Organization 设计 | P0 | DRAFT | F2/T04、F0/T03 |
| T02 | dts-auth：prs-auth 提升为平台鉴权服务 | P0 | DRAFT | T01 |
| T03 | 头脑接入网关身份，修复 API Key 身份自报 | P0 | DRAFT | T02 |
| T04 | 统一 Traefik 网关路由 | P0 | DRAFT | T02 |
| T05 | Studio webapp OIDC 登录 | P1 | DRAFT | T01、T04 |
| T06 | stack 接入统一网关的评估与过渡 | P1 | DRAFT | T04 |

## Definition of Ready
- [x] 契约  - [x] 竖切片：浏览器 → Keycloak → Traefik → dts-auth → engine-ai → 头部上下文  - [x] UI 落点  - [ ] 依赖：ADR-008、Q4  - [x] 验收

## 完成标准
- [ ] 绕过网关直接访问 engine-ai 的业务端口会被拒绝（网络隔离或 401）
- [ ] 伪造 `X-DTS-User-Id` 的请求经过网关后，该头被剥离并替换为真实身份（测试证据）
- [ ] 登录走查截图
