# T11: garden 工具声明化

**原编号**: Sprint-5 F5/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T08、BL-S/T08（工具执行统一走 QueryGateway）

## 目标
把 `service/tool/garden/{FlowerStatsTool,FinanceSummaryTool,GardenProjectQueryTool}`（账本#16）这类"Java 写死 SQL 的领域工具"改成 Pack 中的**声明式 SQL Skill**，由引擎的通用 `SqlSkillTool` 执行；引擎中删除 garden 包。

## 技术设计
- **Skill 资产格式**（`skills/<name>.yaml`，schema `skill.v1`，T01 需要补充）：
  ```yaml
  name: flower_stats
  description: 按项目统计在摆花卉数量与租金（给 LLM 看的工具描述，沿用原 Tool 的 description）
  datasource_ref: prs-mart
  parameters:            # JSON Schema，直接作为工具调用的 parameters
    type: object
    properties: { projectName: {type: string}, month: {type: string, pattern: "^\\d{4}-\\d{2}$"} }
    required: [month]
  sql: |
    SELECT ... FROM public.xycyl_ads_flowerbiz_lease_summary s
    WHERE s."业务月份" = :month AND (:projectName IS NULL OR s."项目" ILIKE '%' || :projectName || '%')
    LIMIT 100
  limits: { maxRows: 100, timeoutSeconds: 30 }   # 与原来的 setMaxRows(100)/setQueryTimeout(30) 一致
  ```
- **引擎**：新增 `service/tool/pack/SqlSkillTool`（实现 `CopilotTool`），在 Pack 激活时为每个 skill 资产注册一个工具实例到 `ToolRegistry`；参数只能通过命名参数绑定（`NamedParameterJdbcTemplate` 风格），**禁止字符串拼接**；执行一律走 `QueryGateway`。
- **迁移步骤**：逐个阅读三个 Tool 的实现，把 SQL、参数、描述、后处理逻辑提取出来；后处理如果超出"行列格式化"的范围（例如计算同比），在 yaml 中改写为 SQL 表达式；确实无法声明化的，登记到 BL-D 或保留为引擎通用能力，并说明原因。
- 原有测试：把 Java 工具的单测改写为 skill 的契约测试（同样的输入产生同样的 SQL 和参数）。

## 验证（RED→GREEN）
- [ ] 同一组参数下，新旧工具生成的 SQL 执行结果一致（在 F0 基线库上逐个比对）
- [ ] SQL 注入测试：参数中包含 `'; DROP ...`、`%' OR '1'='1` 时，结果安全（只作为字面量）

## Definition of Done
- [ ] garden 包已删除，skill 资产已进入 prs-pack
