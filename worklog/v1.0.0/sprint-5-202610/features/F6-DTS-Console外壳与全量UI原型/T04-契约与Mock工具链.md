# T04: 契约与Mock工具链

**原编号**: 新增（2026-09-27，ADR-013 交付方法：模板化 UI 原型先行）

**优先级**: P0 · **状态**: READY · **依赖**: T01、F0/T19

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
