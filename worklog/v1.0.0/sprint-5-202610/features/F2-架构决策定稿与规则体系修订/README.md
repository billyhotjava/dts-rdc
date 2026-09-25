# F2: 架构决策定稿与规则体系修订

**优先级**: P0
**波次**: A
**状态**: DRAFT

## 目标
把 Sprint README 中"提议"状态的 ADR-5..ADR-10 逐条定稿（每条都要有备选方案对比、结论和签字），
再据此修订 `dts-studio/.rules` 与设计文档，让规则和现实一致，下游 Feature 不再"边做边吵"。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 文档 | `RDC/worklog/v1.0.0/docs/adr/ADR-{NNN}-{slug}.md` | 固定章节：背景 / 备选方案（≥2）/ 评估维度表 / 决策 / 后果 / 回滚条件 / 状态（Proposed→Accepted）/ 签字人与日期 |
| 文档 | `RDC/worklog/v1.0.0/docs/adr/README.md` | ADR 索引表：编号、标题、状态、日期、取代关系 |
| 规则 | `dts-studio/.rules/10-architecture/*.rules` | 与已接受的 ADR 一致；每条修改的规则注明 `Source: ADR-NNN` |

ADR 编号映射：ADR-005 头脑语言、ADR-006 BI 归属、ADR-007 口径 SoT、ADR-008 统一网关与身份、ADR-009 数据出口与湖仓路线、ADR-010 版本基线；
ADR-001..004 为用户已定的决策，补写成文档存档即可。

## UI/UX 规格
非用户面 Feature。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | ADR-005 头脑实现语言与运行形态 | P0 | DRAFT | F0/T01 |
| T02 | ADR-006 BI 归属 | P0 | DRAFT | F0/T01 |
| T03 | ADR-007 口径/指标单一事实源 | P0 | DRAFT | - |
| T04 | ADR-008/009 统一网关、身份与数据出口（含湖仓底座路线） | P0 | DRAFT | F0/T03 |
| T05 | ADR-010 版本基线评估（JDK 25 / Boot 4 spike） | P1 | DRAFT | F0/T01 |
| T06 | 修订 studio 规则体系与设计文档 | P0 | DRAFT | T01–T04 |
| T07 | 对齐 prs / copilot 规划（R-013、队列收口） | P0 | DRAFT | T06 |

## Definition of Ready
- [x] 契约（ADR 模板）已钉死  - [x] 竖切片：不涉及  - [x] UI：不涉及  - [ ] 依赖：F0/T01  - [x] 验收：用户签字

## 完成标准
- [ ] ADR-001..010 全部为 Accepted（或 Rejected，并写明替代方案），用户签字
- [ ] `.rules` 中与 ADR 冲突的条款清零（T06 附对照表）
