# PRS v1.0.0 Sprint 队列（花卉租赁系统重建）

版本目标：新技术栈重建花卉租赁 ERP（React + Java21/Boot3 + PG + Keycloak），以智能体为基础的 AI-native 系统。
三驾马车定位：**dts-prs = 抓手**（客户应用系统，业务事实的产生者）；**dts-copilot = 大脑**（语义/问数，演进为智能体）；
**dts-stack = 数据中台底座**（入湖/dbt/治理/身份）。老系统（adminapi/adminweb/app）按域绞杀重做，全域范围。
每个 Sprint 必须同时说明对另两驾马车的契约影响（数据契约、语义包、身份、agent UI），不得只建 prs 自身。

约定：产品 Feature 用 PF-xxx 稳定标识，可跨 Sprint；Sprint 内切片保留原标识。状态：
DRAFT/READY/IN_PROGRESS/DONE/BLOCKED。时间盒日期均为假设，待确认后转正。

| Sprint | 目标 | 时间盒（假设） | 状态 | 本期 Feature → 产品 Feature | 依赖 | Task 统计 |
|---|---|---|---|---|---|---|
| sprint-1-202609 | 建立可运行基线、决策底座与三系统契约，用一条只读主数据竖线证明 prs→stack→copilot 可贯通 | 2026-09-21 至 2026-10-16（扣中秋、国庆假期，约 13–15 个工作日，调休以官方公告为准） | DRAFT | F1→PF-TRANSFER；F2→PF-BASE；F3→PF-IAM；F4→PF-RUNTIME；F6→PF-DATACONTRACT；F7→PF-SKELETON；F5 已调出（见 R-009） | F1/F6 先行 → F2 → F3 → F4 → F7；详见 Sprint README 关键路径 | 23 个 Task：DRAFT 20、IN_PROGRESS 1（F1/T01）、调出 2（F5） |
| sprint-2-202610（待规划） | 首批业务域开工（排序待 F1 确认，默认现场作业域） | 待定 | 未建 | 待 F1/F6 输出 | F1 首批域排序 + F2 规范 + F4 基线 + F6 共存策略 + F7 骨架 | — |

关键决策存档：
- R-001 去 Vue，用 React 栈（Web React19+Vite+antd；移动 React H5 优先，企微/钉钉容器；Taro/Capacitor/RN 备选；Flutter 出局）。
  **补充（2026-09-18）TypeScript 优先**：Web 与移动 H5 的业务代码、组件、hooks、构建与测试配置一律用 TypeScript（`.ts`/`.tsx`），
  开启 `strict`、关闭 `allowJs`；接口类型从后端 OpenAPI 生成，agent UI 消息类型从 copilot 契约生成，不手写重复类型；
  确需保留 JS 的（无类型的第三方脚本、容器 SDK 注入代码等）必须登记为例外并补 `.d.ts` 声明。老前端 JS 代码不做逐行翻译，按能力重写。
- R-002 Java21 + Boot3.4 + PG17 统一；Kafka 定标准延后建（复用 dts-stack 集群）；Keycloak 独立 flower realm。
  **修订（2026-09-18，按 R-012，已确认）**：JDK 25 LTS、Spring Boot 4.1.1、Spring Modulith 2.1.1、PostgreSQL 18.6（prs 独立业务库）、
  Keycloak 26.7.4、Kafka 4.3.1、Traefik 3.7.13、Valkey 9.1.2、OpenTelemetry 一开始就接；前端 Node 24 LTS、TypeScript 6、React 19.2。
  具体版本以 `sprint-1-202609/assets/版本基线.md` 为准，F2/T03-A 验证兼容性。
- R-003 废 rs-ai，第一大脑为 dts-copilot；报表 defer（分析类迁中台，单据打印保留轻量服务）。
- R-004 全域重做；同功能迁移 + 逻辑完善，不做大爆炸重写；轻规范重清单。迁移按**业务能力**跟踪，
  handler 清单仅作覆盖核对附表；新 API 按资源/命令/事件设计，可投影为 copilot MCP 工具，不 1:1 复刻老 RPC 风格端点。
- R-005 移动端三阶段：P1 企微 H5 → P2 客户侧外链/壳 → P3 真原生再议；离线必测。
- R-006 弃用 Nacos（新栈）：服务少而粗，DNS 服务名够用；边缘路由收敛 Traefik（含灰度/影子流量）；
  鉴权走 Traefik forwardAuth 到花卉鉴权服务（复用 dts-stack 模式）；SCA（含 SCG/Sentinel 网关层）整套移除；
  老栈 Nacos/网关保持不动直至退役。老路由别名（`/finace`、大小写、Conroller 拼写）**只在 Traefik 边缘层映射**，
  且仅为绞杀期老客户端服务，逐条登记下线日期；新 API 命名保持干净。
- R-007 与 dts-stack 共用 Keycloak：同一实例、分 realm（S10 不动，flower 自建，另建 flower-test）；
  Sprint-1 网关只做 Bearer JWT 本地验签；H5/BFF 会话模式顺延 Sprint-2；机器间仍用 X-DTS-Service。
  （由 B-004 关闭得出；合规确认见 B-005。）
- R-008（提议，F6/T01 定稿）绞杀期数据共存——"单一事实源、按切换单元迁移、同步跟着事实源走"：
  - **问题**：绞杀期新老系统并存。同一份业务数据（如报花单）两边都有，必须回答"以谁为准、谁能写"。
  - **规则 1 单一事实源**：任一时点，每个切换单元（一个域，或必须一起切的若干域）只有一侧可写（SoR），另一侧是只读副本。**不做双写。**
    理由：双写需要分布式一致性；老系统冻结只修 bug，不具备改造条件；单号"查最大+1"在两侧各自发号必然重号。
  - **规则 2 同步方向跟着 SoR 走**：切换前 老 MySQL → 新 PG；切换后 新 PG → 老 MySQL（反向同步）。
    反向同步不只为回切：尚未迁移的老域代码仍直接读取已迁域的表（长事务链跨表联查），必须持续喂数据。
  - **规则 3 切换单元由"跨域写"决定**：若老系统中未迁域的代码会**写入**某域的表，这些域必须同批切换，
    或先把这些写入改为调用新 API。实证：报花表 `t_flower_biz_info` 被配送、退回、财务报销等服务直接更新（Sprint 账本 #17），
    因此"报花"不能单独切换。F6/T01 负责产出完整的跨域写矩阵并划定切换单元。
  - **规则 4 标识与单号**：新表主键保持 bigint（雪花算法生成，与老 Long 主键同类型，可反向写回；只在 JSON 中转为字符串）；
    切换后，该单元的单号只由新系统的序列生成，老系统对应写入入口必须关闭。
  - **规则 5 下游无感**：dts-stack ODS 同时接入 `ods_ptr_mysql_*`（老）与 `ods_prs_pg_*`（新）；兼容视图按 SoR 登记表选取来源，
    输出与老 ODS 同形；dbt `xycyl_*` 与 copilot 语义包只读兼容视图，不因切换而修改。
  - **单元生命周期**：
    ① 未迁移（老写；无同步；ODS 读老）→
    ② 影子期（老写；老→新同步；新系统只读功能上线；持续对账：行数、金额、状态分布）→
    ③ 切换（冻结窗口 → 末次同步并对账 → Traefik 路由切到新服务、关闭老写入口 → 新 PG 成为 SoR → 开启反向同步 → 兼容视图改读新源）→
    ④ 保护期（新写；新→老反向同步；出现严重问题时路由切回老系统即可回切；一旦新系统引入老表无法表达的字段或状态，即不可回切，须在切换计划中写明截止点）→
    ⑤ 退役（依赖该单元表的老域全部迁完 → 停止反向同步 → 老表只读归档）。
  - **SoR 登记表**（F6 维护，是切换的唯一依据）：切换单元 / 包含的域与表 / 当前阶段 / SoR / 同步方向 / 切换日期 / 回切截止 / 负责人。
- R-009 agent UI 协议（消息块 Schema/组件注册表）归 dts-copilot 维护（其 sprint-27 agent-first UI 已 DONE），
  dts-prs 只消费不另起协议；原 F5 调出，Sprint-2 起以"对接 copilot 协议"形式进入。
- R-010（提议，F2/T03、F7/T01 验证后定稿）多租户分级模型：
  - **分级**：标准（Pool：共享库 + 行级安全）/ 专享（Silo：独立库或 cell）/ 私有化（整套部署在客户侧）；同一套代码，由租户目录路由。
  - **身份**：一个 realm，每个租户一个 Keycloak Organization，网关把组织声明映射为 `X-DTS-Tenant-Id`。
  - **数据**：业务表 `tenant_id NOT NULL`；PG 行级安全（FORCE RLS）强制隔离，每个事务 `SET LOCAL app.tenant_id`；
    取不到租户返回 0 行（fail-closed，与老系统默认放行相反，账本 #18）；唯一约束带租户；单号按
    （租户, 单据类型, 期间）取号；应用层过滤只作第二道防线。
  - **运行时与配置**：缓存、对象存储、消息、日志都带租户；规则、模板、字典、流程采用"平台默认 + 租户覆盖"。
  - **中台与大脑**：copilot 生成 SQL 的租户隔离必须在执行层强制，不靠提示词（B-007）。
  - 详见 `sprint-1-202609/assets/多租户与云原生演进.md` §2。
- R-011（提议）k8s-ready 约束与演进路线：本期不引入 k8s 运行时，但代码与部署描述必须满足 k8s-ready 清单
  （外部化配置、无状态、存活/就绪探针分离、优雅停机、stdout 结构化日志、OTel、非 root 镜像、定时任务支持多副本、
  Helm chart 骨架）。演进顺序：单集群（CloudNativePG / Keycloak Operator / External Secrets / Argo CD）→
  按租户级别部署（HPA/KEDA、专享级独立命名空间）→ 多 cell 与私有化（同一 chart）。
  prs 不等 dts-stack 迁移 k8s。详见同一文档 §3。

- R-012（已定，2026-09-18 确认）版本原则：取**最新的稳定版本**，不用开发版。
  - 不用 alpha/beta/RC/里程碑/nightly/EA 等开发版本；
  - **有 LTS 的组件取最新 LTS** 的最新补丁（JDK 25、Node.js 24；新 LTS 发布后在升级窗口切换）；
  - **没有 LTS 的组件取成熟的最新稳定版本线**：次版本线首发满 30 天、主版本首发满 90 天，线内取最新补丁（补丁不设等待）；
  - **同一主版本内、升级说明里没有影响本系统的破坏性变化时，直接用最新版本**（Keycloak 26.3 → 26.7.4 按此处理）；
  - 与 dts-stack 共用实例的组件（Keycloak、Kafka）连同共享实例一并升级到选定版本（B-008），stack 侧按升级说明做回归；
  - prs 业务库使用独立 PG 实例，不与 stack 的 `dts-pg`（17.6，承载 ODS）共用；
  - 许可证筛查：仓库已归档的项目不选（MinIO → SeaweedFS，只通过 S3 API 访问）；非 OSI 许可证须法务确认
    （Liquibase 5 为 FSL-1.1-ALv2，不通过则换 Flyway）；
  - 持续跟进：Renovate 按上述等待期（`minimumReleaseAge`）自动提升级 PR，每个 Sprint 留升级窗口；
  - 选定版本、依据与 Keycloak 升级评估见 `sprint-1-202609/assets/版本基线.md`（**v1.0 已确认锁定**；之后只能通过升级窗口或 F2/T03-A 结论修订）。

已知阻碍：
- B-001 团队容量/负责人未确认，估算均为假设（见各 README）。开工前（09-21）未指定负责人则全部 Task 保持 DRAFT。
- B-002 财务 v1 单据目录、首批域排序待业务输入（F1/T03 关闭）。
- B-003 租户模型：按 R-010 推荐 Keycloak Organizations，F3/T01 验证后关闭（不满足才退回 groups）；
  单号方案按 R-010（租户计数表）写入 F2 规范后关闭。
- B-004 已关闭（结论：同一实例分 realm，见 R-007）。遗留运维细节（运维归属、master 管理权、升级协调、
  按 realm 备份/恢复、配额隔离）转 F3/T05 落实，不再阻塞协议与 realm 配置工作。
- B-005 共用 Keycloak 的合规确认：dts-stack sprint-36（机密级合规整改，涉及 dts-keycloak）状态为 PLANNING，
  客户 ERP 与机密级平台共用身份实例需合规方书面确认；未确认前 F3 只在 flower-test realm 推进（F3/T05 跟进）。
- B-006 密钥管理依赖 dts-stack sprint-36/37 成果，二者均为 PLANNING；F2 密钥章节按"假设"发布，不作为锁定项。
- B-007 标准级多租户需要 dts-stack 提供行级租户策略（Trino/Ranger 行过滤或每租户独立视图/凭据），
  否则 copilot NL2SQL 存在跨租户泄露风险；stack 现行方案（每场景单独部署）只覆盖专享和私有化。
  本期由 F6/T02 向 stack 提出需求并记录结论，不阻塞 Sprint-1 交付。
- B-008 共享组件需升级到 R-012 选定版本：dts-stack 的 Keycloak 26.3.4 → 26.7.4（同一主版本，升级检查项见版本基线 §5）、
  Kafka 4.1.2 → 4.3.1。由 F3/T05（Keycloak）、F6/T02（Kafka）与 stack 运维方确定升级窗口并跟进 stack 回归；
  升级完成前，prs 客户端需验证能连接现有版本。
