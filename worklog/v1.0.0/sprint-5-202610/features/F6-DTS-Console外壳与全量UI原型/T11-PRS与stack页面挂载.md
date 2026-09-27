# T11: PRS与stack页面挂载

**原编号**: 新增（2026-09-27，ADR-013 交付方法：模板化 UI 原型先行）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01、T02

## 目标
外壳内可打开 PRS 业务页面（模块联邦远程模块）与 stack BI（链接或嵌入），导航、身份显示和主题一致。

## 技术设计 / UI 规格
- PRS：挂载 `frontend/src/remote/exposes.ts` 暴露的页面（workbench/customer/finance 等），共享 react、antd 单例；版本冲突时在 `assets/console-bom.md` 记录处理方式。
- stack BI：首期新窗口链接 + 统一登录跳转；是否 iframe 嵌入由 F0/T17（BI 前端落点）结论决定。
- 远程模块加载失败时显示错误态，并提供直达原应用的链接（铁律 #1）。

## 验证（RED→GREEN）
- [ ] PRS 至少一个页面在外壳内渲染（截图）
- [ ] 远程模块不可用时的错误态截图

## Definition of Done
- [ ] 契约文件与页面同步提交；mock 模式下走查通过；截图与走查记录写入 `../../it/console/`
- [ ] 无占位证据；未接真实数据前不标“可上线”（ADR-013）
