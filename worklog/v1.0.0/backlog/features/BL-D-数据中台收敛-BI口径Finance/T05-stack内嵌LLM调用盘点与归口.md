# T05: stack 内嵌 LLM 调用盘点与归口

**原编号**: Sprint-5 F8/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: F0/T12（ADR-005）

## 目标
盘点 stack 中直接调用 LLM 的代码（账本#25：platform/modeling 16 个文件、governance 8 个、analytics 17 个、admin 7 个、ingestion 7 个），逐个决定"改为调用头脑 API"或"保留在 stack 中，但必须可降级"，消除两个大脑并存的局面。

## 技术设计
- **盘点表** `assets/stack-llm-usage.md`：`file | 功能（例如 AI 辅助建模、指标描述生成、屏幕 AI、NL2SQL 评测） | 调用方式（直连 provider / 经过某个 gateway） | 配置项 | 降级行为 | 处置（route-to-brain / keep-degradable / delete）`；
- **判断原则**：面向终端用户的问答和智能体能力 → 归头脑；stack 内部的"小 AI"（例如给字段生成描述）→ 可以保留，但 LLM 配置统一使用头脑的 LLM Gateway（`POST /api/ai/llm/complete`，内部接口，使用 `X-DTS-Service` 认证），便于统一审计、计费和切换模型；
- **头脑侧**：在 `LlmGatewayService`（账本#16 附近 `service/llm/gateway`）上暴露内部补全接口，支持 `purpose` 标签，用于审计和成本统计；
- **analytics 中的 `ScreenAiResource`、`Nl2SqlEvalResource`**：与 BL-D 的处置一起决定（NL2SQL 评测应归头脑 eval）。
- **铁律 #1 验证**：每个保留在 stack 中的 AI 功能，都要在"头脑下线"时验证 stack 的主功能不受影响。

## 验证
- [ ] 盘点表覆盖 grep 出的全部文件
- [ ] 至少一个 stack 功能完成切换，走查截图；断开头脑后该功能优雅降级（截图）

## Definition of Done
- [ ] 盘点表中处置为 route-to-brain 的项全部完成，或登记为后续 task

## AI 状态与人工接管控制面（2026-09-27）

本 Task 的 studio 侧负责复用现有 AI 配置/运行状态机制，提供状态查询及管理员关闭/恢复 API，承接 F6/T10 和 BL-C/T07。开发前冻结全局/租户作用域、持久化与重启行为、并发更新、重复请求幂等、在途请求完成或取消策略；由领域服务执行权限判断并记录审计，BFF 不实现开关逻辑。

关闭 AI 只影响约定的 AI 能力，Console/BFF、原业务与 stack 核心路径仍可用，不能用停止整个 studio 容器代替页面开关的语义。与 BL-S/T15 的操作审计联调完成后才向 BL-C/T07 提测；本期必需接口不可仅“登记后续”后关闭 Task。

- [ ] 状态查询、关闭、恢复、重复/并发请求、未授权与重启持久化按已定策略验证，关闭后可查看状态并通过人工路径工作。
