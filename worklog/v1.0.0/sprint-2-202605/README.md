# Sprint-2: dts-infra commander

**时间**: 2026-05
**状态**: READY
**目标**: 实现 commander 核心运维能力 — 中间件管理、Platform 组件部署、健康巡检、Infra Agent 基础

## 背景
Sprint-1 完成 bootstrap 后 commander 已运行。Sprint-2 赋予 commander 实际管理能力，
使其能部署中间件（Kafka/ClickHouse/Neo4j/MinIO/Keycloak）和管理 Platform 组件。

## Feature 列表

| ID | Feature | Task 数 | 状态 |
|----|---------|---------|------|
| F1 | 中间件生命周期管理 | TBD | READY |
| F2 | Platform 组件管理 | TBD | READY |
| F3 | 健康巡检与告警 | TBD | READY |
| F4 | Infra Agent 基础能力 | TBD | READY |
| F5 | Commander CLI 客户端 | TBD | READY |

## 完成标准
- [ ] `dts component deploy keycloak` 部署 Keycloak 并连接 global-pg
- [ ] `dts component deploy dts-gateway` 部署 gateway 服务
- [ ] `dts component health` 返回三级健康状态
- [ ] `dts agent diagnose <component>` 基础 AI 诊断可用
- [ ] 全流程在 kind 集群验证通过
