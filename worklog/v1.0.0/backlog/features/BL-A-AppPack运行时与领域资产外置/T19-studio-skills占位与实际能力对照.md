# T19: studio `.skills` 占位与实际能力对照

**原编号**: Sprint-5 F12/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P2
**状态**: DRAFT
**依赖**: T16

## 目标
`dts-studio/.skills/` 中 57 个占位技能（账本#29）与头脑实际具备的能力（T16 导出的 skills、NL2SQL、证明引擎、动作等）逐个对照，标注 `implemented | partial | planned | drop`，让技能清单反映真实状态。

## 技术设计
- 表格 `dts-studio/.skills/STATUS.md`：`category | skill | 对应实现（类或端点或 Pack 资产） | 状态 | 备注`；
- 行业技能（energy、research、manufacturing）目前都属于 planned；花卉相关能力归到 `30-industry` 下新增的 `flower-rental`（引用 prs-pack，而不是在 studio 中定义）。

## Definition of Done
- [ ] STATUS.md 已提交
