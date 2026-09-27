# T02: dts-auth：prs-auth 提升为平台鉴权服务

**原编号**: Sprint-5 F9/T02（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T01

## 目标
把 prs 已经验证过的 forwardAuth 服务（`ForwardAuthController`，账本#27）提升为平台级的 `dts-auth`：支持多个 realm、输出 `X-DTS-Tenant-Id`、按路由做粗粒度授权，供 Studio、stack、prs 共用。

## 技术设计
- **归属**：代码放在哪个仓库由 ADR-008 决定（推荐放在 stack，与 `dts-session-core` 放在一起；如果短期内放在 prs-stack，也必须以平台服务的身份发布）；
- **功能**：
  1. 验证 Bearer JWT（本地 JWKS 缓存，支持多个 issuer，即多个 realm）；
  2. 会话模式（prs 保留的已验证代码，Sprint-2 启用）暂不改动；
  3. 从 claims 映射身份头：`sub` → User-Id、`preferred_username` → User-Name、`name` → Display-Name（URL 编码）、`realm_access.roles` → Roles、`organization` → Tenant-Id（取不到时：如果路由要求租户则返回 403，否则不输出该头）；
  4. 生成或透传 `X-DTS-Trace-Id`（W3C traceparent 优先）；
  5. 路由授权：按 `X-Forwarded-Uri` 前缀匹配规则表（`/api/ai/packs/**` 需要 STUDIO_ADMIN 等），规则来自配置文件；
  6. 只允许内网调用（沿用 prs 的限制）。
- **版本**：沿用 prs 的 JDK 25 / Boot 4.1.1（ADR-010 定义了分裂期的互操作约定：只通过 HTTP 头交互）。

## 验证（RED→GREEN）
- [ ] 契约测试：有效 token / 过期 / 签名错误 / issuer 不在白名单 / 缺少 organization（两种路由）/ 角色不足 → 分别返回 2xx+头 / 401 / 401 / 401 / 403 或 2xx / 403
- [ ] 性能：本地 JWKS 缓存命中时 P95 < 5 ms（记录到 nfr-budget）

## Definition of Done
- [ ] 镜像 `dts-auth` 可以发布；prs 原有的 F1 测试仍然全部通过

## 2026-09-26 承接约束

删除 PRS-G01 的缺租户 `default` 回退；租户业务请求缺失/非法/多义租户时拒绝，平台非租户操作单独列白名单。原 `/tenants/{id}` groups 可作明确的过渡映射，不能宣称 Organizations 已部署。
