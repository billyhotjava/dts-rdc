# T17: Agent UI 消息 Schema 与 TS 类型包

**原编号**: Sprint-5 F12/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: F1/T03

## 目标
兑现 prs R-009（agent UI 协议由头脑维护，prs 只消费）与 R-001（类型由契约生成，不手写重复类型）：
把目前"后端用 Map 组装（`CopilotChatContract.java`，838 行）+ 前端手写类型"（账本#20）的隐式契约，改为 JSON Schema 驱动。

## 技术设计
- **反推 schema**：
  1. 收集样本：用 golden set 全量问题 + 流式事件，录制 engine-ai 的响应（包括 SSE 事件序列），得到响应样本集；
  2. 阅读 `CopilotChatContract.java` 的组装逻辑，以及前端的 `copilotStreamReducer.ts`、`MessageList.tsx`、`copilotFixedReportMessage.ts`，确定每种 `responseKind` 和 block 类型的字段；
  3. 编写 `ui-message.v1.schema.json`（包括流式事件 `StreamEvent = oneOf{delta, block, evidence, done, error}`），用样本集校验，直到 100% 通过；
- **后端**：`CopilotChatContract` 输出后在测试中用 schema 校验（契约测试）；运行时不做校验（性能考虑），但在 dev profile 下开启校验并打印警告；
- **与 10 月契约对齐**：对照 `console-contracts-v1` 的 workspace REST/SSE 结构逐字段登记语义映射；领域消息 Schema 是 engine 输出源，Console OpenAPI 是 BFF 输出源，两者由 BL-C/T02 显式适配，不反向重写已冻结契约或维护重复手写 DTO。
- **TS 包**：`dts-studio/protocol/dap/ts/` 使用 `json-schema-to-typescript` 生成 `index.d.ts`；运行时校验器从同一 Schema 单独生成/编译并测试，声明文件不是运行时校验；以 `@dts/agent-ui-contract@1.0.0` 的形式发布（发布方式遵循 ADR-010 的互操作约定：通过 npm 私有源或 git tag 依赖）；
- **前端改造**：Console 工作台及 F6/T14 吸收模块使用对应层的生成类型，共享领域块从契约包导入；如果 `MessageList` 遇到未知 block 类型，渲染"不支持的内容"占位（向前兼容）；
- **prs 侧**：在 prs sprint-queue 的 Sprint-2 输入中登记"消费 `@dts/agent-ui-contract`"（T21 一并处理）。

## 验证（RED→GREEN）
- [ ] 样本集 100% 通过 schema 校验
- [ ] Console `tsc --noEmit` 通过；消息语义与 F6/T05 原型契约及场景一致（空会话 / 流式中 / 错误 / 成功，含表格、图表、动作建议）

## Definition of Done
- [ ] 包 1.0.0 已发布；前端删除手写重复类型

## 2026-09-30：可复用的来源子契约

引擎新增 `protocol/pack-source-ref.v1.schema.json`，普通回答、SSE `done` 和历史消息通过 `packRefs[]` 暴露 `{type:"pack",name,version}`，持久化于 `trace.packRefs`。现有 `sourceRefs` 的 REST 字符串/SSE 字符串数组保持兼容；本 Task 与 BL-C/T02 需把 `packRefs` 适配到 Console 的结构化来源字段，不能把这个子契约标成完整 UI Schema 已交付。完整类型生成、包发布、Console 消费仍未完成，状态保持 DRAFT。
