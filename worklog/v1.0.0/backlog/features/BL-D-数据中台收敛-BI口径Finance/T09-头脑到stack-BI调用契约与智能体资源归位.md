# T09: 头脑 → stack BI 调用契约与智能体资源归位

**原编号**: Sprint-5 F7/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T07、BL-S/T03、BL-S/T06（已验证代用户授权）

## 目标
（1）实现"保存为卡片 / 加入看板"：头脑调用 stack BI API；
（2）`CopilotChat`、`CopilotAdmin`、`AnalysisDraft` 三个资源（原本在 copilot-analytics 中，账本#22）归入头脑 engine-ai 或 webapp BFF。

## 技术设计
- **头脑侧**：`service/bi/StackBiClient`（HTTP，base-url 使用配置 `dts.studio.bi.stack-base-url`，转发 `X-DTS-*` 身份头与 `X-DTS-Trace-Id`）；
  新增 REST `POST /api/ai/agent/messages/{messageId}/save-as-card`：根据 message 的 grounding 元数据（chat_message 已有的 `source_refs`、`agent_bi_metadata`，见账本#14 中 019/020 changeset）组装 stack 的 card 请求 → 返回 `{cardId, url}`；
- **原 analytics 中的 3 个资源**：
  - `CopilotChatResource` 与 `CopilotAdminResource` 原本是 analytics 到 ai 的代理 → 前端直接调用 `/api/ai/*`，删除代理层；
  - `AnalysisDraftResource` → 属于智能体的产物（草稿），迁入 engine-ai，表结构随之迁移；
- **stack 侧**：card 增加 `origin` 字段（jsonb），记录 agent、session、message、pack 版本，用于溯源；
- **错误路径**：stack 不可用 → 返回 503 `BI_BACKEND_UNAVAILABLE`，前端提示"分析中心暂不可用，可稍后在历史消息中重试"（铁律 #1：问答本身不受影响）。

## 验证（RED→GREEN）
- [ ] 契约测试：使用 WireMock 模拟 stack，校验请求体、身份头、错误映射
- [ ] UI 走查：BL-D README 中的步骤 1–6，截图

## Definition of Done
- [ ] 截图与契约测试结果进入 `it/IT-07-bi-merge.md`
