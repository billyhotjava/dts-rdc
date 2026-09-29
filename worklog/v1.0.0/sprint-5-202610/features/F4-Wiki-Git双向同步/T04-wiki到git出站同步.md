# T04: wiki → git 出站同步（含改名/删除/附件）

**原编号**: Sprint-6 F5/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T03、F3/T03

## 技术设计
- 网页操作产生出站任务（表 `sync_outbox`：page_id、op=`WRITE|MOVE|DELETE|ATTACH`、version_id、actor），事务内写入。
- 同步器批量取任务：在工作副本中按顺序执行（写文件 / `git mv` / `git rm`），**每个用户操作一个提交**，作者 = wiki 用户（`--author`），提交者 = `DTS Wiki <wiki@yuzhicloud.com>`，message = `wiki: <操作> <路径>`（与现网格式一致）。
- 推送严格按 design/04 先入站再物化 outbox；远端前移导致拒绝时，重新入站/处理冲突后重放，不能只 rebase/push 后推进同步点。
- 每条 outbox 带稳定操作 ID。push 结果未知/DB 确认前崩溃先核验远端并幂等确认；checkpoint 只覆盖 PG 已吸收的远端区间与本批操作，旧批次不能把新的保存误置 SYNCED。失败退避并可见。
- 保护：禁止任何 `--force`；出站只触碰同步根内的路径（路径白名单校验）。

## 验证
- [ ] 竖线：wiki 中编辑 PRS worklog 页 → 60 s 内 prs-stack 出现作者为编辑者的提交
- [ ] 改名/删除分别表现为 rename/delete 提交

- [ ] 入站与 push 之间远端新增不同文件/同文件不同段后 PG/git 一致；响应丢失、确认前崩溃、推送期间新保存不漏操作、不重复版本；证据 `it/wiki/IT-03-sync.md`（Sprint 根相对路径）。
