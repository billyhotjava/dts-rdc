# T08: prs-stack/pack 目录与 manifest 骨架

**原编号**: Sprint-5 F5/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T01（schema）、F0/T06（prs-stack 已建库）

## 目标
在 prs-stack 中建立符合 v1 schema 的 Pack 目录骨架与 manifest，并能被 `pack-cli validate` 校验通过（此时资产为空）。

## 技术设计
- **步骤**：
  1. 按 BL-A README 中的目录契约创建目录，每个目录放一个 `README.md`，说明资产格式、对应的 schema 文件、维护人；
  2. `pack-manifest.yaml`：`name: prs-flower`，`version: 0.1.0`，`requires.dts-studio: ">=1.1.0"`，`datasources: [prs-mart, prs-app]`，capabilities 暂时为空数组；
  3. `pack/Makefile` 或 `pack/build.sh`：调用 `pack-cli`（通过 Maven 坐标或下载的 jar，版本固定），提供 `validate`、`build` 两个目标；
  4. `prs-stack/CLAUDE.md` 补充"修改 pack 资产后必须执行 `make -C pack validate`"；
  5. `assets/dbt-reference/`：接收 F1/T05 迁来的 dbt 模型包和 ODS DDL（只作参考，不属于 capabilities）。

## 验证
- [ ] `make -C pack validate` 返回 0

## Definition of Done
- [ ] 骨架已提交到 prs-stack

## 2026-09-26 承接约束

PRS-G07：现有 `pack/` 是 3 月 JSON/RPC/前端联邦原型，禁止原地覆盖。先在 `pack-next/` 暂存新 schema 目录，本 Task 的 validate/build 命令使用该目录；T13 对照能力迁移表并验证后，保留旧制品到 `pack-legacy/`，再切换新包到最终 `pack/`。这里的最终路径与 BL-A README 一致，暂存阶段尚未完成迁移。
