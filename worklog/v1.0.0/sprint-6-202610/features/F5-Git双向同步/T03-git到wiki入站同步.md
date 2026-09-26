# T03: git → wiki 入站同步

**优先级**: P0 · **状态**: DRAFT · **依赖**: T02

## 技术设计
- 调度：每 60 s（可配）+ 管理页"立即同步"；GitHub webhook 因 .50 在内网不可用（账本 #7），保留轮询。
- 步骤：`git fetch` → `git diff --name-status -M <last_synced>..origin/<branch> -- <roots>` → 逐文件读取 blob → 比对 `content_sha256` → 写版本或冲突（T01 规则）→ 推进 `last_synced_commit`。
- 版本作者取 git 提交作者（`git log -1 --format=%an%x00%ae -- <file>`），并在 app_user 中按邮箱/用户名关联 wiki 用户（关联不上则显示 git 作者名）。
- FOLDER 页随目录出现/消失自动维护；README.md ↔ FOLDER 正文。
- 附件（图片、pdf 等）入站：写入 BlobStore 并关联到同目录的页面。

## 验证
- [ ] 集成测试（本地临时 bare repo）：新增、修改、改名、删除、目录改名、二进制文件各一例
- [ ] 竖线：在 prs-stack 修改一个 worklog 文件并 push，60 s 内 wiki 出现新版本，作者正确
