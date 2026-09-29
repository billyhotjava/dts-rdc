# T31: 离线 license

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P2 · **状态**: DRAFT · **工作包**: P7 · **估算**: 8–12 人天 · **依赖**: T14

## 目标
离线签名 license 文件的签发工具（总部）与现场校验（dtsctl/operator/控制台显示），可绑定硬件指纹。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §4.4（本 Task 不重复设计内容）。
- **输入**: 总部签名密钥（与镜像签名密钥分离）
- **输出契约**: license 格式（客户、SKU、到期、功能开关、指纹、签名）；`dtsctl license show|import`；过期策略（仅告警还是限制功能，需用户确定）
- **错误路径**: license 缺失/过期不影响已运行业务的数据访问（铁律 1），只限制升级或新功能

## 影响范围
dts-infra `pkg/license`

## 验证（RED→GREEN）
- [ ] 篡改 license 校验失败
- [ ] 过期策略按确定方案生效

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
