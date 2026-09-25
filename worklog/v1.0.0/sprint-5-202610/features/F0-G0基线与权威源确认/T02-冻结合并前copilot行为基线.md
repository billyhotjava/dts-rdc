# T02: 冻结合并前 copilot 行为基线（golden set 快照）

**优先级**: P0
**状态**: DRAFT
**依赖**: T01（基准 SHA）

## 目标
用 copilot 现有的 NL2SQL golden set + S34 accuracyEvidence，在基准 SHA 上跑一次完整快照，
形成 `assets/baseline-golden-answers.{md,jsonl}`，作为 F3/F4/F5/F6/F10/F13 的**回归判据**。

## 技术设计
- **输入**：`AI/resources/governance/nl2sql-accuracy-golden-set.v1.json`（账本#13）；
  现有服务 `Nl2SqlAccuracyGoldenSetScorecardService`、`Nl2SqlAccuracyGoldenSetReleaseEvidenceService`（`AIJ/service/copilot/`）；
  analytics 侧的 `Nl2SqlEvalResource`（账本#22）。
- **输出契约**（jsonl，每行一题）：
  ```json
  {"id":"gs-001","question":"当前在营项目数","domain":"project-fulfillment",
   "route":"template|nl2sql|direct","sql":"...","sql_hash":"sha256",
   "answer":{"columns":["在营项目数"],"rows":[[128]]},
   "evidence_level":"HIGH|MEDIUM|LOW|UNTRUSTED","latency_ms":1830,
   "commit_sha":"<copilot sha>","llm":{"provider":"deepseek","model":"..."},"run_at":"2026-10-xxT..+08:00"}
  ```
- **步骤**：
  1. 在基准 SHA 上启动 copilot（沿用 `CP/dev.sh` 或 compose，见 T03）。
  2. 编写 `scripts/baseline/run-golden.sh`（放在 RDC `worklog/v1.0.0/sprint-5-202610/assets/scripts/`，不进入产品仓库）：
     读取 golden set → 依次 `POST /api/ai/agent/chat/send`（或 golden set 评测端点，二选一，优先已有评测端点）→ 解析响应 → 写 jsonl。
  3. **追加主竖线题目**："当前在营项目数""各项目经理负责的在营项目数"（与 prs F7/T04 对齐，账本#28）。
  4. 同配置连跑两次，计算差异率（sql_hash 与 answer 不一致的占比），写进 md 汇总；LLM 温度按生产配置记录。
  5. 汇总表：按 domain 统计题数、路由分布、证据等级分布、P50/P95 时延。
- **错误路径**：LLM 不可用 → 记录为 BLOCKED 并附配置；个别题超时 → 标记 `timeout`，不从基线剔除。

## 影响范围
新增 `assets/baseline-golden-answers.{md,jsonl}`、`assets/scripts/run-golden.sh`。

## 验证
- [ ] jsonl 行数 = golden set 题数 + 2
- [ ] 两次重跑差异率 ≤ 2%（超出则记录不稳定题清单，作为已知噪声）
- [ ] md 汇总中每个数字都能从 jsonl 重算

## Definition of Done
- [ ] 基线文件入库（RDC worklog），脚本可一键重跑
- [ ] Sprint README Gate "合并前行为基线" 置为 PASS
