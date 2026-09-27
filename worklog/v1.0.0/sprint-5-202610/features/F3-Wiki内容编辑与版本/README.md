# F3: Wiki内容编辑与版本

**优先级**: P0
**状态**: IN_PROGRESS（DONE=10、DRAFT=3、READY=3）
**时间窗**: 2026-10 第 2–3 周
**整合来源**: Sprint-6 F3 空间与页面管理；Sprint-6 F4 编辑器、附件与模板；Sprint-6 F6 版本历史与追溯（2026-09-26 按月度 Sprint 整合）

## 目标
用户能在有权限的空间内新建/改名/移动/删除页面、用 Markdown 编辑器编辑并上传图片附件、查看历史与对比恢复；所有页面遵循 DTS-MD v1 内容契约（frontmatter 元数据、archify 图即代码、最小差异保存），并向 Agent 提供只读接口。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-空间与页面树.md) | 空间与页面树 API + 左栏页面树 | Sprint-6 F3/T01 | P0 | DONE | F2 |
| [T02](T02-页面阅读.md) | 页面阅读 | Sprint-6 F3/T02 | P0 | DONE | T01 |
| [T03](T03-新建改名移动复制删除与回收站.md) | 新建 / 改名 / 移动 / 复制 / 删除与回收站 | Sprint-6 F3/T03 | P0 | DONE | T01 |
| [T04](T04-乐观并发保存与编辑提示.md) | 乐观并发保存与编辑提示 | Sprint-6 F3/T04 | P0 | DONE | T02 |
| [T05](T05-空间首页与我的空间.md) | 空间首页与"我的空间"首页 | Sprint-6 F3/T05 | P1 | DONE | T01 |
| [T06](T06-编辑器集成与roundtrip保护.md) | 编辑器集成与 roundtrip 保护 | Sprint-6 F4/T01 | P0 | DONE | F2/T02、T04 |
| [T07](T07-图片粘贴上传.md) | 图片粘贴上传 | Sprint-6 F4/T02 | P0 | DONE | T06、T08 |
| [T08](T08-附件存储上传列表与预览.md) | 附件存储、上传、列表与预览 | Sprint-6 F4/T03 | P0 | DONE | F2/T06 |
| [T09](T09-页面模板.md) | 页面模板 | Sprint-6 F4/T04 | P1 | DONE | T06 |
| [T10](T10-版本列表与版本详情.md) | 版本列表与版本详情 | Sprint-6 F6/T01 | P0 | DRAFT | T02 |
| [T11](T11-版本对比与恢复.md) | 版本对比与恢复 | Sprint-6 F6/T02 | P0 | DRAFT | T10 |
| [T12](T12-最近更新与活动流.md) | 最近更新与活动流 | Sprint-6 F6/T03 | P1 | DRAFT | T10 |
| [T13](T13-DTS-MD内容契约与frontmatter元数据.md) | DTS-MD 内容契约与 frontmatter 元数据（v1.1 W5b） | 新增 | P0 | DONE | T01–T05（页面与保存路径已实现）、F2/T12（`/bootstrap`） |
| [T14](T14-archify图即代码.md) | archify 图即代码（v1.1 W6.5 之一） | 新增 | P1 | READY | T08（附件存储）、T13（阅读渲染栈） |
| [T15](T15-Agent只读接口与llms.txt.md) | Agent 只读接口与 llms.txt（v1.1 W6.5 之二） | 新增 | P1 | READY | T13（`page_meta`、`viaAgent`） |
| [T16](T16-Wiki-MCP服务.md) | Wiki MCP 服务 | 新增 | P1 | READY | T15、T04、T14、F2/T10 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-6 F3 空间与页面管理

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
Confluence 式的空间首页、页面树、页面阅读，以及页面的新建、改名、移动（拖拽）、复制、删除（回收站）；git 绑定页的这些操作自动映射为 git 操作（F4）。

### 契约（主要 API）
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

### UI/UX
- 左栏页面树：展开/折叠、拖拽排序与改父节点（放下前高亮落点）、右键菜单（新建子页、改名、复制、移动、删除）。
- 正文：面包屑、标题、"最后由 X 于 Y 更新 · 版本 N · 来自 git：repo@sha"、内容、底部评论区（F5）。
- 删除确认对话框注明"git 绑定页将从仓库中删除（可在回收站恢复）"。
- 四态：空空间（引导新建首页）/ 加载骨架 / 错误重试 / 成功。

## 来源规格：Sprint-6 F4 编辑器、附件与模板

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
Markdown 原生的所见即所得编辑（F2/T02 选定的编辑器），图片与附件（PDF/Office）上传和预览，按 sprint-workflow 规范提供页面模板。

## 来源规格：Sprint-6 F6 版本历史与追溯

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
每个页面可以查看历史版本、任意两版对比、一键恢复；全站和空间有"最近更新"；每个版本标明来源（网页 / git 提交 / 合并）。
