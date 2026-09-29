# T30: AppPack CRD 与生命周期（对接 PackRegistry）

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P7 · **估算**: 20–30 人天 · **依赖**: T23、T29、BL-A/T01（PackRegistry 契约）

## 目标
`AppPack` CRD 完成导入、验签、准入、按 namespace 隔离安装与向 studio PackRegistry 注册资产。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §5.4（本 Task 不重复设计内容）。
- **输入**: ADR-012；BL-A 契约（`studio_pack*` 表、PackRegistry API）
- **输出契约**: CRD `AppPack`（spec: source、version、trustLevel；status: phase、installedRevision、registryRef）；namespace `dts-pack-<name>` 模板（NetworkPolicy、ResourceQuota）
- **错误路径**: 验签失败/策略拒绝 → phase=Rejected 且写审计；注册失败 → 工作负载保留、phase=Degraded

## 影响范围
dts-infra `api/`、`pkg/`

## 验证（RED→GREEN）
- [ ] prs 作为 AppPack 安装并在 PackRegistry 可见
- [ ] 越权 Pack（privileged、跨 namespace 读 Secret）被拒

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
