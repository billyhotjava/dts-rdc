# T06: 审计BFF

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01；BL-S/T17（审计存储与查询）

## 目标
实现 `audit.openapi.yaml`：按条件查询审计事件、按 traceId 组装链路。

## 技术设计
- 下游：BL-S/T17 append-only 存储的查询接口；BFF 只读。
- CSV 导出由下游生成或 BFF 流式转换，需审计员角色并写一条导出审计事件。

## 验证（RED→GREEN）
- [ ] 按 traceId 返回 asked/query/answered 完整链路的集成测试

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权
