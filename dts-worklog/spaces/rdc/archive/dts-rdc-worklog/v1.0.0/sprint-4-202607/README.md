# Sprint-4: app-stack 第一版原型

> 2026-09-26 复核：本目录及其 Feature/Task 状态均为 3 月规划快照，不是可执行 READY。以后续 [Sprint-5](../sprint-5-202610/README.md) 及其 [承接映射](../sprint-5-202610/assets/planning-reconciliation-20260926.md) 为准；未承接项留待后续重排。

**时间**: 2026-07
**状态**: SUPERSEDED（历史规划，未执行，退出活动队列）
**目标**: 实现 AppPack 全生命周期 — 导入、审核、部署、运行，验证合作商 Pack 交付流程

## 背景
Sprint-3 完成后 dts-stack 核心服务可用。Sprint-4 验证 AppPack 生态：
自研 Pack（metro-stack）和模拟第三方 Pack 的完整导入部署流程。

## Feature 列表

| ID | Feature | Task 数 | 状态 |
|----|---------|---------|------|
| F1 | Pack 导入与审核流程 | TBD | 历史 READY（停用） |
| F2 | Pack 部署与运行 | TBD | 历史 READY（停用） |
| F3 | 第三方 Pack 信任链验证 | TBD | 历史 READY（停用） |

## 完成标准
- [ ] `dts pack import metro-pack.tar.gz` 快速导入成功
- [ ] 异步扫描完成后状态变为 ready
- [ ] `dts pack deploy metro-stack` 部署到 dts-packs namespace
- [ ] 模拟第三方 Pack 走完签名验证 + 沙箱 + 审批全流程
