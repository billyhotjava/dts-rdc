# T05: Pack管理BFF

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01；BL-A/T03；BL-A/T07（Pack 查询 API）

## 目标
实现 `packs.openapi.yaml`：上传、列表、详情、激活、回滚。

## 技术设计
- 下游：BL-A/T03 安装/激活/回滚 API 与 BL-A/T07 查询 API；上传流式转发，≤ 20 MB。
- 422 校验错误原样映射为契约的 `details.validation.errors[]`。

## 验证（RED→GREEN）
- [ ] BL-A README 走查步骤 1–6 在 bff 模式下完成（截图）

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权
