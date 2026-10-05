# T11: 连接契约与 profile（rke2-box / rke2-cluster / ack）

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P2 · **估算**: 15–23 人天 · **依赖**: T02、T09

## 目标
实现 `pkg/contract`（生成最小权限凭据、绑定外部服务、契约探测）与 `pkg/profile`（values 覆盖、预检集、external 声明、规格）。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §2 部署粒度、§3.3、§3.5 Verifying（本 Task 不重复设计内容）。
- **输入**: T02 `contract-spec.md`
- **输出契约**: 契约 Secret `dts-<consumer>-<capability>`；探测器：pg/kafka/oidc/s3/redis/opensearch；profile 文件 `profiles/{rke2-box,rke2-cluster,ack}.yaml`（schema 含 `external`、`storageClass`、`ingress`、`imageRegistry`、`sizing`）
- **错误路径**: 外部服务不可达 → Verifying 失败并给出契约名与探测错误；凭据绝不写日志（`[REDACTED]`）

## 影响范围
dts-infra `pkg/contract`、`pkg/profile`、`profiles/`

## 验证（RED→GREEN）
- [ ] 同一 BOM 分别以自建 PG 与外部 PG（模拟 RDS）安装，下游组件无差异运行
- [ ] 日志与 status 中不出现密码（扫描断言）

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
