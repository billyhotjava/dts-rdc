# T03: 头脑接入网关身份，修复 API Key 身份自报

**原编号**: Sprint-5 F9/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T02

## 目标
engine-ai 的身份来源改为"网关注入的头"；API Key 只用于机器间调用（`X-DTS-Service`），并且**不允许**同时自带用户身份头（修复账本#18，`UserContextFilter.java:42`）；上下文中增加 tenantId。

## 技术设计
- **改造**：
  1. `CopilotUserContext` 增加 `tenantId`、`traceId`、`principalType(USER|SERVICE)`；
  2. `UserContextFilter`：
     - 请求来自网关（通过共享密钥头 `X-DTS-Gateway-Sig`，或网络策略保证只有网关能访问，二选一，ADR-008 已定）→ 信任 `X-DTS-*`；
     - 请求带 `Authorization: Bearer cpk_*`（API Key）→ `principalType=SERVICE`；此时若同时带有 `X-DTS-User-Id` → **400 `IDENTITY_HEADER_NOT_ALLOWED`**；只有在该 API Key 配置了 `delegation=true`（例如老 rs-gateway 过渡期），并且头来自受信来源时，才允许代用户调用，同时写入审计 `delegated_by`；
     - 删除"没有头就使用 API Key 名作为用户"的逻辑；
  3. `ApiKeyAuthFilter` 保留，但增加 key 级别的 `scopes`（例如 `ai:chat`、`ai:admin`、`bi:write`）；
  4. 所有取数路径把 `tenantId` 传给 QueryGateway（T09）。
- **兼容性**：老 rs-gateway 的对接方式（copilot README 中"与园林管理平台对接"章节的 `CopilotAuthConvertFilter`）仅在验证用户/租户委托凭据、限定来源/路由/scope 后使用专用 key，并登记下线日期；未验证时保持拒绝。
- **Liquibase**：`api_key` 表增加 `scopes`、`delegation` 列（在 005 changeset 之后新增 changeset）。

## 验证（RED→GREEN）
- [ ] 安全测试：普通 key + 伪造的 User-Id 头 → 400；网关请求 → 上下文正确；无租户的网关请求访问问数 → 403（fail-closed）
- [ ] 回归：golden set（通过网关使用 alice 身份）与基线一致

## Definition of Done
- [ ] 测试证据进入 `it/IT-03-gateway.md`

## 2026-09-26 承接约束

代用户调用必须同时验证服务主体、用户主体、授权委托范围、所属租户与有效期；`delegation=true` 和普通身份头本身不是授权凭据。未形成可验证委托时拒绝，不能自报用户。普通机器主体缺租户或超 scope 也不得访问租户数据。
