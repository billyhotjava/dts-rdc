# T04: wiki → git 出站同步（含改名/删除/附件）

**原编号**: Sprint-6 F5/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T02、F3/T03

## 技术设计
- 网页操作产生出站任务（表 `sync_outbox`：page_id、op=`WRITE|MOVE|DELETE|ATTACH`、version_id、actor），事务内写入。
- 同步器批量取任务：在工作副本中按顺序执行（写文件 / `git mv` / `git rm`），**每个用户操作一个提交**，作者 = wiki 用户（`--author`），提交者 = `DTS Wiki <wiki@yuzhicloud.com>`，message = `wiki: <操作> <路径>`（与现网格式一致）。
- 推送：`git pull --rebase` 后 `git push`；rebase 冲突 → 中止 rebase，相关页面进入 T03 的冲突流程（以远端为 git 版本），不强推。
- 推送成功后推进 `last_synced_commit`，页面状态 `SYNCED`；失败按指数退避重试，状态页可见。
- 保护：禁止任何 `--force`；出站只触碰同步根内的路径（路径白名单校验）。

## 验证
- [ ] 竖线：wiki 中编辑 PRS worklog 页 → 60 s 内 prs-stack 出现作者为编辑者的提交
- [ ] 改名/删除分别表现为 rename/delete 提交
