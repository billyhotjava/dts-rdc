# T08: Pack管理原型

**原编号**: 新增（2026-09-27，ADR-013 交付方法：模板化 UI 原型先行）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T02–T04

## 目标
`/packs` 完成 Pack 上传、查看、激活、回滚的全部界面（取代 BL-A/T07 原计划在旧 webapp 中实现的 UI）。

## 技术设计 / UI 规格
- 交互细节沿用 BL-A/T07 已写的设计（上传 `.dtspack` ≤ 20 MB、422 校验错误列表、激活/回滚二次确认、状态徽标 ACTIVE/INSTALLED/SUPERSEDED/FAILED），组件改用 antd 6 与 T03 模式。
- 详情：manifest 摘要、资产清单（语义包、规则、模板、评测集）、版本时间线、兼容性检查结果。
- 契约 `packs.openapi.yaml`，与 BL-A/T03 的 Pack 安装激活回滚 API 对齐（由 BFF 映射）。

## 验证（RED→GREEN）
- [ ] BL-A README 走查步骤 1–6 在 mock 下可完成（截图）
- [ ] 422 校验错误、激活冲突、回滚确认三种交互截图

## Definition of Done
- [ ] 契约文件与页面同步提交；mock 模式下走查通过；截图与走查记录写入 `../../it/console/`
- [ ] 无占位证据；未接真实数据前不标“可上线”（ADR-013）
