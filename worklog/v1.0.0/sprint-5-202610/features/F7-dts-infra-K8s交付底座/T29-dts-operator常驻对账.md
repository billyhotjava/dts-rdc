# T29: dts-operator 常驻对账

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P7 · **估算**: 15–25 人天 · **依赖**: T10、T15

## 目标
`dts-operator` 监听 `DtsRelease.spec`，复用 `pkg/orchestrator` 持续对账；`dtsctl upgrade` 改为导入包 + 改 spec。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §3.8（本 Task 不重复设计内容）。
- **输入**: T10 编排库；T15 审计
- **输出契约**: `cmd/dts-operator`；RBAC（仅 dts 相关 namespace 与 CRD）；leader election；与 CLI 的 Lease 协调
- **错误路径**: operator 停止不影响运行中的工作负载；漂移（手工改 helm release）→ 事件告警，按策略纠正或仅告警

## 影响范围
dts-infra `cmd/dts-operator`

## 验证（RED→GREEN）
- [ ] 修改 spec 后自动完成升级
- [ ] 手工漂移被检测并记录事件

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
