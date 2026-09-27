# BL-S: 铁律安全基座-网关出口审计

**优先级**: P0
**状态**: DRAFT（DRAFT=18）
**时间窗**: 2026-11（Sprint-6 W1–W3：身份、出口、完整审计）
**整合来源**: Sprint-5 F9 统一身份、网关与租户上下文；Sprint-5 F10 数据出口安全（受控查询网关）；Sprint-5 F11 审计统一入 Kafka（2026-09-26 按月度 Sprint 整合）

## 目标
落实铁律 #2/#3/#4：统一 Keycloak 身份与 Traefik 网关、租户上下文 fail-closed；所有取数经受控查询网关（AST 校验、只读账号、脱敏扩展点）；审计经 outbox 入 Kafka 并 append-only 存储，traceId 端到端可追溯。

2026-09-27 调整：DTS-C01 首次联调必须同时具备 asked/query/answered 及拒绝事件的 outbox → Kafka → append-only 存储证据，因此 T14/T15/T17 的对应切片在 Sprint-6 W2 完成、W3 随阶段 A 验证。部分切片通过不把整项 Task 标 DONE；剩余 Pack/动作/PRS 事件仍按原验收范围跟踪。不用缺审计的链路替代。

Wiki 文档读取按现有空间权限接口执行，后续 studio 委托身份由 BL-A/T22 定义；不把 SQL QueryGateway 当作文档出口实现。缺身份/租户必须显式拒绝；合法空结果可为 0，二者不能混同。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-Keycloak实例realm与Organization设计.md) | Keycloak 实例、realm 与 Organization 设计 | Sprint-5 F9/T01 | P0 | DRAFT | F0/T15、F0/T03（Q4：stack 与 prs 是否已共用 Keycloak） |
| [T02](T02-dts-auth-prs-auth提升为平台鉴权服务.md) | dts-auth：prs-auth 提升为平台鉴权服务 | Sprint-5 F9/T02 | P0 | DRAFT | T01 |
| [T03](T03-头脑接入网关身份修复API-Key身份自报.md) | 头脑接入网关身份，修复 API Key 身份自报 | Sprint-5 F9/T03 | P0 | DRAFT | T02 |
| [T04](T04-统一Traefik网关路由.md) | 统一 Traefik 网关路由 | Sprint-5 F9/T04 | P0 | DRAFT | T02 |
| [T05](T05-Studio-webapp-OIDC登录.md) | Studio webapp OIDC 登录 | Sprint-5 F9/T05 | P1 | DRAFT | T01、T04 |
| [T06](T06-stack接入统一网关评估与过渡.md) | stack 接入统一网关的评估与过渡 | Sprint-5 F9/T06 | P1 | DRAFT | T04 |
| [T07](T07-AST-SQL校验器替换正则黑名单.md) | AST SQL 校验器替换正则黑名单 | Sprint-5 F10/T01 | P0 | DRAFT | F0/T15 |
| [T08](T08-QueryGateway与JdbcGuardedQueryGateway实现.md) | QueryGateway 与 JdbcGuardedQueryGateway 实现 | Sprint-5 F10/T02 | P0 | DRAFT | T07、T10 |
| [T09](T09-租户上下文注入与fail-closed.md) | 租户上下文注入与 fail-closed | Sprint-5 F10/T03 | P0 | DRAFT | T08、T03 |
| [T10](T10-数据源登记改造与只读账号.md) | 数据源登记改造与只读账号 | Sprint-5 F10/T04 | P0 | DRAFT | F0/T15 |
| [T11](T11-所有取数路径收口与架构约束测试.md) | 所有取数路径收口与架构约束测试 | Sprint-5 F10/T05 | P0 | DRAFT | T08 |
| [T12](T12-列级脱敏与行级策略扩展点.md) | 列级脱敏与行级策略扩展点 | Sprint-5 F10/T06 | P2 | DRAFT | T08 |
| [T13](T13-红队SQL用例集与渗透验证.md) | 红队 SQL 用例集与渗透验证 | Sprint-5 F10/T07 | P0 | DRAFT | T07–T11 |
| [T14](T14-审计事件schema与topic规划.md) | 审计事件 schema 与 topic 规划 | Sprint-5 F11/T01 | P0 | DRAFT | BL-A/T20 审计/事件条款 |
| [T15](T15-头脑审计改为outbox到Kafka.md) | 头脑审计改为 outbox → Kafka | Sprint-5 F11/T02 | P1 | DRAFT | T14 |
| [T16](T16-prs审计与outbox接入.md) | prs 审计与 outbox 接入 | Sprint-5 F11/T03 | P1 | DRAFT | T14、F0/T06 |
| [T17](T17-stack侧消费与append-only存储.md) | stack 侧消费与 append-only 存储 | Sprint-5 F11/T04 | P1 | DRAFT | T14 |
| [T18](T18-traceId端到端追溯验证.md) | traceId 端到端追溯验证 | Sprint-5 F11/T05 | P1 | DRAFT | T15–T17、T02 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-5 F9 统一身份、网关与租户上下文

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
兑现铁律 #2：Studio、stack、prs 三个系统的外部请求**只经过一个网关**（Traefik + forwardAuth → dts-auth），
身份与租户通过统一的 `X-DTS-*` 头传递；头脑不再接受"持有 API Key 就可以自报用户身份"。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 身份头 | ADR-008 定义的唯一版本 | `X-DTS-User-Id`、`X-DTS-User-Name`、`X-DTS-Display-Name`、`X-DTS-Roles`、`X-DTS-Tenant-Id`、`X-DTS-Dept`、`X-DTS-Trace-Id`、`X-DTS-Service` |
| 鉴权端点 | `GET /api/internal/auth/forward`（dts-auth，由 prs-auth 演进而来，账本#27） | 2xx 并在响应头中返回上述头；401 未认证；403 无权访问该路由 |
| Keycloak | realm `flower` / `flower-test`；clients：`dts-studio-web`（public + PKCE）、`prs-app`（已有）、`dts-stack-web`、`dts-brain-svc`（confidential，服务间调用） | token claims：`sub`、`preferred_username`、`organization`（租户）、`realm_access.roles` |
| 路由 | Traefik 动态配置 `dts-gateway/dynamic/*.yml` | `studio.*` → engine-ai / webapp；`stack.*` → platform/analytics；`prs.*` → prs 服务；全部挂 forwardAuth 中间件，白名单仅包括健康检查与 OIDC 回调 |
| 服务间 | `X-DTS-Service: <name>` + 服务 token（client_credentials 或 API Key） | 服务调用**不得**携带用户身份头，除非是"代用户调用"并且带有网关签发的上下文（新链路为头脑 → stack BI、头脑 → prs action；老 rs-gateway → 头脑仅按 T03 的限时兼容白名单验证后开放，不能仅凭 delegation 开关放行） |

### UI/UX 规格（T05）
- **入口**：访问 Studio webapp → 未登录时跳转 Keycloak 登录页（使用 realm 的主题）→ 登录后回到原来的深链。
- **四态**：跳转中（全屏 loading "正在登录"）/ 登录失败（Keycloak 错误页，带"返回"链接）/ token 过期（静默刷新；刷新失败时弹出"会话已过期，请重新登录"）/ 成功（右上角显示用户名、租户名，以及退出菜单）。
- **走查**：1. 浏览器打开 `https://studio.<domain>/workspace` → 2. 跳转到登录页 → 3. 输入 alice/test1234 → 4. 回到工作台，右上角显示"alice · t1" → 5. 提问 → 6. 退出后再访问，重新跳转到登录页。

### Definition of Ready
- [x] 契约  - [x] 竖切片：浏览器 → Keycloak → Traefik → dts-auth → engine-ai → 头部上下文  - [x] UI 落点  - [ ] 依赖：ADR-008、Q4  - [x] 验收

### 完成标准
- [ ] 绕过网关直接访问 engine-ai 的业务端口会被拒绝（网络隔离或 401）
- [ ] 伪造 `X-DTS-User-Id` 的请求经过网关后，该头被剥离并替换为真实身份（测试证据）
- [ ] 登录走查截图

## 来源规格：Sprint-5 F10 数据出口安全（受控查询网关）

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
兑现铁律 #3：头脑的**所有**取数路径（NL2SQL 执行、模板、Skill、工具、证明引擎的 SQL 源）统一经过 `QueryGateway`，
保证：只读、有时限、有行数和字节上限、带租户上下文（取不到租户时 fail-closed）、SQL 通过 AST 白名单校验、可审计。
这也是头脑连接 prs 新库（启用了 RLS）的前置条件。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| Java | `QueryGateway` | `QueryResult execute(QueryContext ctx, DatasourceRef ds, String sql, Map<String,Object> params, QueryLimits limits)` |
| Java | `QueryContext` | `tenantId`(必填，除非数据源声明 `tenantScope=NONE`)、`userId`、`roles`、`traceId`、`purpose`(`nl2sql|template|skill|proof|schema-lookup`) |
| Java | `QueryResult` | `columns[]{name,type}`、`rows`、`truncated`、`rowCount`、`elapsedMs`、`sqlHash`、`datasourceRef` |
| Java | `SqlGuard` | `GuardResult check(String sql, SqlDialect dialect, GuardPolicy policy)`；`GuardResult{allowed, violations[]{code, message, position}}` |
| 配置/数据 | `studio_datasource` | `ref varchar(64) pk`、`dialect`、`jdbc_url`、`username`、`secret_ref`（**不存明文密码**，引用环境变量或 secret）、`tenant_scope(NONE|RLS_SESSION_VAR|VIEW_COLUMN)`、`tenant_column?`、`read_only_verified_at` |
| DB | 只读账号 | `dts_brain_ro`：只有目标 schema 的 `SELECT` 权限；`default_transaction_read_only=on`；`statement_timeout=30s`（数据库级兜底） |
| 事件 | `dts.audit.v1` type `dts.ai.query.{executed,blocked}` | `data{datasource, purpose, sql_hash, rows, elapsed_ms, violations[]}` |

### UI/UX 规格
- 被拦截的查询：答案卡片显示"该问题生成的查询未通过安全校验（原因：xxx）"，不展示 SQL 细节给普通用户；管理员可以在审计中查看。
- 行数截断：表格底部显示"结果已截断，仅显示前 N 行"。

### Definition of Ready
- [x] 契约  - [x] 竖切片：问题 → NL2SQL → SqlGuard → QueryGateway → 只读事务 + RLS → 结果与审计  - [x] UI 落点  - [ ] 依赖：ADR-009  - [x] 验收：T13

### 完成标准
- [ ] 架构测试证明：除 QueryGateway 实现类以外，engine 中没有任何类获取 JDBC `Connection`
- [ ] 红队用例 ≥ 40 条，全部拦截或在只读事务中失败，没有数据被修改
- [ ] alice 与 bob 问同一个问题，只能看到各自租户的数据；无租户上下文时返回 0 行或 403

## 来源规格：Sprint-5 F11 审计统一入 Kafka

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
兑现铁律 #4：头脑与 prs 中人和 AI 的关键操作，以统一的 CloudEvents 格式写入 Kafka `dts.audit.v1`，由 stack 消费并落到 append-only 存储；
可以通过 traceId 把一次问答的"登录 → 提问 → SQL → 结果 → 动作"完整串起来。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 事件 | CloudEvents 1.0 JSON（structured mode） | `specversion, id(uuid), source("dts-studio/engine-ai"), type, time, subject, datacontenttype, tenantid(ext), actorid(ext), actortype(ext: user|service|agent), traceid(ext), data{...}` |
| type 目录 | `dts.ai.chat.{asked,answered}`、`dts.ai.query.{executed,blocked}`、`dts.pack.{installed,activated,rolledback}`、`dts.action.{drafted,approved,committed,rejected}`、`dts.auth.{login,denied}`、`prs.biz.*` | 每个 type 的 `data` 使用 JSON Schema 描述（`dts-studio/protocol/audit/*.schema.json`） |
| Topic | `dts.audit.v1` | 分区键 = `tenantid`；保留期 ≥ 7 天（持久化存储在下游）；`min.insync.replicas` 按集群配置 |
| Outbox | 头脑 `studio_audit_outbox`、prs `outbox`（prs-platform 已有，账本#27） | `id, event jsonb, created_at, published_at null`；轮询发布，至少一次投递 |
| 存储 | stack 消费后的存储 | append-only：数据库层禁止 UPDATE/DELETE（通过触发器或只授予 INSERT 权限） |

### UI/UX 规格
- 头脑的答案卡片显示"审计号"（事件 id 前 8 位），点击复制；
- 审计查询界面：本 sprint 不新做，使用 stack 已有的审计页面（如果有，由 T17 确认）或 Kafka UI（`dts-kafka-ui`，账本#24）查看。

### Definition of Ready
- [x] 契约  - [x] 竖切片：操作 → outbox → Kafka → stack 存储 → 查询  - [x] UI：审计号  - [ ] 依赖  - [x] 验收：T18

### 完成标准
- [ ] 主竖线的一次问答在存储中可以查到 ≥ 3 条同一 traceId 的事件（asked / query.executed / answered）
- [ ] 尝试 UPDATE 审计表失败（证据）
