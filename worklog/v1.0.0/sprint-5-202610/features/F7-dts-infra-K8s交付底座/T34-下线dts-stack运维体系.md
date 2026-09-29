# T34: 下线 dts-stack 运维体系与现网迁移

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P9 · **估算**: 3–5 人天 · **依赖**: T33

## 目标
K8s 路径验收后删除 stack 的 `init.sh`、compose 编排、opmanager、imgversion，并确定现网 `.50` Compose 服务（wiki/sso）迁移时点。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §0 D1、§10 O7（本 Task 不重复设计内容）。
- **输入**: 账本#37；`deploy/{wiki,sso}`（账本 W1、reference_infra_topology）
- **输出契约**: stack 仓库删除提交（经用户确认）；各模块文档指向 dtsctl；O7 迁移计划
- **错误路径**: 删除前确认无客户现场仍依赖旧体系；保留一个历史 tag

## 影响范围
stack 仓库、dts-rdc `deploy/`

## 验证（RED→GREEN）
- [ ] stack 仓库无旧运维入口，文档更新
- [ ] O7 有结论

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
