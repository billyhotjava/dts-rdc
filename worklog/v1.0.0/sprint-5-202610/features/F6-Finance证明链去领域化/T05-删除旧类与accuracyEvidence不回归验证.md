# T05: 删除旧类与 accuracyEvidence 不回归验证

**优先级**: P1
**状态**: DRAFT
**依赖**: T04

## 目标
删除 `Finance*` / `VoucherLedger*` 旧类与对应的测试（测试改写为引擎测试和 Pack 契约测试），并证明 S34 的 accuracyEvidence 等级分布没有变化。

## 技术设计
- 删除前运行 golden set，记录每道题的 `evidence_level` 与 `reasons`；删除后再运行一次，逐题比对；
- 旧快照表（029/034）：数据迁移到 `studio_proof_run`（写一个一次性的迁移 changeset，带 `context: migrate-proof-snapshots`），旧表重命名为 `*_legacy`，保留 1 个版本周期后删除；
- 更新 `domain-leak-allowlist.txt`，删除所有 Finance 条目。

## 验证
- [ ] `find engine-ai/src/main -name 'Finance*.java' | wc -l` = 0
- [ ] 证据等级逐题一致（差异题逐一解释）

## Definition of Done
- [ ] `it/IT-05-no-domain-in-engine.md` 的白名单清零
