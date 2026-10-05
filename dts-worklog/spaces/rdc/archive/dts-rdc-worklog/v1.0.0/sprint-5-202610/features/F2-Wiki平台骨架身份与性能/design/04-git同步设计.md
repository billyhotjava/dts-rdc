# 04 Git 双向同步设计

## 1. 原则
1. **PG 是事实源**，但同步根内的文件在 git 中也可以被开发者/AI 直接修改；正常网络、约定规模且无待人工冲突时，两方向目标 ≤ 60 s；异常延迟必须可见。
2. **永不静默覆盖**：同文件双向修改先做三方合并；无重叠时记录 MERGE 版本，无法自动合并时保留两版交人工处理。
3. **永不改写历史**：不 `--force` 推送；只会丢弃工作副本中**尚未推送**的本地提交（它们可由 outbox 重建）；wiki 的每个用户操作是一个独立提交，作者 = wiki 用户。
4. **同步器是工作副本的唯一操作者**：每个仓库一个本地 clone，只有 `GitSyncScheduler`（ShedLock 单实例）在同一时刻操作它。
5. 同步单位是**文件**；已持久化的内容冲突可隔离，IO/数据库失败等未完成入站不能被推进 checkpoint 跳过。
6. **字节忠实**（v1.1）：入站、导入把 git 中的文件原文字节写入版本；出站把版本原文写回文件。同步链路上**任何环节都不做 Markdown 格式化**（格式统一由作者侧 `tools/mdfmt` 自愿完成，09 §2.5）。

## 2. 配置与工作副本

| 项 | 值 |
|----|----|
| 空间 → 仓库 | `Space.gitRepoUrl`（SSH）、`gitBranch`（默认 `main`） |
| 同步根 | `SyncRoot.repoPath`（如 `docs`、`worklog`），挂载页 `mountPage`（FOLDER） |
| 工作副本 | `${repos-dir}/<space-slug>`：`git clone --branch <branch> --single-branch <url>`（全量历史，用于 `log --follow`） |
| SSH | `${ssh-keys-dir}/<space-slug>.key`（ed25519，0600）；`GIT_SSH_COMMAND="ssh -i <key> -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=${ssh-keys-dir}/known_hosts"` |
| 提交者 | `-c user.name=DTS Wiki -c user.email=wiki@yuzhicloud.com`；作者 `--author="<显示名> <邮箱>"`（邮箱缺失用 `<login>@users.noreply.yuzhicloud.com`） |
| 初始空间 | `dts` → `git@github.com:billyhotjava/dts-rdc.git`，同步根 `docs`、`worklog`；`prs` → `git@github.com:billyhotjava/prs-stack.git`，同步根 `worklog`（`docs` 待确认） |

git 调用封装在 `GitRepoManager`，所有命令：`ProcessBuilder` + 超时（fetch/push 60 s，其余 30 s）+ 捕获 stderr；非 0 退出抛 `GitCommandException(command, exitCode, stderr)`。

## 3. 页面同步状态机

```
                  网页保存/改名/移动/删除（写 outbox）
   ┌──────────┐ ─────────────────────────────────────► ┌──────────────┐
   │  SYNCED  │                                         │ PENDING_PUSH │
   └──────────┘ ◄───────────── 推送成功 ─────────────── └──────────────┘
        │  ▲                                                    │
入站：git 改了且 wiki 未改（写 GIT 版本，仍为 SYNCED）          │ 入站：git 也改了同一文件
        │  │ 解决冲突后推送成功                                  ▼
        │  └──────────────────────────────────────────── ┌──────────┐
        └── 入站：git 改了，wiki 有未推送修改 ──────────► │ CONFLICT │
                                                          └──────────┘
```

- `CONFLICT` 页：普通保存被拒（409 `PAGE_SYNC_CONFLICT`），只能走冲突合并；该页的 outbox 条目标为 `BLOCKED_BY_CONFLICT`。
- NATIVE/TEMPLATE 页恒为 `LOCAL_ONLY`，不参与同步。

## 4. 同步周期（每个启用同步的空间，每 30 s）

```
1. lock(space)                                  -- ShedLock 名称 git-sync-<slug>
2. ensureClone()                                -- 不存在则 clone
3. git fetch origin <branch>
   reconcileRemoteOperations()                 -- 先核验上次未知 push 的操作 ID，补本批确认，不跳过其他远端变化或先推进全局 checkpoint
4. Inbound(origin/<branch>)                     -- §5，先吸收远端变化（可能产生冲突）
5. reconcileLocalMaterialization()              -- 只重建确认未推送且可由 outbox 恢复的本地提交
   git reset --hard <已完成入站的远端 SHA>       -- 仅同步器专用 clone，禁止用于开发者工作副本
6. Outbound()                                   -- §6，处理 outbox，逐条提交
7. git push origin HEAD:<branch>
     成功 → 仅当 HEAD = 已入站基点 + 已持久化 PG 的本批 outbox 提交时，原子确认 checkpoint 与本批 outbox
             页面仅在没有更新版本/待确认操作时置 SYNCED，否则仍为 PENDING_PUSH
     被拒（远端前移）→ 保留 outbox；重新 fetch → 新增远端区间完整 Inbound/冲突处理 → 重建 outbox → 再 push
                       不允许只 rebase/push 后推进同步点；有限重试后回到下一周期
     超时/断连（结果未知）→ fetch 核验操作 ID 是否已在远端；确认后只补数据库确认，不重复业务提交
8. 写 SyncState（status、时间、错误信息）
```

要点：本地未推送提交只是 outbox 的物化结果；只有确认原始操作、作者、版本和文件载荷可恢复后才能重建。push 结果未知先核对远端，不能直接重放；任何 reset 都不得丢弃未入库的修改。

## 5. 入站（git → wiki）

```
changes = git diff --name-status -M50% <lastSyncedCommit> origin/<branch> -- <各同步根>
（lastSyncedCommit 为空 = 首次导入，见 §8）
for each change:
  A (新增) / M (修改) path.md:
      gitContent = git show origin/<branch>:path；sha = sha256(gitContent)
      page = findByGitPath(path)（不存在则按目录创建 FOLDER 链与 GIT 页）
      if page.currentVersion.sha == sha → 跳过（例如 wiki 自己推上去的提交）
      elif page.syncStatus == SYNCED → 新增版本(source=GIT, gitCommit=该文件最后一次提交, 作者=提交作者)
      elif page.syncStatus == PENDING_PUSH →
           base = lastSyncedCommit 时该文件的内容
           尝试三方合并（§7）：成功 → 新增 MERGE 版本及其出站操作，保留被替代 WRITE 的原载荷/关联关系，避免旧 WRITE 再覆盖合并结果，保持 PENDING_PUSH
                               失败 → 创建 SyncConflict(git 内容, wikiVersion=当前版本, baseVersion)，状态 CONFLICT
      elif CONFLICT → 追加远端冲突版本并更新当前引用，保留旧 base/wiki/git 内容用于追溯
  D (删除) path:
      SYNCED → 页面软删除（ActivityEvent: 来自 git 的删除）
      PENDING_PUSH → 冲突（git 删了、wiki 改了），合并界面提供"保留 wiki 版本（恢复文件）/ 接受删除"
  R (重命名) old→new:
      更新 page.gitPath（及 FOLDER 链），不产生新版本；若内容同时变化按 M 处理
  README.md 的 A/M/D → 作用于其目录对应的 FOLDER 页正文
  非 md 文件（图片、pdf…）→ Attachment 的增删改（BlobStore 存内容）
仅当该远端区间每个变化均已应用或持久化为冲突/明确跳过记录后，事务提交 lastSyncedCommit = 本轮固定远端 SHA
未处理错误不推进；重跑按来源 commit/path/操作 ID 幂等，不重复创建版本
```

- 作者映射：`git log -1 --format=%an%x00%ae <commit> -- path`；按 `jhi_user.email`（忽略大小写）或 `login` 匹配。
- 元数据（v1.1）：每个写入的 md 版本都调用 `ContentService.analyze(LENIENT)`；frontmatter 不合规照常入库，`page_meta.valid=false`，同步状态页汇总不合规数量（不产生冲突、不阻塞同步）。
- archify 产物（v1.1）：`diagrams/` 下的 `*.archify.json`、`*.html`、`*.png` 按附件同步（归属同目录的页面）；不做渲染与校验（校验由仓库 CI 负责，09 §4.2）。
- 排除：`.git*`、隐藏文件、超过 `max-file-size` 的文件（记录日志与同步状态告警）。

## 6. 出站（wiki → git）

outbox 按 `id` 顺序处理，每条一个提交：

| op | 工作副本操作 | 提交信息 |
|----|--------------|----------|
| WRITE | 写 `payload.versionId` 的内容到 `gitPath`（README 类 FOLDER 写 `<dir>/README.md`） | `wiki: edit <path>` / `wiki: create <path>` |
| MOVE | `git mv <fromPath> <toPath>`（目录整体移动；目标父目录不存在则先创建） | `wiki: move <from> -> <to>` |
| DELETE | `git rm -r <path>` | `wiki: delete <path>` |
| RESTORE | 同 WRITE（从回收站恢复） | `wiki: restore <path>` |
| ATTACH / DETACH | 从 BlobStore 写出文件 / `git rm` | `wiki: upload <path>` / `wiki: remove <path>` |

- 提交前 `git add -A -- <涉及路径>`；每次操作带稳定 outbox ID（提交 trailer `Wiki-Operation-Id`），记录物化 commit，重放保持 ID。
- 无实际变化时，只在已入站远端内容已满足该操作时确认 DONE，不能因未推送本地内容相同就提前确认；MOVE/DELETE 重试也核验操作 ID 与路径状态。
- push 成功但 DB 确认前崩溃时，从远端核验操作 ID/提交祖先与内容，幂等补确认；新的网页保存不能被旧批次确认覆盖。
- **路径白名单**：所有写入路径必须位于该空间启用的同步根之内，否则条目 FAILED 并告警（防御性校验）。
- 失败处理：单条命令失败 → `attempts+1`、`lastError`，指数退避（30 s、1 min、2 min… 上限 30 min）；超过 10 次 → FAILED，状态页红色。

## 7. 三方合并与冲突解决
- 自动合并：`git merge-file -p <wiki版> <base> <git版>`（在临时目录执行）；退出码 0 = 无冲突。
- 人工合并界面（05 §5）提供：基线、wiki 版、git 版三栏；结果编辑区预填 `merge-file` 的输出（含 `<<<<<<<` 标记）。
- 解决：`POST /api/wiki/conflicts/{id}/resolve {contentMd, resolution}` → 新增 MERGE 版本（或 KEPT_WIKI/KEPT_GIT）→ 页面 `PENDING_PUSH` → outbox WRITE → 下一周期推送；冲突记录 `resolvedAt/resolvedBy`。
- 通知：冲突产生时通知该页最后的 wiki 编辑者与关注者（`SYNC_CONFLICT`）。

## 8. 首次导入（ImportService）
1. 管理员在 `/admin/sync` 为空间配置仓库与同步根，添加 deploy key，"测试连接"通过；
2. `POST /api/wiki/admin/import/{slug}`：clone → 为每个同步根创建挂载 FOLDER 页 → 遍历文件按 02 §5 映射创建页面与附件；
3. 版本：默认每个文件导入**最近 20 个历史版本**（`git log --follow --format=%H -n 20 -- path`，逐个 `git show <sha>:<path>`，作者/时间取提交信息）；`importHistory=false` 时只导入当前版本；
4. 排序：同目录按文件名自然排序（数字按数值、中文按拼音，与现网 wiki 一致）；
5. `lastSyncedCommit = HEAD`；输出导入报告（文件数、页面数、附件数、跳过项、frontmatter 不合规页面清单）。
6. **不做首次归一化**（v1.1 取消原方案）：导入即原文字节入库。

**切换前置条件**：现网 .50 `/data/dts-wiki/repo` 中网页编辑产生的本地提交必须已推送到 GitHub（需要 dts-rdc 的写权限 deploy key），否则这些编辑不会出现在新 wiki。

## 9. 与开发者 / AI 协作的约定（写入各仓库 CLAUDE.md / README）
- 同步根内的文件可以直接在 git 中修改；在正常条件下 wiki 目标 1 分钟内吸收，冲突和失败由状态页跟踪。
- 大规模重构（批量改名、移动目录）建议在 git 中一次提交完成，wiki 入站按 rename 处理，页面 id 与历史保留。
- 不要在同步根内提交超大二进制文件（> 20 MB 不会同步到 wiki）。

## 10. 测试场景（必须全部自动化，见 07）
新增 / 修改 / 删除 / 改名 / 目录改名 / 图片 / README ↔ FOLDER / 两边改不同行（自动合并）/ 两边改同一行（冲突）/ git 删 wiki 改 / 推送被拒后重放 / 网络中断重试 / 重复执行幂等 / 中文路径。

追加必测：入站后、push 前远端新增不同文件/同文件不同段，PG 必须吸收远端变化，下一轮不能漏入站；push 成功响应丢失、DB 确认前崩溃、推送期间新保存、入站中途失败分别验证 PG/git 内容、版本数、操作 ID、outbox/checkpoint 一致。60 秒目标仅适用于正常网络、无待人工冲突且在验证规模内的路径；冲突期间保留双方版本并展示状态。
