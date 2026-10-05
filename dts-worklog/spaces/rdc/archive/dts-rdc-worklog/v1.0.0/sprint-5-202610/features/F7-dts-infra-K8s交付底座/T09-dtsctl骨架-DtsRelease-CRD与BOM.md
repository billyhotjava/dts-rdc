# T09: dtsctl 骨架、DtsRelease CRD 与 BOM

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: IN_PROGRESS（W1–W3 代码完成，本地 `make lint test cross` 全绿，分支已推送；待合入 main 并在自托管 runner 上跑 CI，证据 `../../it/infra/W1-W4-dtsctl.md`） · **工作包**: P2 · **估算**: 8–12 人天 · **依赖**: T01（可并行：00 §0 决策已经用户确认）、T02

## 目标
建立 dts-infra Go 工程与 `dtsctl` 命令框架，实现 `DtsRelease` CRD（§3.4）与 BOM 解析/校验/diff（§3.2）。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §3.1、§3.2、§3.4；编码细则 [`design/01`](design/01-dtsctl编码设计与首批工作包.md) §1–§6、§8 W1–W3（本 Task 不重复设计内容）。
- **输入**: 设计 §3.2 BOM 示例、§3.4 CRD 字段
- **输出契约**: Go module `yuzhi.com/dts/infra`；`api/v1alpha1`（`DtsRelease`，group `infra.dts.yuzhicloud.com`）与生成的 CRD YAML；`pkg/bom`（解析、JSON Schema 校验、依赖图构建、diff）；`dtsctl version|status` 可用
- **错误路径**: BOM 缺 digest、循环依赖、未满足的 requires → 校验失败并指出组件名

## 影响范围
dts-infra `cmd/`、`api/`、`pkg/bom`

## 验证（RED→GREEN）
- [ ] BOM 校验单测覆盖：缺 digest、循环依赖、未满足 requires、external 替代
- [ ] envtest 下 CRD 可创建/更新 status

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据
