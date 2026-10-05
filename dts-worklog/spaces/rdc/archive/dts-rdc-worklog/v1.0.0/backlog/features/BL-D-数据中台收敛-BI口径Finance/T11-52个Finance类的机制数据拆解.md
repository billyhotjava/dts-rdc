# T11: 52 个 Finance 类的机制/数据拆解

**原编号**: Sprint-5 F6/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: F1/T01（归属清单）

## 目标
对 52 个 `Finance*` 类（以及 `VoucherLedger*`，账本#11）逐个拆解："通用机制是什么、领域数据是什么、行为是否有测试覆盖"，产出 `assets/finance-decomposition.md`，作为 T12 设计的依据。

## 技术设计
- **表格列**：`class | lines | role(registry|service|runner|provider|publisher|scheduled|jdbc-config|harness) | mechanism(一句话) | domain-data(读取的配置/SQL/表) | tests(对应测试类) | target(ProofSource|ProofCheck|ScorecardPublisher|asset|delete)`。
- **已知的模式**（根据类名初步判断，实施时需阅读代码确认）：
  - `*Registry` + `*.v1.json`：加载配置 → 统一由 `PackBackedJsonRegistry` 处理（BL-A/T05 已完成来源切换）；
  - `*Service`：比较逻辑 → `ProofCheck` 的几种类型（dual reconciliation → `dual-path`；tieout → `tieout`；invariant → `invariant`；differential grid → 参数化的 `tolerance`）；
  - `*ProofRunner` / `*ProofService` / `*JdbcConfiguration` / `*JdbcProperties` / `*QueryExecutor`：连接应用库 MySQL 或 oracle 库取数 → `ProofSource(sql)` + QueryGateway 数据源绑定（**这类类的连接属性必须移出代码**）；
  - `*ScorecardEvidenceProvider` / `*ScorecardService` / `*PublisherService` / `*ScheduledPublisherService` / `*SnapshotService`：计分和发布 → `ScorecardPublisher` + 调度配置；
  - `FinanceDetailReconciliationHarness`、`*HttpPayloadProvider`、`*JsonSourceClient`：HTTP 取数 → `ProofSource(http-json)`；
  - `FinanceAnswerAuditTrail*`、`FinanceChatAuditTrailService`：答案审计 → 与 BL-S 审计合并。
- 同时统计：Liquibase 029/034 中的快照表（`finance_reconciliation_scorecard_snapshot`、`finance_weak_path_reconciliation_candidate_snapshot`，账本#14）如何迁移到 `studio_proof_run`。

## 验证
- [ ] 52 个类都已登记；每个 target 都能在 T12 的契约中找到落点

## Definition of Done
- [ ] 文档经 BL-D 负责人与原 S33/S34 作者确认
