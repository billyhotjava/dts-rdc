# T02: Skill 描述导出端点

**优先级**: P2
**状态**: DRAFT
**依赖**: F5/T04

## 目标
`GET /api/ai/dap/skills` 输出当前可用的全部工具（内置工具 + Pack 中的 SqlSkill），格式符合 DAP Skill 层（`dts-agent-protocol.md:141`），供将来的 MCP 暴露或第三方智能体发现使用（prs R-004 提到的"新 API 可投影为 copilot MCP 工具"）。

## 技术设计
- 从 `ToolRegistry`（账本#16）枚举，按用户角色过滤（只返回该用户有权使用的工具）；
- 字段见 F12 README；`parameters` 直接复用 `CopilotTool` 的参数 schema（`ExecuteQueryTool` 中已有 `properties`/`required` 的构造方式）；
- 同时生成静态文件 `protocol/dap/skills.snapshot.json`（CI 中生成），用于变更评审。

## Definition of Done
- [ ] 契约测试通过；快照已提交
