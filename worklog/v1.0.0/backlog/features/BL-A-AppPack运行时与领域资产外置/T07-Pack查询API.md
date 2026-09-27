# T07: Pack 查询 API（界面驱动）

**原编号**: Sprint-5 F4/T07（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T03；Sprint-5 F6/T13（契约 v1）

## 目标
2026-09-27 按 ADR-013 调整：Pack 管理的**界面**已移到 Sprint-5 F6/T08（DTS Console 原型），接入真实数据由 BL-C/T05（Pack 管理 BFF）完成。本 Task 改为补齐界面驱动出的**领域查询 API**：Pack 列表、详情（manifest 摘要、资产清单）、版本时间线、兼容性检查结果。

## 技术设计
- 与 T03（安装/激活/回滚）同一服务、同一鉴权；只读接口，分页 `{items, page, size, total}`。
- 字段以 F6/T13 冻结的 `packs.openapi.yaml` 与 `console-contract-map.md` 的缺口清单为准；领域接口按 Pack 运行时自身语义设计，不为页面定制形状，差异由 BFF 适配。
- 原 UI 设计（上传限制、422 错误列表、确认弹窗、状态徽标）已迁入 F6/T08，不在此重复。

## 验证
- [ ] 契约测试：列表分页、详情、时间线、未找到 404、无权限 403
- [ ] BL-C/T05 在 bff 模式下完成 BL-A README 走查步骤 1–6
