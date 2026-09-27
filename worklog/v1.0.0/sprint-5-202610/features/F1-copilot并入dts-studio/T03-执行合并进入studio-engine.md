# T03: 执行合并进入 studio/engine

**原编号**: Sprint-5 F3/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T01、T02、F0/T12、F0/T01（copilot 未提交修改已处置，账本#9）

## 目标
在真实的 studio 仓库上执行 T02 脚本，推送后更新 RDC 的 studio gitlink。

## 技术设计
- **前置条件**：
  - copilot 的 main 已包含所有需要保留的改动（账本#9 中的 5 个未提交文件已提交或丢弃）；
  - 通知所有 copilot 开发者**冻结提交**（冻结窗口建议 ≤ 1 个工作日）。
- **步骤**：
  1. 在 copilot 打 tag `pre-merge-2026-10-xx`，并推送；
  2. 执行 `merge-copilot.sh`（T02），在 studio 的 `feat/merge-copilot` 分支上完成合并；
  3. 修改 `engine/pom.xml` 中的 `<module>`（dts-copilot-ai → engine-ai 等），**不改 artifactId**（避免连锁影响），只改目录；
  4. 本地构建：`cd engine && mvn -B -q -DskipTests package`（按 stack 的约定，在构建目录执行：先推分支，再在 `/data/dts-studio` 拉取后构建）；
  5. 开 PR → review → 合并到 studio main；
  6. RDC：`git -C dts-studio pull && git add dts-studio && git commit -m "chore(T03): studio now contains engine"`。
- **错误路径**：合并冲突（studio 根目录已有 README/CLAUDE.md，而 engine 的文件都在子目录下，理论上不会冲突）→ 如有冲突，一律保留 studio 根目录的版本；构建失败 → 在分支上修复，不回退合并。

## 影响范围
dts-studio 仓库（新增 engine/），RDC gitlink。

## 验证
- [ ] `engine/` 下的文件数 ≈ copilot 的文件数减去排除项
- [ ] 构建成功（输出记录进 `it/IT-02-studio-build.md`）

## Definition of Done
- [ ] studio main 包含 engine，RDC gitlink 已更新
