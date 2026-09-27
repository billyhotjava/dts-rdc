# T18: Intent/Security/Audit 层现状对照与文档更新

**原编号**: Sprint-5 F12/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P2
**状态**: DRAFT
**依赖**: BL-S

## 目标
在 DAP 文档中为 Intent（:232）、Security（:309）、Audit（:349）三层写"v1 实现"章节，指向实际的契约（IntentRouter 的路由结果结构、ADR-008 身份头、`dts.audit.v1`），并标注未实现部分。

## 技术设计
- Intent：梳理 `IntentRouterService` / `ConversationPlannerService` 的输出结构（路由类型、域、置信度），与 DAP 的 Intent Structure 对照；差异标注为 v2；
- Security：Identity Propagation → ADR-008；Data Security Envelope → QueryGateway 与 ResultPolicy（BL-S）；
- Audit：→ BL-S/T14 的 schema。

## Definition of Done
- [ ] DAP 文档五层都有"实现状态"标注
