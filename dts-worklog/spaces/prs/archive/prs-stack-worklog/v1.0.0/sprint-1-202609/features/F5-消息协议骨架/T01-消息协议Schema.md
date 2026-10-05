# T01: 消息块 JSON Schema 设计
类型：设计。负责人：待确认；状态：调出（R-009）；估算：3 点（假设）。
设计/需求依据：F5 README 规则；copilot 现有契约字段（responseKind 15 种、suggestedDisplay、
accuracyEvidence、SSE reasoning/token/tool/done、reportCode/templateCode）。
输入依赖：copilot 契约可读（已有）；输出消费方：T02。

## 目标和范围
输出六块（text/chart/table/kpi/approval_card/drill_link）的 JSON Schema v0.1，
字段尽量复用现有契约名，新增仅 approval_card/kpi 两块。
排除：后端实现、BFF 组装。

## 工作内容
逐块定字段/类型/必填/约束 + 未知类型降级约定；与 copilot 侧做一次字段对齐（会议或书面），
冲突记未决转 Sprint-2。

## Ready 与完成标准
Ready：契约可读（满足）。完成：Schema 可读且无命名冲突；未决有去向。

## 实际结果
未执行。2026-09-17 随 F5 整体调出（R-009），协议归 dts-copilot 维护。
