---
type: task
id: S5/F0/T20
feature: S5/F0
title: "wiki 产品与 worklog 内容分离迁移"
status: IN_PROGRESS
priority: P0
depends: []
---
# T20: wiki 产品与 worklog 内容分离迁移

**Feature**: F0 基线仓库落位与架构定案（Feature 原文见[归档](../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F0-基线仓库落位与架构定案/README.md)）
**优先级**: P0
**状态**: IN_PROGRESS（M1–M6、M8a、M8c 已完成；M8b 待排期）
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
- [x] M6 已提交并推送：prs-stack `bb26e7b`、dts-app-stack `c90e1f4`、dts-studio `e3b1a1f`、dts-rdc `9a19533`
- [x] M8a `wiki-content/v1` 契约、`content-lint`、归档封存、CI、边界规则
- [ ] M8b dts-docs 内容包纳入发布（F7/T27）
- [x] M8c 按 [dry-run 报告](../../assets/frontmatter-dry-run-20261005.md) 方案 A（用户 2026-10-05 确认）建立 Sprint-5 元数据卡片：8 个 Feature、118 个 Task，并给 Sprint README 和本 Task 补 frontmatter；backlog 在拉入 Sprint 时再建卡片

## 证据（2026-10-05，本机 10.20.0.6）

| 检查 | 结果 |
|---|---|
| 归档前后文件集合 | rdc：383 → 383；prs：45 → 45，路径集合逐一相同 |
| 内容差异 | rdc 有 10 个文件、prs 有 2 个文件的内容发生变化，经逐一 diff 确认，变化只有相对链接改写 |
| 链接改写 | 共改写 57 处，范围包括归档、dts-docs，以及 dts-app-stack、prs-stack 的 README |
| 仍未解析的链接 | 3 处，原文中本来就是占位符或已失效：`./diagrams/system-architecture.png`、`./assets/<日期>-<hash>.png`、`./assets/<yyyyMMddHHmmss>-<6位hex>.<ext>` |

## 证据：M8a（2026-10-05，本机 10.20.0.6）

| 检查 | 结果 |
|---|---|
| `dts-common/build.sh clean install`（Java 21） | PASS：20 个测试，0 失败（ContentLintTest 7、PackArchiveValidatorTest 12、PackCliTest 1）；本地已安装 1.1.0 |
| 归档封存 | 封存前 `git status` 显示归档无改动；`checksums/rdc/dts-rdc-worklog.sha256` 共 383 行，`checksums/prs/prs-stack-worklog.sha256` 共 45 行 |
| `content-lint check .` | 3 个空间、434 个文件，0 个带 frontmatter，2 份已封存归档，0 个错误 |
| `python3 scripts/check-boundaries.py` | PASS；人为新建根目录 `worklog/` 后检查失败，说明规则生效 |
| Studio | 仍钉 Common 1.0.0；Pack 代码与 schema 未改动，未重跑 Studio 测试 |

## 证据：M8c（2026-10-05）

| 检查 | 结果 |
|---|---|
| 卡片生成 | 共 126 张（Feature 8、Task 118）。状态、优先级、依赖取自归档；依赖先去掉括号说明再解析，指向不存在编号的 `S5/F1/T25` 未写入 |
| `content-lint check .` | 3 个空间、561 个文件，其中 128 个带 frontmatter，2 份归档已封存，0 个错误 |
| 状态复核 | 未做；各 Feature 负责人复核后修改卡片（wiki 部分由 wiki 开发会话负责，见[工作指导](../../assets/handoff-20261005-dts-wiki-dev-session.md)） |
