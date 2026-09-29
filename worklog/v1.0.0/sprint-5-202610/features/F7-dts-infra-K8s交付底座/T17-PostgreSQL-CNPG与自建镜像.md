# T17: PostgreSQL：CNPG 与自建 operand 镜像

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P3 · **估算**: 8–12 人天 · **依赖**: T02、T03

## 目标
交付 CNPG operator chart、PG 18 + pgvector + pg_bigm 多架构镜像与 `dts-pg` chart（provides: pg），支持 Box/集群两种规格与备份到 S3。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §2 PostgreSQL、§5.2、§10 O3（本 Task 不重复设计内容）。
- **输入**: 账本#37（pgvector 0.8.6-pg18、wiki `dts-wiki-db:18-bigm`）
- **输出契约**: 镜像 `dts-images/postgres:18-vector-bigm`；chart `dts-pg`（Cluster、每消费者 database/role 由契约生成）；barman 备份配置；O3 结论
- **错误路径**: 扩展缺失 → 契约探测失败（`CREATE EXTENSION` 检查）

## 影响范围
dts-infra `charts/dts-pg`、镜像构建

## 验证（RED→GREEN）
- [ ] copilot 与 wiki 所需扩展在镜像中可创建
- [ ] 主备切换与 PITR 演练各一次

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
