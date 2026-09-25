# T02: 合并基线与 schema 映射

**优先级**: P0
**状态**: DRAFT
**依赖**: T01

## 目标
在 stack `dts-analytics` 上建立合并分支，明确 copilot 的 `copilot_analytics` schema 中每张表在 stack 中的对应表（或新增表），产出迁移设计。

## 技术设计
- stack 分支 `feat/sprint5-bi-merge`（遵循 stack CLAUDE.md：在开发目录提交，在构建目录构建，账本#3）；
- `assets/bi-schema-map.md`：`copilot 表 | stack 表 | 列映射 | 需要新增的列 | 处置（merge/new/drop）`；
- 新增的表和列使用 stack 自己的 Liquibase 命名规范，changeset 放在 stack 的 `dts-analytics` 模块中；
- 标识冲突：两边主键都是自增或序列，迁移时采用"偏移 + 映射表"（`bi_id_map(src_schema, src_table, src_id, dst_id)`），保证引用关系（dashboard → card → collection）一致。

## Definition of Done
- [ ] 映射表评审通过
