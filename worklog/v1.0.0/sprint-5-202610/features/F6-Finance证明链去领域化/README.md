# F6: Finance 证明链去领域化（通用证明引擎）

**优先级**: P1
**波次**: C
**状态**: DRAFT

## 目标
copilot S31–S34 为财务域建立了"可证明正确"的能力（对账、不变量、oracle 比对、计分卡、签核基线、accuracyEvidence），
但这些能力写成了 52 个 `Finance*` 类、约 7.7k 行（账本#11）。本 Feature 把其中的**机制**提炼为通用证明引擎，**规则和用例**全部改为 Pack 中的声明式资产。
完成后，任何域（包括将来的 metro）只需编写 JSON/YAML 就能获得同等的证明能力。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| Java | `ProofEngine` | `ProofRun run(ProofSuiteRef suite, ProofContext ctx)`；`ProofContext{tenantId, asOf, traceId}` |
| Java | SPI | `ProofSource`（取数：`sql`/`http-json`/`snapshot`）、`ProofCheck`（比较：`equals`/`tolerance`/`invariant`/`tieout`/`dual-path`）、`ScorecardPublisher`（计分输出） |
| 资产 | `quality/proof/<suite>.yaml`（schema `proof-suite.v1`） | `suite, domain, cases[]{id, left:{source,ref,sql?,params}, right:{...}, check:{type, tolerance?, keys[]}, severity}`, `schedule?`, `scorecard{name, weights}` |
| 数据 | `studio_proof_run`、`studio_proof_case_result` | run: `id, suite, pack_version_id, started_at, finished_at, status, pass, fail, error`；case: `run_id, case_id, status, left_value, right_value, diff, evidence jsonb` |
| 契约 | `accuracyEvidence` | 保持 S34 的结构不变（`level`、`reasons[]`、`missingProofs[]`、`nextSteps[]`），其中的证据来源改为 `studio_proof_run` |

## UI/UX 规格
沿用 copilot 已有的证据展示（答案卡片中的证据等级）；如果 copilot 已有计分卡页面，只替换其数据源，不改动界面。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 52 个 Finance 类的机制/数据拆解 | P0 | DRAFT | F3/T01 |
| T02 | 证明引擎契约与 proof-suite schema | P0 | DRAFT | T01 |
| T03 | 引擎核心实现与首个用例迁移（汇总双路对账） | P0 | DRAFT | T02、F10/T02 |
| T04 | 其余用例的声明式迁移 | P1 | DRAFT | T03 |
| T05 | 删除旧类与 accuracyEvidence 不回归验证 | P1 | DRAFT | T04 |
| T06 | 规划器大类拆分（AssetBackedPlannerPolicy） | P2 | DRAFT | F5/T07 |

## Definition of Ready
- [ ] 契约：T02 完成后钉死  - [x] 竖切片：Pack 资产 → ProofEngine → run 表 → accuracyEvidence → 答案卡片  - [x] UI：沿用现有  - [ ] 依赖  - [x] 验收：T05

## 完成标准
- [ ] `Finance*` 类数量为 0（或进入白名单并有明确理由）
- [ ] S33/S34 定义的财务证明用例在新引擎上全部重跑，通过或失败的状态与旧实现一致
