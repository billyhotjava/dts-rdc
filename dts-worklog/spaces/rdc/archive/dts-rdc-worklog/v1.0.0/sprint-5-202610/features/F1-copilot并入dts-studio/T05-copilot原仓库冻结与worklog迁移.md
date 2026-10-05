# T05: copilot 原仓库冻结与 worklog 迁移

**原编号**: Sprint-5 F3/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T03

## 目标
copilot 原仓库只读归档，所有人都能找到新位置；copilot 的 34 个 sprint 规划历史在 studio 中可以检索，且不与 RDC 的 worklog 混淆。

## 技术设计
- **步骤**：
  1. copilot main 最后一次提交：README 顶部写"已迁移至 dts-studio/engine（commit <sha>），本仓库只读"；
  2. GitHub 仓库设置为 Archived（**需要用户操作或确认**；`gh repo archive billyhotjava/dts-copilot`）；
  3. `engine/worklog-history/` 顶部加 README：说明这是 copilot S1–S34 的历史规划，状态以 BL-A/T21 收口后的队列为准，新规划写在 `dts-rdc/worklog`；
  4. `worklog-history/prs/v1/`（dbt 模型包、ODS DDL，账本#30）→ 属于花卉领域资产，复制到 `prs-stack/pack/assets/dbt-reference/`（BL-A/T08 目录），并在原位置留指针；
  5. 在 RDC 的 `worklog/v1.0.0/README.md` 文档索引中加入 copilot 历史的链接。

## 验证
- [ ] GitHub 上 copilot 显示 Archived
- [ ] 从 RDC 的 README 两次点击内能找到 copilot 的 S34 README

## Definition of Done
- [ ] 完成并记录
