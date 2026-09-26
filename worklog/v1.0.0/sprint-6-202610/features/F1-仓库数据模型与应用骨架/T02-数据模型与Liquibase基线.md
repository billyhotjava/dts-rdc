# T02: 数据模型与 Liquibase 基线

**优先级**: P0 · **状态**: DRAFT · **依赖**: T01

## 技术设计
- 按 F1 README 契约建表（`db/changelog/v1_0_0_001__baseline.xml`）；主键 bigint（序列）；时间 `timestamptz`。
- 页面树：邻接表（`parent_id` + `position`），读取整棵树用递归 CTE；同一父节点下 `position` 用间隔整数（1000 步长）便于拖拽插入。
- 版本：`page.current_version_id` 指向最新版本；`page_version.content_md` 存全文（不存 diff，简单可靠；200 篇 × 多版本体量很小）。
- `content_sha256` 用于快速判断"内容是否变化"与同步比对。
- 软删除：`page.deleted_at`（回收站），git 绑定页删除时同步为 `git rm`。
- Repository 层单元测试用 Testcontainers（postgres:18）。

## 验证
- [ ] 空库执行 Liquibase update 成功、rollback 可执行
- [ ] 递归查询 1 万节点页面树 < 100 ms（Testcontainers 基准）
