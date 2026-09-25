# F11: 审计统一入 Kafka

**优先级**: P1
**波次**: C
**状态**: DRAFT

## 目标
兑现铁律 #4：头脑与 prs 中人和 AI 的关键操作，以统一的 CloudEvents 格式写入 Kafka `dts.audit.v1`，由 stack 消费并落到 append-only 存储；
可以通过 traceId 把一次问答的"登录 → 提问 → SQL → 结果 → 动作"完整串起来。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 事件 | CloudEvents 1.0 JSON（structured mode） | `specversion, id(uuid), source("dts-studio/engine-ai"), type, time, subject, datacontenttype, tenantid(ext), actorid(ext), actortype(ext: user|service|agent), traceid(ext), data{...}` |
| type 目录 | `dts.ai.chat.{asked,answered}`、`dts.ai.query.{executed,blocked}`、`dts.pack.{installed,activated,rolledback}`、`dts.action.{drafted,approved,committed,rejected}`、`dts.auth.{login,denied}`、`prs.biz.*` | 每个 type 的 `data` 使用 JSON Schema 描述（`dts-studio/protocol/audit/*.schema.json`） |
| Topic | `dts.audit.v1` | 分区键 = `tenantid`；保留期 ≥ 7 天（持久化存储在下游）；`min.insync.replicas` 按集群配置 |
| Outbox | 头脑 `studio_audit_outbox`、prs `outbox`（prs-platform 已有，账本#27） | `id, event jsonb, created_at, published_at null`；轮询发布，至少一次投递 |
| 存储 | stack 消费后的存储 | append-only：数据库层禁止 UPDATE/DELETE（通过触发器或只授予 INSERT 权限） |

## UI/UX 规格
- 头脑的答案卡片显示"审计号"（事件 id 前 8 位），点击复制；
- 审计查询界面：本 sprint 不新做，使用 stack 已有的审计页面（如果有，由 T04 确认）或 Kafka UI（`dts-kafka-ui`，账本#24）查看。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 审计事件 schema 与 topic 规划 | P0 | DRAFT | F2/T06 |
| T02 | 头脑审计改为 outbox → Kafka | P1 | DRAFT | T01 |
| T03 | prs 审计与 outbox 接入 | P1 | DRAFT | T01、F1/T01 |
| T04 | stack 侧消费与 append-only 存储 | P1 | DRAFT | T01 |
| T05 | traceId 端到端追溯验证 | P1 | DRAFT | T02–T04、F9/T02 |

## Definition of Ready
- [x] 契约  - [x] 竖切片：操作 → outbox → Kafka → stack 存储 → 查询  - [x] UI：审计号  - [ ] 依赖  - [x] 验收：T05

## 完成标准
- [ ] 主竖线的一次问答在存储中可以查到 ≥ 3 条同一 traceId 的事件（asked / query.executed / answered）
- [ ] 尝试 UPDATE 审计表失败（证据）
