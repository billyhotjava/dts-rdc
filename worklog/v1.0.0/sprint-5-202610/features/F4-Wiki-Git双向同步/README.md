# F4: Wiki-Git双向同步

**优先级**: P0
**状态**: DRAFT（DRAFT=6）
**时间窗**: 2026-10 第 3 周
**整合来源**: Sprint-6 F5 Git 双向同步（2026-09-26 按月度 Sprint 整合）

## 目标
网页编辑 1 分钟内成为产品仓库中的提交，仓库推送 1 分钟内成为 wiki 新版本；冲突不静默覆盖而进入人工合并；现网 wiki 内容与存量文档（含 frontmatter 迁移）完成首次导入。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-同步模型定稿与状态机.md) | 同步模型定稿与状态机 | Sprint-6 F5/T01 | P0 | DRAFT | F2/T06 |
| [T02](T02-空间同步配置与deploy-key管理.md) | 空间同步配置与 deploy key 管理 | Sprint-6 F5/T02 | P0 | DRAFT | T01 |
| [T03](T03-git到wiki入站同步.md) | git → wiki 入站同步 | Sprint-6 F5/T03 | P0 | DRAFT | T02 |
| [T04](T04-wiki到git出站同步.md) | wiki → git 出站同步（含改名/删除/附件） | Sprint-6 F5/T04 | P0 | DRAFT | T02、F3/T03 |
| [T05](T05-首次导入与现网内容迁移.md) | 首次导入与现网内容迁移 | Sprint-6 F5/T05 | P0 | DRAFT | T03 |
| [T06](T06-冲突检测三方合并与同步监控.md) | 冲突检测、三方合并界面与同步监控页 | Sprint-6 F5/T06 | P0 | DRAFT | T03、T04 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-6 F5 Git 双向同步

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
每个空间可配置一个 git 仓库和若干同步根（如 DTS：dts-rdc 的 `docs`、`worklog`；PRS：prs-stack 的 `worklog`）。
同步根下的 Markdown 与附件与 wiki 双向一致；两边同时修改时不静默覆盖。

### 同步模型（W-ADR-7）
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
