---
type: sprint
id: sprint-5
title: "Sprint-5（2026-10）：四模块合并落位 + Wiki v1 上线 + Console 原型 + dts-infra K8s 交付底座"
status: IN_PROGRESS
timebox:
  start: 2026-10-01
  end: 2026-10-31
goal: "A 四模块合并与 ADR-005～010 定稿；B DTS Wiki v1 上线（产品中立，内容来自 dts-worklog）；C Console 原型并冻结契约；D dts-infra K8s 交付底座（ADR-014、chart/契约规范、制品中心）"
---
# Sprint-5（2026-10）续

**状态**: IN_PROGRESS
**前半月记录**: [归档 Sprint-5](../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/README.md)。Feature、Task、ADR 原文都在归档中；本目录只记录 2026-10-05 起的新增 Task、状态变更和证据，Feature 编号沿用归档。

## 元数据卡片

`features/` 下每个 Feature（`README.md`）和 Task 各对应一张卡片，按归档目录结构排列。卡片只包含 frontmatter（状态、优先级、依赖）、指向归档原文的链接和状态变更记录，**状态以卡片为准**。backlog 在拉入 Sprint 并重新编号时再建卡片。依据：[frontmatter dry-run 报告](assets/frontmatter-dry-run-20261005.md)。

## 2026-10-05 起的变更

| 日期 | 变更 | 位置 |
|---|---|---|
| 10-05 | D18–D23：dts-wiki 改为产品中立；研发和 App 内容迁入 dts-worklog；产品能力文档放在 dts-docs（取代 D17） | [F0 设计](features/F0-基线仓库落位与架构定案/design/2026-10-05-wiki产品与worklog内容分离及模块关系设计.md) |
| 10-05 | 新增 F0/T20：wiki 与内容分离迁移 | [T20](features/F0-基线仓库落位与架构定案/T20-wiki产品与worklog内容分离迁移.md) |
| 10-07 | 访问方式扩展：服务器可以用密钥或 root 密码访问（askpass 托管、交互输入、改装公钥），脚本不变 | dts-infra `deploy/ssh/README.md` |
| 10-07 | F7 S2-W6 日志：D-S2-4 按方案 A 定案；新增 CHART016 节点代理例外；VictoriaLogs + Fluent Bit 已在 dts-local 端到端验证（不丢、不重） | [F7 design/03 §6](features/F7-dts-infra-K8s交付底座/design/03-S2研发构建与制品流实施计划.md) |
| 10-06 | F7 S2-W6 指标：Prometheus Operator + Prometheus 已在 dts-local 验证；dtsctl 覆盖支持 `"*"`；新增 chart 规则 CHART015；日志采集等待 D-S2-4 | [F7 design/03 §6](features/F7-dts-infra-K8s交付底座/design/03-S2研发构建与制品流实施计划.md) |
| 10-06 | 环境整理：开发主机访问清单 + 专用基础设施密钥 `id_ed25519_dts_e2` | dts-infra `docs/development-ci-host.md` |
| 10-06 | F7 S2-W5 证书底座：cert-manager v1.21.1 + 内部 CA，dts-local 上安装、签发、续期演练均通过；E3 不通的根因定位为 PVE 转发放行（修复脚本待用户在 PVE 执行） | [F7 design/03 §6](features/F7-dts-infra-K8s交付底座/design/03-S2研发构建与制品流实施计划.md) |
| 10-06 | F7 S2-W4（不依赖 E3 的部分）：dtsctl 部署前离线验签；本地验证集群 dts-local 与 E3 镜像路径一致，端到端通过；修复 dts-pg 在没有消费方时的缺陷（0.1.1） | [F7 design/03 §6](features/F7-dts-infra-K8s交付底座/design/03-S2研发构建与制品流实施计划.md) |
| 10-06 | F7 S2-W3 构建链：签名、扫描、多架构，本地端到端验证通过；Trivy 拦下 2 个依赖的 3 个 HIGH 并已升级修复 | [F7 design/03 §6](features/F7-dts-infra-K8s交付底座/design/03-S2研发构建与制品流实施计划.md) |
| 10-06 | F7 S2 研发构建与制品流：现状评审与实施计划（W0–W6、待决 D-S2-1～3、用户事项 U1～U4）；W0 本机基线完成 | [F7 design/03](features/F7-dts-infra-K8s交付底座/design/03-S2研发构建与制品流实施计划.md) |
| 10-05 | dts-wiki 开发会话工作指导：WP1–WP9、硬规则、状态回写方式、用户事项 G0/G2–G5 | [工作指导](assets/handoff-20261005-dts-wiki-dev-session.md) |
| 10-05 | T20 M8c：按方案 A 建立 8 张 Feature 卡片和 118 张 Task 卡片（状态取自归档快照，待复核） | [dry-run 报告](assets/frontmatter-dry-run-20261005.md) |
| 10-05 | T20 M8a：dts-common 1.1.0 加入 `wiki-content` v1 契约与 `content-lint`；归档已封存；新增 CI 与边界规则 | 同上 |

## 与归档的状态差异

| 项 | 归档中的记载 | 当前 |
|---|---|---|
| 分支 | 各仓库在 feature 分支上 | 2026-10-04 起全部只有 `main`，并已推送（[分支合并记录](../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/assets/branch-consolidation-20261004.md)） |
| 10-02 的本地整理 | 尚未提交 | 已随 `89379d0` 等提交入库 |
| dts-stack 推送 | 多租户设计完成前不推送 | 合并提交 `06e28c654` 已推送到 origin/main；用户 2026-10-05 确认为有意推送，F0 设计 §7 的“不推送”约束解除 |
| S4 研发文档位置 | D17：迁入 dts-wiki `content/` | D18–D23：迁入 dts-worklog；S4a 的 Task 6 作废 |
