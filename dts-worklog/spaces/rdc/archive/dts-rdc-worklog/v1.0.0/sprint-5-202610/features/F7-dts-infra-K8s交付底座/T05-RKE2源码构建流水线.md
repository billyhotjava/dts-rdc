# T05: RKE2 与系统镜像源码构建流水线（多架构）

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P1 · **估算**: 20–30 人天 · **依赖**: T03

## 目标
在我们的 CI 中从锁定的上游提交重建 rke2、runtime 镜像、约 20 个系统镜像与 rke2-selinux，产出 x86/arm64 制品、SBOM 与签名，推送 Harbor。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §6.1、§6.3（本 Task 不重复设计内容）。
- **输入**: 上游 `rancher/rke2`、`rancher/image-build-*`、`rancher/rke2-selinux` 的锁定提交清单
- **输出契约**: `distro/upstream.lock`（仓库 → commit）；构建产物：rke2 二进制 tarball、`rke2-images.<arch>.tar.zst`、系统镜像（Harbor `dts-images/distro/*`）、SBOM、cosign 签名；版本号规则 `v1.34.x+dts.N`
- **错误路径**: 任一镜像构建失败则整次发布失败；禁止混用上游预构建镜像（CI 检查镜像来源）

## 影响范围
dts-infra `distro/`、CI 配置

## 验证（RED→GREEN）
- [ ] 与上游同版本的镜像清单逐一对照，无遗漏
- [ ] 用构建产物在 VM 上完成 RKE2 单节点 airgap 启动

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
