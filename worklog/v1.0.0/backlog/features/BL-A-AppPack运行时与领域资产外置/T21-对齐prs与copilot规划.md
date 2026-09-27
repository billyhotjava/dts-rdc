# T21: 对齐 prs / copilot 规划（R-013、队列收口）

**原编号**: Sprint-5 F2/T07（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T20

## 目标
（1）在 prs 规划中正式登记 "prs 是 DTS AppPack"（R-013），并评估对 prs Sprint-1/2 的影响；
（2）copilot 的 sprint 队列收口，冻结后并入 studio，使历史状态真实可信（账本#30）。

## 技术设计
### prs 侧（`prs-stack/worklog/v1.0.0/sprint-queue.md`）
- 新增 **R-013**（建议文本）：
  "R-013（已定，2026-10）dts-prs 是 DTS 平台面向花卉租赁的 App，代码位于 `dts-rdc/dts-app-stack/prs-stack`。
  三驾马车表述更新为：prs=App（业务事实产生者）、studio=AI 头脑（原 copilot）、stack=湖仓中台。
  prs 对头脑的输入以 AppPack 资产提供（语义包、指标引用、动作、评测集、persona），遵循 `apppack-protocol.rules`；
  R-009 的 agent UI 协议归属改为 dts-studio（DAP UI 层）；身份头遵循 ADR-008；copilot/studio 查询 prs 数据必须走 QueryGateway（ADR-009）。"
- 修订 R-003（"第一大脑为 dts-copilot" → "dts-studio"）与 R-009 的措辞，保留原文并用删除线标注。
- **影响评估表**：prs Sprint-1 的 F1（Keycloak）、BL-D（数据契约）、BL-D（骨架，F0/T15 依赖 copilot 问数）逐项判断"不变 / 需调整 / 延后"，重点：BL-D/T08 在本 sprint 期间仍用 copilot 旧部署，不阻塞。
- Sprint-2 规划输入：新增 PF-PACK（prs-pack 维护）作为常设产品 Feature。
### copilot 侧（`CP/worklog/v1.0.0/sprint-queue.md`）
- 逐个处理悬挂的 IN_PROGRESS（S9、S15、S16、S24、S25、S31、S33）：根据证据改为 DONE / BLOCKED / 转入 Sprint-5 对应 Feature（写明映射，例如 S33 财务可证明正确性 → BL-D）；
- 在队列顶部加冻结声明："自 2026-10-xx 起不再新增 sprint，后续见 dts-rdc sprint-5"；
- 重算总体统计（队列里写着"待重算"）。

## 验证
- [ ] prs 队列 R-013 已登记，影响评估表有 prs 负责人确认
- [ ] copilot 队列中 IN_PROGRESS 数量 = 0（或只剩一个，并注明原因）

## Definition of Done
- [ ] 两边提交完成；本 sprint README 的"与 prs Sprint-1 的协同"一节更新为确认后的结论

## 2026-09-26 承接约束

先读 prs-stack 的 integration-20260926 与导入的原工作记录。R-013 中 App 归属已由 ADR-4 确认，Pack/网关实现仍分别受 ADR-012/008/009 状态约束，不能整体写成已定。校正 PRS-G05/06：Task 头、队列、旧 BOM 实测分栏；SPEC 的 BL-A 自建 UI、Boot Admin、tracing 二期等按 R-009/011/012 修订。原文件是接收时快照，本轮保持字节一致；后续修订新增记录并保留来源哈希，不能把未验收状态改成 DONE。
