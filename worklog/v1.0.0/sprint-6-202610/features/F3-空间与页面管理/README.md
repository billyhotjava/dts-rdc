# F3: 空间与页面管理

**优先级**: P0 · **状态**: DRAFT

## 目标
Confluence 式的空间首页、页面树、页面阅读，以及页面的新建、改名、移动（拖拽）、复制、删除（回收站）；git 绑定页的这些操作自动映射为 git 操作（F5）。

## 契约（主要 API）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/spaces` | 当前用户可见空间 |
| POST | `/api/spaces` | 新建空间（admin）`{slug, name, description, gitRepoUrl?, syncRoots[]}` |
| GET | `/api/spaces/{slug}/tree` | 页面树（id、title、kind、children、syncStatus） |
| GET | `/api/pages/{id}` | 页面：标题、Markdown、版本号、作者、更新时间、面包屑、git 来源 |
| POST | `/api/spaces/{slug}/pages` | 新建 `{parentId, title, content, kind}`（在 git 挂载点下默认 `GIT`） |
| PUT | `/api/pages/{id}` | 保存 `{baseVersion, content, message}`；409 返回当前版本 |
| PATCH | `/api/pages/{id}` | 改名/移动 `{title?, parentId?, position?}` |
| POST | `/api/pages/{id}/copy` · DELETE `/api/pages/{id}` · POST `/api/pages/{id}/restore` | 复制 / 删除进回收站 / 恢复 |

## UI/UX
- 左栏页面树：展开/折叠、拖拽排序与改父节点（放下前高亮落点）、右键菜单（新建子页、改名、复制、移动、删除）。
- 正文：面包屑、标题、"最后由 X 于 Y 更新 · 版本 N · 来自 git：repo@sha"、内容、底部评论区（F8）。
- 删除确认对话框注明"git 绑定页将从仓库中删除（可在回收站恢复）"。
- 四态：空空间（引导新建首页）/ 加载骨架 / 错误重试 / 成功。

## Task 列表
| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 空间与页面树 API + 左栏页面树 | P0 | DRAFT | F1、F2 |
| T02 | 页面阅读（Markdown 渲染、面包屑、元信息） | P0 | DRAFT | T01 |
| T03 | 新建 / 改名 / 移动 / 复制 / 删除与回收站 | P0 | DRAFT | T01 |
| T04 | 乐观并发保存与编辑锁提示 | P0 | DRAFT | T02 |
| T05 | 空间首页与"我的空间"首页 | P1 | DRAFT | T01 |
