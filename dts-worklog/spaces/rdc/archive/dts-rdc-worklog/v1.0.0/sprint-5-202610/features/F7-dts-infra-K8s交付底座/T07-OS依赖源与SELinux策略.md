# T07: 国产 OS 依赖本地源与 SELinux 策略

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P1 · **估算**: 15–25 人天 · **依赖**: T05、T04（SELinux spike 结论）

## 目标
为 el8、el9、openEuler、麒麟 V10、统信 UOS 各产出 OS 依赖本地源与可用的 SELinux 策略 RPM，纳入 base 离线包。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §4.2 base 层、§6.2（本 Task 不重复设计内容）。
- **输入**: T04 SELinux spike；T05 rke2-selinux 构建
- **输出契约**: 每个 OS 家族：`repo/<os>/<arch>/`（container-selinux、rke2-selinux、iptables 等及依赖闭包）、repo 元数据、签名；兼容说明
- **错误路径**: 依赖闭包缺失时离线安装在预检阶段报错并指明包名

## 影响范围
dts-infra `distro/os/`

## 验证（RED→GREEN）
- [ ] 每个可获得的 OS（至少 openEuler、RHEL8/9）在断网 VM 用本地源装齐依赖并以 enforcing 启动 RKE2
- [ ] 麒麟/统信无授权时标注“待实机”，不标 PASS

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
