# T06: stack 接入统一网关的评估与过渡

**原编号**: Sprint-5 F9/T06（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T04

## 目标
评估 stack（已有自己的 `dts-proxy` 与 Keycloak 集成、`dts-session-core`）接入统一 forwardAuth 的方式与风险，给出过渡方案，并至少让"头脑 → stack BI/指标"这条服务间路径使用统一身份。

## 技术设计
- **现状调研**（只看需要的部分）：`services/dts-proxy` 的配置、`source/dts-session-core`（5 个文件）的鉴权方式、stack 如何从 token 或会话中取用户与部门；
- **方案对比**：A 全量接入 forwardAuth（stack 改为信任 `X-DTS-*`）；B stack 保留自己的鉴权，只让统一网关透传 Bearer，stack 自己验签（同一个 Keycloak）；C 只把服务间路径统一；
- **推荐**：本 sprint 采用 C + B（风险最小），A 登记到下一个 sprint；
- **服务间**：头脑调用 stack 时，使用 `dts-brain-svc` client credentials 取 token，并携带 `X-DTS-Service: dts-studio`，代用户调用时附带用户上下文（stack 侧需要验证 `on-behalf-of` 委托并按真实用户权限/租户创建，owner 为该用户；若不支持则拒绝保存并登记待完成，不得按服务账号创建资产兜底）。

## Definition of Done
- [ ] 方案文档 `assets/stack-gateway-plan.md` 评审通过；服务间路径联调通过（证据进入 `it/IT-03-gateway.md`）
