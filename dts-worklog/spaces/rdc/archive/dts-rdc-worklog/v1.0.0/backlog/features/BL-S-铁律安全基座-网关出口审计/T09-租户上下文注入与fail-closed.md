# T09: 租户上下文注入与 fail-closed

**原编号**: Sprint-5 F10/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T08、T03

## 目标
按数据源的 `tenant_scope` 在执行层强制租户隔离，而不是依靠提示词（prs R-010 / B-007，账本#28）；取不到租户时 fail-closed。

## 技术设计
- **三种模式**：
  1. `RLS_SESSION_VAR`（prs 新库，账本#27：`FORCE ROW LEVEL SECURITY`，策略读取 `current_setting('app.tenant_id', true)`）→ 在事务内执行 `SELECT set_config('app.tenant_id', ?, true)`（等价于 `SET LOCAL`，使用参数化避免注入）；这里是网关内部调用，不受 T07 函数白名单的限制；
     只读账号 `dts_brain_ro` **不能**有 `BYPASSRLS` 权限，也不能是表的 owner（T10 会校验）；
  2. `VIEW_COLUMN`（stack mart / 兼容视图）→ 使用 `SqlGuard` 的 AST 改写：对数据源声明的每个租户化视图，外层包一层 `SELECT * FROM (<原 SQL>) ...` **是不够的**（原 SQL 可以直接访问底表），正确做法是**把 FROM 中的每个租户化表或视图替换为带过滤的子查询** `(SELECT * FROM v WHERE tenant_id = ?) v`；这项改写在 AST 层完成，并有单测覆盖 join、子查询、CTE 等情况；
     主竖线使用 RLS_SESSION_VAR 或已具 tenant_id 的 VIEW_COLUMN；mart 无租户列时先补列/视图或选 prs RLS 数据源，不能降为 NONE 通过主竖线；
  3. `NONE` → 仅用于显式登记的非租户公共数据或隔离的旧系统回归，不参加租户业务主竖线；来源、访问主体、期限写入 `assets/tenant-scope-decisions.md`，审计记录 NONE。
- **fail-closed**：数据源为 `RLS_SESSION_VAR` 或 `VIEW_COLUMN`，且 `ctx.tenantId` 为空 → 抛出 `TenantContextMissingException`（HTTP 403 `TENANT_CONTEXT_REQUIRED`），不会执行查询。

## 验证（RED→GREEN）
- [ ] Testcontainers：建一张启用 RLS 的表，插入 t1/t2 数据；以 t1 上下文查询只能得到 t1 的行；无上下文时查询被拒绝；账号有 BYPASSRLS 时 T10 的启动校验失败
- [ ] AST 改写单测：包含 join、CTE、子查询、union、别名的 12 个样例
- [ ] 端到端：alice 与 bob 问"当前在营项目数"，分别与已冻结的租户可见项目集合及 status=1/type=1/del_flag=0 口径一致；两租户计数可以相同，仍须证明不能读取对方项目 ID（证据进入 IT-06）

## Definition of Done
- [ ] 证据进入 `it/IT-06-query-gateway.md`

## 2026-09-26 承接约束

PRS-G03：实际 tenant_id 使用 "1"/"2"，不向 bigint 注入 t1/t2。准备有效、删除、停营、异租户项目等独立验收夹具；先修正或独立校验 API 过滤规则，再对比 API/SQL/答案。不得将未过滤 del_flag 的现有 API total 当作指标真值。
