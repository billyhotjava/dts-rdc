# T01: ADR-014 dts-infra 定位与 K8s 交付底座定稿

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: READY · **工作包**: P0 · **估算**: 3–5 人天 · **依赖**: 无

## 目标
把设计 §0 的 D1–D16 定稿为 ADR-014（状态“已定”），同步修订与之冲突的入口文档与规则登记。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §0、§1.2、§10 O4（本 Task 不重复设计内容）。
- **输入**: 设计文档 §0 决策表；用户 2026-09-28～29 确认记录；3 月设计 `docs/plans/2026-03-26-dts-infra-design.md`
- **输出契约**: Sprint README ADR 表 ADR-014 行改“已定”；`CLAUDE.md` Architecture 段 dts-infra 描述与“当前采用 Compose 验证”修订草案（交用户确认后改）；`dts-studio/.rules/10-architecture/infra-iron-laws.rules` 按 §1.2 重写的条款登记到 BL-A/T20；O4 MinIO/Bitnami 分发状态复核记录 `assets/infra-license-review.md`
- **错误路径**: 若用户对某项决策改口：只改 ADR 与设计对应行并在变更记录注明，不另起文档

## 影响范围
Sprint README、`CLAUDE.md`（经确认）、BL-A/T20 登记、`assets/infra-license-review.md`

## 验证（RED→GREEN）
- [ ] ADR-014 行状态为“已定”，引用设计 §0
- [ ] 3 月设计头部“已取代”标注存在
- [ ] `infra-license-review.md` 列出每个 L2 组件与发行版组件的许可证、arm64 镜像来源、复核日期

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据
