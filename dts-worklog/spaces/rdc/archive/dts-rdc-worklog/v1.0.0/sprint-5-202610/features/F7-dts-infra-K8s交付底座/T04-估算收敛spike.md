# T04: 估算收敛 spike：stack 离线化、昇腾推理、国产 OS SELinux

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: READY · **工作包**: P0 · **估算**: 另计 6–10 人天 · **依赖**: T03（环境）

## 目标
对估算不确定性最大的三项各做一次限时 spike，输出修正后的人天与风险，更新设计 §8。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §8 末段（本 Task 不重复设计内容）。
- **输入**: stack compose（账本#24）与镜像清单（账本#37）；ollama/推理现状（账本#21）；openEuler 免费镜像
- **输出契约**: `assets/infra-spike-estimates.md`：① stack 22 服务逐个的 restricted/离线/配置外置难度分级（S/M/L）② 昇腾设备插件 + 推理服务在 K8s 的可行路径与缺口 ③ openEuler 上 rke2-selinux 安装结果与麒麟/统信差异推断；设计 §8 对应行更新
- **错误路径**: spike 限时（每项 ≤ 3 人天），超时即记录已知与未知，不继续深挖

## 影响范围
`assets/infra-spike-estimates.md`、设计 §8

## 验证（RED→GREEN）
- [ ] 三项各有结论、证据（命令输出/截图）与修正后的人天
- [ ] 设计 §8 已更新并注明来源

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据
