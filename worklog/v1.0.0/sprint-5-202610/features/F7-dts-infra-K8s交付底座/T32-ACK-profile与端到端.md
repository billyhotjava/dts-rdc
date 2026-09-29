# T32: ACK profile 与端到端验收

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P8 · **估算**: 15–25 人天 · **依赖**: T11、T12、T24–T27

## 目标
`dtsctl deploy --profile ack` 在 ACK 上完成部署：SLB、云盘 CSI、ACR、SLS，并以 RDS/OSS/云 Kafka 验证外部契约。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §1.2 铁律 2 云上定义、§2 云映射、§4.1（本 Task 不重复设计内容）。
- **输入**: T03 ACK 环境；T11 profile 机制
- **输出契约**: `profiles/ack.yaml`；云上交付检查单（IAM→RBAC、云控制台旁路说明）；`it/infra/ack-e2e.md`
- **错误路径**: 云服务配额/权限不足 → 预检报错并指明资源

## 影响范围
dts-infra `profiles/`、`it/infra/`

## 验证（RED→GREEN）
- [ ] ACK 上主竖线跑通（自建中间件与托管中间件各一次）
- [ ] 预检报告存档

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
