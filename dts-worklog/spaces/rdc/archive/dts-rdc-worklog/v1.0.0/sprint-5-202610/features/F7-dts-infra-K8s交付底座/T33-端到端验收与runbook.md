# T33: 端到端验收、演练与 runbook

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P9 · **估算**: 20–30 人天 · **依赖**: T13–T32

## 目标
在断网 RKE2（单节点与三节点）与 ACK 上完成全新安装、主竖线、增量升级、回滚、灾备演练，产出 runbook 与验收证据。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §4.3、§5.2、§9（本 Task 不重复设计内容）。
- **输入**: Sprint README 主竖线（alice 问“在营项目数”）；BL-E/T01 验收口径
- **输出契约**: `it/infra/IT-infra-e2e.md`；`assets/infra-runbook.md`；非功能预算实测值回填 F0/T18
- **错误路径**: 任一场景失败即建修复 Task，不以“已知问题”放行

## 影响范围
`it/infra/`、`assets/`

## 验证（RED→GREEN）
- [ ] 设计 §9 各项预算有实测值
- [ ] 主竖线在 K8s 上通过且审计链完整

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
