# Sprint-3: dts-stack 第一版原型

> 2026-09-26 复核：本目录及其 Feature/Task 状态均为 3 月规划快照，不是可执行 READY。以后续 [Sprint-5](../sprint-5-202610/README.md) 及其 [承接映射](../sprint-5-202610/assets/planning-reconciliation-20260926.md) 为准；未承接项留待后续重排。

**时间**: 2026-06
**状态**: SUPERSEDED（历史规划，未执行，退出活动队列）
**目标**: 通过 commander 部署 dts-stack 核心服务原型，验证 Java+Python 服务可通过 commander 管理

## 背景
Sprint-2 完成后 commander 具备组件管理能力。Sprint-3 聚焦 dts-stack 核心服务，
从 draft 中的旧 sprint 计划吸收内容，按新架构实现并通过 commander 部署。

## Feature 列表

| ID | Feature | Task 数 | 状态 |
|----|---------|---------|------|
| F1 | Java 基座服务（gateway + platform） | TBD | 历史 READY（停用） |
| F2 | 数据层服务（ontology-store + query-service） | TBD | 历史 READY（停用） |
| F3 | Python AI 服务原型（intent-engine + agent） | TBD | 历史 READY（停用） |
| F4 | 端到端集成验证 | TBD | 历史 READY（停用） |

## 完成标准
- [ ] `dts component deploy dts-stack` 通过 commander 部署核心服务
- [ ] gateway → platform → ontology-store 链路可用
- [ ] 至少一个 Python AI 服务启动并通过 gRPC 调用
- [ ] 全流程通过 commander 管理（部署/健康/日志）
