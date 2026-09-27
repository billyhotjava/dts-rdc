# T15: 头脑审计改为 outbox → Kafka

**原编号**: Sprint-5 F11/T02（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T14

## 目标
engine-ai 现有的审计（`ai_audit_log` 表，changeset 003，账本#14）改为 outbox 模式发布到 Kafka；原表保留作为本地查询和对账使用。

## 技术设计
- **写入**：业务事务内写入 `studio_audit_outbox`（与业务数据在同一个库），`AuditPublisher`（`@Scheduled` 每秒执行，使用 PG `SELECT ... FOR UPDATE SKIP LOCKED` 批量取 500 条，保证多副本安全）→ Kafka producer（`acks=all`、`enable.idempotence=true`）→ 成功后更新 `published_at`；
- **覆盖的事件**：chat asked/answered（`service/chat`）、query executed/blocked（BL-S QueryGateway）、pack installed/activated/rolledback（BL-A/T03）、action drafted/approved/committed（BL-A/T12 + `OntologyActionApprovalService`）；
- **Kafka 不可用**：outbox 积压，不影响业务（铁律 #1）；积压超过阈值时告警（BL-E/T03）；
- **清理**：已发布超过 7 天的 outbox 记录定期删除；
- **`FinanceAnswerAuditTrail*`、`FinanceChatAuditTrailService`**（账本#11）：合并到统一审计中，由 BL-D/T11 标注，本 task 负责事件的落地。

## 验证（RED→GREEN）
- [ ] Testcontainers（PG + Kafka）：业务事务回滚时不产生事件；Kafka 停止 30 秒后恢复，事件不丢失、不重复（消费端按 id 去重）
- [ ] 事件样例通过 T14 的 schema 校验

## Definition of Done
- [ ] 合入；指标 `studio_audit_outbox_backlog` 可见
