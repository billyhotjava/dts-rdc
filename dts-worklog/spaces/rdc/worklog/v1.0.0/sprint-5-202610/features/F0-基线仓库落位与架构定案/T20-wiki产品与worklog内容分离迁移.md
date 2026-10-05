# T20: wiki 产品与 worklog 内容分离迁移

**Feature**: F0 基线仓库落位与架构定案（Feature 原文见[归档](../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F0-基线仓库落位与架构定案/README.md)）
**优先级**: P0
**状态**: IN_PROGRESS（本地已完成 M1–M5，等待提交）
**来源**: 用户 2026-10-05 需求。dts-wiki 改为产品中立；研发与 App 内容放入 dts-worklog；产品能力文档放入 dts-docs
**设计**: [wiki 产品与 worklog 内容分离及模块关系设计](design/2026-10-05-wiki产品与worklog内容分离及模块关系设计.md)

## 范围

执行设计 §6 中的 M1–M6 和 M8。M7（dts-wiki 改造与 .50 部署）由独立的 wiki 开发会话按设计 §7 执行，归属 F4。

## 验收

- [x] M1 dts-worklog 是 dts-rdc 下的普通目录，包含模板、清单和规则
- [x] M2 两份 worklog 已整体归档；dts-rdc 的部分通过重命名保留历史
- [x] M3 守恒校验通过，见下方证据
- [x] M4 `docs/` 已改名为 `dts-docs/`；`products/`、`products.json` 已删除
- [x] M5 入口文档和 skill 已更新；`python3 scripts/check-boundaries.py` 通过
- [ ] M6 提交并推送（等待用户确认）
- [ ] M8 `wiki-content/v1` 契约、内容 lint、dts-docs 内容包

## 证据（2026-10-05，本机 10.20.0.6）

| 检查 | 结果 |
|---|---|
| 归档前后文件集合 | rdc：383 → 383；prs：45 → 45，路径集合逐一相同 |
| 内容差异 | rdc 有 10 个文件、prs 有 2 个文件的内容发生变化，经逐一 diff 确认，变化只有相对链接改写 |
| 链接改写 | 共改写 57 处，范围包括归档、dts-docs，以及 dts-app-stack、prs-stack 的 README |
| 仍未解析的链接 | 3 处，原文中本来就是占位符或已失效：`./diagrams/system-architecture.png`、`./assets/<日期>-<hash>.png`、`./assets/<yyyyMMddHHmmss>-<6位hex>.<ext>` |
