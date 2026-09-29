# T18: Kafka、SeaweedFS、Valkey、OpenSearch

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P3 · **估算**: 16–26 人天 · **依赖**: T02、T03

## 目标
交付 Strimzi（含 `dts.audit.v1` topic）、SeaweedFS、Valkey、OpenSearch 的 chart 与契约，Box/集群规格。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §2（本 Task 不重复设计内容）。
- **输入**: 账本#37 镜像版本（Kafka 4.3.1、Valkey 9.1.2）
- **输出契约**: chart `dts-kafka`（provides: kafka）、`dts-s3`（s3）、`dts-valkey`（redis）、`dts-opensearch`（opensearch）；KafkaTopic `dts.audit.v1`（分区/保留按 F0/T18）
- **错误路径**: 契约探测失败即 Verifying 失败

## 影响范围
dts-infra `charts/`

## 验证（RED→GREEN）
- [ ] 四个契约探测在 Box 与集群规格均通过
- [ ] OpenMetadata 连接 OpenSearch 冒烟（与 T24 协同）

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
