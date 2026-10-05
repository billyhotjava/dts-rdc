# T17: 分叉差异深度比对与 stack BI 前端落点

**原编号**: Sprint-5 F7/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T01（只读调研先于 ADR-006）

## 目标
量化两份 analytics 的差异（不仅是 REST 类名，还包括 service、domain、Liquibase、前端页面），回答开放问题 Q2（stack 的 BI 前端在哪里），产出 `assets/bi-fork-diff.md`。

## 技术设计
- **比对维度**：
  1. 50 个同名 REST 资源（账本#22）：`diff -u` 两边文件，按"无差异 / 小于 20 行 / 大于 20 行"分三档；大于 20 行的逐个记录差异摘要；
  2. service / domain / repository 包：同样按三档比对；
  3. Liquibase：两边 changelog 列表与表结构的差异（表名、列名）；
  4. copilot 独有的 8 个资源：逐个说明功能与依赖（`FixedReport` 依赖报表模板目录，`PlatformIndicator` 依赖 S29 联邦配置，`EltMonitor` 依赖 `service/elt`，`CopilotChat`/`CopilotAdmin` 代理到 engine-ai）；
  5. 前端：copilot webapp 中的 BI 页面（CardsPage、DashboardsPage、CollectionsPage、DatabaseDetailPage 等，见 `webapp/src/pages`）对比 stack 前端——**先找到 stack 的 BI 页面在哪里**：`dts-analytics-webapp` 是空的（账本#23），需要在 `dts-platform-webapp/src/pages/**` 中查找 card/dashboard/screen 的路由（`ScreenStrip.tsx` 提示可能在 workbench 下）；
  6. 分叉点：以 copilot 首次提交日期 2026-03-14 为界，统计 stack `source/dts-analytics` 此后的提交数与改动行数，以及 copilot `dts-copilot-analytics` 的提交数与改动行数。
- **结论**：哪边的实现更新；按资源给出"以 stack 为准 / 以 copilot 为准 / 需要手工合并"的建议。

## Definition of Done
- [ ] 报告完成，Q2/Q6 有证据结论；作为 T13 定案输入，不能反过来等待 ADR-006

## 2026-09-26 承接约束

本 Task 在波次 A 执行。补充 Q6：只读盘点各环境 BI 业务对象、数量、归属人与权限，以及是否为真实用户资产，产出 `assets/bi-data-inventory.md`。无法访问的环境标待核实，不假定空库。不得为盘点迁移或删除数据；是否跳过迁移由 T13 据证据决定。
