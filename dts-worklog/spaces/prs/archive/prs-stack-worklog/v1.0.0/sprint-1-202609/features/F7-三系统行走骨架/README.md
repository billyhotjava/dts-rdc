# F7: 三系统行走骨架（项目主数据只读竖线）
产品 Feature：PF-SKELETON；需求依据：三驾马车定位；Sprint README §端到端契约链；R-008（F6）。
负责人：待确认；优先级：高（证明 prs→stack→copilot 可贯通，暴露 F6 契约问题）；状态：DRAFT。

## 使用场景与验收
调用者：测试用户（经 F3 登录）、dts-stack 入湖任务、dts-copilot 问数。触发：F4 基线就绪后。
输入：老库 `p_project`（账本 #13）、F4 基线服务、F3 鉴权、F6 兼容契约。
结果：① 新栈 `GET /api/prs/projects` 经 Traefik + forwardAuth 返回**本租户**的项目列表，跨租户隔离由 PG 行级安全保证；② 新 PG `prs.project` 由老库单向同步；
③ dts-stack 有 `ods_prs_pg_project` 与兼容视图；④ copilot 对"当前在营项目数"在新旧两源上结果一致。
正常流程：T01 表结构与只读 API → T02 老库同步 → T03 入湖与兼容视图 → T04 问数对照。
替代流程：copilot 无法切换数据源 → T04 降级为对兼容视图与老 ODS 直接跑同一口径 SQL 对照，记 GAP。
失败流程：对照不一致 → 定位到同步、映射或口径问题，回写 F6 契约或 F1 口径表，不得调整期望值使其"通过"。
规则与边界：只读；老库是 SoR（R-008）；不改既有 `ods_ptr_mysql_*` 与 `xycyl_*` 模型；
在营口径按 K4（status1 + type1 + del0 快照），口径签字后复核。
验收示例：Given 老库快照已同步、ODS 已入湖 / When 测试用户调接口、copilot 提问 / Then 接口返回同一批项目，
两源在营项目数一致，无 token 调接口得 401；租户 A 的用户看不到租户 B 的项目。
本期范围：`p_project` 一张表的端到端竖线。后续切片：Sprint-2 首批域按同一范式扩展。
非目标：项目写接口、前端页面、`p_project` 以外的表、同步工具产品化。

## 设计
概念与共享架构：见 Sprint README §端到端契约链。
概要协作：老 MySQL `p_project` → 同步 → PG `prs.project` → 只读 API（Traefik `prs-project` 路由）；
PG `prs.project` → ODS `ods_prs_pg_project` → 兼容视图（同形于 `ods_ptr_mysql_p_project`）→ copilot。
关键契约：
- `prs.project` 最小列（对齐老表，T01 冻结）：`id bigint`（沿用老 `Long` 主键，账本 #16；API 中以字符串返回；ODS 兼容视图转 varchar）、`tenant_id`、`code`、`name`、
  `abbreviation`、`status`、`type`、`customer_type`、`contract_id`、`manager_id`、`start_time`/`end_time`（timestamptz）、
  `del_flag`、`created_at`/`updated_at`、`synced_at`；pk(id)、idx(tenant_id, status, type)；`tenant_id bigint NOT NULL`；`ENABLE` + `FORCE ROW LEVEL SECURITY`，
  策略按 F2 规范 ⑥（R-010）。
- API：`GET /api/prs/projects?status=&type=&page=&size=` → F2 envelope，`items[]` 含 `id/code/name/status/type/managerId`，`total`；
  事务开始时 `SET LOCAL app.tenant_id` = `X-DTS-Tenant-Id`，由数据库完成租户过滤；401/403 语义同 F3。
- 列映射：新 `start_time timestamptz` → 老 ODS `start_time varchar(40)` 等，T03 按 F6/T02 模板列出。
UI 或使用路径：无页面；走查用 Bruno/curl 脚本 + copilot 问数界面。
详细设计：见 T01–T04。
未决项：同步方式在 F6/T01 定稿前按"定时全量快照"假设实现。

## Task
| ID | 类型/目标产出 | 负责人 | 输入依赖 | 估算 | 验证方式 | 状态 |
|---|---|---|---|---|---|---|
| T01 | 开发：`prs.project` 表 + 只读 API + Traefik 路由 | 待确认 | F4/T01 基线、F3/T02 鉴权、F2 API 章节 | 3 点（假设） | 契约测试 + 401/403 负例 | DRAFT |
| T02 | 开发：老库 `p_project` → PG 单向同步 | 待确认 | T01 表结构；老库只读账号；F6/T01（可按假设） | 2 点（假设） | 行数/字段抽样对账记录 | DRAFT |
| T03 | 集成：ODS 入湖 + 兼容视图 | 待确认 | T02；F6/T02 兼容契约；stack 对接人 | 3 点（假设） | 兼容视图与老 ODS 同形；既有 dbt compile 通过 | DRAFT |
| T04 | 验收：copilot 问数新旧两源对照 | 待确认 | T03；copilot 对接人 | 2 点（假设） | `it/F7-skeleton.md` 对照记录 | DRAFT |

## Feature 完成标准
四个结果均有运行实例上的证据写入 `it/F7-skeleton.md`；对照不一致项有定位结论与去向；
范式（表 → 同步 → ODS → 兼容视图 → 问数）整理为 Sprint-2 各域可复用的步骤清单。
