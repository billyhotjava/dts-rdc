# T06: PRS 重写基础纳入 prs-stack 版本控制

**原编号**: Sprint-5 F1/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: READY
**依赖**: T05（本地资料接收已完成）

## 目标
在 prs-stack 的既有历史上纳入重写底座，保留原型与来源证据，形成可复现的仓库提交。

## 当前进展与技术设计
- 已 checkout 登记提交 `fc3d0e7`；其中已有 `backend/`、`frontend/`、`pack/`，不是空仓库。已在工作副本增量导入 `sources/`、`worklog/` 共 93 个源文件，来源清单见 T05。
- 原始 `/opt/prod/prs/source/dts-prs` 保持不变，不在原目录 `git init`；新旧原型并存的目的、构建入口和能力映射见 prs-stack README 与 integration-20260926。
- 后续沿既有历史提交；不得覆盖已有原型、重建历史或 force push。发现同路径冲突先作逐文件差异表，不使用覆盖式同步。
- 提交前按 `source-manifest.json` 核验来源；确认 `.env`、target、node_modules、密钥不在提交集内。测试 realm 的测试凭据仅用于隔离验收环境。
- PRS 子仓库提交后，按既有发布授权流程使提交可拉取，再由 T07 依次更新 app-stack、RDC gitlink。当前本地未提交内容不能作为 gitlink 的交付成果。
- `MOVED.md`、旧路径冻结和开发目录切换由 T11 统一完成，本次资料接收不改变写入权威源。

## 验证
- [ ] `git ls-files` 无 target/node_modules/真实 .env/密钥，保留 `.env.example`
- [ ] 原 `backend/`、`frontend/`、`pack/` 内容未被导入覆盖；93 文件来源哈希可复核
- [ ] 全新 checkout 在 JDK 25 下执行 `cd sources && mvn -B -q package` 成功；新 BOM 登录、RLS 验收见 T03

## Definition of Done
- [ ] 提交可从远端拉取，构建证据写入 `it/IT-01-repo-layout.md`
- [ ] 资料导入与正式仓库交付分别登记；本 Task 不因 T05 DONE 自动完成
