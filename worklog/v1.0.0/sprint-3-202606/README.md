# Sprint-3: dts-stack 第一版原型

**时间**: 2026-06
**状态**: READY
**目标**: 通过 commander 部署 dts-stack 核心服务原型，验证 Java+Python 服务可通过 commander 管理

## 背景
Sprint-2 完成后 commander 具备组件管理能力。Sprint-3 聚焦 dts-stack 核心服务，
从 draft 中的旧 sprint 计划吸收内容，按新架构实现并通过 commander 部署。

## Feature 列表

| ID | Feature | Task 数 | 状态 |
|----|---------|---------|------|
| F1 | Java 基座服务（gateway + platform） | TBD | READY |
| F2 | 数据层服务（ontology-store + query-service） | TBD | READY |
| F3 | Python AI 服务原型（intent-engine + agent） | TBD | READY |
| F4 | 端到端集成验证 | TBD | READY |

## 完成标准
- [ ] `dts component deploy dts-stack` 通过 commander 部署核心服务
- [ ] gateway → platform → ontology-store 链路可用
- [ ] 至少一个 Python AI 服务启动并通过 gRPC 调用
- [ ] 全流程通过 commander 管理（部署/健康/日志）
