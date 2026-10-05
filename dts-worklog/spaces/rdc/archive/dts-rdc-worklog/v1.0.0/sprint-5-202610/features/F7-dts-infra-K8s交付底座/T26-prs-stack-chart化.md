# T26: prs-stack chart 化

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P5 · **估算**: 10–15 人天 · **依赖**: T02、T17–T20

## 目标
prs 5 个服务基于既有 Helm 骨架完成共性十项改造，RLS 所需 PG 角色经契约生成。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §7（本 Task 不重复设计内容）。
- **输入**: 账本#27（prs 骨架与 `sources/deploy/helm/prs-service`）、#34（RLS/租户）
- **输出契约**: `charts/prs-stack`；Valkey 契约消费；RLS 角色生成说明
- **错误路径**: 租户上下文缺失时 fail-closed（沿用 R-010）

## 影响范围
prs-stack 仓库

## 验证（RED→GREEN）
- [ ] chart-check 通过；断网 VM 上 prs 服务就绪
- [ ] RLS 用例（两租户隔离）通过

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
