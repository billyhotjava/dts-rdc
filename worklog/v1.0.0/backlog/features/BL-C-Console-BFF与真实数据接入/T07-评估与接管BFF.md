# T07: 评估与接管BFF

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01；BL-A/T10（评测集）

## 目标
实现 `evaluation.openapi.yaml`：评测结果、未通过样本、AI 状态与关闭/恢复操作。

## 技术设计
- 下游：评测运行结果（BL-A/T10 迁移后的评测集与运行记录）、studio 的 AI 能力开关接口。
- 关闭/恢复 AI 仅平台管理员；每次操作写审计事件。

## 验证（RED→GREEN）
- [ ] 关闭 AI 后 PRS 原业务路径仍可用的演练记录（与 BL-E/T01 阶段 B 共用）

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权
