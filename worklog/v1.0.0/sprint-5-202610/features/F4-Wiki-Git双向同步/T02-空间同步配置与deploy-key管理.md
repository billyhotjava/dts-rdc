# T02: 空间同步配置与 deploy key 管理

**原编号**: Sprint-6 F5/T02（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T01

## 技术设计
- 管理页 `/admin/sync`：每个空间的仓库 URL、分支、同步根列表（repo_path → 挂载点）、同步间隔、最近状态。
- deploy key：服务器为每个仓库生成 ed25519 key（`/data/dts-wiki-v2/secrets/<repo>.key`），管理页显示公钥与"复制"按钮，并提示到 GitHub 仓库 Settings → Deploy keys 添加并**勾选写权限**；
  "测试连接"按钮执行 `git ls-remote` 与一次 dry-run push（`git push --dry-run`）。
- 初始配置：
  | 空间 | 仓库 | 同步根 |
  |------|------|--------|
  | dts | `git@github.com:billyhotjava/dts-rdc.git` | `docs`→`/docs`，`worklog`→`/worklog` |
  | prs | `git@github.com:billyhotjava/prs-stack.git` | `worklog`→`/worklog`（`docs` 待 Q1 确认） |

## 验证
- [ ] 两个仓库"测试连接"均通过（需用户添加 deploy key）
