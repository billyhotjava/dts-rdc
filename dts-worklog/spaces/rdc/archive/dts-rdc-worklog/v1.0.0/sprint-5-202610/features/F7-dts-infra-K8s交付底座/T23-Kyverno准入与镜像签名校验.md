# T23: Kyverno 准入与镜像签名校验

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P4 · **估算**: 8–12 人天 · **依赖**: T14

## 目标
交付 Kyverno 与策略：DTS namespace 仅允许 DTS 签名镜像、强制 restricted、必需标签与资源限制。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §5.4、§5.5（本 Task 不重复设计内容）。
- **输入**: cosign 离线公钥（T14）
- **输出契约**: `policies/*.yaml`；chart `dts-policy`；策略豁免清单（系统组件）
- **错误路径**: 未签名镜像被拒并给出策略名；策略引擎故障时 fail-closed（DTS namespace）

## 影响范围
dts-infra `policies/`

## 验证（RED→GREEN）
- [ ] 未签名/篡改镜像部署被拒
- [ ] privileged Pod 在 DTS namespace 被拒

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
