# F5: Git 双向同步

**优先级**: P0 · **状态**: DRAFT

## 目标
每个空间可配置一个 git 仓库和若干同步根（如 DTS：dts-rdc 的 `docs`、`worklog`；PRS：prs-stack 的 `worklog`）。
同步根下的 Markdown 与附件与 wiki 双向一致；两边同时修改时不静默覆盖。

## 同步模型（W-ADR-7）
```
                 ┌──────────── wiki (PG, 事实源) ────────────┐
 网页编辑 ─► page_version(source=WEB) ─► 出站队列 ─► 工作副本 commit(作者=用户) ─► rebase ─► push
 git push ─► fetch ─► diff(last_synced_commit..origin) ─► 逐文件：
               · wiki 侧自上次同步未改 → 新版本(source=GIT, git_commit=sha)
               · wiki 侧也改了且内容不同 → sync_conflict（保存 git 版本），page.sync_status=CONFLICT
               · 内容相同 → 仅推进同步点
```
- 同步点：每个 (空间, 同步根) 记录 `last_synced_commit`；wiki 出站提交成功推送后也推进。
- 工作副本：服务器上每个仓库一个本地 clone（`/data/dts-wiki-v2/repos/<repo>`），只由同步器进程操作（PG advisory lock 保证单实例）。
- 冲突解决：界面三方对比（基线 / wiki 版 / git 版），人工合并后产生 `source=MERGE` 版本并正常写回 git。

## Task 列表
| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 同步模型定稿与状态机 | P0 | DRAFT | F1/T02 |
| T02 | 空间同步配置与 deploy key 管理 | P0 | DRAFT | T01 |
| T03 | git → wiki 入站同步 | P0 | DRAFT | T02 |
| T04 | wiki → git 出站同步（含改名/删除/附件） | P0 | DRAFT | T02、F3/T03 |
| T05 | 首次导入与现网内容迁移 | P0 | DRAFT | T03 |
| T06 | 冲突检测、三方合并界面与同步监控页 | P0 | DRAFT | T03、T04 |
