# T15: 删除旧类与 accuracyEvidence 不回归验证

**原编号**: Sprint-5 F6/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T14

## 目标
删除 `Finance*` / `VoucherLedger*` 旧类与对应的测试（测试改写为引擎测试和 Pack 契约测试），并证明 S34 的 accuracyEvidence 等级分布没有变化。

## 技术设计
- 删除前运行 golden set，记录每道题的 `evidence_level` 与 `reasons`；删除后再运行一次，逐题比对；
- 旧快照表（029/034）：数据迁移到 `studio_proof_run`（写一个一次性的迁移 changeset，带 `context: migrate-proof-snapshots`），切换回退窗口保留原表名和旧 schema 可读性；仅在回退窗口结束、旧部署退出后另行安排重命名/删除；
- 更新 `domain-leak-allowlist.txt`，删除所有 Finance 条目。

## 验证
- [ ] `find engine-ai/src/main -name 'Finance*.java' | wc -l` = 0
- [ ] 证据等级逐题一致（差异题逐一解释）

## Definition of Done
- [ ] `it/IT-05-no-domain-in-engine.md` 的运行期 Finance 白名单清零；已执行 Liquibase 历史例外保留并审计
