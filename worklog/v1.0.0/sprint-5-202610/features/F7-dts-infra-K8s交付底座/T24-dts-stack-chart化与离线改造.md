# T24: dts-stack chart 化与离线改造

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P0 · **状态**: DRAFT · **工作包**: P5 · **估算**: 60–90 人天 · **依赖**: T02、T04、T17–T20

## 目标
stack 约 22 个服务按 chart-spec 完成共性十项改造，Airflow/OpenMetadata/dbt/ingestion 离线可用，OpenMetadata 切 OpenSearch。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §7、§4.5、§10 O5/O6（本 Task 不重复设计内容）。
- **输入**: 账本#23/#24（模块与 compose 服务）、#37（镜像）；T04 难度分级
- **输出契约**: stack 仓库 `charts/dts-stack`（或按服务子 chart）；各服务契约消费清单；运行时联网排查报告 `it/infra/offline-stack.md`；O5/O6 结论
- **错误路径**: 任何运行时外连在断网 VM 暴露即为缺陷

## 影响范围
stack 仓库（代码在其仓库，本 Task 为指令与验收）

## 验证（RED→GREEN）
- [ ] chart-check 通过
- [ ] 断网 VM 上 stack 全部服务就绪，治理指标查询冒烟通过

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
