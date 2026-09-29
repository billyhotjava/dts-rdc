# T02: chart 规范与连接契约规范（chart-spec / contract-spec）

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: READY · **工作包**: P0 · **估算**: 4–6 人天 · **依赖**: T01

## 目标
在 dts-infra 仓库发布 `docs/chart-spec.md` 与 `docs/contract-spec.md`，并提供可复用的 chart 规范检查 CI 步骤，各模块据此写 chart。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §2 硬约束、§3.3、§6.3、§7 共性十项、§10 O1（本 Task 不重复设计内容）。
- **输入**: 设计 §3.3 契约键表；§7 共性十项；§6.3 检查项
- **输出契约**: `dts-infra/docs/chart-spec.md`（restricted、StorageClass 变量、digest 引用、禁 Bitnami、ServiceMonitor/探针、IngressRoute 约定、values 分层与 profile 覆盖约定、AI 开关 `ai.enabled`）；`docs/contract-spec.md`（capability → 键、Secret 命名 `dts-<consumer>-<capability>`、标签、轮换语义）；CI 步骤 `ci/chart-check`（helm lint + Kyverno CLI + 自定义检查）；O1 base image 策略结论
- **错误路径**: 检查失败输出规则 id 与修复建议；规范变更需版本号（`chart-spec v1`），各模块声明所遵守版本

## 影响范围
dts-infra `docs/`、`ci/`、`policies/`

## 验证（RED→GREEN）
- [ ] 用一个故意违规的样例 chart 跑 `ci/chart-check`，每条规则都能报错（RED）
- [ ] 用 prs-service 骨架改造后的样例通过（GREEN）
- [ ] O1 结论写入 chart-spec

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据
