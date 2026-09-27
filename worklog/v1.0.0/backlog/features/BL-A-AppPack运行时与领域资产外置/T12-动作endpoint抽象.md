# T12: 动作 endpoint 抽象（adminapi → 服务引用）

**原编号**: Sprint-5 F5/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T08

## 目标
动作（例如"创建坏账处理单"，账本#15）不再写死 `service: adminapi` 和老系统路径，改为 `serviceRef` 加上部署侧的绑定，
使 prs 按域切换（R-008）时，**只需修改绑定或发布一个 Pack 小版本，头脑代码无需改动**。

## 技术设计
- **Action 资产**（`actions/<name>.json`，schema `action.v1`）：
  ```json
  {"name":"创建坏账处理单","object":"租赁报花明细","riskLevel":"high",
   "intent":"基于坏账风险命中的报花明细生成坏账处理单草稿，正式提交仍由人工确认。",
   "target":{"serviceRef":"prs-legacy-adminapi",
     "draft":{"method":"POST","path":"/rs-flowers-base/flower/bizBadDebt/saveDraftFlowerBadDebt"},
     "commit":{"method":"POST","path":"/rs-flowers-base/flower/bizBadDebt/saveFlowerBadDebt"}},
   "params":[{"name":"projectId","source":"租赁报花明细.项目id","required":true}, ...],
   "approval":{"mode":"HITL","requiredRole":"PRS_FINANCE"}}
  ```
- **绑定**：引擎配置 `dts.studio.action.services.<serviceRef>.base-url`，以及认证方式（`service-token` / `forward-user`）；本期绑定 `prs-legacy-adminapi` → 老网关地址；将来 prs 新 API 上线后，新增 `prs-api` 这个 ref，并在 Pack 中切换。
- **引擎改造**：`AdminApiActionClient` / `HttpAdminApiActionClient`（账本#15）改名并泛化为 `ActionClient` / `HttpActionClient`，按 serviceRef 查找绑定；未绑定时返回错误 `ACTION_TARGET_UNBOUND`，并在 UI 中提示"该动作在当前环境不可用"；
- **铁律**：`riskLevel: high` 必须经过 `OntologyActionApprovalService` 的人工审批（现有机制）；commit 调用携带发起人身份头（BL-S 的契约），被调用方负责权限校验；每次 draft 和 commit 都发审计事件 `dts.action.{drafted,committed}`（BL-S）。

## 验证（RED→GREEN）
- [ ] 契约测试：使用 WireMock 模拟 `prs-legacy-adminapi`，draft 和 commit 的 method、path、body、身份头都正确
- [ ] 未绑定 serviceRef 时返回预期错误

## Definition of Done
- [ ] `grep -rn "adminapi\|rs-flowers" engine-ai/src/main/java` 为空
