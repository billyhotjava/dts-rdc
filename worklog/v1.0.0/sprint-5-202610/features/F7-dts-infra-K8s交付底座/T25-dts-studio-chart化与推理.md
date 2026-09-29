# T25: dts-studio chart 化、推理服务与模型包

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P5 · **估算**: 20–30 人天 · **依赖**: T02、T04、T17–T20

## 目标
studio（ai/analytics/webapp）完成共性十项改造；推理服务支持 NVIDIA 与昇腾设备插件；模型权重进入 model 离线包。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §7、§4.2 model 层、§4.5（本 Task 不重复设计内容）。
- **输入**: 账本#10/#21（copilot 模块与 compose）；F1（copilot 并入 studio）
- **输出契约**: `charts/dts-studio`；推理服务 chart 与 GPU profile；model 包清单；联网排查报告
- **错误路径**: `ai.enabled=false` 时其余功能可用（铁律 1）

## 影响范围
studio 仓库

## 验证（RED→GREEN）
- [ ] 断网 VM 上问数主竖线可用（CPU 推理或外部模型端点）
- [ ] `ai.enabled=false` 回归通过

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
