# BL-D: 数据中台收敛-BI口径Finance

**优先级**: P0（首个数据场景）/ P1（其余收敛）
**状态**: DRAFT（DRAFT=17）
**时间窗**: 2026-11（Sprint-6 W1–W4：口径与 T17 在 W1–W3，BI/Finance 收口在 W4）
**整合来源**: Sprint-5 F6 Finance 证明链去领域化（通用证明引擎）；Sprint-5 F7 BI 收敛：copilot-analytics 并回 stack；Sprint-5 F8 口径与指标单一事实源（stack governance）（2026-09-26 按月度 Sprint 整合）

## 目标
口径与指标以 dts-stack 为单一事实源；copilot-analytics 并回 stack-BI 后只保留一份 BI；Finance 证明链去领域化为声明式证明引擎。

2026-09-27 产品承接：以 [DTS-C01](../../../docs/plans/2026-09-27-product-capability-roadmap.md) 验证共享数据能力：PRS 原页面/API 与 AI 使用同口径、同快照的授权数据，提供来源、版本、新鲜度与质量信息。T17 复用既有目录/指标/API，不新增通用数据产品中心；其首次联调不等待全量 BI/Finance 收敛。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-口径指标对照表.md) | 口径/指标对照表 | Sprint-5 F8/T01 | P0 | DRAFT | F0/T14 |
| [T02](T02-缺失指标补录到stack-governance.md) | 缺失指标补录到 stack governance | Sprint-5 F8/T02 | P1 | DRAFT | T01 |
| [T03](T03-头脑指标读取改为以stack为准.md) | 头脑指标读取改为以 stack 为准（缓存与降级） | Sprint-5 F8/T03 | P1 | DRAFT | T01、BL-S/T03（服务间身份） |
| [T04](T04-引用一致性CI校验.md) | 引用一致性 CI 校验 | Sprint-5 F8/T04 | P2 | DRAFT | T03、BL-A/T13 |
| [T05](T05-stack内嵌LLM调用盘点与归口.md) | stack 内嵌 LLM 调用盘点与归口 | Sprint-5 F8/T05 | P1 | DRAFT | F0/T12（ADR-005） |
| [T06](T06-合并基线与schema映射.md) | 合并基线与 schema 映射 | Sprint-5 F7/T02 | P0 | DRAFT | F0/T17、F0/T13（ADR-006 Accepted） |
| [T07](T07-copilot独有BI能力回迁stack.md) | copilot 独有 BI 能力回迁 stack | Sprint-5 F7/T03 | P1 | DRAFT | T06 |
| [T08](T08-copilot-analytics业务数据迁移.md) | copilot-analytics 业务数据迁移 | Sprint-5 F7/T04 | P1 | DRAFT | T06、F0/T17 的 Q6 盘点结论 |
| [T09](T09-头脑到stack-BI调用契约与智能体资源归位.md) | 头脑 → stack BI 调用契约与智能体资源归位 | Sprint-5 F7/T05 | P1 | DRAFT | T07、BL-S/T03、BL-S/T06（已验证代用户授权） |
| [T10](T10-前端收敛与engine-analytics下线.md) | 前端收敛与 engine-analytics 下线 | Sprint-5 F7/T06 | P1 | DRAFT | T07–T09 |
| [T11](T11-52个Finance类的机制数据拆解.md) | 52 个 Finance 类的机制/数据拆解 | Sprint-5 F6/T01 | P0 | DRAFT | F1/T01（归属清单） |
| [T12](T12-证明引擎契约与proof-suite-schema.md) | 证明引擎契约与 proof-suite schema | Sprint-5 F6/T02 | P0 | DRAFT | T11 |
| [T13](T13-引擎核心实现与首个用例迁移.md) | 引擎核心实现与首个用例迁移（汇总双路对账） | Sprint-5 F6/T03 | P0 | DRAFT | T12、BL-S/T08（QueryGateway 可用） |
| [T14](T14-其余用例的声明式迁移.md) | 其余用例的声明式迁移 | Sprint-5 F6/T04 | P1 | DRAFT | T13 |
| [T15](T15-删除旧类与accuracyEvidence不回归验证.md) | 删除旧类与 accuracyEvidence 不回归验证 | Sprint-5 F6/T05 | P1 | DRAFT | T14 |
| [T16](T16-规划器大类拆分.md) | 规划器大类拆分（AssetBackedPlannerPolicy） | Sprint-5 F6/T06 | P2 | DRAFT | BL-A/T14 |
| [T17](T17-PRS在营项目数据产品最小交付.md) | PRS 在营项目数据产品最小交付 | 2026-09-27 DTS-C01 | P0 | DRAFT | F0/T01、T04、T14；T01～T03；运行安全/审计前提见 Task |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-5 F6 Finance 证明链去领域化（通用证明引擎）

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
copilot S31–S34 为财务域建立了"可证明正确"的能力（对账、不变量、oracle 比对、计分卡、签核基线、accuracyEvidence），
但这些能力写成了 52 个 `Finance*` 类、约 7.7k 行（账本#11）。本 Feature 把其中的**机制**提炼为通用证明引擎，**规则和用例**全部改为 Pack 中的声明式资产。
完成后，任何域（包括将来的 metro）只需编写 JSON/YAML 就能获得同等的证明能力。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| Java | `ProofEngine` | `ProofRun run(ProofSuiteRef suite, ProofContext ctx)`；`ProofContext{tenantId, asOf, traceId}` |
| Java | SPI | `ProofSource`（取数：`sql`/`http-json`/`snapshot`）、`ProofCheck`（比较：`equals`/`tolerance`/`invariant`/`tieout`/`dual-path`）、`ScorecardPublisher`（计分输出） |
| 资产 | `quality/proof/<suite>.yaml`（schema `proof-suite.v1`） | `suite, domain, cases[]{id, left:{source,ref,sql?,params}, right:{...}, check:{type, tolerance?, keys[]}, severity}`, `schedule?`, `scorecard{name, weights}` |
| 数据 | `studio_proof_run`、`studio_proof_case_result` | run: `id, suite, pack_version_id, started_at, finished_at, status, pass, fail, error`；case: `run_id, case_id, status, left_value, right_value, diff, evidence jsonb` |
| 契约 | `accuracyEvidence` | 保持 S34 的结构不变（`level`、`reasons[]`、`missingProofs[]`、`nextSteps[]`），其中的证据来源改为 `studio_proof_run` |

### UI/UX 规格
沿用 copilot 已有的证据展示（答案卡片中的证据等级）；如果 copilot 已有计分卡页面，只替换其数据源，不改动界面。

### Definition of Ready
- [ ] 契约：T12 完成后钉死  - [x] 竖切片：Pack 资产 → ProofEngine → run 表 → accuracyEvidence → 答案卡片  - [x] UI：沿用现有  - [ ] 依赖  - [x] 验收：T15

### 完成标准
- [ ] `Finance*` 类数量为 0（或进入白名单并有明确理由）
- [ ] S33/S34 定义的财务证明用例在新引擎上全部重跑，通过或失败的状态与旧实现一致

## 来源规格：Sprint-5 F7 BI 收敛：copilot-analytics 并回 stack

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
BI 只保留一份：以 stack `dts-analytics` 为基线，吸收 copilot 分叉期间新增的 BI 能力；
头脑通过 stack 的 BI API 生成卡片/看板；`engine-analytics`（原 copilot-analytics）下线。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| REST（stack） | `POST /api/analytics/cards` | req `{name, datasetRef|nativeQuery{datasourceRef, sql}, display, vizSettings, collectionId?, origin:{type:"agent", sessionId, messageId, packVersion}}`；resp `{id, url}` |
| REST（stack） | `POST /api/analytics/dashboards` / `POST /api/analytics/dashboards/{id}/cards` | 头脑创建看板、追加卡片 |
| REST（stack） | `GET /api/analytics/fixed-reports`、`/report-templates` | 回迁的 copilot 独有能力（路径与 copilot 现有路径保持一致，便于前端迁移） |
| 身份 | 头脑调用 stack | 经 BL-S 验证的代用户身份；stack 按真实用户的租户和权限创建，卡片归属该用户；不允许服务账号代持兜底 |
| 数据 | stack analytics 库 | 迁移 copilot `copilot_analytics` schema 中的业务对象（Q6） |

### UI/UX 规格
- **入口变化**：用户在 Studio 工作台的答案卡片上点击"保存为卡片"或"加入看板" → 调用 stack API → 成功后提示"已保存"，并提供"在分析中心打开"链接（深链 `https://<stack>/analytics/cards/{id}`）。
- **四态**：保存中（按钮 loading）/ 失败（toast 显示错误原因，例如无权限、数据源未登记）/ 成功（toast + 链接）/ 空（不适用）。
- **走查**：1. 工作台提问"本月各项目租金净额" → 2. 答案出现表格或图表 → 3. 点击"保存为卡片" → 4. 选择收藏夹 → 5. 提示成功 → 6. 点击链接，stack 分析中心显示该卡片，并标注来源为"智能体"。
- stack 侧的 BI 页面沿用 stack 现有的设计（落点见 F0/T17 / Q2）。

### Definition of Ready
- [x] 契约  - [x] 竖切片：工作台 → 头脑 → stack BI API → stack 库 → 分析中心页面  - [x] UI 落点已命名  - [ ] 依赖：ADR-006、Q2、Q6  - [x] 验收

### 完成标准
- [ ] `engine-analytics` 不再部署；原 copilot BI 页面的功能在 stack 中都有对应（对照表 100% 覆盖）
- [ ] "保存为卡片"走查截图

## 来源规格：Sprint-5 F8 口径与指标单一事实源（stack governance）

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
指标定义只在 stack governance 中维护；头脑和 Pack 通过引用消费。"同一个指标，两处定义、两个数"的情况从机制上消除；
stack 内嵌的 AI 调用归口到头脑，避免出现"两个大脑"。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 引用 | Pack `metrics[].indicatorRef` | `stack://indicator/<code>@<version>` |
| REST（stack，已有，账本#19/#25） | `GET /api/governance/indicators?codes=&status=PUBLISHED`、`GET /api/governance/indicators/{code}` | 头脑读取：`{code, name, version, expression, caliberText, dimensions[], status, updatedAt}` |
| 缓存 | 头脑 `studio_indicator_cache` | 保留 code/version/payload/fetched_at 的映射；缓存键须覆盖定义作用域及版本，不能混用租户定义；刷新窗口与硬过期阈值由 F0/T14 定稿，当前授权和发布状态独立校验 |
| 证据 | accuracyEvidence reasons | 新增 `CALIBER_CACHE_STALE`、`INDICATOR_NOT_PUBLISHED`、`INDICATOR_REF_MISMATCH` |
| REST（头脑，新增） | `POST /api/ai/llm/complete`（内部，`X-DTS-Service`） | 供 stack 的建模/治理 AI 功能调用，替代 stack 自己直连 LLM |

### UI/UX 规格
无新页面；答案卡片的证据中显示"指标：租金净额（stack v3）"，点击后深链到 stack 指标详情页。

### Definition of Ready
- [x] 契约  - [x] 竖切片：stack 指标 → 头脑缓存 → NL2SQL 表达式 → 证据 → UI 深链  - [x] UI 落点  - [ ] 依赖：ADR-007  - [x] 验收

### 完成标准
- [ ] 6 个语义包的全部 metrics 都有 `indicatorRef`，或登记了例外理由
- [ ] stack 暂时不可用时，仅在授权与已发布版本仍有效、缓存未硬过期的情况下降级并显示 `CALIBER_CACHE_STALE`；撤权/撤回/未发布或无法确认授权时拒绝，详见 T03。
