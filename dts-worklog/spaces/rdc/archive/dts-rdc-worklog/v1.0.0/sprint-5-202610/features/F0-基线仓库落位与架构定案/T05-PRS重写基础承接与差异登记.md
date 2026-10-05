# T05: PRS 重写基础承接与差异登记

**原编号**: Sprint-5 F0/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DONE
**依赖**: 无（用户已指定来源与目标；不依赖 Stack 权威仓库选择）
**完成日期**: 2026-09-26

## 目标与范围
将 `/opt/prod/prs/source/dts-prs` 中已做的底座原型、BOM/镜像清单、迁移与执行记录接收到 dts-app-stack/prs-stack，并形成 Sprint-5 可追溯输入。
资料接收可以独立完成；不包含远端提交交付、新 BOM 构建/运行验收和业务迁移。

## 已完成成果
- [x] 保留 prs-stack `fc3d0e7` 的旧原型；新增原样来源文件 93 个，278598 字节，逐文件 SHA256 清单；排除编译输出及真实 .env 等 68 个本机文件。
- [x] 建立 5 个后端模块与 21 个历史页面的能力映射，说明 mock、入口和两代 Pack 的差异。
- [x] 登记 9 月 BOM/公共镜像快照与实际运行待验边界，保留旧 BOM 测试状态。
- [x] PRS-G01～G07 差异落实到 F0/BL-A/BL-S；同步 Sprint 依赖、波次、状态和回归标准。

## 证据
- [资料接收与差异表](../../../../../../../prs/archive/prs-stack-worklog/v1.0.0/integration-20260926/README.md)
- [来源哈希清单](../../../../../../../prs/archive/prs-stack-worklog/v1.0.0/integration-20260926/source-manifest.json)
- [静态导入验证](../../../../../../../prs/archive/prs-stack-worklog/v1.0.0/integration-20260926/import-validation.md)
- [整体规划复核](../../assets/planning-reconciliation-20260926.md)

## 验收边界
T06、T03 和身份/数据安全 Task 保持未完成；本 Task DONE 不提升任何运行 Gate，也不表示三层 gitlink 已发布。
