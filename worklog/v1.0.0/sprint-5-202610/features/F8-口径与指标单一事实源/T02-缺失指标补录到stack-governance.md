# T02: 缺失指标补录到 stack governance

**优先级**: P1
**状态**: DRAFT
**依赖**: T01

## 目标
把 T01 中"stack 缺失"或"表达式不同且以 Pack 为准"的指标，按 stack 的指标发布流程登记并发布，使 stack 成为完整的事实源。

## 技术设计
- 使用 stack 现有的 Indicator 能力（定义 → 派生校验 `IndicatorDerivationValidationService` → 发布预览 `IndicatorPublishPreviewService` → 发布），**不要直接写数据库**；
- 批量登记：如果 stack 有导入 API 就使用；没有的话，在 stack 中新增一个 task（记录在 stack 的 worklog），本 sprint 只登记最多 20 个 P0 指标（主竖线涉及的"在营项目数"、租金净额、加摆/撤摆单数等优先）；
- 每个指标都要有 dbt 模型或视图作为实现（`IndicatorImplementationRef`），对应 `xycyl_*` mart 表；
- 口径说明从 Pack 的 `caliber` 字段迁移过来，并注明原出处（copilot S31 的口径 SoT 文档）。

## 验证
- [ ] 登记后调用 `GET /api/governance/indicators/{code}` 可以查到，状态为 PUBLISHED
- [ ] 发布预览的计算结果与 Pack `expr` 在基线库上的计算结果一致

## Definition of Done
- [ ] T01 表格中的处置列全部完成或登记了后续 task
