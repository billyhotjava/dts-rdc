# Sprint-5（2026-10）：四模块合并落位 + Wiki v1 上线 + Console 原型

**时间**: 2026-10-01 ～ 2026-10-31（月度 Sprint；10-01～10-07 国庆假期，实际工作日约 17 天）
**状态**: IN_PROGRESS（Wiki 工作流已于 9 月末先行完成 W0–W4；四模块工作流 F0/T05 已完成）
**类型**: Architecture / Repository Consolidation / Implementation
**目标**（四条工作流；A–C 须在 10-31 前可验收，D 的本月范围见下）:
- **工作流 A · 四模块合并（F0–F1）**：dts-rdc 的 submodule 指向真实仓库与提交，dts-prs 进入 prs-stack 版本控制，密钥出库；
  ADR-005～010 定稿；copilot 以保留历史的方式并入 dts-studio，构建可用且回归结果与冻结基线等价。
- **工作流 B · DTS Wiki v1（F2–F5）**：团队成员用统一账号登录 `wiki.yuzhicloud.com`，在有权限的产品空间浏览、搜索、编辑、追溯页面；
  内容以 PostgreSQL 为唯一事实源，与各产品 git 仓库的 `docs/`、`worklog/` 1 分钟内双向同步，冲突不静默覆盖；现网 wiki 经完整验收后切换，回退时保留 PG 独有数据与待同步修改。
- **工作流 C · Console 原型（F6）**：按 ADR-013 完成约定路由与页面动作的 mock 原型，10-23 冻结 REST/SSE 契约和下游责任映射，供 11 月 BL-C 接入真实数据。
- **工作流 D · dts-infra K8s 交付底座（F7，2026-09-29 新增）**：放弃 dts-stack 运维体系，dts-infra 以 Go + 品牌化 RKE2（Rancher 开源生态）为底座，离线包为唯一交付路径，兼容阿里云 ACK；v1.0.0 以 K8s 交付且不保留 Compose 回退（ADR-014）。本月可验收：ADR-014 定稿、chart/契约规范、总部制品中心与验证环境、估算收敛 spike（F7/T01～T04）；其余 Task 按月度规则随 Feature 转入 Sprint-6。按工作量规划，核心约 505–770 人天，**v1.0.0 发布日期以 F7/T33 验收为前提，可能顺延**（用户 2026-09-28 接受）。

**节奏规则**: 一个自然月一个 Sprint；新需求优先追加为既有 Feature 的 Task，不临时新建 Feature/Sprint（详见 [`sprint-queue.md`](../sprint-queue.md) §迭代节奏规则）。
后续实现（AppPack、安全基座、数据能力收敛、Console BFF、集成与发布）已移入 [`backlog/`](../backlog/README.md)，11-02 整体转入 Sprint-6，按依赖交付同一业务场景。

**2026-09-29 studio 重构优先级确认**：用户确认先重构 dts-studio。沿用 [F1（首阶段入口）](features/F1-copilot并入dts-studio/README.md) 承接 copilot 引擎迁入与回归，后续 AI 运行时和领域解耦由 BL-A 承接，BL-S/BL-D/BL-C/BL-E 配套完成首个真实场景；不重复新建 Feature。F0 的具体前置仍须闭合，stack 同步提供最小数据接口，完整湖仓重构不作为 studio 启动条件。取数职责和 ADR-014 交付边界的待修订项见 F1；本次不调整任务状态、数量或其他工作流排期。

**2026-09-26 整合**: 原 Sprint-5（14 Feature / 83 Task，跨 10–12 月）与原 Sprint-6（Wiki，10 Feature / 39 Task，同为 10 月）合并为本月度 Sprint：
本月 7 个 Feature / 83 Task（含 4 个 v1.1 新增 Task、Wiki MCP F3/T16、ADR-013 F0/T19 与 F6 Console 原型与模块吸收 14 个 Task），backlog 5 个 Feature / 69 Task（全部于 Sprint-6 完成）。新旧编号对照见 [`assets/renumber-20260926.md`](assets/renumber-20260926.md)。
**2026-09-26 修订**: [整体复核及 PRS 基础承接](assets/planning-reconciliation-20260926.md)。旧 Sprint-1～4 退出活动队列；原型/资料接收 F0/T05 已完成，运行 Gate 仍待执行。

## 背景与价值

### 产品能力与月度切片（2026-09-27）

共享需求依据为 [产品能力规划](../docs/plans/2026-09-27-product-capability-roadmap.md)。四模块目标保持不变，以 DTS-C01 可信经营数据、C02 授权知识供给、C03 行业能力复用、C04 可评估与人工接管串联工程任务。

最新修订与静态检查见 [09-28 文档复核记录](assets/review-planning-20260928.md)；[09-27 文档复核](assets/review-planning-20260927.md) 保留当日结论；[此前产品规划校验](assets/product-planning-validation-20260927.md) 保留历史快照。两者均不代表本轮产品运行验收。

- 本月 83 个 Task（F6 以 mock 原型先行冻结 Console 契约，见 ADR-13）：F0/T04 确认 PRS 首个业务场景和独立 oracle；T14 定义可供业务/AI 共用的指标及信任信息；T18 给出质量、时延、成本和使用价值的测量方法；F3/T15 验证知识读取的权限与版本。其余实现仍在 backlog。
- 11 月（Sprint-6）连贯完成 backlog 全部工作：11-20 PRS“在营项目”首次受控联调（BL-D/T17、BL-E/T01 阶段 A），11-30 全范围验收与发布；不再安排 Sprint-7。
- Wiki RAG 在 BL-A/T22 先做对照探索；不增加 10 月完整 RAG、训练/标注平台或新业务域承诺。
- 排期按依赖编排、不按人力容量打折；安全、测试和回归工作不得删减。Wiki v1 含 MCP（F3/T16）本月收口。

### 工作流 A · 四模块合并
DTS 以 Palantir 为参照：**dts-stack ≈ Foundry 数据层（湖仓一体中台）**、**dts-studio ≈ Ontology + AIP（AI 头脑：智能体、chat2sql、本体）**、
**dts-app-stack ≈ 面向行业客户的应用（花卉租赁 prs 为首个 App）**、**dts-infra ≈ Apollo（安装运维）**。
dts-rdc 是总纲仓库（定位已确认不变）。

9 月 25 日初查时真实引擎主要在 `/opt/prod/prs/source`，RDC 顶层模块以骨架为主；9 月 26 日补查确认嵌套 prs-stack 已有 3 月前后端原型，且已接收 9 月重写底座（账本#32～35）；
dts-copilot 经 34 个 sprint 已成为事实上的头脑，但它是"三合一"——**通用 AI 引擎 + 花卉领域资产 + 一份与 stack 分叉的 BI**；
原始 dts-prs 没有独立 git；已增量接收进 prs-stack 工作副本，正式提交与新 AppPack 协议仍待 F0/BL-A；五条铁律中 #2 统一网关、#3 数据出口安全、#4 审计 均未在代码层兑现。

**不做的代价**：
- 头脑持续沉积花卉专用代码（Finance* 已 52 类 / 7.7k 行），第二个行业 App（metro）无法复用；
- BI 两份分叉越走越远，合并成本线性上升；
- copilot 连接 prs 新库前若不解决租户与只读，会把 prs 精心设计的 RLS（R-010）在 AI 出口处击穿；
- prs Sprint-1（2026-09-21 至 10-16）正在定义契约，现在纠正 AppPack 定位成本最低，Sprint-2 后成本倍增。

### 工作流 B · DTS Wiki v1
**设计文档**: [`features/F2-Wiki平台骨架身份与性能/design/`](features/F2-Wiki平台骨架身份与性能/design/)（00–10；编码由独立会话按 `08-编码任务与交接说明.md` 与 `10-v1.1变更与重构清单.md` §5 执行，代码在子模块 `dts-wiki`）。

- 现有 wiki（`dts-rdc/wiki/` + `deploy/wiki/`，2026-09-26 上线）是"git 内容的静态展示 + 编辑入口"，已具备：Keycloak 统一登录、
  产品级隔离、网页编辑、图片上传、git 同步。但它的上限明显：无页面管理（改名/移动/删除）、无历史对比界面、无评论通知、
  每次保存全站重建约 30 秒、只能表达 git 里的 Markdown 文件（会议纪要等非研发内容无处安放）。
- 目标是向 Confluence 式协作平台演进，并成为 DTS 知识中心的雏形（带权限的知识库 = AI 头脑 RAG 的合规数据源，铁律 #3）。
  因此存储改为 PG；研发文档仍需与产品仓库保持一致（AI 助手、sprint-workflow、开发者直接读写 git），故 git 作为"同步端"保留。
- 本期**安全与权限需求降级**：只做到产品（空间）一级；页面级权限、审计报表、外部分享等不做。

## 架构决策记录 (ADR)

### 工作流 A
| # | 决策点 | 选择 | 状态 | 理由 | 影响 |
|---|--------|------|------|------|------|
| ADR-1 | dts-rdc 定位 | 总纲仓库：愿景、铁律、DAP 协议、跨模块 sprint、submodule 索引 | **已定**（用户 2026-09-25） | 统一产品叙事与跨模块治理 | 本 sprint 的 worklog 落在 dts-rdc |
| ADR-2 | dts-stack 定位 | 湖仓一体数据中台（入湖/ODS/dbt/治理/指标/查询/BI） | **已定** | 与 Foundry 数据层对标 | BI 与口径 SoT 倾向归 stack（ADR-6/7） |
| ADR-3 | 头脑 | dts-studio 与 dts-copilot **合并**为 AI 头脑（智能体、chat2sql、本体、Pack 运行时） | **已定** | studio 有规则/协议，copilot 有可运行引擎 | F1/BL-A |
| ADR-4 | 花卉租赁 | dts-prs 并入 `dts-app-stack/prs-stack`，作为 DTS 面向花卉租赁的 App | **已定** | App 与平台解耦，验证 AppPack 协议 | F0/BL-A |
| ADR-5 | 头脑实现语言 | **Java 为主体**（沿用 copilot），Python 仅作可选 sidecar（eval/embedding），修订 studio 规则中 "Python LangGraph 10 服务" 的设计 | 提议（F0/T12 定稿） | 34 个 sprint 资产不推倒；团队 Java 为主 | `.rules/10-architecture/*` 需改 |
| ADR-6 | BI 归属 | BI（Card/Dashboard/Screen/Report）**归 stack**，头脑保留对话/智能体 UI，通过 API 让 stack 生成 BI 资产 | 提议（F0/T13） | BI 是湖仓消费层；消除分叉 | BL-D |
| ADR-7 | 口径/指标 SoT | **stack governance Indicator 为唯一事实源**，头脑只读消费（缓存 + 降级） | 提议（F0/T14） | 消除双事实源；S29 联邦已铺路 | BL-D |
| ADR-8 | 统一网关 | **Traefik + forwardAuth 作为 dts-gateway 的实现**，鉴权服务由 prs-auth 演进为平台 `dts-auth`；Keycloak 单实例，Organization=租户 | 提议（F0/T15） | prs 已验证（F3）；stack/copilot 也用 Traefik | BL-S |
| ADR-9 | 数据出口 | 头脑所有 SQL 经 **QueryGateway**：AST 白名单 + 只读账号 + READ ONLY 事务 + statement_timeout + 租户上下文注入；Trino/Ranger 作为后续替换实现 | 提议（F0/T15） | 铁律 3；当前 stack 无 Trino/Ranger 运行 | BL-S |
| ADR-10 | 版本基线 | 平台（studio/stack）目标对齐 prs R-012（JDK 25 / Boot 4.x），本 sprint 只做评估与路线，不强制升级 | 提议（F0/T16） | 避免合并与升级叠加风险 | F0/T16 spike |
| ADR-11 | 历史保留 | copilot 并入 studio **保留 git 历史**（filter-repo 重写路径到 `engine/` 后 merge `--allow-unrelated-histories`） | 已定（09-29 F1/T02 双次演练通过） | 34 sprint 的 blame/证据可追溯 | F1 |
| ADR-12 | 领域资产载体 | 花卉语义包/治理规则/模板/提示词/评测集 以 **AppPack 资产**形式存放于 prs-stack，头脑运行时从 **Pack 注册表**加载，classpath 仅保留过渡回退 | 提议（BL-A/T01） | 兑现 apppack-protocol.rules | BL-A/BL-D |
| ADR-13 | 交付方法与铁律 #5 解释 | **UI 原型先行（antd 6 自建 DTS Console 外壳，借鉴 shadcn-admin）→ 冻结 OpenAPI 契约 → BFF 只承担前端交互 → 领域模块按常规设计**；原型只用 mock，接真实数据前领域 API + 测试必须完成；copilot webapp 不迁移，F6/T14 选择性吸收，不设前端过渡期 | 提议（F0/T19，10-09 前定稿；方向经用户 2026-09-27 确认） | 界面尽早经业务确认，契约从界面倒推；统一 antd 体系，不重写存量 | F6、BL-C；CLAUDE.md 铁律 #5 加注 |
| ADR-14 | dts-infra 定位与 K8s 交付底座 | **放弃 dts-stack 运维体系；Go 实现 `dtsctl`（安装器 + Helm v4 伞形编排 + `DtsRelease` CRD，编排库后续装入 operator）；现场只交付品牌化 RKE2（仅改用户可见层），不交付 Rancher Manager；离线包为唯一标准路径；总部 Harbor + 现场 RKE2 内置分发；chart 归各模块、infra 持 L2 中间件/BOM/网关公共件；兼容 ACK；v1.0.0 以 K8s 交付、不保留 Compose 回退**；取代 3 月 dts-infra 设计 | 已确认设计（用户 2026-09-28～29 逐段确认），F7/T01 定稿 ADR 文本 | 自主可控与信创（国产 CPU/OS）交付；同一套 chart 覆盖一体机、集群与公有云 | F7 全部；BL-E/T02～T03 改写；BL-S/T04 网关编排归 infra；CLAUDE.md、infra-iron-laws.rules 修订 |

### 工作流 B · Wiki
| # | 决策点 | 选择 | 状态 | 理由 | 影响 |
|---|--------|------|------|------|------|
| W-ADR-1 | 事实源 | **PostgreSQL** 存全部页面、版本、附件元数据、评论；git 仅为研发文档的同步端 | 已定（用户 2026-09-26） | Confluence 式功能（评论、页面管理、历史界面、非研发页面）需要数据库 | 需要同步器与冲突模型（F4） |
| W-ADR-2 | 技术栈 | **JHipster 9 单体**（用户 2026-09-26 指定）：生成器 9.2.x（按 R-012 取首发满 30 天的最新次版本线）、Spring Boot 由 JHipster 管理（9.2.0 实际为 Boot 4.0.7，见 design/00 D2）、**Java 25**；后端 JHipster 生成（`skipClient`），前端为 `frontend/` 独立的 **React 19 + antd 6**（用户 2026-09-26 指定），打进同一个 jar | 已定 | 与 dts-stack（JHipster 后端 + React/antd 前端）同架构；实体/Liquibase/OAuth2/测试脚手架现成 | 设计见 `features/F2-Wiki平台骨架身份与性能/design/`；实体以 `dts-wiki/jhipster/dts-wiki.jdl` 为准 |
| W-ADR-3 | 内容规范格式 | **Markdown 原文**（PG 存 Markdown，与 git 字节级一致） | 已定 | 双向同步无损，避免富文本↔Markdown 转换产生伪冲突 | 编辑器须 Markdown 原生（F2/T02 选型） |
| W-ADR-4 | 代码位置 | 新仓库 **`billyhotjava/dts-wiki`**，作为 dts-rdc submodule | 已定 | 边界清晰，日后整体并入 dts-studio 知识中心 | 需在 GitHub 建仓（用户操作） |
| W-ADR-5 | 权限粒度 | **仅产品（空间）级**：沿用 Keycloak realm `yuzhicloud`、client `dts-wiki` 的角色 `space-<slug>`（读）、`editor`（写）、`admin`；**不做页面级权限** | 已定（降级） | 与现网 wiki 权限模型一致，迁移零成本 | F2 |
| W-ADR-6 | 身份接入 | JHipster `authenticationType: oauth2`（服务端会话 + OIDC 授权码），不再依赖 oauth2-proxy | 已定 | 应用需要细粒度判断角色、生成审计作者；少一跳代理 | 现网 oauth2-proxy 随切换下线 |
| W-ADR-7 | 同步语义 | 页面分两类：**git 绑定页**（空间配置的仓库路径下的 `.md`，双向同步）与 **wiki 原生页**（仅 PG）；同步单位 = 文件；冲突 = 自上次同步以来两边都改 → 标记冲突、保留两版、人工三方合并；**不自动覆盖** | 提议（F4/T01） | 沿用现网"本地提交 + 定时 rebase/push"的成功经验，把冲突显式化 | F4 |
| W-ADR-8 | 中文全文检索 | PG 内实现：**pg_bigm**（二元组，零词典） | 已定（F2/T03，见 `assets/wiki/search-spike.md`；2 字词走索引，p95 约 12ms/661 篇） | 自定义 PG 镜像 `dts-wiki-db:18-bigm`（`dts-wiki/src/main/docker/postgres.Dockerfile`） |
| W-ADR-9 | 附件存储 | v1 放宿主机卷（`/data/dts-wiki/attachments`，按 sha256 去重）；接口按 S3 抽象，后续切 SeaweedFS | 提议（F3/T08） | 先简后繁；R-012 已定对象存储走 S3 API | — |

## 端到端契约链 (Vertical Slice)

### 工作流 A（整条竖线在 11 月由 BL-E 验收；本月交付仓库落位与头脑合并两层）
主竖线：alice（租户 ID `1`，显示别名 t1，项目经理）在 Studio 智能体工作台问“当前在营项目数”。

| 层 | 契约/落点 | 签名要点 |
|----|-----------|----------|
| UI 入口 | DTS Console `/workspace`（F6/T05；F6/T14 吸收原工作台交互） | 输入框提交问题；答案卡片展示数值 + `accuracyEvidence` 等级 + 数据来源 + 审计号 |
| 登录（目标，现状见 PRS-G01） | Keycloak（单实例；realm `flower-test`，client `dts-studio-web`，OIDC PKCE） | access_token 含 `organization`（租户）、`realm_access.roles` |
| 网关 | Traefik（dts-gateway）→ forwardAuth `GET /api/internal/auth/forward`（账本#25） | 2xx 回注 `X-DTS-User-Id / X-DTS-User-Name / X-DTS-Roles / X-DTS-Tenant-Id / X-DTS-Trace-Id`；401/403 直接返回 |
| API | `POST /api/ai/agent/chat/send`（既有，账本#17 所在服务） | req `{sessionId?, message, domainHint?}`；resp copilot 契约 `{responseKind, blocks[], accuracyEvidence{level,reasons[]}, sourceRefs[], auditId}` |
| Service | `IntentRouterService` → `SemanticPackService`（改为 `PackRegistry` 供数，pack `prs-flower@1.0.0` 域 `project-fulfillment`）→ `Nl2SqlService` → `SqlGuard`（AST）→ `QueryGateway.execute(ctx, datasourceRef, sql, params, limits)` | ctx 含 tenantId/userId/roles/traceId；无 tenantId 时 fail-closed |
| 数据 | 首选：stack 兼容视图（prs F7/T03 产物）；备选：prs PG `prs.project`（RLS FORCE） | 只读账号 `dts_brain_ro`；事务 `SET TRANSACTION READ ONLY` + `SET LOCAL statement_timeout='30s'` + `SET LOCAL app.tenant_id=<t>` |
| 审计 | Kafka topic `dts.audit.v1`（CloudEvents 1.0，type `dts.ai.query.executed`） | 字段 `id,source,type,time,subject,tenantid,actorid,actortype,traceid,data{sql_hash,datasource,rows,evidence_level}` |
| 迁移 | studio engine Liquibase `v1_1_0_001__pack_registry.xml`；prs-stack `pack/pack-manifest.yaml` | 表 `studio_pack`, `studio_pack_version`, `studio_pack_asset`（见 BL-A 契约） |

### 工作流 B · Wiki（本月完整贯通）
主竖线："梅卫锋（产品-PRS 成员 + 研发部）在 wiki 编辑 PRS 的一个 worklog 页面，1 分钟内 prs-stack 仓库出现他署名的提交；
开发者随后在仓库修改同一目录另一文件并 push，1 分钟内 wiki 出现新版本。"

| 层 | 契约/落点 | 签名要点 |
|----|-----------|----------|
| UI | `/s/prs/pages/{pageId}`（页面阅读）→"编辑"→ `/s/prs/pages/{pageId}/edit` | 页面树、面包屑、版本号、"来自 git：prs-stack@abc123"标识 |
| 登录 | Keycloak `yuzhicloud`，client `dts-wiki`（授权码 + PKCE，回调 `/login/oauth2/code/oidc`） | 角色 `dts-wiki:space-prs`、`dts-wiki:editor` |
| API | `GET /api/wiki/pages/{id}`、`PUT /api/wiki/pages/{id}/content`（`{baseVersionNo, contentMd, message?}`） | 409 `PAGE_VERSION_CONFLICT` 返回 `currentVersionNo`；详情与响应字段以 design/03 为准 |
| Service | `PageService.saveContent` → 写 `page_version`（source=`WEB`）与 `SyncOutbox` | 同一事务提交内容与出站操作；同步异步进行 |
| 数据 | `page`（`space_id, parent_id, title, git_path, current_version_id`）、`page_version`（`content_md, author, source, git_commit`）、`sync_binding`、`sync_state` | uk(space_id, git_path) |
| 同步 | fetch → 完整入站 → outbox 物化/提交 → push；远端前移须重新入站后重放 | 按 design/04 幂等确认；内容冲突保留双方版本，不能仅 rebase 后跳过远端区间 |
| 迁移 | Liquibase `db/changelog/*.xml` | 首次同步导入 dts-rdc（docs/、worklog/）与 prs-stack（worklog/） |

## 现状勘察账本 (Context Ledger)

### 工作流 A
> #1～31 为 2026-09-25 的历史快照，#32 起追加 2026-09-26 的定向核查。优先复用已有证据；发生导入/提交/部署变化时核验受影响项，不重复全量勘察。旧条目不是当前运行状态证明。
> 路径简写：`PRS=/opt/prod/prs/source`，`RDC=/opt/prod/dts/dts-rdc`，`CP=PRS/dts-copilot`，`AI=CP/dts-copilot-ai/src/main`，`AIJ=AI/java/com/yuzhi/dts/copilot/ai`。

| # | 事实 | 证据 |
|---|------|------|
| 1 | RDC 4 个 submodule 均为空壳（仅 README）；`dts-stack` 指向 `b2a674b`（2026-03-27 "first commit"），URL `git@github.com:billyhotjava/dts-stack.git` | `RDC/.gitmodules`；`git -C RDC/dts-stack log` |
| 2 | `PRS/dts-stack` 与 RDC 的 dts-stack submodule **同一 URL 但历史不相交**（`b2a674b` 不在其历史中）；`PRS/dts-stack` 2877 commits，根提交 `7d35cfb73 init`，有 5 个未提交修改（docker-compose-app.yml / docker-compose.dev.yml / imgversion.conf / init.sh / services/dts-pg/init/10-init-users.sh） | `git -C PRS/dts-stack` |
| 3 | `/opt/prod/s10/v2.2.3` 是另一仓库 `billyhotjava/s10-stack.git`（3020 commits，HEAD `8568eb95d` 不在 PRS/dts-stack 中）；stack 的 CLAUDE.md 规定开发目录 `/opt/prod/s10/v2.2.3`、构建目录 `/data/dts-stack` | `PRS/dts-stack/CLAUDE.md` 第 3–4 行 |
| 4 | `RDC/dts-app-stack/.gitmodules` 注册 `metro-stack`、`prs-stack`（`billyhotjava/prs-stack.git` @ `fc3d0e7`），均未 checkout | `git -C RDC/dts-app-stack submodule status` |
| 5 | `RDC/dts-studio/.gitmodules` 又嵌套了 `dts-stack`、`app-stack` → 与 RDC 形成循环嵌套；studio 内 `dts-stack/`、`app-stack/` 为空目录 | `RDC/dts-studio/.gitmodules` |
| 6 | `RDC/dts-studio/worklog/v1.0.0/evolution/` 与 `RDC/worklog/v1.0.0/evolution/` 内容完全重复（BP/产品说明/定价 md+pptx+pdf+生成脚本） | `find` 对比 |
| 7 | `PRS/dts-prs` **不是 git 仓库**；`sources/*/target/` 编译产物在源码树；`sources/deploy/.env` 含 `PRS_PG_PASSWORD`、`PRS_LEGACY_PASSWORD`；已有 `.env.example` | `ls -la PRS/dts-prs` |
| 8 | `PRS` 根不是 git；`PRS/AGENTS.md` 描述的是老系统 adminapi/adminweb/app（已移入 `PRS/archived/`），已过时 | `PRS/AGENTS.md` |
| 9 | copilot：`billyhotjava/dts-copilot.git` main，150 commits，未提交修改 README.md/build.sh/dev.sh/docker-compose.yml/imgversion.conf；**`.env` 被 git 跟踪**（含 `PG_PASSWORD`、`DTS_DBT_DB_PASSWORD`；`LLM_API_KEY` 为空），最近相关提交 `366d0d2` | `git -C CP ls-files .env` |
| 10 | copilot 模块：ai 302 Java、analytics 296 Java、webapp 365 TS；测试 146 个；Java 21 / Spring Boot 3.4.5 | `CP/pom.xml` |
| 11 | `AIJ/service/copilot/` 87 类 16,895 行；其中 `Finance*` 52 类 7,689 行；`AssetBackedPlannerPolicy.java` 1,578 行、`TemplateMatcherService.java` 881 行、`CopilotChatContract.java` 838 行 | `wc -l` |
| 12 | `SemanticPackService.java:21` 从 **classpath** 加载 `semantic-packs/*.json`（:31 起列举）；6 个包：field-operations / finance / flowerbiz / procurement / project-fulfillment / warehouse，共 58,742 字节；schema 键：`domain, description, objects, links, metrics, signals, actions, synonyms, fewShots, guardrails` | `AI/resources/semantic-packs/` |
| 13 | `AI/resources/governance/` 19 个 JSON（17 个 finance/voucher，另有 `caliber-rules.v1.json`、`caliber-cross-source-regression.v1.json`、`nl2sql-accuracy-golden-set.v1.json`）；由 `CaliberRuleRegistry.java:19`、`FinanceInvariantRegistry.java:20` 等从 classpath 读取；另有 `AI/resources/prompts/{flowerbiz,settlement}-{constraints,few-shots}.txt`、`planner/business-direct-responses.json` | `ls AI/resources/*` |
| 14 | Liquibase `AI/resources/config/liquibase/changelog/` 共 34 个；`010`–`034` 大量为**领域查询模板数据**（flowerbiz/finance/procurement/project/warehouse），含 `026__trino_compatible_flowerbiz_sales_templates.xml` | `ls` |
| 15 | `flowerbiz.json:257-258` action endpoint `{"service":"adminapi","draft":"/rs-flowers-base/flower/bizBadDebt/saveDraftFlowerBadDebt","commit":".../saveFlowerBadDebt"}`；调用方 `HttpAdminApiActionClient`、`OntologyActionExecutor`、`OntologyActionApprovalService` | grep |
| 16 | 工具：`service/tool/builtin/{ExecuteQueryTool,SchemaLookupTool}`、`service/tool/garden/{FinanceSummaryTool,FlowerStatsTool,GardenProjectQueryTool}`；注册 `ToolRegistry`；连接 `ToolConnectionProvider`/`ManagedToolConnectionProvider` | `ls AIJ/service/tool` |
| 17 | SQL 安全：`SqlSafetyChecker.java:17` 正则关键词黑名单（INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER/CREATE/GRANT/REVOKE/EXEC/EXECUTE/MERGE/REPLACE），未覆盖 CALL/DO/COPY/SET/LOCK/SELECT INTO/副作用函数；`ExecuteQueryTool.java:82` 开连接后仅 `setMaxRows`、`setQueryTimeout(30)`，**无只读事务**；copilot 主代码中 `tenant` **零命中**；`setReadOnly`/`READ ONLY` 零命中 | grep |
| 18 | 认证：`AIJ/security/ApiKeyAuthFilter.java:25`（`Bearer cpk_*`）；`UserContextFilter.java:24-28` 读取 `X-DTS-User-Id/User-Name/Display-Name/Roles/Dept`，`:42` 无头时用 API Key 名作为用户 → **持 Key 者可自报任意用户身份**；无 `X-DTS-Tenant-Id` | 源码 |
| 19 | `AI/resources/application.yml:73-80` 已有 `DTS_PLATFORM_BASE_URL / TOKEN_URL / CLIENT_ID / CLIENT_SECRET / SERVICE_TOKEN` 等，用于 S29 平台指标联邦 | 源码 |
| 20 | Agent UI 契约：后端 `CopilotChatContract.java`（838 行，Map 组装）；前端手写于 `CP/dts-copilot-webapp/src/components/copilot/{useCopilotStream,copilotStreamReducer,MessageList,copilotFixedReportMessage}.ts(x)`；**无 JSON Schema、无代码生成**；工作台页 `src/pages/AgentWorkspacePage.tsx` | 源码 |
| 21 | copilot 自带 compose：pgvector `0.8.6-pg18`、ollama `0.18.0`、traefik `v3.7.13`；镜像 `dts-copilot-{ai,analytics,webapp}`；`build.sh` = `mvn clean package -DskipTests && docker compose build` | `CP/docker-compose.yml:3-193`、`CP/build.sh` |
| 22 | BI 分叉：`CP/dts-copilot-analytics/.../web/rest` 58 个 vs `PRS/dts-stack/source/dts-analytics/.../web/rest` 59 个，**同名 50 个**；copilot 独有 8：AnalysisDraft / CopilotAdmin / CopilotChat / EltMonitor / FixedReport / PlatformIndicator / ReportTemplateCatalog / Synonym；stack 独有 9：AnalysisExceptionHandler / Analysis / AnalyticsClassificationMigration / DataPortal / internal / Marketplace / ProjectCockpit / SemanticPublish / Semantic；copilot analytics 含 `resources/metabase` | `comm` |
| 23 | stack 源码模块（Java/TS 文件数）：dts-platform 2251、dts-platform-webapp 1646、dts-analytics 383、dts-admin 312、dts-admin-webapp 291、dts-ingestion 257、dts-metrics 62、dts-common 18、dts-metrics-webapp 14、dts-session-core 5；`dts-analytics-webapp` 0 文件（BI 前端落点待确认，platform-webapp 有 `pages/workbench/components/ScreenStrip.tsx`） | `find` |
| 24 | stack `docker-compose-app.yml` 服务：dts-core/admin/admin-webapp/airflow(init/scheduler/triggerer/webserver)/analytics/dbt/elasticsearch/ingestion/keycloak/openmetadata(+ingestion/init)/kafka/kafka-ui/pg/dbt-runtime-init/platform/platform-webapp/proxy；**无 Trino/Ranger/对象存储服务**；`:1313` `DTS_JDBC_DRIVER_CLASS=org.apache.hive.jdbc.HiveDriver`（外部 Hive）；`services/dts-ranger/` 空；花卉 dbt 产物在 PG `public.xycyl_*` | compose |
| 25 | stack 治理指标体系：`dts-platform/.../service/governance/Indicator*`（定义/派生/发布/证据/查询计划）；stack 内嵌 LLM 调用：platform `service/modeling` 16 文件、`service/governance` 8、analytics 17 文件、admin 7、ingestion 7 | grep |
| 26 | 版本：stack、copilot 均 Java 21 / Boot 3.4.5；stack platform-webapp React 18.3 / antd 5.22；copilot webapp React 19.1 / antd 5.24；prs JDK 25 / Boot 4.1.1（`PRS/dts-prs/sources/pom.xml`） | pom/package.json |
| 27 | prs 骨架：prs-common（R 信封、`UserContextFilter` X-DTS-* :24-27）、prs-platform:8082（Liquibase 基线）、prs-auth:8081（`ForwardAuthController` `/api/internal/auth/forward` :30/:47）、prs-shadow:8083、prs-project:8084（RLS 只读 + 老库同步）；Keycloak realm `flower-test`（`sources/deploy/keycloak/realm-flower-test.json`）；Helm 骨架 `sources/deploy/helm/prs-service` | `PRS/dts-prs/sources/README.md` |
| 28 | prs 决策 R-003..R-012 位于 `PRS/dts-prs/worklog/v1.0.0/sprint-queue.md:25-73`（R-008 绞杀共存、R-009 agent UI 协议归 copilot、R-010 多租户 RLS、R-012 版本原则）；prs worklog **未提及** AppPack / dts-rdc / pack-manifest；prs F7/T04 依赖 copilot 问数对照 | grep |
| 29 | studio 设计：`RDC/worklog/v1.0.0/docs/plans/2026-03-11-ai-decision-os-design.md` §3/§6 规定 Python+LangGraph AI Core 10 服务；`dts-studio/.rules/10-architecture/apppack-protocol.rules` 定义 manifest 10 类能力；`service-boundaries.rules` 规定 data-security 为唯一出口；DAP 文档 `RDC/worklog/v1.0.0/docs/dts-agent-protocol.md`（Ontology:47 / Skill:141 / Intent:232 / Security:309 / Audit:349） | 文档 |
| 30 | copilot worklog 12 MB、34 个 sprint（`CP/worklog/v1.0.0/`），含 `CP/worklog/prs/v1/`（dbt 模型包、ODS DDL）；队列规则"同一时间最多一个 IN_PROGRESS"已被违反（S33 有 8 个 IN_PROGRESS；S9/S15/S16/S24/S25/S31 悬挂） | `CP/worklog/v1.0.0/sprint-queue.md` |
| 31 | stack worklog 中已有 `PRS/dts-stack/worklog/prs/prs-flowerbiz-*.json`（报花域看板/钻取定义），为 stack 侧花卉资产 | `ls` |
| 32 | 已初始化 prs-stack 到既有 `fc3d0e7`（2026-03-09），有 backend/frontend/pack 与 21 个页面文件；不是空仓库 | prs-stack Git HEAD；integration-20260926/prototype-capability-map.md |
| 33 | 原 dts-prs 的 93 个文件已原样接收到 prs-stack/sources 与 worklog；新增资料未提交，父子 gitlink 未更新 | source-manifest.json；F0/T05 |
| 34 | PRS 实际使用 groups、缺租户 default、数字租户、两租户各一个项目；RLS/同步路由与口径有待验证项 | integration-20260926/README.md 的 PRS-G01～G07 |
| 35 | R-012/BOM 为 9 月 18 日，公共镜像快照为 9 月 20 日；历史运行证据属于旧 BOM，新配置仅有静态核对 | integration-20260926/version-handoff.md；新 BOM 仍由 F0/T03 验收 |
| 36 | 09-28 核查记录：GitHub dts-stack main 与 s10-stack v2.2.3 同为 `8568eb9`；PRS 旧副本为落后 143 个提交的祖先；RDC 的旧指针 `b2a674b` 不在所查远端分支历史中。用户已选定 dts-stack main | `assets/q1-dts-stack-authority-20260928.md`；本轮仅同步记录，未重跑远端核查/克隆 |
| 37 | 中间件镜像现状（09-28）：`postgres:18.6`、`pgvector/pgvector:0.8.6-pg18-trixie`（copilot）、wiki 自建 `dts-wiki-db:18-bigm`、`apache/kafka:4.3.1`（KRaft）、`quay.io/keycloak/keycloak:26.7.4`、`traefik:v3.7.13`、`docker.elastic.co/elasticsearch/elasticsearch:8.11.4`（OpenMetadata 用）、`valkey/valkey:9.1.2`（prs）、`ollama/ollama:0.18.0`、`trinodb/trino:451`、`openmetadata/server:1.11.5`、`dts-airflow-om:2.9.3-om`（LocalExecutor） | `PRS/dts-stack/imgversion.conf`、`CP/imgversion.conf`、`CP/docker-compose.yml`、`dts-stack/docker-compose-app.yml:232` |
| 38 | `RDC/dts-infra` 仅 1 个提交 `b549059`（README 一行），远端 main 相同；无任何代码 | `git -C RDC/dts-infra log`、`git ls-remote` |
| 39 | stack 现有运维体系：`init.sh`（1856 行）、`start.sh`/`stop.sh`、`docker-compose-app.yml`、`imgversion.conf`；`opmanager/`（Spring Boot 3.4.5 + React 离线升级控制台，经 Docker API 重建 Compose 服务，不依赖 Keycloak/主 PG/Traefik）→ ADR-014 决定放弃 | `PRS/dts-stack/{init.sh,opmanager/README.md}` |
| 40 | 3 月 infra 设计（bootstrap/commander、bbolt、global-pg infra schema、gRPC、Helm 集中）与 `dts-studio/.rules/10-architecture/infra-iron-laws.rules` 均基于旧 All-in-K8s/25 服务架构，Sprint-1/2 全部 SUPERSEDED 未执行 | `docs/plans/2026-03-26-dts-infra-design.md`；`sprint-queue.md` Sprint-1/2 |

**开放问题**（勘察未决，由对应 Task 关闭）：
- Q1 已关闭（2026-09-28）：dts-stack main 为权威，见 [决定与核查](assets/q1-dts-stack-authority-20260928.md) §4。F0/T01 继续全模块基准/脏文件对账，F0/T07 的指针修正尚未执行。
- Q2 stack BI 前端落点（`dts-analytics-webapp` 为空）→ F0/T17
- Q3 外部 Hive（`HiveDriver`）对应哪个客户环境？湖仓底座（Iceberg/Trino）是否本期引入？→ F0/T15
- Q4 Keycloak 是否已与 stack 共用单实例（prs R-007 称共用）→ BL-S/T01
- Q5 stack 升级 Boot 4 的成本 → F0/T16
- Q6 copilot-analytics 生产环境是否有用户数据（dashboard/card/screen）需要迁移 → F0/T17（波次 A 盘点）；BL-D/T08 执行迁移

### 工作流 B · Wiki（编号前缀 W）
| # | 事实 | 证据 |
|---|------|------|
| W1 | 现网 wiki：`dts-rdc/wiki/`（VitePress 站点 + `server/` Node API 约 800 行）、`deploy/wiki/`（oauth2-proxy + nginx + api），`https://wiki.yuzhicloud.com`，.50:`/data/dts-wiki` | 提交 `c0b7807`、`9885b05` |
| W2 | 现网可复用思路/代码：乐观并发（`pages.mjs` writePage/baseSha）、图片按页面目录存放、每次编辑一个 git 提交（作者=SSO 用户）、定时 fetch→rebase→push 且冲突时中止（`git.mjs` syncWithRemote）、产品空间映射（`spaces.mjs`）、单元测试 | `wiki/server/*.mjs` |
| W3 | 产品注册表 `dts-rdc/products.json`：dts（docs→`docs`，worklog→`worklog`）、prs（`products/prs/docs`、`products/prs/worklog`）、extras（sandbox）。**新方案中 PRS 改为同步 `prs-stack` 仓库** | `products.json` |
| W4 | Keycloak：realm `yuzhicloud`；client `dts-wiki`（机密客户端，redirect 仅 `https://wiki.yuzhicloud.com/oauth2/callback`）；client 角色 reader/editor/admin/space-dts/space-prs；组 管理员/研发部/产品-DTS 平台/产品-PRS 花卉租赁 | `deploy/sso/bootstrap/realm-yuzhicloud.sh`、`apps/wiki-spaces.sh` |
| W5 | 内容规模：dts-rdc `docs/`+`worklog/` 约 201 个 md，4.5 MB；含中文目录/文件名、少量 pdf/pptx；prs-stack 有 `worklog/`（sprint-1-202609、integration-20260926），无 `docs/` | `find`/`du` |
| W6 | prs-stack：`git@github.com:billyhotjava/prs-stack.git`，已检出于 `dts-rdc/dts-app-stack/prs-stack`（backend/frontend/pack/sources/worklog） | `git remote` |
| W7 | .50 环境：RHEL 8.10、Docker 26、**docker daemon 代理坏（192.168.1.54），镜像须本机 `docker save` 传输**，不可重启 dockerd（live-restore 关，jira 会跟着重启）；可达 npmmirror、GitHub(ssh)，GitHub https 不通 | `reference_infra_topology` 记忆 |
| W8 | .50 现有 PG：`devops-postgres`(15.3, jira 用)、`dts-sso-db`(17, keycloak)。wiki 应**独立实例**（PG 18）并纳入每日备份（参照 `deploy/sso/backup/`） | `docker ps` |
| W9 | GitHub deploy key：现网 `/data/dts-wiki/secrets/deploy_key` 已生成但**尚未加到 GitHub**；新方案每个同步仓库（dts-rdc、prs-stack）都需要一把有写权限的 key | 状态页 sync=offline |
| W10 | sprint-workflow 规范：`v{x}/sprint-{N}-{YYYYMM}/features/F{N}-*/T{NN}-*.md`；README 为目录索引页 | `.claude/skills/sprint-workflow` |

**Wiki 开放问题**：
- Q1 PRS 的研发文档是否也需要 `docs/`（prs-stack 目前只有 worklog/）？→ F4/T02 配置时确认
- Q2 wiki 原生页（非 git）是否也要定期导出备份到 git（作为只读快照）？→ F5/T08
- Q3 dts-rdc 中 `products/prs/`（现网临时 PRS 空间）内容迁往 prs-stack 还是删除？→ F4/T05

## Gate Registry

| Gate | 项目 | 状态 | 证据 | 未过则关联 Task |
|------|------|------|------|-----------------|
| G0 | [A] 交付基线（三系统可同机启动、可登录、可问数） | PENDING | `it/baseline.md` | F0/T03 |
| G0 | [A] 领域与数据画像 | GAP | 本 sprint 为架构重整，领域画像复用 prs `F1 迁移清单` 与 copilot S25/S30；需补 `assets/domain-profile.md` 摘要 | F0/T04 |
| G0 | [A] 领域不变量自检（五条铁律 + domain-dts 包） | GAP | 铁律 #2/#3/#4 未兑现（账本#17/#18/#24） | backlog BL-S（Sprint-6） |
| G0 | [A] 合并前行为基线（回归参照） | PENDING | `assets/baseline-golden-answers.md` | F0/T02 |
| G1 | [A] 契约链贯通 | GAP | 本文档 §端到端契约链；QueryGateway/PackRegistry 为新契约，待 BL-A/BL-S 钉死 | BL-A/T01、BL-S/T08 |
| G1 | [A] 非功能预算 | PENDING | `assets/nfr-budget.md`（问数 P95、Pack 加载时延、审计丢失率） | F0/T18 |
| G3 | [A] 发布安全（旧 copilot 部署并行、可回退） | PENDING | `assets/release-plan.md` | BL-E/T02 |
| G4 | [A] 可运维性 | PENDING | `assets/runbook.md` | BL-E/T03 |
| G4 | [A] DoD 验收 | PENDING | `it/` | BL-E/T01 |
| G0 | [Wiki] 交付基线（空仓库可构建、可部署到 .50、可登录） | PASS（已存档） | `it/wiki/baseline.md` §5，2026-09-27 / w6a2；本轮未重跑 | F2/T09 的完整会话验收仍未完成 |
| G0 | [Wiki] 领域不变量（与 DTS worklog/docs 规范一致；铁律 #1 可降级：wiki 挂了研发文档仍在 git） | PASS | 本文档 W-ADR-1/7 | — |
| G1 | [Wiki] 契约链贯通 | GAP | 本文档 §端到端契约链；API 细节在 F2/F3/F4 | F2/T06、F4/T01 |
| G1 | [Wiki] 非功能预算 | PENDING | `assets/wiki/nfr-budget.md`（页面打开 P95 < 500ms、保存 < 1s、同步延迟 < 60s、检索 P95 < 800ms） | F5/T07 |
| G3 | [Wiki] 发布安全（与现网 wiki 并行、可回退） | PENDING | `assets/wiki/release-plan.md` | F5/T09 |
| G4 | [Wiki] 可运维性（备份、告警、runbook） | PENDING | `assets/wiki/runbook.md` | F5/T08 |
| G4 | [Wiki] DoD 验收 | PENDING | `it/wiki/` | F5/T10 |

| G1 | [Console] 页面动作与 REST/SSE 契约冻结、领域 API 责任明确 | PENDING | `assets/console-contract-map.md` | F6/T13 |
| G4 | [Console] mock 原型四态、权限展示与业务评审 | PENDING | F6/T13 原型评审记录（非真实数据验收） | F6/T05～T13 |
| G0 | [Infra] 验证环境（Harbor、多架构 runner、断网 VM、ACK） | PENDING | `assets/infra-env.md` | F7/T03 |
| G0 | [Infra] 许可证与分发状态复核 | PENDING | `assets/infra-license-review.md` | F7/T01 |
| G1 | [Infra] 契约链贯通（CLI/UI → 编排 → CRD → 契约 Secret → 审计） | GAP | F7 README §端到端契约链；模块 chart 字段级契约待 F7/T02 | F7/T02 |
| G1 | [Infra] 非功能预算 | PENDING | 设计 §9 并入 `assets/nfr-budget.md` | F0/T18、F7/T33 |
| G3 | [Infra] 发布安全（离线升级、回滚、forward-only 备份恢复） | PENDING | `it/infra/IT-infra-e2e.md` | F7/T15、T33 |
| G4 | [Infra] 可运维性与 DoD（断网 RKE2 + ACK 全场景） | PENDING | `assets/infra-runbook.md`、`it/infra/` | F7/T33 |

**当前前置状态**：Q1 已关闭；F0/T01 剩余基准对账、ADR-005/006 与仓库落位仍分别限制 F1 的执行。Console 设计可先行，实际仓库集成须满足 F0/T08。详见 [09-28 复核记录](assets/review-planning-20260928.md)。

## 本月范围与 backlog 去向（取代原"波次计划"）

| 原波次 | 原日期假设 | 现去向 |
|--------|------------|--------|
| A 落位与定案 | 10-08 ~ 10-23 | **本 Sprint** F0、F1 |
| Wiki v1（原 Sprint-6） | 10-12 ~ 11-20 | **本 Sprint** F2–F5（9 月末已先行，按 10 月完成计划） |
| B 边界拆分与安全 | 10-26 ~ 11-27 | backlog → **Sprint-6（2026-11）W1–W3**：BL-A、BL-S、BL-D 口径/T17，11-20 BL-E/T01 阶段 A |
| C 收敛与验收 | 11-30 ~ 12-25 | backlog → **Sprint-6（2026-11）W3–W4**：BI/Finance 收口、BL-E/T01 阶段 B、发布与回退（原 12 月内容并入 11 月，不单开 Sprint-7） |

> 与 prs Sprint-1（至 10-16）的协同：本轮已做资料接收 F0/T05；后续 git 落位、R-013/协议同步与 PRS-G01～04 修复需列出对 PRS F3/F4/F7 的影响和验证窗口，不能以“不打断”省略这些依赖。
> 本月 Task 状态统计见 `sprint-queue.md`；10 月未完成的 Task 于 11-02 随所属 Feature 进入 Sprint-6 W1，不延长本 Sprint。

## Feature 列表

| ID | Feature | Task 数 | 优先级 | 时间窗 | 状态 | 整合来源 |
|----|---------|---------|--------|--------|------|----------|
| [F0](features/F0-基线仓库落位与架构定案/README.md) | 基线仓库落位与架构定案 | 19 | P0 | 2026-10 第 1–3 周 | IN_PROGRESS（DONE=1 / IN_PROGRESS=2 / READY=3 / DRAFT=13） | Sprint-5 F0 G0 基线与权威源确认；Sprint-5 F1 仓库落位与 submodule 重整；Sprint-5 F2 架构决策定稿与规则体系修订 |
| [F1](features/F1-copilot并入dts-studio/README.md) | copilot并入dts-studio | 6 | P0 | 2026-10 第 2–4 周 | IN_PROGRESS（DONE=1 / IN_PROGRESS=4 / DRAFT=1） | Sprint-5 F3 copilot 并入 dts-studio |
| [F2](features/F2-Wiki平台骨架身份与性能/README.md) | Wiki平台骨架身份与性能 | 12 | P0 | 2026-10 第 1–2 周（W0–W3 已于 9 月末先行） | IN_PROGRESS（DONE=8 / IN_PROGRESS=2 / DRAFT=2） | Sprint-6 F0 基线与技术选型 spike；Sprint-6 F1 仓库、数据模型与应用骨架；Sprint-6 F2 统一登录与产品级权限 |
| [F3](features/F3-Wiki内容编辑与版本/README.md) | Wiki内容编辑与版本 | 16 | P0 | 2026-10 第 2–3 周 | IN_PROGRESS（DONE=10 / READY=2 / DRAFT=4） | Sprint-6 F3 空间与页面管理；Sprint-6 F4 编辑器、附件与模板；Sprint-6 F6 版本历史与追溯 |
| [F4](features/F4-Wiki-Git双向同步/README.md) | Wiki-Git双向同步 | 6 | P0 | 2026-10 第 3 周 | DRAFT（DRAFT=6） | Sprint-6 F5 Git 双向同步 |
| [F5](features/F5-Wiki检索协作与上线/README.md) | Wiki检索协作与上线 | 10 | P0/P1 | 2026-10 第 4 周 | DRAFT（DRAFT=10） | Sprint-6 F7 搜索与导航；Sprint-6 F8 协作：评论、@提及、通知；Sprint-6 F9 部署、迁移切换与运维 |
| [F6](features/F6-DTS-Console外壳与全量UI原型/README.md) | DTS-Console外壳与全量UI原型 | 14 | P0 | 2026-10（10-09～10-23 契约冻结） | DRAFT（READY=3 / DRAFT=11） | 新增工作流（ADR-013） |
| [F7](features/F7-dts-infra-K8s交付底座/README.md) | dts-infra K8s交付底座 | 35 | P0 | 2026-10 起（本月 T01～T04；其余随 Feature 转入 Sprint-6） | IN_PROGRESS（READY=4 / IN_PROGRESS=4 / DRAFT=27；dtsctl W1–W4 已完成，见 `it/infra/W1-W4-dtsctl.md`） | 新增工作流（ADR-014，用户 2026-09-28～29 确认） |

**依赖顺序**: 工作流 A：F0（T01 权威源 → T06～T09 仓库落位 → T12～T16 ADR）→ F1（T03 合并后完成 F0/T11 工作副本切换）；
工作流 B 以 design/10 §5 为准，F5/T01 检索可先行供 MCP 使用，不能把整个 F5 都排在 F3/T16 之后；工作流 C 按 F0/T19 → F6 契约与 mock 原型推进。三条工作流可并行，跨工作流前提以各 Task 依赖为准。
**工作流 D**：F7/T01 → T02 → 模块 chart 改造（T24～T27）与 dtsctl 核心（T09～T16）并行 → T32 ACK → T33 验收；发行版（T05～T08）与中间件（T17～T20）在 T02/T03 后并行。

**关键路径**: A：F0/T01 → F0/T07 → F0/T12 → F1/T03 → F1/T06；B：同步基础 → F4/T05 导入/迁移 → F5/T10-A 完整验收 → F5/T09 切换 → F5/T10-B 冒烟；C：F6/T01～T04 → 页面原型 → T13 冻结；D：F7/T01 → T02 → T24（stack 改造）/ T10（编排器）→ T33

## 追溯矩阵 (Traceability)

| 需求点 | Feature | 关键 Task | 验收证据位置 |
|--------|---------|-----------|--------------|
| DTS-C01 可信经营数据（本月定义，后续运行） | F0、BL-D、BL-E | F0/T04、T14；BL-D/T17；BL-E/T01 | 本月 `assets/domain-profile.md`；后续 `IT-data-product-prs.md`、`IT-10` |
| DTS-C02 授权知识供给（本月接口，后续探索） | F3、BL-C、BL-A | F3/T15、T16；BL-C/T04；BL-A/T22 | 本月 `it/wiki/W6.5-diagram-agent.md`；后续 `assets/wiki-rag-spike.md` |
| DTS-C03 行业能力复用 | BL-A、BL-D | BL-A/T10、T14；BL-D/T04 | 后续 Pack/引用一致性验收；不计本月完成 |
| DTS-C04 价值测量与人工接管 | F0、BL-E | F0/T18；BL-E/T01 | 本月 `assets/nfr-budget.md`；后续 `IT-10` 实测 |
| ADR-1 dts-rdc 总纲，submodule 指向真实仓库 | F0 | F0/T07 | `it/IT-01-repo-layout.md` |
| ADR-3 studio+copilot 合并 | F1 | F1/T03、F1/T04 | `it/IT-02-studio-build.md` |
| ADR-4 prs 进入 app-stack | F0、BL-A | F0/T06、BL-A/T08 | `it/IT-01`、`it/IT-04-pack-install.md` |
| ADR-12 头脑无领域硬编码 | BL-A、BL-D | BL-A/T04、BL-A/T14、BL-D/T15 | `it/IT-05-no-domain-in-engine.md`（静态扫描） |
| ADR-6 BI 单份 | BL-D | BL-D/T07 | `it/IT-07-bi-merge.md` |
| ADR-7 口径 SoT | BL-D | BL-D/T03 | `it/IT-08-caliber-sot.md` |
| 铁律 #2 统一网关 | BL-S | BL-S/T02、BL-S/T03 | `it/IT-03-gateway.md` |
| 铁律 #3 数据出口 | BL-S | BL-S/T07–T12 | `it/IT-06-query-gateway.md` + 红队用例报告 |
| 铁律 #4 审计 | BL-S | BL-S/T15–T17 | `it/IT-09-audit.md` |
| 主竖线（在营项目数） | BL-E | BL-E/T01 | `it/IT-10-e2e-slice.md` |
| 无回归 | F0、BL-E | F0/T02、BL-E/T01 | `assets/baseline-golden-answers.md` vs `it/IT-10` |
| PG 为唯一事实源 | F2、F4 | F2/T06、F4/T05 | `it/wiki/IT-01-schema.md` |
| 研发文档与产品 git 双向一致 | F4 | F4/T03、F4/T04、F4/T06 | `it/wiki/IT-03-sync.md` |
| Confluence 式页面管理/历史/评论 | F3、F5 | F3/T02、F3/T11、F5/T04 | `it/wiki/IT-04-pages.md` |
| 产品级权限（降级后） | F2 | F2/T10 | `it/wiki/IT-02-access.md` |
| 平滑替换现网 wiki | F5 | F5/T09 | `it/wiki/IT-05-cutover.md` |
| ADR-14 离线自主交付（国产 CPU/OS、ACK） | F7 | F7/T13、T14、T32、T33 | `it/infra/IT-infra-e2e.md`、`it/infra/os-matrix.md`、`it/infra/ack-e2e.md` |
| 铁律 #1 人工接管（infra） | F7 | F7/T29、T33 | `it/infra/IT-infra-e2e.md`（停 dtsctl/operator 后 helm 接管） |

> 关键 Task 为 BL-* 的行由 backlog 承接，11-02 转入 Sprint-6 时随之迁移。

## 完成标准（本月）

工作流 A：
- [ ] **仓库**：RDC 的 4 个 submodule 均指向真实仓库和真实提交；dts-prs 在 prs-stack 中受版本控制；无循环嵌套；无被跟踪的 `.env`（`it/IT-01-repo-layout.md`）。
- [ ] **决策**：ADR-005～010 状态为"已定"，studio 规则中与之冲突的条款已登记到 BL-A/T20。
- [ ] **头脑合并**：copilot 历史保留进入 studio，`build.sh`/compose 可构建运行，回归与 `assets/baseline-golden-answers.md` 等价（`it/IT-02-studio-build.md`）。
- [ ] **预算**：`assets/nfr-budget.md` 定义问数 P95、Pack 加载时延、审计丢失率等适应度函数，供 backlog Feature 使用。
- [ ] **产品依据**：F0/T04 登记主场景、业务确认人、待确认口径与 oracle；T14 明确指标引用/版本/新鲜度及失效规则；T18 补价值与成本测量方法。未决项有责任 Task，未测收益不得填 PASS。

工作流 C（Console）：
- [ ] F6/T02 约定路由与 T05～T12 全部动作具备 mock 正常/空/加载/错误状态和角色差异，完成业务评审。
- [ ] F6/T13 冻结契约 v1 与责任映射（含 `/me`、SSE、Wiki 身份委托、评估、AI 开关、导出和页面挂载）；未决项不能冒充已冻结。
- [ ] 原型证据与 11 月 BL-C/T08 真实数据验收分开记录。

工作流 B（Wiki）：
- [ ] 主竖线在 .50 运行实例上跑通（两个方向各一次），证据入 `it/wiki/IT-03-sync.md`
- [ ] 现网 wiki 的全部内容（dts-rdc docs/worklog、prs-stack worklog、练习区）已导入，页面数与文件数一致
- [ ] 同时修改同一页面产生冲突时：两个版本都保留、界面可三方合并、合并结果同步回 git
- [ ] 页面改名/移动/删除在 git 中表现为 `git mv`/`git rm` 提交
- [ ] W12 迁移与切换前完整验收通过，旧地址重定向有效；切换后冒烟与回退演练留证，PG 独有内容和待同步修改的恢复路径明确
- [ ] v1.1：首屏 JS ≤ 300 KB gz、RSS < 400 MB；DTS-MD 内容契约与 frontmatter 校验生效；Agent 只读接口与 MCP 权限/契约测试通过（F2/T12、F3/T13–T16）

> 原 Sprint-5 中属于 11 月的完成标准（契约、边界、安全、UI、竖线、可回退）已移至 [`backlog/README.md`](../backlog/README.md) §版本级完成标准。

工作流 D（Infra，本月部分）：
- [ ] ADR-014 定稿；`infra-license-review.md` 完成（F7/T01）
- [ ] `chart-spec.md`、`contract-spec.md` 与 `ci/chart-check` 发布（F7/T02）
- [ ] Harbor、多架构 runner、断网 VM、ACK 环境可用（F7/T03）；三项 spike 结论回填设计 §8（F7/T04）

## 非目标

工作流 A：
- ~~不在本 sprint 引入 k8s 运行时、dts-infra（Go）实现~~（2026-09-29 由 ADR-014 推翻，见 F7）；仍不引入 Neo4j/ClickHouse。
- 不实施 Trino/Ranger/Iceberg 湖仓底座（仅在 QueryGateway 预留实现位，并由 F0/T15 出路线）。
- 不做 JDK 25 / Boot 4 的实际升级（F0/T16 只出评估与路线）。
- 不重写 copilot 的 NL2SQL 算法、不新增业务问答域。
- 不改变 prs Sprint-1 的业务范围与时间盒；不迁移老系统业务功能。
- 不处理 metro-stack。
- 本月不做 AppPack 运行时、统一网关、受控出口、审计入 Kafka、BI/口径/Finance 收敛（在 backlog，Sprint-6 / 11 月）。

工作流 C（Console）：
- [ ] F6/T02 约定路由与 T05～T12 全部动作具备 mock 正常/空/加载/错误状态和角色差异，完成业务评审。
- [ ] F6/T13 冻结契约 v1 与责任映射（含 `/me`、SSE、Wiki 身份委托、评估、AI 开关、导出和页面挂载）；未决项不能冒充已冻结。
- [ ] 原型证据与 11 月 BL-C/T08 真实数据验收分开记录。

工作流 B（Wiki）：
- 页面级权限、外部/匿名分享、审计报表、访问统计
- 多人实时协同编辑（W-ADR-3 已为其预留：Markdown 原生编辑器可在后续接 Yjs）
- PDF/Word 导出、Confluence 数据导入、移动端专门适配
- 作为 DTS 知识中心的 RAG 接入（backlog，在 dts-studio 规划中承接）
- 通用训练/标注平台、多模态处理流水线、世界模型与新行业扩展；后续机会须另有真实需求和容量依据。

**2026-09-29 Studio implementation**: [First implementation checkpoint](assets/studio-refactor-20260929.md). F1/T02 DONE; F1/T01/T03/T04/T06 and F0/T08 IN_PROGRESS. The source import is locally committed on a feature branch; 610 backend tests passed. Remote/main promotion, runtime golden regression and business acceptance remain pending.
