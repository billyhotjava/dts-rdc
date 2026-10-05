# T27: dts-wiki chart 化与附件迁移 S3

**原编号**: 新增（2026-09-29，F7 dts-infra K8s 交付底座）

**优先级**: P1 · **状态**: DRAFT · **工作包**: P5 · **估算**: 6–10 人天 · **依赖**: T02、T17、T18、T20

## 目标
wiki 单 jar 完成共性十项改造，使用 pg_bigm PG 镜像，附件改 S3，git deploy key 为 Secret。

## 技术设计 (Contract-first)
- **设计依据**: [`design/00`](design/00-dts-infra-K8s交付底座设计.md) §7（本 Task 不重复设计内容）。
- **输入**: W-ADR-8/9；账本 W8/W9
- **输出契约**: `charts/dts-wiki`；附件存储 S3 适配（W-ADR-9 的 S3 抽象）；deploy key Secret 约定
- **错误路径**: S3 不可用时编辑保存失败并提示，不丢数据

## 影响范围
dts-wiki 仓库

## 验证（RED→GREEN）
- [ ] 断网 VM 上 wiki 登录、编辑、检索、附件上传通过
- [ ] git 同步在有出网的环境通过

## Definition of Done
- [ ] 架构：输出契约有测试或可复查证据
- [ ] 切片：在断网 VM 或 ACK 的运行实例上验证（适用时），证据入 `../../it/infra/`
- [ ] 无占位证据

DRAFT 原因：依赖 Task 的输出契约尚未产出；依赖就绪后按设计文档补齐字段级契约再转 READY。
