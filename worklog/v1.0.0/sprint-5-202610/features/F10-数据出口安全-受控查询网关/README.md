# F10: 数据出口安全（受控查询网关）

**优先级**: P0
**波次**: B
**状态**: DRAFT（依赖 ADR-009）

## 目标
兑现铁律 #3：头脑的**所有**取数路径（NL2SQL 执行、模板、Skill、工具、证明引擎的 SQL 源）统一经过 `QueryGateway`，
保证：只读、有时限、有行数和字节上限、带租户上下文（取不到租户时 fail-closed）、SQL 通过 AST 白名单校验、可审计。
这也是头脑连接 prs 新库（启用了 RLS）的前置条件。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| Java | `QueryGateway` | `QueryResult execute(QueryContext ctx, DatasourceRef ds, String sql, Map<String,Object> params, QueryLimits limits)` |
| Java | `QueryContext` | `tenantId`(必填，除非数据源声明 `tenantScope=NONE`)、`userId`、`roles`、`traceId`、`purpose`(`nl2sql|template|skill|proof|schema-lookup`) |
| Java | `QueryResult` | `columns[]{name,type}`、`rows`、`truncated`、`rowCount`、`elapsedMs`、`sqlHash`、`datasourceRef` |
| Java | `SqlGuard` | `GuardResult check(String sql, SqlDialect dialect, GuardPolicy policy)`；`GuardResult{allowed, violations[]{code, message, position}}` |
| 配置/数据 | `studio_datasource` | `ref varchar(64) pk`、`dialect`、`jdbc_url`、`username`、`secret_ref`（**不存明文密码**，引用环境变量或 secret）、`tenant_scope(NONE|RLS_SESSION_VAR|VIEW_COLUMN)`、`tenant_column?`、`read_only_verified_at` |
| DB | 只读账号 | `dts_brain_ro`：只有目标 schema 的 `SELECT` 权限；`default_transaction_read_only=on`；`statement_timeout=30s`（数据库级兜底） |
| 事件 | `dts.audit.v1` type `dts.ai.query.{executed,blocked}` | `data{datasource, purpose, sql_hash, rows, elapsed_ms, violations[]}` |

## UI/UX 规格
- 被拦截的查询：答案卡片显示"该问题生成的查询未通过安全校验（原因：xxx）"，不展示 SQL 细节给普通用户；管理员可以在审计中查看。
- 行数截断：表格底部显示"结果已截断，仅显示前 N 行"。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | AST SQL 校验器替换正则黑名单 | P0 | DRAFT | F2/T04 |
| T02 | QueryGateway 与 JdbcGuardedQueryGateway 实现 | P0 | DRAFT | T01、T04 |
| T03 | 租户上下文注入与 fail-closed | P0 | DRAFT | T02、F9/T03 |
| T04 | 数据源登记改造与只读账号 | P0 | DRAFT | F2/T04 |
| T05 | 所有取数路径收口与架构约束测试 | P0 | DRAFT | T02 |
| T06 | 列级脱敏与行级策略扩展点 | P2 | DRAFT | T02 |
| T07 | 红队 SQL 用例集与渗透验证 | P0 | DRAFT | T01–T05 |

## Definition of Ready
- [x] 契约  - [x] 竖切片：问题 → NL2SQL → SqlGuard → QueryGateway → 只读事务 + RLS → 结果与审计  - [x] UI 落点  - [ ] 依赖：ADR-009  - [x] 验收：T07

## 完成标准
- [ ] 架构测试证明：除 QueryGateway 实现类以外，engine 中没有任何类获取 JDBC `Connection`
- [ ] 红队用例 ≥ 40 条，全部拦截或在只读事务中失败，没有数据被修改
- [ ] alice 与 bob 问同一个问题，只能看到各自租户的数据；无租户上下文时返回 0 行或 403
