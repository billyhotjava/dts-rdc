# T07: 修正 dts-rdc 各 submodule 指针

**原编号**: Sprint-5 F1/T02（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT（Q1 已关闭；等待相应子仓库提交与可克隆证据）
**依赖**: stack 子步骤消费 T01 已有 Q1 决定；完整交付另依赖 T01 基准表、T06、T08

## 目标
让 RDC 的 submodule 指向权威仓库和真实基准 SHA，并在 dts-app-stack 内注册可 checkout 的 prs-stack。

## 技术设计
- **输入**：`assets/source-of-truth.md`（T01）；账本#1、#4。
- **输出契约**：
  - `RDC/.gitmodules`：4 个 submodule 的 URL 与 source-of-truth 一致，`branch = main` 写入配置（`git config -f .gitmodules submodule.<n>.branch main`）；
  - gitlink SHA = source-of-truth 的 baseline_sha；
  - `dts-app-stack` 仓库：`prs-stack` gitlink = T06 推送后的 main HEAD。
- **步骤**：
  1. `cd RDC/dts-stack && git fetch origin && git checkout <baseline_sha>`；回到 RDC `git add dts-stack`。
     Q1 已确定使用 dts-stack.git main 的已登记基准 `8568eb9`（执行前解析完整 SHA）；不擅自改用当时最新 main。只读核对工作副本后执行，不覆盖未提交修改。
  2. `cd RDC/dts-app-stack && git submodule update --init prs-stack && cd prs-stack && git checkout main && git pull --ff-only` → 在 app-stack 中提交 gitlink → push app-stack → 回到 RDC 更新 app-stack gitlink。
  3. `dts-studio`：本 task 只更新到 T08 完成后的 SHA；F1 合并 copilot 后再更新一次（由 F1/T03 负责）。
  4. `dts-infra` 保持不变（本 sprint 非目标）。
  5. RDC 提交信息：`chore(T07): point submodules to authoritative repos`。
- **错误路径**：嵌套 submodule 递归 init 失败（T08 未完成时 studio 的循环嵌套）→ 先完成 T08，或本次只做 `git submodule update --init`（不加 `--recursive`）。

## 影响范围
`RDC/.gitmodules`、RDC gitlinks、`dts-app-stack/.gitmodules` 与 gitlink。

## 验证
- [ ] `git submodule status --recursive` 无 `-`（未初始化）或 `+`（偏离）前缀
- [ ] 全新目录 `git clone --recursive` 成功，检查 F0 完成标准中的 3 个文件

## Definition of Done
- [ ] 证据写入 `it/IT-01-repo-layout.md`（命令 + 输出）

stack 子步骤可先行记录进度，但 T06/T08 未完成、递归克隆未通过时整项仍未完成。本文是实施要求，本轮文档 review 未更新任何 gitlink。
