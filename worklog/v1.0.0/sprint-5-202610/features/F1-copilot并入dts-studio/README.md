# F1: copilot并入dts-studio

**优先级**: P0
**状态**: IN_PROGRESS（DONE=1 / IN_PROGRESS=4 / DRAFT=1）
**时间窗**: 2026-10 第 2–4 周
**整合来源**: Sprint-5 F3 copilot 并入 dts-studio（保留历史）（2026-09-26 按月度 Sprint 整合）

## 目标
copilot 以保留 git 历史的方式并入 dts-studio（studio-engine），镜像/compose/脚本路径可用，合并后回归结果与 F0/T02 冻结的行为基线等价，原仓库冻结只读。

## studio 优先重构：已有 Feature 承接（2026-09-29）

用户确认优先重构 dts-studio，使其成为 AI 大脑；dts-stack 承担湖仓一体数据平台。沿用 F1 作为首阶段执行入口，不重复新建 Feature，也不把整项重构全部计入 F1 的 6 个迁移任务。后续功能重构以 BL-A 为主体，与现有配套 Feature 按首个 PRS 场景联调。

| 重构范围 | 已有承接项 | 可验证产出与边界 |
|----------|------------|------------------|
| 基线、仓库整理与架构定案 | [F0](../F0-基线仓库落位与架构定案/README.md) 的 T01、T02、T03、T08、T12～T15 | 冻结来源 SHA、回归基线和运行环境；确定引擎形态、BI/指标归属、身份与取数边界 |
| AI 引擎迁入 studio | 本 Feature T01～T06 | 逐包归属、历史保留、构建入口和 API/SSE 回归；旧 copilot webapp 不整包迁入 |
| 通用 AI 运行时与行业解耦 | [BL-A](../../../backlog/features/BL-A-AppPack运行时与领域资产外置/README.md) | Pack 加载、领域资产外置、通用工具/动作及 DAP 契约；Wiki RAG 生产接入仍以探索结论为前提 |
| 身份、受控取数与审计 | [BL-S](../../../backlog/features/BL-S-铁律安全基座-网关出口审计/README.md) | 真实用户与租户上下文、授权执行和关联审计；取数实现归属须先完成下述设计修订 |
| stack 最小数据接口及 BI/指标收敛 | [BL-D](../../../backlog/features/BL-D-数据中台收敛-BI口径Finance/README.md) | 为 studio 提供首场景的指标引用、数据服务及可追溯结果；不以 stack 全面重构完成作为 studio 启动条件 |
| Console 与真实交互 | [F6](../F6-DTS-Console外壳与全量UI原型/README.md)、[BL-C](../../../backlog/features/BL-C-Console-BFF与真实数据接入/README.md) | 原型/契约与真实数据接入分别验收；不以 mock 页面证明 AI 大脑可用 |
| 联合验收与正式交付 | [BL-E](../../../backlog/features/BL-E-端到端竖线验收与发布/README.md)、[F7/T25](../F7-dts-infra-K8s交付底座/T25-dts-studio-chart化与推理.md) | PRS 在营项目场景的答案、来源、权限和审计一致；K8s 交付适配及发布验收仍按 ADR-014/F7 执行 |

### 执行前需闭合的设计差异

- **取数职责**：F0/T15 与 BL-S/T08 当前仍描述 studio 自管 `studio_datasource`、连接池和 JDBC 执行。按本轮边界，studio 保留查询意图与工具适配，stack 管理数据源凭据并最终执行数据授权、查询限制和数据执行审计；studio 的运行审计与之关联。F0/T15 须先核对 stack 既有查询能力并定稿契约，BL-S/T08 及其相关任务据此修订后才能进入实现；本次承接确认不代表这些设计已闭合。
- **迁移归属**：T01 的通用工具分类不能据此把所有 `*ConnectionProvider` 永久归入 studio；逐项区分 AI 工具接口、stack 数据执行实现和过渡代码，记录下游承接项。迁仓阶段的行为等价不代表最终数据边界已经收敛。
- **交付边界**：本 Feature 继承的 Compose 描述仅用于旧基线与迁移验证，不能作为 v1.0.0 正式交付或回退方案；正式交付沿用 ADR-014，由 F7/T25 承接。T04 执行前须据 F7 契约细化验证入口。

### 启动顺序与完成判定

先闭合 F0 中影响具体任务的基线、仓库及 ADR 前提，再依次完成 T01/T02 → T03 → T04/T06；T05 按原依赖执行。随后由 BL-A、BL-S、BL-D、BL-C 共同交付首个真实场景，BL-E 记录联合验收；不等待所有后续 Feature 全部完成才首次联调。

09-29 已进入实现：T02 DONE，T01/T03/T04/T06 IN_PROGRESS，T05 DRAFT。引擎已在开发分支迁入并通过 610 个后端测试，详细证据见 [实现记录](../../assets/studio-refactor-20260929.md)。F1 完成只证明引擎迁移和基线回归完成，studio 完整重构还需上述功能与联合验收证据。Task 数量、月度时间盒和其他工作流保持原有安排。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-copilot逐包逐资源归属清单.md) | copilot 逐包/逐资源归属清单 | Sprint-5 F3/T01 | P0 | IN_PROGRESS | F0/T12（ADR-005）、F0/T13（ADR-006） |
| [T02](T02-保留历史的合并方案演练.md) | 保留历史的合并方案演练 | Sprint-5 F3/T02 | P0 | DONE | F0/T08（studio 根目录已清理） |
| [T03](T03-执行合并进入studio-engine.md) | 执行合并进入 studio/engine | Sprint-5 F3/T03 | P0 | IN_PROGRESS | T01、T02、F0/T12、F0/T01（copilot 未提交修改已处置，账本#9） |
| [T04](T04-构建compose镜像与脚本路径修复.md) | 构建、compose、镜像与脚本路径修复 | Sprint-5 F3/T04 | P0 | IN_PROGRESS | T03 |
| [T05](T05-copilot原仓库冻结与worklog迁移.md) | copilot 原仓库冻结与 worklog 迁移 | Sprint-5 F3/T05 | P1 | DRAFT | T03 |
| [T06](T06-合并后回归验证.md) | 合并后回归验证 | Sprint-5 F3/T06 | P0 | IN_PROGRESS | T04、F0/T02 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-5 F3 copilot 并入 dts-studio（保留历史）

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
dts-copilot 的代码与 git 历史进入 `dts-studio/engine/`，studio 成为"规则 + 协议 + 可运行引擎"的 AI 头脑仓库；
合并后功能与 F0/T02 基线一致，copilot 原仓库冻结。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 目录 | `dts-studio/engine/` | `pom.xml`（原 CP/pom.xml）、`engine-ai/`（原 dts-copilot-ai）、`engine-analytics/`（原 dts-copilot-analytics，按 ADR-006 过渡保留）、`deploy/`（原 docker、docker-compose*.yml、services、scripts）、`worklog-history/`（原 CP/worklog） |
| 构建 | `dts-studio/engine/build.sh` | 与原 `CP/build.sh` 行为一致（账本#21） |
| 镜像 | 镜像名 | 新名 `dts-studio-engine-ai`（`engine-analytics` 视 ADR-006 定）；compose 中保留旧名别名一个版本周期 |
| Java 包名 | `com.yuzhi.dts.copilot.*` | **本 sprint 不改包名**（降低风险）；改名登记为后续技术债 |
| API 路径 | `/api/ai/*`、`/api/*` | 不变 |

### UI/UX 规格
copilot webapp 不迁入 studio；F6/T14 选择性吸收模块，F6/T05 交付新 Console 工作台。F1 验收采用 F0/T02 的 engine API/SSE 回归，不能用旧 webapp 截图代替。

### Definition of Ready
- [ ] 合并契约待 ADR 确认  - [x] 回归：后端语义等价  - [x] UI：独立 Console 承接  - [ ] 依赖：ADR-005/006  - [x] 验收：T06

### 完成标准
- [ ] `git -C dts-studio log --follow engine/engine-ai/src/main/java/.../Nl2SqlService.java` 能追溯到 copilot 的原始提交
- [ ] 按冻结 SHA 清点的后端测试全部通过（历史 146 是参考快照，前端测试按 T14 单列）；golden set 按 F0/T02 的冻结上下文语义等价，安全断言零容差
