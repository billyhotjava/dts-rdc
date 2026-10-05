# Sprint-1: 可运行基线、决策底座与三系统契约

目标：本期交付重建工程的可运行基线与决策底座——迁移清单定稿、底座规范 v0.1、
Keycloak 打通第一条集成路径、新栈 G0 基线就绪；同时钉死 dts-prs 与 dts-stack/dts-copilot 的数据契约与绞杀共存策略，
并用一条"项目主数据只读竖线"证明 **prs 新 PG → stack ODS → copilot 问数** 可贯通；多租户（R-010）与 k8s-ready（R-011）
约束从第一天起写入规范并得到验证，使 Sprint-2 首批业务域可以直接开工。
可验收表述：测试用户经 Keycloak 登录后能在新栈查到本租户的项目列表，查不到其他租户的数据（由数据库行级安全保证）；
copilot 对"当前在营项目数"的回答在新旧两源上一致。
产品/版本目标：PRS v1.0.0（引用 sprint-queue.md）。
时间盒：2026-09-21 至 2026-10-16（假设，待确认）。扣除中秋（09-25）与国庆（10-01~10-07）假期，
约 13–15 个工作日（调休以官方公告为准）。原定 10-02 结束的两周时间盒实际仅约 7 个工作日，不足以承载本期范围。
工作状态：DRAFT。
时间盒是否结束：否；交付目标是否达成：尚未评估。

## 范围与容量
人员与可用时间：待确认（B-001）。09-21 前未指定负责人，则全部 Task 保持 DRAFT，不得开工。
估算依据：相对点数（1 点 ≈ 0.5 人天，假设全职投入；无历史吞吐，Sprint-1 回顾时校准）。
合计 54 点 ≈ 27 人天。
容量分配（假设）：设计、规范与契约 35%，开发集成、基线与骨架 45%，测试验证与签核跟进 20%。
容量不足时的调出顺序：F7/T04 降级为人工 SQL 对照 → F1/T04 顺延 → F4/T03 的 Helm chart 顺延（k8s-ready 自检保留）。
F2/T03 中的版本兼容性与 RLS 验证不降级（它们决定 BOM 与租户方案）。
F1、F6、F3/T01–T02、F4 不调出（它们是 Sprint-2 开工的硬前提）。
不确定性：Keycloak/PG 对团队是新栈，F3/F4 各预留返工空间；F7 依赖 dts-stack 入湖通道的协同。

| 本期 ID | 产品 Feature ID | 本期能力切片 | 负责人 | 估算 | 依赖 | 状态 |
|---|---|---|---|---|---|---|
| F1 | PF-TRANSFER | 迁移清单 v1.0 定稿 + 口径签字 + 首批域排序/财务单据目录确认 + 能力视图重组 | 待确认 | 10 点（假设） | 输入：四路核查报告（已有） | IN_PROGRESS（T01 已组装 v0.1） |
| F2 | PF-BASE | 技术底座规范 v0.1（含基线版本调整、多租户、k8s-ready 章节）+ 服务模板骨架验证（含 Boot 4 兼容性、RLS） | 待确认 | 10 点（假设） | F1 §10；F6/T01（数据规范章节引用共存策略） | DRAFT |
| F3 | PF-IAM | flower-test realm + Traefik forwardAuth（Bearer JWT）+ 端到端登录验证 | 待确认 | 9 点（假设，含 T05 细化设计） | F2 鉴权章节（可按假设先行）；共享 Keycloak 运维支持；B-005 | DRAFT |
| F4 | PF-RUNTIME | PG+Liquibase+Traefik 路由+空服务+种子数据，G0 基线验证通过；k8s-ready 自检 + Helm chart 骨架 | 待确认 | 10 点（假设） | F2/T03 模板；**F3/T03（基线"登录"项）**；PG 资源 | DRAFT |
| F6 | PF-DATACONTRACT | 绞杀期数据共存策略 ADR + 下游（ODS/dbt/copilot 语义包）影响评估与兼容契约 | 待确认 | 5 点（假设） | F1 域划分；dts-stack/dts-copilot 对接人 | DRAFT |
| F7 | PF-SKELETON | 项目主数据只读竖线：新 PG（RLS）→ 只读 API → ODS 兼容视图 → copilot 问数对照 | 待确认 | 10 点（假设） | F4 基线、F3 鉴权、F6 契约 | DRAFT |
| ~~F5~~ | PF-AGENTUI | 已调出：协议归 dts-copilot 维护（R-009），Sprint-2 以"对接 copilot 协议"进入 | — | 0 | — | 调出 |

## 设计依据
需求与验收示例：重建目标与已定决策见 sprint-queue.md（R-001~R-009）；迁移输入见
`assets/迁移清单-v0.1.md`（F1/T01 产出）。
概念/架构/概要/详细设计：目标架构 = Traefik 边缘 → forwardAuth 鉴权 → 新服务（无 Nacos/SCA）；
MySQL 老库 → PG 新库，按域切换事实源（R-008）；dts-stack ODS 同时接两侧，下游经兼容视图屏蔽 schema 变化；
Kafka 复用 dts-stack 集群；与 dts-stack 共用 Keycloak，realm 分离；agent UI 协议由 copilot 提供；
多租户按分级模型（R-010），部署按 k8s-ready 约束（R-011），设计依据见 `assets/多租户与云原生演进.md`。
关键决策：R-001~R-012（R-002 已按 R-012 修订，版本见 `assets/版本基线.md`）；待决：B-001/B-002/B-003/B-005/B-006/B-007/B-008。

### 架构决策记录（ADR，本期新增）
| 决策点 | 选择 | 理由 | 影响 |
|---|---|---|---|
| 绞杀期事实源 | 单一 SoR、按切换单元迁移、同步方向跟着 SoR 走（R-008 规则 1–5，F6/T01 定稿） | 双写难保一致；老系统存在跨域写（账本 #17） | F2 数据规范、F7、Sprint-2 起每个域的切换计划 |
| 下游兼容 | ODS 层新增 `ods_prs_pg_*` 源 + 兼容视图对齐老 `ods_ptr_mysql_*` 形状，dbt/copilot 语义包不随每次重写而改 | 保护 copilot sprint-22/26/31 已建语义与口径 SoT | F6/T02、F7/T03 |
| 迁移跟踪粒度 | 按业务能力跟踪，handler 清单只作附表（R-004） | 避免在新栈复刻 RPC 端点；能力可投影为 MCP 工具 | F1/T04、F2 API 章节 |
| 路由别名 | 只在 Traefik 边缘层映射，登记下线日期（R-006） | 不把拼写错误带进新 API | F1 清单 §10、F3/F4 路由表 |
| 网关验证模式 | Sprint-1 只做 Bearer JWT；H5/BFF 会话顺延 Sprint-2（R-007） | 收敛范围，先证明主链路 | F3/T02、T04 |
| agent UI 协议归属 | dts-copilot 维护，prs 消费（R-009） | 避免平行协议 | F5 调出 |
| 前端语言 | React 前端 TypeScript 优先：`strict`、禁用 `allowJs`、接口与 agent 消息类型由契约生成，JS 仅限登记例外（R-001 补充） | 老前端 0 个 TS 文件（账本 #21），类型是跨前后端与 copilot 契约的第一道校验 | F2/T01 ⑧、F2/T03-A |
| 技术基线 | 【已确认】版本基线 v1.0（R-012：有 LTS 取最新 LTS，无 LTS 取成熟版本线）：JDK 25 LTS、Boot 4.1.1、Modulith 2.1.1、PG 18.6、Keycloak 26.7.4、Kafka 4.3.1、Traefik 3.7.13、Valkey 9.1.2、SeaweedFS、OTel 2.30.0；前端 Node 24 LTS、TS 6.0、React 19.2、Vite 8.2、antd 6.6 | 重写项目没有历史包袱，但不用开发版；模块边界先于部署单元 | F2/T01 引用 `assets/版本基线.md`；F2/T03-A 验证 |
| 共享组件版本 | 共享实例一并升级：Keycloak 26.3.4 → 26.7.4（同一主版本，无影响 prs 的破坏性变化）、Kafka 4.1.2 → 4.3.1（B-008） | 共用实例无法单方面升级；stack 侧需按升级说明回归 | F3/T05、F6/T02 |
| 许可证 | 已归档项目不选（MinIO → SeaweedFS）；FSL 等非 OSI 许可证须法务确认（Liquibase 5） | 私有化交付涉及分发 | F2/T01 |
| 多租户 | 分级模型；Organizations；PG 行级安全强制、fail-closed（R-010） | 老系统隔离在应用层且默认放行（账本 #18） | F2 数据规范、F3/T01、F7/T01、B-007 |
| 部署形态 | 本期 compose 运行，按 k8s-ready 清单写，prs 自带 Helm chart 骨架（R-011） | 规模化与私有化都走同一 chart | F2 部署规范、F4/T03 |
| 同步管道 | Debezium CDC → Kafka 为首选候选（F6/T01 定稿） | 同一变更流同时服务 R-008 同步与 ODS 入湖 | F6/T01、F7/T02 |
| agent 代用户调用 | Keycloak token exchange（本期只做设计） | 令牌同时记录调用方与被代表用户，审计完整 | F3/T05；实现 Sprint-2 |

### 端到端契约链（F7 竖线）
| 层 | 契约/落点 | 签名要点 |
|---|---|---|
| UI 入口 | 本期无业务页面；用 curl/Bruno 脚本 + copilot 问数界面验证 | 走查脚本见 F7/T04 |
| 边缘 | Traefik router `prs-project`（`PathPrefix(/api/prs/projects)`）+ forwardAuth 中间件 | 无 token → 401；头注入见 F3 头契约 |
| API | `GET /api/prs/projects?status=&page=&size=` | 响应：统一 envelope（F2 API 章节），`id` 为字符串 |
| Service | 项目只读查询服务（F4 空服务上扩展） | 只读；事务开始时 `SET LOCAL app.tenant_id` = `X-DTS-Tenant-Id` |
| 数据 | PG `prs.project`（字段对齐老 `p_project` 的最小子集，F7/T01 钉死） | pk(id)、idx(tenant_id,status,type)；FORCE RLS 按租户隔离 |
| 同步 | 老 MySQL `p_project` → PG `prs.project` 单向只读同步（F7/T02） | 老库为 SoR（R-008） |
| 入湖 | dts-stack ODS `ods_prs_pg_project` + 兼容视图（F7/T03） | 与老 `ods_ptr_mysql_p_project` 同形 |
| 问数 | copilot 问"当前在营项目数"，分别命中新旧两源 | 结果一致即通过（F7/T04） |

## Context Ledger
| # | 事实/假设/未决项 | 证据位置和版本 | 影响 |
|---|---|---|---|
| 1 | 老后端 182 controller 约 1217 handler，Java8/Boot2.5.3 | adminapi/rs-modules/rs-flowers-base（2026-09 核查） | F1 清单范围 |
| 2 | 36 个 mapper 含 MySQL 专有函数；全库无存储过程；主键应用层赋值 | 同上 mapper 核查 | F4 PG 改写通则、F2 规范 |
| 3 | Web 无 JS 角色分支（v-hasPermi + roleCode 下拉）；APP 养护隐藏租金 | adminweb/app 核查 | F1 §5、新前端权限模型 |
| 4 | SpEL 规则 seed 缺失；注释 job 大量空转；单号查最大+1 并发不安全 | 同上 | F1 修项、F2 规范约束 |
| 5 | 时间盒/容量/负责人均为假设；时间盒跨中秋、国庆 | 本文件范围与容量节 | 全部估算待校准 |
| 6 | 未决：财务 v1 单据目录、首批域排序 | B-002 | F1/T03 关闭，否则 Sprint-2 无法规划 |
| 7 | 未决：租户模型（groups vs Organizations）、单号序列方案 | B-003 | F2/F3 关闭 |
| 8 | 新栈弃用 Nacos/SCA：DNS 服务名 + Traefik 路由/灰度 + forwardAuth 鉴权 | sprint-queue.md R-006 | F2/F3/F4 |
| 9 | 与 dts-stack 共用 Keycloak：同一实例分 realm（S10 不动）；本期只做 Bearer JWT | R-007，F3/T05 | F3 |
| 10 | dts-stack 现网版本：Keycloak 26.3.4、PG 17.6、Traefik v3.5.2（Keycloak 26 原生支持 Organizations） | `dts-stack/docker-compose*.yml`（2026-09-17） | F2 BOM、F3 租户模型选型 |
| 11 | dts-stack forwardAuth 可复用：`GET/HEAD /api/forward-auth`，成功注入 `X-DTS-User`/`X-DTS-Display-Name`/`X-DTS-User-Id`/`X-DTS-Roles`/`X-DTS-Permissions`/`X-DTS-Dept-Code`/`X-DTS-Personnel-Level`，失败 401（浏览器请求可 302） | `dts-stack/source/dts-platform/src/main/java/com/yuzhi/dts/platform/web/rest/ForwardAuthResource.java:78-149` | F3 头契约 |
| 12 | 老库入湖命名 `public.ods_ptr_mysql_<表>`，由 `ptr_mysql_flow` 采集；copilot 花卉 dbt 包（`xycyl_*`）只读 ODS | `dts-copilot/worklog/prs/v1/README.md`；`ods_create_tables.sql`（12 张表） | F6/T02、F7/T03 |
| 13 | 老项目主表 `p_project`（mapper 引用 97 处）已有 ODS 表 `ods_ptr_mysql_p_project` | `dts-copilot/worklog/prs/v1/ods_create_tables.sql:393` | F7 选型依据 |
| 14 | copilot 口径 SoT 收口 sprint-31 为 IN_PROGRESS；路由阶梯/Trino 联邦 sprint-32 为 DONE；agent-first UI sprint-27 为 DONE | `dts-copilot/worklog/v1.0.0/sprint-{27,31,32}-*/README.md` | F6/T02、R-009 |
| 15 | dts-stack sprint-36（机密级合规整改，含 dts-keycloak）、sprint-37（上传文件加密）均为 PLANNING | `dts-stack/worklog/v2.2.3/archi/sprint-3{6,7}-202606/README.md` | B-005、B-006 |
| 16 | 老项目实体主键为 `Long`（应用层赋值） | `adminapi/rs-api/rs-flowers-base-api/src/main/java/com/rs/flowers/base/project/domain/Project.java:23,28` | R-008 规则 4、F7/T01 表结构 |
| 17 | 报花表存在跨域写：`flowerBizInfo(Service/Mapper).update/save` 出现在 DistributionSreviceImpl（14 处）、BizBackServiceImpl（9）、FlowerBizGiveServiceImpl（6）、ExpenseAccountInfoServiceImpl（1）等 | `adminapi/rs-modules/rs-flowers-base`（grep，2026-09-17，未区分读写字段） | R-008 规则 3、F6/T01 跨域写矩阵 |
| 18 | 老系统租户隔离在应用层（MyBatis-Plus 拦截器），取不到租户时不加过滤、返回全部数据，且只对白名单表生效；mapper XML 中 `tenant_id` 出现 0 次；租户 ID 为 `Long` | `adminapi/rs-common/rs-common-data/src/main/java/com/rs/common/data/tenant/RsTenantHandler.java:54-62` | R-010、F2 数据规范 |
| 19 | dts-stack 部署全部为 compose，仓库中没有 Helm/Kustomize；Kafka 4.1.2、MinIO RELEASE.2025-09-07 | `dts-stack/docker-compose*.yml`、`imgversion.conf`（2026-09-17） | R-011、F6 CDC 选型 |
| 20 | 版本核实（2026-09-18）：JDK 25 为最新 LTS（27 于 09-15 GA，非 LTS）；Node 24 为当前 LTS（26 预计 10 月下旬转 LTS）；Boot 4.1.1、PG 18.6、Keycloak 26.7.4、Kafka 4.3.1、Traefik 3.7.13；TypeScript 7、pnpm 12 主版本发布不满 90 天；Liquibase 5.0.4 许可证为 FSL-1.1-ALv2；MinIO GitHub 仓库已归档；Keycloak 26.4~26.7 升级说明以安全加固为主 | `assets/版本基线.md`（endoflife.date、Maven Central、npm、GitHub、openjdk.org、keycloak.org 升级指南） | R-012、F2 BOM、B-008 |
| 21 | 老前端完全没有 TypeScript：adminweb 为 243 个 `.js` + 750 个 `.vue`，app 为 144 个 `.js` + 597 个 `.vue`，`.ts/.tsx` 均为 0 | `adminweb/`、`app/`（排除 node_modules/dist，2026-09-18 统计） | R-001 补充、F2/T01 ⑧ |

**开放问题**：
- ODS 新增 `ods_prs_pg_*` 源由谁负责采集配置（dts-stack 运维 or prs 团队）——F6/T02 关闭。
- 老 `p_project` 的在营判定口径（K4：status1+type1+del0）在新表如何表达——F7/T01 按 K4 映射，口径签字后复核。

## 执行与测试安排
关键路径：F1/T01 走读 + F6/T01 共存 ADR + F2/T03 版本兼容性 spike（第 1 周，spike 结论决定 BOM）→ F2 规范评审 → F3/T01→T05→T02 → F4/T01 →
F3/T03 登录联调 → F4/T02 基线验证 → F7/T01~T04（假期后第 1–2 周）。
F1/T03（排序/单据目录）最晚 09-30 到位，否则按默认排序推进 Sprint-2 规划。
并行工作：F2 起草与 F1 走读、F6 并行；F3/T01 realm 配置与 F4/T01 基线搭建并行；F7/T02 同步脚本可在 F4 就绪前用本地 PG 先行；F4/T03 k8s-ready 自检与 Helm chart 骨架跟随 F4/T01 进行。
首次集成及分批提测：假期前完成 F3 登录链路联调；假期后第 1 周完成 F4 基线验证，第 2 周完成 F7 竖线。
F1 签核、F2 评审、F6 ADR 为文档评审，不占用提测通道。
验证分工：开发自验证（单测/集成记录）→ 业务方签核（口径表）→ 基线验收（delivery-baseline 口径）→ 竖线对照（copilot 对接人参与）。
测试方案/数据/环境：F4 种子数据 + PG 测试库；F3 用 flower-test realm；F7 用老库 `p_project` 快照同步数据。
回归范围及依据：本期无老系统变更，不做老系统回归；ODS 新增源不改动既有 `ods_ptr_mysql_*` 表与 `xycyl_*` 模型，
F7/T03 需确认既有 dbt 构建不受影响（`dbt compile` 通过）。

## 追溯
| 需求/规则 | 设计依据 | Feature/Task | 测试条件/用例 | 实际结果 |
|---|---|---|---|---|
| 重建目标与决策 R-001~R-009 | sprint-queue.md | F1–F7 | 评审/签核记录 | 未执行 |
| 迁移不丢逻辑 | assets/迁移清单-v0.1.md | F1/T01–T04 | 口径签字表 + 能力视图覆盖核对 | 未执行 |
| 登录鉴权链 | F3 头契约 + T05 设计 | F3/T01–T05 | 端到端登录用例（T04） | 未执行 |
| G0 可运行基线 | delivery-baseline 技能 | F4/T01–T02 | it/baseline.md | 未执行 |
| 多租户隔离由数据库强制 | R-010 + assets/多租户与云原生演进.md §2 | F2/T01、F2/T03、F3/T01、F7/T01 | RLS 负例（无租户 0 行、跨租户不可见、跨租户写入被拒） | 未执行 |
| k8s-ready | R-011 + 同上 §3.3 | F2/T01、F4/T03 | k8s-ready 清单自检 + `helm lint` | 未执行 |
| 绞杀期不断数、不破坏下游语义 | R-008 + F6 ADR | F6/T01–T02 | ADR 评审 + 影响清单签认 | 未执行 |
| 三系统可贯通 | 本文件 §端到端契约链 | F7/T01–T04 | it/F7-skeleton.md 对照记录 | 未执行 |

## Gate Registry
| Gate | 项目 | 状态 | 证据 | 缺口/Task/影响范围 |
|---|---|---|---|---|
| G0 | 交付基线 | PENDING | `it/baseline.md` | F4/T02；未通过则 Sprint-2 业务域不开工 |
| G0 | 领域与数据画像 | GAP | `assets/domain-profile.md`（待建） | F6/T02 产出（至少覆盖 `p_project` 与首批域主表量级/脏数据） |
| G0 | 领域不变量自检 | PENDING | 迁移清单 §2/§3/§8 + 本文件 ADR | F1/T02 口径签字 |
| G1 | 契约链贯通 | GAP | 本文件 §端到端契约链 | 表结构与头契约待 F7/T01、F3/T01 钉死 |
| G1 | 非功能预算 | N/A | 本期无业务流量；Sprint-2 首批域开工前补 `assets/nfr-budget.md`（含租户级限流与配额） | Sprint-2 |
| G2 | 实现及开发验证 | PENDING | 待 F3/F4/F7 | — |
| G3 | 发布与恢复 | N/A | 本期无正式交付包；F7 同步为只读，不影响老库 | — |
| G4 | 可运维性 | PENDING | 本期无生产部署；k8s-ready 自检与 Helm chart 骨架见 F4/T03；共享 Keycloak 运维对接在 F3/T05 | F4/T03 |
| G4 | QA/业务验收 | PENDING | 待 F1 签核 + F7 对照 | 口径签字与竖线对照即本期验收 |

## 非目标
业务页面开发；H5/BFF 会话；APP/企微接入；任何写业务数据的新接口；copilot 后端改造；agent UI 协议设计（归 copilot）；
k8s 集群搭建与运行（R-011 阶段 1 起）；租户开通控制面与计量计费（Sprint-2+）；token exchange 实现（本期只做设计）。

## Review 与回顾
（时间盒结束时填写）实际增量与目标差异：待填写。未完成/调出项：待填写。
质量与遗留缺陷：待填写。下一期工程改进：待填写（重点校准估算）。
