# F8: 口径与指标单一事实源（stack governance）

**优先级**: P1
**波次**: B
**状态**: DRAFT（依赖 ADR-007）

## 目标
指标定义只在 stack governance 中维护；头脑和 Pack 通过引用消费。"同一个指标，两处定义、两个数"的情况从机制上消除；
stack 内嵌的 AI 调用归口到头脑，避免出现"两个大脑"。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 引用 | Pack `metrics[].indicatorRef` | `stack://indicator/<code>@<version>` |
| REST（stack，已有，账本#19/#25） | `GET /api/governance/indicators?codes=&status=PUBLISHED`、`GET /api/governance/indicators/{code}` | 头脑读取：`{code, name, version, expression, caliberText, dimensions[], status, updatedAt}` |
| 缓存 | 头脑 `studio_indicator_cache` | `code pk, version, payload jsonb, fetched_at`；TTL 可配置（默认 10 分钟） |
| 证据 | accuracyEvidence reasons | 新增 `CALIBER_CACHE_STALE`、`INDICATOR_NOT_PUBLISHED`、`INDICATOR_REF_MISMATCH` |
| REST（头脑，新增） | `POST /api/ai/llm/complete`（内部，`X-DTS-Service`） | 供 stack 的建模/治理 AI 功能调用，替代 stack 自己直连 LLM |

## UI/UX 规格
无新页面；答案卡片的证据中显示"指标：租金净额（stack v3）"，点击后深链到 stack 指标详情页。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 口径/指标对照表 | P0 | DRAFT | F2/T03 |
| T02 | 缺失指标补录到 stack governance | P1 | DRAFT | T01 |
| T03 | 头脑指标读取改为以 stack 为准（缓存与降级） | P1 | DRAFT | T01、F9/T03 |
| T04 | 引用一致性 CI 校验 | P2 | DRAFT | T03、F5/T06 |
| T05 | stack 内嵌 LLM 调用盘点与归口 | P1 | DRAFT | F2/T01 |

## Definition of Ready
- [x] 契约  - [x] 竖切片：stack 指标 → 头脑缓存 → NL2SQL 表达式 → 证据 → UI 深链  - [x] UI 落点  - [ ] 依赖：ADR-007  - [x] 验收

## 完成标准
- [ ] 6 个语义包的全部 metrics 都有 `indicatorRef`，或登记了例外理由
- [ ] 断开 stack 后问数仍然可用，证据等级降一级，原因显示 `CALIBER_CACHE_STALE`
