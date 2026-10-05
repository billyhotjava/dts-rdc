# T04: 契约与Mock工具链

**原编号**: 新增（2026-09-27，ADR-013 交付方法：模板化 UI 原型先行）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T01、T02 路由/角色设计、F0/T19

## 目标
OpenAPI 契约是唯一来源：前端类型、MSW mock、BFF 契约测试都从同一份文件派生。

## 技术设计 / UI 规格
- `console/contracts/<surface>.openapi.yaml`（OpenAPI 3.1），按页面域拆分；公共部分（错误体、分页、traceId、证据等级）放 `common.yaml`。
- 错误体统一：`{errorKey, message, traceId, details?}`；分页 `{items, page, size, total}`。
- 前端类型：`openapi-typescript` 生成 `src/shared/api/schema.d.ts`；请求函数用生成类型，禁止手写 DTO。
- Mock：MSW handlers 按契约实现，数据来自 `mocks/fixtures/`；fixture 取 PRS 种子数据的真实形状（两租户、项目状态分布、口径字段），不编造业务词汇（domain-grounding）。
- 契约检查：CI 中 `redocly lint`；契约变更需在 PR 描述写明影响的页面与 BFF 端点。

## 验证（RED→GREEN）
- [ ] 修改契约字段后前端类型检查立即报错（RED 验证）
- [ ] 开发模式下对 mock 响应做 schema 校验

## Definition of Done
- [ ] 契约文件与页面同步提交；mock 模式下走查通过；截图与走查记录写入 `../../it/console/`
- [ ] 无占位证据；未接真实数据前不标“可上线”（ADR-013）

## Mock 身份与消息类型

`mocks/identities.json` 定义覆盖 T02 路由表的六类身份：业务用户、数据维护者、Pack 维护者、审计员、业务负责人、平台管理员；使用稳定 ID/角色键，并分配到两个测试租户。另提供未登录、缺租户、撤权场景。身份是合成测试输入，不是实际 Keycloak 用户。

顶栏身份切换器仅在 mock 构建启用，同时驱动菜单、`/me`、业务数据和 MSW 的 401/403/无租户响应；不能只换姓名而仍返回管理员 fixture。bff/生产构建不得渲染控件或加载其数据，更不能将 mock user/role 写成可信身份头。

workspace 的 SSE 事件 Schema 与 REST 契约共同维护，前端类型由契约生成。MSW 按事件序列模拟增量、终止、拒绝、超时和取消；10 月不依赖 BL-A/T17 的 11 月类型包。

- [ ] 六类身份、两个租户及未登录/缺租户均有预期菜单和响应测试；同计数的租户按记录 ID 验证隔离。
- [ ] bff 产物中无 mock 身份切换器、fixture 自动兜底和 MSW 注册；客户端改角色不改变服务端授权。
