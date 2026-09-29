# T02: 工作台BFF

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T01；BL-S/T09（租户上下文）；BL-A/T04（注册表供数）；BL-S/T15（审计 outbox）

## 目标
实现 `workspace.openapi.yaml`：会话、消息、流式事件；答案卡片所需的证据、来源、口径版本、审计号由下游组合。

## 技术设计
- 下游：studio engine `POST /api/ai/agent/chat/send`（既有，Sprint-5 README 契约链）与会话接口；流式事件按契约转发（SSE）。
- 组合：答案中的 `indicatorRef` → 指标元数据（口径版本、新鲜度）；`auditId` 直接透传。
- 不在 BFF 做意图判断或业务策略；SSE 转发须保持顺序/终止/取消/断连语义，默认不自动重放 chat POST 或工具动作。仅在下游有明确幂等键与重连游标契约时重试，避免重复执行与重复计费。

## 验证（RED→GREEN）
- [ ] 契约测试覆盖正常、拒绝、失败、降级四种响应
- [ ] 与 F6/T05 原型在 bff 模式下走查一致

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权
