# BL-A: AppPack运行时与领域资产外置

**优先级**: P0
**状态**: DRAFT（DRAFT=22）
**时间窗**: 2026-11（Sprint-6 W1–W4；T18 待完整安全基座，T22 W2 探索/W4 收口）
**整合来源**: Sprint-5 F4 AppPack 协议落地与头脑 Pack 运行时；Sprint-5 F5 花卉领域资产外置为 prs-pack；Sprint-5 F12 DAP 协议代码化与 Agent UI 契约（2026-09-26 按月度 Sprint 整合）

## 目标
头脑从 Pack 注册表加载 prs-pack 的花卉领域资产（语义包、治理规则、查询模板、工具、动作），头脑运行逻辑中不再有花卉硬编码；DAP 协议与 Agent-UI 契约代码化；studio 规则体系与 prs/copilot 规划完成对齐收口。

2026-09-27 产品承接：DTS-C03 首包优先服务 PRS“在营项目”数据场景；T22 对 DTS-C02 做有界知识接入探索，不把探索或 Agent 只读接口视为完整 RAG 上线。范围与验收统一引用 [产品能力规划](../../../docs/plans/2026-09-27-product-capability-roadmap.md)。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-pack-manifest-v1-Schema与校验器.md) | pack-manifest v1 Schema 与校验器 | Sprint-5 F4/T01 | P0 | DRAFT | F0/T12、F0/T15、F1/T03（原则与 CLI 工程落点；不等待 T20 整体完成） |
| [T02](T02-Pack注册表数据模型与迁移.md) | Pack 注册表数据模型与迁移 | Sprint-5 F4/T02 | P0 | DRAFT | T01、F1/T03 |
| [T03](T03-Pack安装激活回滚API.md) | Pack 安装/激活/回滚 API | Sprint-5 F4/T03 | P0 | DRAFT | T02 |
| [T04](T04-语义包与本体服务改为从注册表读取.md) | 语义包与本体服务改为从注册表读取 | Sprint-5 F4/T04 | P0 | DRAFT | T03 |
| [T05](T05-治理规则类Registry统一改用PackAssetResolver.md) | 治理规则类 Registry 统一改用 PackAssetResolver | Sprint-5 F4/T05 | P0 | DRAFT | T04 |
| [T06](T06-领域查询模板从Liquibase数据迁为Pack资产.md) | 领域查询模板从 Liquibase 数据迁为 Pack 资产 | Sprint-5 F4/T06 | P1 | DRAFT | T04 |
| [T07](T07-Pack查询API.md) | Pack 查询 API（界面驱动；UI 见 Sprint-5 F6/T08）| Sprint-5 F4/T07 | P1 | DRAFT | T03；Sprint-5 F6/T13（契约 v1） |
| [T08](T08-prs-stack-pack目录与manifest骨架.md) | prs-stack/pack 目录与 manifest 骨架 | Sprint-5 F5/T01 | P0 | DRAFT | T01（schema）、F0/T06（prs-stack 已建库） |
| [T09](T09-迁移语义包提示词与直答规则.md) | 迁移语义包、提示词与直答规则 | Sprint-5 F5/T02 | P0 | DRAFT | T08 |
| [T10](T10-迁移治理规则与评测集.md) | 迁移治理规则与评测集 | Sprint-5 F5/T03 | P0 | DRAFT | T08 |
| [T11](T11-garden工具声明化.md) | garden 工具声明化 | Sprint-5 F5/T04 | P1 | DRAFT | T08、BL-S/T08（工具执行统一走 QueryGateway） |
| [T12](T12-动作endpoint抽象.md) | 动作 endpoint 抽象（adminapi → 服务引用） | Sprint-5 F5/T05 | P0 | DRAFT | T08 |
| [T13](T13-Pack构建CI与发布流程.md) | Pack 构建、CI 与发布流程 | Sprint-5 F5/T06 | P1 | DRAFT | T09、T10 |
| [T14](T14-头脑去领域化验收.md) | 头脑去领域化验收 | Sprint-5 F5/T07 | P0 | DRAFT | T09–T13、T05、T06 |
| [T15](T15-DAP-Ontology-v1定稿.md) | DAP Ontology v1 定稿 | Sprint-5 F12/T01 | P1 | DRAFT | T01 |
| [T16](T16-Skill描述导出端点.md) | Skill 描述导出端点 | Sprint-5 F12/T02 | P2 | DRAFT | T11 |
| [T17](T17-Agent-UI消息Schema与TS类型包.md) | Agent UI 消息 Schema 与 TS 类型包 | Sprint-5 F12/T03 | P1 | DRAFT | F1/T03 |
| [T18](T18-Intent-Security-Audit层现状对照与文档更新.md) | Intent/Security/Audit 层现状对照与文档更新 | Sprint-5 F12/T04 | P2 | DRAFT | BL-S |
| [T19](T19-studio-skills占位与实际能力对照.md) | studio `.skills` 占位与实际能力对照 | Sprint-5 F12/T05 | P2 | DRAFT | T16 |
| [T20](T20-修订studio规则体系与设计文档.md) | 修订 studio 规则体系与设计文档 | Sprint-5 F2/T06 | P0 | DRAFT | F0/T12–F0/T16；完整规则对齐再等待 T01（ADR-012/Schema） |
| [T21](T21-对齐prs与copilot规划.md) | 对齐 prs / copilot 规划（R-013、队列收口） | Sprint-5 F2/T07 | P0 | DRAFT | T20 |
| [T22](T22-Wiki授权知识检索接入探索.md) | Wiki 授权知识检索接入探索 | 2026-09-27 DTS-C02 | P1 | DRAFT | Sprint-5 F3/T15 的真实可调用接口与 F2/T10 权限用例；F1 合并后的 studio 基线；身份方案读取 F0/T15、BL-S/T01/T03 的结论；在线身份验证依赖 BL-C/T04 的 Wiki 委托接入，未就绪时只做离线实验并记录缺口。 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-5 F4 AppPack 协议落地与头脑 Pack 运行时

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
头脑不再从 classpath 读取领域资产，改为从 **Pack 注册表**读取。Pack 以版本化制品的形式安装、激活、回滚；
这样 prs（以及将来的 metro）只要交付一个 Pack，就能驱动头脑的问数、动作、评测，**不需要改头脑代码**。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 制品 | `pack-manifest.yaml`（Schema：`dts-studio/protocol/pack-manifest.v1.schema.json`） | `apiVersion: dts.pack/v1`、`name`、`version`(semver)、`vendor`、`requires.dts-studio`、`capabilities.{ontology,metrics,actions,skills,guardrails,quality_rules,templates,prompts,persona,evaluations}[]`（每项为 `{path, kind, schemaVersion}`） |
| 制品 | Pack 包 | `<name>-<version>.dtspack`（zip：`pack-manifest.yaml` + 资产 + `SHA256SUMS`） |
| 数据 | `studio_pack` | `id bigint pk`, `name varchar(64) uk`, `vendor`, `created_at` |
| 数据 | `studio_pack_version` | `id pk`, `pack_id fk`, `version varchar(32)`, `status enum(INSTALLED,ACTIVE,SUPERSEDED,FAILED)`, `manifest jsonb`, `checksum char(64)`, `installed_by`, `installed_at`, `activated_at`；uk(pack_id, version)；部分唯一索引：每个 pack 最多一条 ACTIVE |
| 数据 | `studio_pack_asset` | `id pk`, `pack_version_id fk`, `kind varchar(32)`, `key varchar(128)`, `content jsonb`, `content_text text`, `sha256`；uk(pack_version_id, kind, key) |
| REST | `POST /api/ai/packs`（multipart `file`） | 201 `{packId, versionId, name, version, status:"INSTALLED", validation:{errors[],warnings[]}}`；422 校验失败 |
| REST | `POST /api/ai/packs/{name}/versions/{version}/activate` | 200 `{name, version, status:"ACTIVE", previousVersion}`；409 已经是 ACTIVE |
| REST | `POST /api/ai/packs/{name}/rollback` | 200 回到上一个 SUPERSEDED 版本 |
| REST | `GET /api/ai/packs`、`GET /api/ai/packs/{name}`、`GET /api/ai/packs/{name}/versions/{version}/assets?kind=` | 列表/详情/资产 |
| Java | `PackAssetResolver` | `Optional<PackAsset> resolve(String kind, String key)`；`List<PackAsset> list(String kind)`；`long generation()`（激活时 +1，用于刷新缓存） |
| 事件 | `dts.audit.v1` type `dts.pack.{installed,activated,rolledback}` | 见 BL-S |

### UI/UX 规格（T07）
- **入口**：DTS Console → Pack 管理（`/packs`，F6/T08），以 BL-S/T01 确认的 Pack 维护者/管理员权限控制。
- **线框**：
  ```
  ┌ 能力包 ─────────────────────────────────────────────┐
  │ [上传能力包]                        [搜索名称____]  │
  │ ┌──────────┬────────┬────────┬──────────┬────────┐ │
  │ │ 名称     │当前版本│ 状态   │ 激活时间  │ 操作   │ │
  │ │prs-flower│ 1.0.0  │ ●ACTIVE│10-30 14:2│详情 回滚│ │
  │ └──────────┴────────┴────────┴──────────┴────────┘ │
  └────────────────────────────────────────────────────┘
  详情抽屉：版本时间线（INSTALLED/ACTIVE/SUPERSEDED）| 资产分类计数 | 校验警告 | [激活此版本]
  ```
- **四态**：空（"尚未安装能力包" + 上传按钮）/ 加载（表格骨架屏）/ 错误（接口失败时顶部 Alert，可重试；上传校验失败时在弹窗内逐条列出 errors）/ 成功（列表）。
- **关键交互**：上传 → 显示进度 → 返回校验结果（有 warnings 也可以继续）→ 版本处于 INSTALLED → 点击"激活"弹出二次确认（写明"会影响所有用户的问答"）→ 成功提示并刷新；回滚同样需要二次确认。
- **走查**：1. 管理员登录 → 2. 管理/能力包 → 3. 上传 `prs-flower-1.0.0.dtspack` → 4. 看到 INSTALLED 和 0 个错误 → 5. 激活 → 6. 到工作台提问，答案卡片的来源中显示 `pack: prs-flower@1.0.0`。

### Definition of Ready
- [x] 契约已钉死（上表）  - [x] 竖切片：上传 → API → 注册表 → Resolver → 问数  - [x] UI 落点已命名  - [ ] 依赖：F1 合并完成  - [x] 验收可验证

### 完成标准
- [ ] 删除 `engine-ai/src/main/resources/{semantic-packs,governance,prompts,planner}` 后，安装 prs-pack 再跑 golden set，结果与基线一致
- [ ] Pack 管理页走查截图（四态）

## 来源规格：Sprint-5 F5 花卉领域资产外置为 prs-pack

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
copilot 中所有花卉领域资产（语义包、治理规则、提示词、模板、工具、动作、评测集）迁移到 `prs-stack/pack/`，
由 prs 团队维护，以 `prs-flower-<ver>.dtspack` 的形式交付给头脑；头脑的代码和 classpath 中不再有花卉资产。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 目录 | `prs-stack/pack/` | `pack-manifest.yaml`、`ontology/`、`guardrails/`、`quality/`、`templates/`、`prompts/`、`actions/`、`skills/`、`eval/`、`persona/`、`assets/dbt-reference/`、`SHA256SUMS`（构建时生成） |
| 制品 | `prs-flower-<semver>.dtspack` | 由 `pack-cli build` 生成；以 GitHub Release 附件或内部制品库发布 |
| 动作 | `actions/*.json` endpoint 抽象 | `{"target":{"serviceRef":"prs-legacy-adminapi","draft":{"method":"POST","path":"..."},"commit":{...}}}`；serviceRef 由部署侧绑定 base-url |
| 数据源 | `datasources[].ref` | `prs-mart`（PG `public.xycyl_*`）、`prs-app`（prs 新业务库，只读） |
| 版本 | Pack 版本规则 | 资产不兼容变更 → major；新增域/模板 → minor；修正 → patch |

### UI/UX 规格
无新页面；在工作台的答案卡片"来源"中能看到 `pack: prs-flower@x.y.z`（T04 + BL-A）。

### Definition of Ready
- [x] 契约已钉死  - [x] 竖切片：prs 仓库 → 制品 → 注册表 → 问数  - [x] UI 落点：答案来源  - [ ] 依赖：T01  - [x] 验收：T14

### 完成标准
- [ ] `pack-cli validate prs-stack/pack` 返回 0
- [ ] 头脑开启 `fallback-classpath=false` 并删除领域资源后，golden set 与基线一致

## 来源规格：Sprint-5 F12 DAP 协议代码化与 Agent UI 契约

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
DTS Agent Protocol（DAP，`RDC/worklog/v1.0.0/docs/dts-agent-protocol.md`）从"愿景文档"变成"有 Schema、有端点、有生成代码"的协议：
Ontology 层以语义包 schema 为准，Skill 层由 ToolRegistry 导出，UI 层（原 prs R-009 归 copilot 的 agent UI 协议）发布为 JSON Schema 和 TS 类型包，prs 前端可以直接消费。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| Schema | `dts-studio/protocol/dap/ontology.v1.schema.json` | = T01 的 `ontology.v1`（同一个文件，建立软链接或在 README 中说明） |
| REST | `GET /api/ai/dap/skills` | `[{name, description, parameters(JSON Schema), source:"builtin|pack:<name>@<ver>", riskLevel, datasourceRefs[]}]` |
| Schema | `dts-studio/protocol/dap/ui-message.v1.schema.json` | `ChatResponse{responseKind, blocks[], accuracyEvidence, sourceRefs[], auditId}`；`Block = oneOf{text, table, chart, metric, actionProposal, fixedReportLink, clarification, error}` |
| 包 | `@dts/agent-ui-contract`（npm，私有 registry 或 git 依赖） | 由 schema 生成的 TS 类型 + 类型守卫；版本号与 schema 一致 |
| Java | `CopilotChatContract`（账本#20） | 输出必须通过 `ui-message.v1` 校验（契约测试） |

### UI/UX 规格
不新增页面；工作台现有消息渲染（`MessageList.tsx` 等，账本#20）改为使用生成的类型，渲染效果不变（截图对比）。

### Definition of Ready
- [x] 契约  - [x] 竖切片：schema → 后端契约测试 → 生成 TS → 前端渲染  - [x] UI：渲染不变  - [ ] 依赖  - [x] 验收

### 完成标准
- [ ] 后端的 golden set 全部响应通过 `ui-message.v1` 校验
- [ ] 前端编译时使用生成的类型，手写的重复类型已删除
