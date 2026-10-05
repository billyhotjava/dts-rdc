# Sprint-5（2026-10）续

**状态**: IN_PROGRESS
**前半月记录**: [归档 Sprint-5](../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/README.md)。Feature、Task、ADR 原文都在归档中；本目录只记录 2026-10-05 起的新增 Task、状态变更和证据，Feature 编号沿用归档。

## 2026-10-05 起的变更

| 日期 | 变更 | 位置 |
|---|---|---|
| 10-05 | D18–D23：dts-wiki 改为产品中立；研发和 App 内容迁入 dts-worklog；产品能力文档放在 dts-docs（取代 D17） | [F0 设计](features/F0-基线仓库落位与架构定案/design/2026-10-05-wiki产品与worklog内容分离及模块关系设计.md) |
| 10-05 | 新增 F0/T20：wiki 与内容分离迁移 | [T20](features/F0-基线仓库落位与架构定案/T20-wiki产品与worklog内容分离迁移.md) |
| 10-05 | T20 M8a：dts-common 1.1.0 加入 `wiki-content` v1 契约与 `content-lint`；归档已封存；新增 CI 与边界规则 | 同上 |

## 与归档的状态差异

| 项 | 归档中的记载 | 当前 |
|---|---|---|
| 分支 | 各仓库在 feature 分支上 | 2026-10-04 起全部只有 `main`，并已推送（[分支合并记录](../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/assets/branch-consolidation-20261004.md)） |
| 10-02 的本地整理 | 尚未提交 | 已随 `89379d0` 等提交入库 |
| dts-stack 推送 | 多租户设计完成前不推送 | 合并提交 `06e28c654` 已推送到 origin/main；用户 2026-10-05 确认为有意推送，F0 设计 §7 的“不推送”约束解除 |
| S4 研发文档位置 | D17：迁入 dts-wiki `content/` | D18–D23：迁入 dts-worklog；S4a 的 Task 6 作废 |
