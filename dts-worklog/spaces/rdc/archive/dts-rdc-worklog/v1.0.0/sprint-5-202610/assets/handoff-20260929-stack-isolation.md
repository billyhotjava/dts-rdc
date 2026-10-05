# 实施指令：dts-stack 与 s10-stack 完全隔离（2026-09-29）

**执行方**：实施会话。本会话（规划）只出指令。
**依据**：`q1-dts-stack-authority-20260928.md` §5（用户 2026-09-29 决定）。
**与前序指令的关系**：修正 `handoff-20260928-q1-and-review-fixes.md` 第 2 步。
- 第 2.4 步中“s10 副本 10 个未提交文件登记”取消；
- 第 2.5 步整步取消（s10-stack 归档、22 个提交核对、remote 改写）；
- 其余步骤照常执行。

## 1. 文档修改

| # | 文件（相对 `worklog/v1.0.0/`） | 修改 |
|---|------|------|
| 1 | `sprint-5-202610/features/F0-基线仓库落位与架构定案/T01-确认各模块权威仓库与基准提交.md` | 第 13 行附近的权威源结论改为：dts-stack = GitHub `billyhotjava/dts-stack` `main`，隔离基线 `8568eb9`，开发副本 `/opt/prod/dts/dts-rdc/dts-stack`，构建目录 `/data/dts-rdc/dts-stack`，与 s10-stack 完全隔离（链接 Q1 文档 §5）；删除第 22 行“s10-stack main 的独有提交……核对是否吸收”一项 |
| 2 | `…/F0-基线仓库落位与架构定案/T11-工作副本迁移与旧路径过渡.md` | 第 10 行“stack 开发继续在 `/opt/prod/s10/v2.2.3`”改为“stack 开发在 `/opt/prod/dts/dts-rdc/dts-stack`”；第 19 行映射表中 `/opt/prod/prs/source/dts-stack` 的目标改为 `/opt/prod/dts/dts-rdc/dts-stack`（开发）/ `/data/dts-rdc/dts-stack`（构建）；新增一条约束：`/opt/prod/s10/v2.2.3`、`/data/dts-stack` 属 s10，DTS 任何脚本、compose、文档不得引用 |
| 3 | `sprint-5-202610/README.md` 账本 | 追加 #37：“09-29 用户决定 dts-stack 与 s10-stack 完全隔离，基线 `8568eb9`；`/opt/prod/s10/v2.2.3`、`/data/dts-stack`（origin s10-stack）归 s10；dts-stack 开发 `/opt/prod/dts/dts-rdc/dts-stack`、构建 `/data/dts-rdc/dts-stack`”；#3、#36 原文不改 |
| 4 | `sprint-5-202610/features/F0-基线仓库落位与架构定案/` 新增 Task `T20-dts-stack隔离后仓库内路径与命名去s10化.md` | 内容见第 2 节 |
| 5 | F0 README、`sprint-queue.md`、Sprint README 的 Feature 列表 | F0 的 Task 数加 1；状态统计同步 |

## 2. 新增 Task：F0/T20 dts-stack 隔离后仓库内路径与命名去 s10 化

- 头部：`**原编号**: 新增（2026-09-29，用户决定 dts-stack 与 s10-stack 完全隔离）`；`**优先级**: P0 · **状态**: READY · **依赖**: T07（子模块指针已指向 8568eb9）`。
- 背景：dts-stack `main` 的内容继承自 s10-stack v2.2.3，仓库内的开发说明、脚本与部署配置仍指向 s10 的路径、镜像和容器名。如果不改，DTS 与 s10 在同一台机器上构建或运行时会互相覆盖。
- 范围（在 dts-stack 仓库的开发副本 `/opt/prod/dts/dts-rdc/dts-stack` 上，分支 `chore/isolate-from-s10`）：
  1. **路径**：`CLAUDE.md`、`AGENTS.md`、`DEPLOY.md`、`init.sh`、`dev*.sh`、`build*.sh` 等所有引用 `/opt/prod/s10/v2.2.3`、`/data/dts-stack` 的地方，改为 `/opt/prod/dts/dts-rdc/dts-stack`、`/data/dts-rdc/dts-stack`。先用 `grep -rn "s10\|/data/dts-stack" --exclude-dir=node_modules --exclude-dir=target .` 列出清单写入证据，再修改。
  2. **容器与镜像命名**：compose 的 `name:`（或 `COMPOSE_PROJECT_NAME`）、容器名、网络名、数据卷名、本地镜像名/标签，都要与 s10 的部署区分开。建议前缀 `dts-rdc-` 或独立镜像命名空间，按 `imgversion.conf` 集中配置；端口若与 s10 在同机同时运行会冲突，在 `.env.example` 中给出一组不冲突的端口。
  3. **远端与历史说明**：README 注明本仓库自 `8568eb9` 起与 s10-stack 隔离；删除脚本中对 `s10-stack.git` 的引用。
  4. **worklog**：dts-stack 自带的 s10 sprint 历史（至 sprint-104）保持原样作为历史，不迁移、不改写；新工作记录在 dts-rdc 的 worklog 中。
- 不做：不修改 `/opt/prod/s10/v2.2.3`、`/data/dts-stack`；不改业务代码。
- 验证：
  - [ ] `grep` 清单在修改后为空（历史 worklog 除外）；
  - [ ] 在 `/data/dts-rdc/dts-stack` 用新的项目名完成一次 compose 构建与 `config` 校验（`docker compose config`），与 s10 的容器名、卷名、网络名没有重叠（列出两边 `docker compose config --services`/`volumes`/`networks` 对照）；
  - [ ] 提交推送 dts-stack，dts-rdc 子模块指针随之更新。
- 证据：`it/IT-01-repo-layout.md` 的 stack 小节。

## 3. 执行约束

- 不在 `/opt/prod/s10/v2.2.3`、`/data/dts-stack` 中执行任何写操作，包括 `git fetch` 以外的 git 命令、构建和 compose 启停。
- dts-rdc 只 `git add` 明确路径；`products.json` 保留。

## 4. 自检

1. `grep -rn "s10" worklog/v1.0.0/sprint-5-202610 worklog/v1.0.0/backlog` 的命中只剩：账本 #3/#36/#37、Q1 核查文档、各 handoff 与评审记录；F0/T01、T11 中不再出现 s10 开发/构建路径。
2. F0 的 Task 数与 `sprint-queue.md`、Sprint README 一致。
