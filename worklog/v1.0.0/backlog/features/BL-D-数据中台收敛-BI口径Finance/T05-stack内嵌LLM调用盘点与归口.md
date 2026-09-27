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
