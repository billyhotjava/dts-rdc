# T08: copilot-analytics 业务数据迁移

**原编号**: Sprint-5 F7/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T06、F0/T17 的 Q6 盘点结论

## 目标
如果 copilot-analytics 的环境中存在用户创建的 card、dashboard、screen、collection、fixed report 等数据，完整迁移到 stack，保留引用关系、归属人和权限。

## 技术设计
- **复核 Q6 快照**：复用 F0/T17 的 `assets/bi-data-inventory.md`，迁移前只读复核变化；如果都是测试数据，由用户确认后跳过迁移（本 task 标记为 N/A 并写明理由）。
- **迁移工具**：一次性的 Java 或 SQL 脚本，按照 T06 的映射表，按依赖顺序执行：collection → database/dataset 引用 → card → dashboard（包括 dashboard_card 布局）→ screen → fixed report；写入 `bi_id_map`；
- **数据源引用**：copilot 中登记的数据源（`DatabaseResource`）需要映射到 stack 中已登记的数据源；映射不上的，列出清单让管理员处理，不自动新建；
- **幂等**：脚本可以重复执行（根据 `bi_id_map` 跳过已迁移的对象）；
- **校验**：迁移后按对象类型比对行数，抽样 10 个看板，截图对比新旧渲染效果。

## Definition of Done
- [ ] 迁移记录与抽样截图进入 `it/IT-07-bi-merge.md`
