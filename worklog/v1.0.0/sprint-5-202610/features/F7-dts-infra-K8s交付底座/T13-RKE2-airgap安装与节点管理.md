# T13: RKE2 airgap 安装、节点加入与升级

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P2 · **估算**: 12–18 人天 · **依赖**: T05、T12

## 目标
`dtsctl install --distro rke2` 完成单节点与三节点 airgap 安装、节点加入与逐 minor 升级，关闭 ingress-nginx，开启 secrets-encryption 与 embedded registry。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §1、§4.1、§4.3（本 Task 不重复设计内容）。
- **输入**: T05 制品；T07 本地源；T12 预检
- **输出契约**: `pkg/distro/rke2`（config.yaml 生成：`disable: rke2-ingress-nginx`、`secrets-encryption: true`、`embedded-registry: true`、OIDC 参数；`registries.yaml` 镜像重写）；节点 join token 管理；升级计划（逐 minor）
- **错误路径**: 节点加入失败可重试且不破坏已有节点；跨多个 minor 升级被拒绝

## 影响范围
dts-infra `pkg/distro/rke2`

## 验证（RED→GREEN）
- [ ] 断网 VM：单节点、三节点安装成功
- [ ] 从 N-1 minor 升级到 N，工作负载保持运行

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
