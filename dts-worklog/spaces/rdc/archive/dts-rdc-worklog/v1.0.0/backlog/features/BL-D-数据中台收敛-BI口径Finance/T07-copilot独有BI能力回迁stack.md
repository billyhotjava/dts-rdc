# T07: copilot 独有 BI 能力回迁 stack

**原编号**: Sprint-5 F7/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T06

## 目标
把 `FixedReport`、`ReportTemplateCatalog`、`PlatformIndicator`、`Synonym`、`EltMonitor` 五个 copilot 独有的 BI/数据能力（账本#22），以及 F0/T17 中标记为"以 copilot 为准"的同名资源改动，合入 stack `dts-analytics`。

## 技术设计
- 按资源逐个迁移：REST + service + domain + repository + Liquibase + 测试，一起搬迁；包名改为 stack 的 `com.yuzhi.dts.analytics.*`；
- `PlatformIndicator`：在 stack 内部可以直接调用 platform 的指标服务（使用 stack 的内部调用方式，不再需要 S29 的跨系统联邦配置），**不复制**指标数据；
- `EltMonitor`：与 stack 已有的 `dts-platform-webapp/src/pages/explore/etl/EltConsolePage.tsx` 对比，如果功能重复，以 stack 现有实现为准，只补齐缺失的部分；
- `Synonym`：同义词属于语义资产，对照 BL-D 的决定——指标同义词归 stack；Pack 中的 `synonyms[]` 继续由头脑用于 NL 理解，两者之间的关系在 `assets/bi-schema-map.md` 中说明；
- 每个资源迁移后，把 copilot 原有的测试一并迁移并跑通。

## 验证
- [ ] stack 构建通过（在构建目录）；迁入的测试全部通过
- [ ] 契约测试：5 个资源的端点路径和响应结构与 copilot 原版一致（前端可以无缝切换）

## Definition of Done
- [ ] PR 合入 stack
