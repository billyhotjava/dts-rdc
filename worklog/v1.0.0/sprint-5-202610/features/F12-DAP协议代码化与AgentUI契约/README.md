# F12: DAP 协议代码化与 Agent UI 契约

**优先级**: P1
**波次**: B
**状态**: DRAFT

## 目标
DTS Agent Protocol（DAP，`RDC/worklog/v1.0.0/docs/dts-agent-protocol.md`）从"愿景文档"变成"有 Schema、有端点、有生成代码"的协议：
Ontology 层以语义包 schema 为准，Skill 层由 ToolRegistry 导出，UI 层（原 prs R-009 归 copilot 的 agent UI 协议）发布为 JSON Schema 和 TS 类型包，prs 前端可以直接消费。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| Schema | `dts-studio/protocol/dap/ontology.v1.schema.json` | = F4/T01 的 `ontology.v1`（同一个文件，建立软链接或在 README 中说明） |
| REST | `GET /api/ai/dap/skills` | `[{name, description, parameters(JSON Schema), source:"builtin|pack:<name>@<ver>", riskLevel, datasourceRefs[]}]` |
| Schema | `dts-studio/protocol/dap/ui-message.v1.schema.json` | `ChatResponse{responseKind, blocks[], accuracyEvidence, sourceRefs[], auditId}`；`Block = oneOf{text, table, chart, metric, actionProposal, fixedReportLink, clarification, error}` |
| 包 | `@dts/agent-ui-contract`（npm，私有 registry 或 git 依赖） | 由 schema 生成的 TS 类型 + 类型守卫；版本号与 schema 一致 |
| Java | `CopilotChatContract`（账本#20） | 输出必须通过 `ui-message.v1` 校验（契约测试） |

## UI/UX 规格
不新增页面；工作台现有消息渲染（`MessageList.tsx` 等，账本#20）改为使用生成的类型，渲染效果不变（截图对比）。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | DAP Ontology v1 定稿 | P1 | DRAFT | F4/T01 |
| T02 | Skill 描述导出端点 | P2 | DRAFT | F5/T04 |
| T03 | Agent UI 消息 Schema 与 TS 类型包 | P1 | DRAFT | F3/T03 |
| T04 | Intent/Security/Audit 层现状对照与文档更新 | P2 | DRAFT | F9、F11 |
| T05 | studio `.skills` 占位与实际能力对照 | P2 | DRAFT | T02 |

## Definition of Ready
- [x] 契约  - [x] 竖切片：schema → 后端契约测试 → 生成 TS → 前端渲染  - [x] UI：渲染不变  - [ ] 依赖  - [x] 验收

## 完成标准
- [ ] 后端的 golden set 全部响应通过 `ui-message.v1` 校验
- [ ] 前端编译时使用生成的类型，手写的重复类型已删除
