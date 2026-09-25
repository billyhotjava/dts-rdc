# F1: 仓库落位与 submodule 重整

**优先级**: P0
**波次**: A
**状态**: READY（T01–T04）/ DRAFT（T05–T06，依赖 F0/T01）

## 目标
让 `dts-rdc` 成为真正可用的总纲仓库：`git clone --recursive dts-rdc` 能拿到 stack、studio、app-stack/prs-stack 的**真实代码**；
dts-prs 进入版本控制；没有循环嵌套、重复文档，也没有被跟踪的密钥。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 仓库 | `RDC/.gitmodules` | `dts-infra`, `dts-stack`, `dts-studio`, `dts-app-stack`（URL 以 F0/T01 结论为准） |
| 仓库 | `dts-app-stack/.gitmodules` | `prs-stack` → `git@github.com:billyhotjava/prs-stack.git`；`metro-stack` 保持 |
| 目录 | prs-stack 仓库根结构 | `sources/`（原 dts-prs/sources）、`worklog/`（原 dts-prs/worklog）、`pack/`（F5 新增）、`README.md`、`CLAUDE.md`、`.gitignore` |
| 约定 | `.gitignore` 基线 | `target/`, `node_modules/`, `.env`, `*.p12`, `*.key`, `.dev-logs/`, `.dev-pids/`, `.worktrees/` |
| 约定 | 工作副本路径 | 开发：`/opt/prod/dts/dts-rdc/<module>`；构建：`/data/<module>`；旧路径 `/opt/prod/prs/source/*` 进入只读过渡期 |

## UI/UX 规格
非用户面 Feature。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | dts-prs git 化并落位 prs-stack | P0 | READY | - |
| T02 | 修正 dts-rdc 各 submodule 指针 | P0 | READY | F0/T01、T01 |
| T03 | dts-studio 去除嵌套 submodule，evolution 文档去重 | P0 | READY | - |
| T04 | 密钥出库与轮换（copilot `.env`、prs `deploy/.env`） | P0 | READY | - |
| T05 | 入口文档与目录约定更新 | P1 | DRAFT | T02 |
| T06 | 工作副本迁移与旧路径过渡 | P1 | DRAFT | T02、F3/T03 |

## Definition of Ready
- [x] 契约已钉死  - [x] 竖切片：不涉及  - [x] UI：不涉及  - [ ] 依赖：T02/T05/T06 依赖 F0/T01  - [x] 验收可验证

## 完成标准
- [ ] 全新目录执行 `git clone --recursive <dts-rdc>` 后，`dts-stack/source/pom.xml`、`dts-studio/.rules/`、`dts-app-stack/prs-stack/sources/pom.xml` 均存在（证据写入 `it/IT-01-repo-layout.md`）
- [ ] `git ls-files | grep -E '(^|/)\.env$'` 在所有仓库中为空
