# T17: stack 侧消费与 append-only 存储

**原编号**: Sprint-5 F11/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T14

## 目标
由 stack 消费 `dts.audit.v1`，落到 append-only 存储，并提供按 traceId、actor、tenant、时间范围的查询。

## 技术设计
- **先调研**：stack 的 `dts-platform/service/audit`（账本#25 中有 audit 目录）是否已有审计存储和查询页面；有的话就扩展它，**不另造**；
- **存储**：PG 表 `dts_audit_event`（`id uuid pk, type, source, time, tenant_id, actor_id, actor_type, trace_id, data jsonb, received_at`），按月分区；
  append-only：消费者账号只授予 `INSERT`，并加触发器 `BEFORE UPDATE OR DELETE ... RAISE EXCEPTION`；
- **消费者**：consumer group `dts-audit-sink`，按 `id` 做幂等（`ON CONFLICT DO NOTHING`）；
- **查询 API**：`GET /api/audit/events?traceId=&actorId=&tenantId=&type=&from=&to=`（需要审计员角色）。

## Definition of Done
- [ ] 消费、查询可用；UPDATE 与 DELETE 被拒绝（证据）

## Console 查询与导出消费（2026-09-27）

BL-C/T06 的查询/CSV 导出由本 Task 提供领域 API：真实主体与租户从可信身份链取得，查询参数不能扩大可见范围；分页、导出上限、敏感字段策略在开发前定稿。导出/拒绝事件先由领域服务持久化并沿既有审计链投递，BFF 不直接访问表或伪造审计身份。授权与导出动作 Schema 对齐 T14。

- [ ] 普通用户、审计员、跨租户参数、超量导出与权限拒绝均有测试；导出事件可按 traceId 查询，数据库只读/append-only 限制保持。
