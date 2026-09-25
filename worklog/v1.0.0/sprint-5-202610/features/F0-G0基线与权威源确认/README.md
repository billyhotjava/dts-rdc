# F0: G0 基线与权威源确认

**优先级**: P0
**波次**: A
**状态**: DRAFT

## 目标
在动任何代码之前，确认"以哪份代码为准"，并留下合并前的**可复现行为基线**，
使后续每一次搬迁、拆分都能用同一把尺子证明"没有回归"。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 文档 | `assets/source-of-truth.md` | 每个模块：权威仓库 URL、分支、基准 commit SHA、工作副本路径、构建路径、负责人 |
| 文档 | `assets/baseline-golden-answers.md` | 每题：`question, domain, expected_sql_hash, answer_value, evidence_level, latency_ms, run_at, commit_sha` |
| 数据 | `assets/baseline-golden-answers.jsonl` | 同上（机读，供 F13/T02 自动比对） |
| 文档 | `it/baseline.md` | 启动命令、端口表、健康检查、登录账号、问数 smoke 结果 |
| 文档 | `assets/domain-profile.md` | 花卉域词汇表摘要、核心不变量、数据量级（引用 prs F1、copilot S25/S30，不重做） |

## UI/UX 规格
非用户面 Feature；基线中的"问数 smoke"使用现有 copilot webapp 工作台（`/workspace`）手工走查并截图。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 确认各模块权威仓库与基准提交 | P0 | DRAFT | - |
| T02 | 冻结合并前 copilot 行为基线（golden set 快照） | P0 | DRAFT | T01 |
| T03 | 三系统交付基线（同机启动、登录、问数 smoke） | P0 | DRAFT | T01 |
| T04 | 领域画像摘要与铁律/领域包自检 | P1 | DRAFT | T01 |

## Definition of Ready
- [ ] 契约已钉死（上表）  - [x] 竖切片：不涉及  - [x] UI 落点：不涉及  - [ ] 依赖：需用户确认 Q1（stack 权威仓库）  - [x] 验收可验证

## 完成标准
- [ ] `assets/source-of-truth.md` 经用户签字（在文档末尾记录确认人与日期）
- [ ] golden set 基线可由脚本一键重跑，两次重跑结果差异 ≤ 2%（LLM 非确定性容差）
- [ ] `it/baseline.md` 所有步骤有真实输出，无占位
