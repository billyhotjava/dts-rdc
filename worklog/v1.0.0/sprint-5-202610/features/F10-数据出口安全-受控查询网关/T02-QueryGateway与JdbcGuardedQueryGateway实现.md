# T02: QueryGateway 与 JdbcGuardedQueryGateway 实现

**优先级**: P0
**状态**: DRAFT
**依赖**: T01、T04

## 目标
实现 F10 README 中的 `QueryGateway` 契约，作为头脑取数的唯一出口。

## 技术设计
- **类**：`service/query/QueryGateway`（接口）、`JdbcGuardedQueryGateway`（实现）、`DatasourceRegistry`（读取 `studio_datasource`，每个 ref 一个 HikariCP 池，`readOnly=true`）；
- **执行流程**：
  1. `SqlGuard.check`（T01），失败 → 抛出 `QueryBlockedException`，发审计事件 `blocked`；
  2. 从池中取连接 → `conn.setReadOnly(true)`、`conn.setAutoCommit(false)`；
  3. `SET TRANSACTION READ ONLY`；`SET LOCAL statement_timeout = '<limits.timeout>'`；（PG）`SET LOCAL idle_in_transaction_session_timeout`；
  4. 租户注入（T03）；
  5. 使用 `PreparedStatement`（命名参数展开为位置参数），`setFetchSize(500)`、`setMaxRows(limits.maxRows+1)`，流式读取时累计字节数，超过 `maxBytes` 就停止并标记截断；
  6. **始终 rollback**（只读事务，不 commit），关闭连接；
  7. 发审计事件 `executed`；输出 Micrometer 指标 `studio_query_duration_seconds{datasource,purpose}`、`studio_query_blocked_total{code}`；
- **非 PG 方言**：MySQL（老库）→ `SET SESSION TRANSACTION READ ONLY` + `max_execution_time`；Trino → 只读由账号或 catalog 保证，超时使用 `query_max_execution_time` 会话属性；
- **默认限制**：`maxRows=1000`（UI 展示 200）、`timeout=30s`、`maxBytes=16MB`，可以按 `purpose` 覆盖。

## 验证（RED→GREEN）
- [ ] Testcontainers PG：执行 `UPDATE`（绕过 guard，直接调用内部方法）必须因只读事务而失败；`pg_sleep(60)`（绕过 guard）在 30 秒超时后被终止
- [ ] 截断标记与字节上限的单测
- [ ] 连接池耗尽时返回 503 `QUERY_CAPACITY_EXHAUSTED`，不会挂起

## Definition of Done
- [ ] 实现合入，测试通过
