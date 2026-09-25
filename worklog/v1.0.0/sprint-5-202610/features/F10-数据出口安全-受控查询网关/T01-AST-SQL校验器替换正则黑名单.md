# T01: AST SQL 校验器替换正则黑名单

**优先级**: P0
**状态**: DRAFT
**依赖**: F2/T04

## 目标
用 SQL 解析器的 AST 白名单替代 `SqlSafetyChecker.java:17` 的正则关键词黑名单（账本#17），覆盖黑名单漏掉的 CALL/DO/COPY/SET/LOCK/SELECT INTO/有副作用的函数/多语句等情况。

## 技术设计
- **解析器**：JSqlParser（Apache-2.0 / LGPL 双许可证，选择 Apache-2.0；新增依赖前按 dependency-policy 登记）。PG 方言优先，同时要兼容已有的 Trino 模板（账本#14 中 026 changeset）→ `SqlDialect{POSTGRES, TRINO, MYSQL}`；
- **规则**（`GuardPolicy`，默认值如下，可以由 Pack 的 guardrails 收紧，但不能放宽）：
  1. 只允许单条语句；语句类型只能是 `Select`（包括 WITH、UNION、子查询）；
  2. 禁止 `SELECT ... INTO`、`FOR UPDATE/SHARE`、`LOCK`；
  3. **函数白名单**：聚合函数、字符串、日期、数学、条件函数（`coalesce`、`case` 等）、窗口函数；禁止 `pg_sleep`、`pg_read_file`、`dblink*`、`lo_*`、`nextval`、`setval`、`set_config`、`current_setting`（禁止读取租户变量）、`pg_terminate_backend`、`query_to_xml` 等；未知函数默认拒绝（报告 `UNKNOWN_FUNCTION`，可以通过 Pack 的 guardrails 加入允许清单）；
  4. **对象白名单**：只能访问数据源声明的 schema/表或视图的模式（例如 `public.xycyl_*`、`prs.project`）；禁止访问 `pg_catalog`、`information_schema`（schema 查询由 `SchemaLookupTool` 通过专用路径完成）；
  5. 必须有 `LIMIT`，没有则自动追加 `LIMIT maxRows+1`（用于判断是否截断），不信任 LLM 生成的 LIMIT 值，取二者较小值；
  6. 注释、`$$` 美元引号、E'' 转义都在解析层处理，不做字符串层面的替换；
- 保留原 `SqlSafetyChecker` 中的口径校验（`CaliberRuleRegistry`）调用顺序：先 AST，后口径；
- **解析失败** → 拒绝（fail-closed），错误码 `SQL_PARSE_ERROR`，并记录 SQL hash 供分析（不记录全文，防止日志泄露；全文只进入受控的审计存储）。

## 验证（RED→GREEN）
- [ ] 先把 T07 用例集中的"应拦截"部分写成参数化单测（此时对旧实现运行应有多条失败，作为 RED 证据）
- [ ] golden set 中的全部 SQL 必须通过新的校验（避免误伤），误伤的逐条分析后调整规则
- [ ] 性能：单条 SQL 校验 P95 < 10 ms

## Definition of Done
- [ ] `SqlSafetyChecker` 改为委托 `SqlGuard`；正则黑名单删除
