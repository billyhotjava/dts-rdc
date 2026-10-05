# F5（已调出）: 消息协议与组件注册表骨架

> **2026-09-17 调出**（R-009）：agent UI 协议归 dts-copilot 维护（其 sprint-27 agent-first UI 已 DONE），
> dts-prs 只消费、不另起协议。Sprint-2 起以"对接 copilot 协议（Web/H5 渲染适配）"形式重新立项，
> 输入改为 copilot 侧已发布的契约。以下为原始内容，保留备查，不再执行。
产品 Feature：PF-AGENTUI；需求依据：智能体生成式 UI 决策 + copilot 现有契约
（CopilotChatContract/responseKind/suggestedDisplay/accuracyEvidence/SSE 事件）。
负责人：—；优先级：—；状态：调出（不计入 Sprint-1 容量与完成统计）。

## 使用场景与验收
调用者：Web React19 与 H5 前端（共用协议、各自渲染）。触发：智能体返回非纯文本时。
输入：copilot 现有契约；结果：消息块 JSON Schema（text/chart/table/kpi/approval_card/drill_link）
+ 前端组件注册表骨架（类型→组件映射 + 降级规则）。
正常流程：T01 Schema 设计 → T02 注册表骨架 → 与 copilot 侧联评（字段对齐）。
替代/失败流程：本期容量不足 → 整 Feature 调出至 Sprint-2，不留半截设计。
规则与边界：模型不直出 HTML/JS；图表只出语义描述（指标/维度/类型），option 由后端生成校验；
审批卡片只触发 HITL 管线，不直调业务。
验收示例：Given Schema v0.1 / When copilot done 事件携带各块 / Then 注册表可渲染且未知类型可降级为文本。
本期范围：Schema + 注册表骨架设计。后续切片：BFF 组装、审批卡片联调（Sprint-2+）。
非目标：copilot 后端改造。

## 设计
概念与共享架构：协议是 Web/H5 共用的 agent UI 契约，维护责任：前端架构 + copilot 侧对接人。
概要协作：copilot SSE/done → BFF 组装块 → 注册表渲染 → 未知类型降级。
关键契约：六块字段表（复用 responseKind/suggestedDisplay/accuracyEvidence，不另起一套）。
UI 或使用路径：Web 与 H5 各自组件实现，共用类型注册表接口。
详细设计：见 T01–T02。
未决项：approval_card 与 Flowable draft 的字段映射（Sprint-2 联调时关闭）。

## Task
| ID | 类型/目标产出 | 负责人 | 输入依赖 | 估算 | 验证方式 | 状态 |
|---|---|---|---|---|---|---|
| T01 | 设计：消息块 JSON Schema v0.1 | 待确认 | copilot 现有契约 | 3 点（假设） | 六块字段齐全，与现有契约无冲突 | DRAFT |
| T02 | 设计：组件注册表骨架 | 待确认 | T01 | 2 点（假设） | 类型→组件映射 + 降级规则可读 | DRAFT |

## Feature 完成标准
Schema 与注册表骨架通过联评；未决映射有去向。若调出则整 Feature 移至 Sprint-2，不算本期完成。
