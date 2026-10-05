# T01: copilot 逐包/逐资源归属清单

**原编号**: Sprint-5 F3/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: IN_PROGRESS
**依赖**: F0/T12（ADR-005）、F0/T13（ADR-006）

## 目标
产出 `assets/copilot-ownership-map.md`：copilot 中**每个 Java 包、每个资源文件、每个 Liquibase changeset、每个前端页面**都标注最终归属——
`engine`（头脑通用能力）/ `pack:prs`（花卉领域资产）/ `stack`（BI 或口径）/ `console-harvest`（选择性吸收）/ `delete`（不迁入目标树），作为 BL-A–BL-D 的共同输入。

## 技术设计
- **输入**：账本#10–#16、#20、#22。
- **输出契约**（表格列）：`path | kind(java-pkg|class|resource|changeset|page) | lines | owner(engine|pack:prs|stack|console-harvest|delete) | target_feature | note`。
- **分类规则**：
  1. `service/llm/**`、`service/agent/**`、`service/rag/**`、`service/tool/{CopilotTool,ToolRegistry,ToolContext,ToolResult,*ConnectionProvider}`、`service/tool/builtin/**`、`service/safety/**`、`service/chat/**`、`service/audit/**`、`security/**`、`service/config/**` → `engine`；
  2. `service/copilot/`（87 类）逐个判断：
     - 通用编排（`IntentRouterService`、`ConversationPlannerService`、`PlannerPolicy`、`TemplateMatcherService`、`Nl2SqlService`、`SqlSafetyChecker`、`SemanticPackService`、`OntologyService`、`OntologyAction*`、`CopilotChatContract`、`AiCopilotService`、`Nl2SqlAccuracyGoldenSet*`）→ `engine`；
     - `Finance*`（52 类）、`VoucherLedger*`、`FinanceApplicationMysql*` → `engine`（引擎化，BL-D）+ 规则数据归 `pack:prs`，逐类写明"哪部分是机制、哪部分是数据"；
     - `AssetBackedPlannerPolicy`（1578 行）：拆分标注，找出其中的领域硬编码段（grep 中文业务词 / 表名 `xycyl_`）；
     - `AdminApiActionClient`、`HttpAdminApiActionClient` → `engine`（改为通用 ActionClient，BL-A/T12）；
  3. `service/tool/garden/**` → `pack:prs`（BL-A/T11）；
  4. `resources/semantic-packs/**`、`resources/governance/**`（除通用 schema 外）、`resources/prompts/**`、`resources/planner/**` → `pack:prs`；
  5. Liquibase：001–009、012–014、019–020、023 结构变更 → `engine`；010/011/015–018/021/022/024–034 中的**模板数据** → `pack:prs`（BL-A/T06），**表结构** → `engine`；
  6. `dts-copilot-analytics` → 按 ADR-006 逐个 REST 资源标注；
  7. webapp 不整包迁入：逐文件标记由 F6/T14 吸收/重写或不迁移；BI 功能归 stack 的映射交 BL-D/T10。前端盘点阶段可先行，最终归属依赖 ADR-006；不把整个 webapp 标为 engine。
- **统计汇总**：按 owner 汇总文件数和行数。

## 验证
- [ ] 清单覆盖率 100%：`find` 出的文件数 = 清单行数（按包聚合的行需注明包含的文件数）
- [ ] 抽检 10 个 `engine` 条目，确认不含花卉业务词

## Definition of Done
- [ ] 清单入档，经 BL-A/BL-D 负责人确认

## Implementation checkpoint (2026-09-29)

Published the 2,222-file candidate ownership inventory; final mixed-resource ownership review remains open.

Evidence: [implementation record](../../assets/studio-refactor-20260929.md), [IT-02](../../it/IT-02-studio-build.md).
