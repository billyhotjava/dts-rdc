# T04: copilot-analytics 业务数据迁移

**优先级**: P1
**状态**: DRAFT
**依赖**: T02、开放问题 Q6

## 目标
如果 copilot-analytics 的环境中存在用户创建的 card、dashboard、screen、collection、fixed report 等数据，完整迁移到 stack，保留引用关系、归属人和权限。

## 技术设计
- **先回答 Q6**：在每个部署环境中统计 `copilot_analytics` 各业务表的行数（只读查询），记录在 `assets/bi-data-inventory.md`；如果都是测试数据，由用户确认后跳过迁移（本 task 标记为 N/A 并写明理由）。
- **迁移工具**：一次性的 Java 或 SQL 脚本，按照 T02 的映射表，按依赖顺序执行：collection → database/dataset 引用 → card → dashboard（包括 dashboard_card 布局）→ screen → fixed report；写入 `bi_id_map`；
- **数据源引用**：copilot 中登记的数据源（`DatabaseResource`）需要映射到 stack 中已登记的数据源；映射不上的，列出清单让管理员处理，不自动新建；
- **幂等**：脚本可以重复执行（根据 `bi_id_map` 跳过已迁移的对象）；
- **校验**：迁移后按对象类型比对行数，抽样 10 个看板，截图对比新旧渲染效果。

## Definition of Done
- [ ] 迁移记录与抽样截图进入 `it/IT-07-bi-merge.md`
