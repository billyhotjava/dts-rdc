# T15: DAP Ontology v1 定稿

**原编号**: Sprint-5 F12/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T01

## 目标
把 DAP 文档中 Ontology 层（`dts-agent-protocol.md:47` 起，ObjectType / Relationship / Metric）与实际的语义包 schema（objects / links / metrics / signals / actions / synonyms / fewShots / guardrails，账本#12）合并成一份规范。

## 技术设计
- **对照表**（写入 DAP 文档的新章节"Ontology v1 实现"）：DAP 概念 ↔ 语义包字段；例如 `ObjectType` ↔ `objects[]{name, view, keyDimensions, keyMeasures, commonFilters, defaultTimeField}`；`Relationship` ↔ `links[]{from, to, fromKey, toKey, cardinality, joinHint}`；`Metric` ↔ `metrics[]{name, object, expr, unit, format, caliber, indicatorRef}`；DAP 没有而语义包有的：`signals`（对应 Palantir 的"信号/告警"）、`actions`、`synonyms`、`fewShots`、`guardrails` → 补入 DAP；
- DAP 中有而语义包没有的（例如 DAP 提到的实例级数据、`properties` 类型系统）→ 标注"v2 规划"，不在本期实现；
- 与 Palantir Ontology 的对照写一小段（Object Type / Link Type / Action Type / Function），作为产品叙事的依据。

## Definition of Done
- [ ] DAP 文档更新，schema 文件为唯一来源
