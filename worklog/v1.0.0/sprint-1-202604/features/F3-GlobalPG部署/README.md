# F3: GlobalPG 部署

**优先级**: P0
**状态**: READY

## 目标
实现 bootstrap 部署全局配置 PostgreSQL 的能力，作为整个 DTS 平台的配置库

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | GlobalPG Helm Chart | P0 | READY | F1/T01 |
| T02 | PG 部署与等待就绪 | P0 | READY | T01, F2/T01 |

## 完成标准
- [ ] Helm chart 可部署 PG 16 StatefulSet 到 dts-system namespace
- [ ] bootstrap 自动等待 PG ready 后继续
- [ ] PG 包含 infra schema 初始 DDL
- [ ] 在 kind 集群验证通过
