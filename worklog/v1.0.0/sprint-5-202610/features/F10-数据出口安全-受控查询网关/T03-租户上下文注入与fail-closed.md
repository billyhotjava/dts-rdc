# T03: 租户上下文注入与 fail-closed

**优先级**: P0
**状态**: DRAFT
**依赖**: T02、F9/T03

## 目标
按数据源的 `tenant_scope` 在执行层强制租户隔离，而不是依靠提示词（prs R-010 / B-007，账本#28）；取不到租户时 fail-closed。

## 技术设计
- **三种模式**：
  1. `RLS_SESSION_VAR`（prs 新库，账本#27：`FORCE ROW LEVEL SECURITY`，策略读取 `current_setting('app.tenant_id', true)`）→ 在事务内执行 `SELECT set_config('app.tenant_id', ?, true)`（等价于 `SET LOCAL`，使用参数化避免注入）；这里是网关内部调用，不受 T01 函数白名单的限制；
     只读账号 `dts_brain_ro` **不能**有 `BYPASSRLS` 权限，也不能是表的 owner（T04 会校验）；
  2. `VIEW_COLUMN`（stack mart / 兼容视图）→ 使用 `SqlGuard` 的 AST 改写：对数据源声明的每个租户化视图，外层包一层 `SELECT * FROM (<原 SQL>) ...` **是不够的**（原 SQL 可以直接访问底表），正确做法是**把 FROM 中的每个租户化表或视图替换为带过滤的子查询** `(SELECT * FROM v WHERE tenant_id = ?) v`；这项改写在 AST 层完成，并有单测覆盖 join、子查询、CTE 等情况；
     如果 mart 视图还没有 `tenant_id` 列（花卉目前是单租户），在数据源上显式声明 `tenant_scope=NONE`，并由用户签字确认（写入 `assets/tenant-scope-decisions.md`），prs 多租户上线前必须改为 VIEW_COLUMN；
  3. `NONE` → 不注入，但审计中记录 `tenant_scope=NONE`。
- **fail-closed**：数据源为 `RLS_SESSION_VAR` 或 `VIEW_COLUMN`，且 `ctx.tenantId` 为空 → 抛出 `TenantContextMissingException`（HTTP 403 `TENANT_CONTEXT_REQUIRED`），不会执行查询。

## 验证（RED→GREEN）
- [ ] Testcontainers：建一张启用 RLS 的表，插入 t1/t2 数据；以 t1 上下文查询只能得到 t1 的行；无上下文时查询被拒绝；账号有 BYPASSRLS 时 T04 的启动校验失败
- [ ] AST 改写单测：包含 join、CTE、子查询、union、别名的 12 个样例
- [ ] 端到端：alice 与 bob 问"当前在营项目数"，结果不同，且各自与 prs API 的结果一致（证据进入 IT-06）

## Definition of Done
- [ ] 证据进入 `it/IT-06-query-gateway.md`
