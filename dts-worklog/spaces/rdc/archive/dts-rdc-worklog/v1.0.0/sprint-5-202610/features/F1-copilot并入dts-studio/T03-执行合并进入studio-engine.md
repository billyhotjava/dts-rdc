# T03: 执行合并进入 studio/engine

**原编号**: Sprint-5 F3/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: IN_PROGRESS
**依赖**: T01、T02、F0/T12、F0/T01（copilot 未提交修改已处置，账本#9）

## 目标
在真实的 studio 仓库上执行 T02 脚本，推送后更新 RDC 的 studio gitlink。

## 技术设计
- **前置条件**：
  - copilot 的 main 已包含所有需要保留的改动（账本#9 中的 5 个未提交文件已提交或丢弃）；
  - 通知所有 copilot 开发者**冻结提交**（冻结窗口建议 ≤ 1 个工作日）。
- **步骤**：
  1. 在 copilot 打 tag `pre-merge-2026-10-xx`，并推送；
  2. 执行 `merge-copilot.sh`（T02）准备可丢弃 clone；核验 manifest、源 SHA 与显式保留的工作副本改动哈希后，在 studio 的 `feature/studio/engine-import` 分支 fetch 准备好的 `copilot-import` ref，使用 `merge --no-ff --allow-unrelated-histories` 保留导入历史。脚本不直接操作 studio；
  3. 修改 `engine/pom.xml` 中的 `<module>`（dts-copilot-ai → engine-ai 等），**不改 artifactId**（避免连锁影响），只改目录；
  4. 在 `/data/dts-studio` 核对受测源码与 studio 分支一致后运行根目录 `./build.sh verify`；首批本地迁移可验证工作树快照，并在提交后核对受测输入与 SHA，单独记录远端推广尚未完成；
  5. 开 PR → review → 合并到 studio main；
  6. RDC：`git -C dts-studio pull && git add dts-studio && git commit -m "chore(T03): studio now contains engine"`。
- **错误路径**：合并冲突（studio 根目录已有 README/CLAUDE.md，而 engine 的文件都在子目录下，理论上不会冲突）→ 如有冲突，逐项核对共享配置与双方意图并补回归，不机械选择某一侧；构建失败 → 在分支上修复，不回退合并。

## 影响范围
dts-studio 仓库（新增 engine/），RDC gitlink。

## 验证
- [ ] `engine/` 下的文件数 ≈ copilot 的文件数减去排除项
- [ ] 构建成功（输出记录进 `it/IT-02-studio-build.md`）

## Definition of Done
- [ ] studio main 包含 engine，RDC gitlink 已更新

Q1 权威源选择已关闭；主线推广仍需 T01/F0/T01 的完整归属和冻结 SHA 输入。首批分支迁移将源仓库的 7 项未提交调整另存为可追溯导入提交，未替用户处置原工作副本；来源冻结与归档仍待 T05。最小 Maven 模块路径修复与旧 webapp 构建引用排除在本任务内完成；T04/F7 再完成镜像及 K8s 交付路径收口。`/data/dts-studio` 已在本轮建立并核对受测输入；构建与真实运行验收分别记录。

## Implementation checkpoint (2026-09-29)

Imported and locally committed on feature/studio/engine-import at 06a6a8c; source HEAD and pending changes preserved. Main/remote promotion and RDC gitlink update remain open.

Evidence: [implementation record](../../assets/studio-refactor-20260929.md), [IT-02](../../it/IT-02-studio-build.md).
