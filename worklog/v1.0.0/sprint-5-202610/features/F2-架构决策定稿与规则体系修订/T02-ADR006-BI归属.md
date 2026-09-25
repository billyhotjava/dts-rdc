# T02: ADR-006 BI 归属

**优先级**: P0
**状态**: DRAFT
**依赖**: F0/T01、开放问题 Q2（stack BI 前端落点）、Q6（copilot-analytics 是否有生产数据）

## 目标
定稿 Card / Dashboard / Screen / FixedReport 等 BI 能力归 stack 还是归头脑，并确定两份分叉的合并基线（账本#22）。

## 技术设计
- **事实输入**：同名 REST 资源 50 个；copilot 独有 8 个（其中 `CopilotChat`、`CopilotAdmin`、`AnalysisDraft` 是智能体相关，`FixedReport`、`ReportTemplateCatalog`、`PlatformIndicator`、`Synonym`、`EltMonitor` 是 BI/数据相关）；stack 独有 9 个（Semantic*、DataPortal、Marketplace、ProjectCockpit 等）。
- **备选方案**：
  - A：BI 归 stack（推荐）。以 stack `dts-analytics` 为基线，把 copilot 独有的 BI 能力回迁；智能体相关的 3 个资源进入头脑；头脑通过 `stack BI API` 创建卡片和看板。
  - B：BI 归头脑。以 copilot-analytics 为基线，stack 删除 dts-analytics。
  - C：维持两份，只做接口对齐（不推荐，只作为对照组）。
- **评估维度**：两边自分叉以来的提交数与改动行数（`git log --since=<fork-date> -- <path>`，fork 日期取 copilot 首次提交 2026-03-14）、测试覆盖、前端落点（Q2）、数据迁移量（Q6）、与湖仓的距离（查询引擎/数据源管理在哪边）。
- **ADR 必须写明**：
  1. 资源归属表：58+9 个资源逐个标注 `stack | brain | 删除`；
  2. 头脑调用 BI 的契约草案（由 F7/T05 细化）：`POST /api/analytics/cards`（stack）、`POST /api/analytics/dashboards/{id}/cards`；
  3. 数据库：copilot `copilot_analytics` schema 的去留与迁移策略；
  4. 过渡期：copilot-analytics 保持只读运行，直到 F7 完成。
- **产出**：`docs/adr/ADR-006-bi-ownership.md`。

## 验证
- [ ] 资源归属表覆盖全部 67 个 REST 资源类
- [ ] 提交量对比有命令与输出

## Definition of Done
- [ ] ADR Accepted；F7 的状态可以从 DRAFT 推进
