# T19: Keycloak Operator 与 realm 代码化

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P3 · **估算**: 10–15 人天 · **依赖**: T17

## 目标
交付 Keycloak（Operator，DB 在 CNPG）与 keycloak-config-cli 声明的 realm/client/role，提供 oidc 契约，并支持 RKE2 apiserver OIDC。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §2 身份、§7 跨模块（本 Task 不重复设计内容）。
- **输入**: 账本#27（realm `flower-test`）、W4（realm `yuzhicloud` 客户端与角色）；ADR-008
- **输出契约**: chart `dts-keycloak`（provides: oidc）；`realms/`（内部 realm 与客户 realm 模板分开）；各模块 client 声明片段约定；`dts-ops` 角色
- **错误路径**: config-cli 幂等：重复执行无差异；realm 冲突 → 失败并输出差异

## 影响范围
dts-infra `charts/dts-keycloak`、`realms/`

## 验证（RED→GREEN）
- [ ] 全新安装后各模块 client 存在且可完成 OIDC 登录
- [ ] 重复 apply 无变更

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
