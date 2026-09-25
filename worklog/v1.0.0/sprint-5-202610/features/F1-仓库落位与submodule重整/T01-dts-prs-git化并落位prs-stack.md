# T01: dts-prs git 化并落位 prs-stack

**优先级**: P0
**状态**: READY
**依赖**: 无（推送前需用户确认远端 prs-stack 当前内容可被覆盖或合并）

## 目标
把 `/opt/prod/prs/source/dts-prs` 变成 `billyhotjava/prs-stack` 仓库的内容，首个提交不含编译产物和密钥。

## 技术设计
- **输入**：账本#7（无 git、target/ 在树内、`deploy/.env` 含密码）、账本#4（prs-stack submodule 记录的 SHA `fc3d0e7`，远端内容未知）。
- **输出契约**：远端 `prs-stack` main 分支，根结构见 F1 README；首个提交信息 `chore: import dts-prs sprint-1 baseline into prs-stack`。
- **步骤**：
  1. 只读检查远端：`git ls-remote git@github.com:billyhotjava/prs-stack.git`，并 `git clone` 到 scratch 目录查看 `fc3d0e7` 的内容。
     - 远端为空或只有 README → 直接作为新历史推送；
     - 远端有实质内容 → 停下来，报告差异，由用户决定是合并还是另建仓库（**不 force push**）。
  2. 在 dts-prs 根新建 `.gitignore`（契约中的基线 + `sources/**/target/`）。
  3. `git init -b main`；`git add` 之前执行 `git status --ignored`，确认 `target/`、`deploy/.env` 在 ignored 列表中。
  4. 扫描密钥：`grep -rnE '(password|secret|token)\s*[:=]\s*\S+' sources --include='*.yml' --include='*.json' --include='*.sql'`，
     逐条判断是开发默认值还是真实值；realm 导出文件 `realm-flower-test.json` 中的测试用户密码（test1234）属于测试夹具，保留但在 README 注明。
  5. 首次提交并推送：`git remote add origin git@github.com:billyhotjava/prs-stack.git && git push -u origin main`（**推送前向用户确认**）。
  6. 在 `PRS/dts-prs/` 放一个 `MOVED.md` 说明新位置（过渡期保留，由 T06 统一清理）。
- **错误路径**：推送被拒（远端有提交）→ 回到步骤 1 的分支判断，不 `--force`。

## 影响范围
`PRS/dts-prs/.gitignore`（新增）、`.git/`（新增）、远端 prs-stack。

## 验证
- [ ] `git ls-files | grep -c target/` = 0
- [ ] `git ls-files | grep -E '\.env$'` 为空，`deploy/.env.example` 存在
- [ ] 在全新目录 clone 后，`cd sources && mvn -B -q package` 可通过（JDK 25，账本#26）

## Definition of Done
- [ ] 远端可 clone，构建通过，结果写入 `it/IT-01-repo-layout.md`
