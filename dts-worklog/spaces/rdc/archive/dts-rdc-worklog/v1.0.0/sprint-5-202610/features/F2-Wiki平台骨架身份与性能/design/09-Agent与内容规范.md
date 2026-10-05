# 09 Agent 与内容规范（DTS-MD v1）

> v1.1 新增（2026-09-27）。本文定义 wiki 中**一切内容**的格式契约：人、编辑器、git、Agent、检索都以此为准。
> 对应 ADR：D6（扩大）、D15–D18（见 00）。实施拆分见 `10-v1.1变更与重构清单.md`。

## 1. 原则

1. **Markdown 是唯一的内容契约**。所有页面（GIT / FOLDER 正文 / NATIVE / TEMPLATE）在 PG 与 git 中存的都是 Markdown 原文；编辑器（ProseMirror/Milkdown）只是它的一个视图，块结构、Yjs 文档等都只是临时状态。
2. **结构化信息放 YAML frontmatter**，按文档类型有 JSON Schema；正文不再承载状态、负责人、依赖这类字段。
3. **图即代码**：图的源文件是文本（Mermaid 代码块、archify JSON），渲染结果只是派生产物。
4. **可退化**：任何扩展语法在 GitHub、普通编辑器、纯文本阅读中都必须仍然可读，最多丢失样式，不丢失信息。
5. **最小差异**：wiki 保存时只改动用户真正改过的块，不因编辑器的序列化习惯改写其他内容（05 §4.3）。
6. **Agent 与人同权同责**：Agent 通过与人相同的接口读写，受同样的空间权限约束，每个版本都记录"谁（经哪个 Agent）改的"。

## 2. Markdown 方言 DTS-MD v1

### 2.1 基础
CommonMark 0.31 + GFM：表格、任务列表 `- [ ]`、删除线 `~~`、自动链接。换行规则：渲染时 `breaks: true`（单换行即换行，与现网 wiki 一致）。

### 2.2 允许的扩展（白名单）

| # | 扩展 | 语法 | wiki 渲染 | GitHub / 纯文本退化 | 编辑器（Milkdown）支持 | 优先级 |
|---|------|------|-----------|---------------------|------------------------|--------|
| E1 | frontmatter | 文首 `---` YAML `---` | 属性面板（不进正文） | GitHub 显示为表格 | 不进编辑区，由属性面板编辑 | P0 |
| E2 | 提示框 | `> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]` + 引用内容 | 彩色提示框（antd Alert 样式） | GitHub 原生支持 | 自定义节点（blockquote + 类型属性），`/` 菜单插入 | P0 |
| E3 | Mermaid | ```` ```mermaid ```` 代码块 | 懒加载渲染为图，点击可放大 | GitHub 原生渲染 | 代码块 + 右侧实时预览 | P0 |
| E4 | archify 图 | ```` ```archify ```` 代码块，info string 带属性（§4.3） | 沙箱 iframe 展示交互图 | 代码块内含 SVG 链接，可点开 | 只读卡片（显示预览 + "在源文件中编辑"说明），不可在编辑器内改 | P0 |
| E5 | 脚注 | `正文[^1]` + `[^1]: 说明` | 页底脚注 | GitHub 原生支持 | remark-gfm 自带，原样保留 | P1 |
| E6 | 折叠块 | `:::details 标题` … `:::` | antd Collapse | 显示为普通文本段落 | 源码块（§2.4） | P1 |
| E7 | 数学公式 | `$…$`、`$$…$$` | KaTeX（懒加载） | GitHub 原生支持 | Crepe `latex` 特性 | P2 |
| E8 | 分栏 | `:::columns` / `:::column` … `:::` | 两至三栏布局（窄屏堆叠） | 顺序段落 | 源码块（§2.4） | P2 |
| E9 | @提及 | `@login`（空格或行尾结束） | 用户卡片（悬停显示姓名） | 纯文本 | 输入 `@` 弹出候选，插入纯文本 | P1 |

- 容器指令（E6、E8）统一用 remark-directive 语法（三个冒号），名称只允许 `details`、`columns`、`column`；其他名称视为普通文本。
- 页面之间链接：一律用**相对路径的 Markdown 链接**（`[F5 同步](../../F4-Wiki-Git双向同步/README.md)`），不引入 `[[wiki 链接]]`，保证 git/GitHub 中可点。wiki 渲染时解析为站内页面（03 §4 `resolve`）。
- 图片：相对路径 `./assets/<文件>`，alt 文本必填（Agent 与无障碍都依赖它）。

### 2.3 明确禁止
- 原始 HTML（包括 `<details>`、`<br>`、`<span style>`）：渲染器 `html: false`，出现时按文本显示；保存时给出警告（不阻断）。
- 文字颜色、背景色、字体大小；表格合并单元格、表格嵌套；iframe/embed 标签。
- 用标题样式做"装饰"（标题必须体现结构，Agent 按标题切块）。

### 2.4 编辑器不认识的块
编辑器解析到非白名单或暂不支持可视化编辑的节点（容器指令、数学块、未知代码块等）时，**不得改写其原文**：以"源码块"节点保存原始文本切片，所见即所得模式中显示为只读渲染预览 + [编辑源码] 按钮（打开 CodeMirror 小窗）。序列化时原样输出该切片（见 05 §4.3 最小差异算法）。

### 2.5 规范格式（normalized form）
为了让人、Agent、编辑器写出的 Markdown 尽量一致，定义规范格式（与编辑器序列化选项完全相同）：

| 项 | 规范 |
|----|------|
| 无序列表符号 | `-` |
| 有序列表 | `1.` 递增 |
| 列表缩进 | 子项缩进 2 空格（`listItemIndent: 'one'`） |
| 强调 / 加粗 | `*斜体*` / `**加粗**` |
| 代码块 | ```` ``` ````，必须写语言 |
| 分隔线 | `---` |
| 标题 | 只用 ATX（`#`），标题前后各空一行 |
| 表格 | 管道对齐（remark 默认），表格前后空一行 |
| 行尾 | LF，文件末尾一个换行 |

提供格式化工具 `dts-wiki/tools/mdfmt`（Node CLI，与编辑器用同一套 remark 配置）：`npx mdfmt <文件或目录> [--check]`。开发者与 Agent 可在提交前自行格式化；**wiki 不会批量改写仓库文件**（取代此前"首次导入做一次归一化"的方案）。

## 3. Frontmatter 规范

### 3.1 通用字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | 枚举 | `sprint` / `feature` / `task` / `adr` / `evidence` / `page`（缺省视为 `page`） |
| `id` | 字符串 | 空间内唯一的稳定标识，供 `depends`、`related`、查询使用；`page` 类型可省略 |
| `title` | 字符串 | 可选；缺省取正文第一个 `# 标题` |
| `status` | 枚举 | 按类型取值（§3.2） |
| `owner` | 字符串 | Keycloak 登录名（如 `xiezm`） |
| `tags` | 字符串数组 | 自由标签；frontmatter 为唯一写入源，page_meta/Label 仅派生，见 design/02 §6 与 F5/T03 |
| `related` | 字符串数组 | 相关文档的 `id` |

规则：键名小写蛇形或短横线（统一用 `snake_case`）；未知键允许（`additionalProperties: true`），已知键必须符合类型；日期一律 `YYYY-MM-DD`。

### 3.2 各类型 Schema（JSON Schema 2020-12，文件放 `dts-wiki/src/main/resources/content-schemas/<type>.schema.json`，同一份拷贝给 sprint-workflow 技能）

**sprint**（Sprint README）
```yaml
type: sprint
id: sprint-6                       # ^sprint-[0-9]+$
title: DTS Wiki v1
status: IN_PROGRESS                # DRAFT | READY | IN_PROGRESS | DONE | BLOCKED
timebox: { start: 2026-10-12, end: 2026-11-20 }
goal: 一句话可验收目标
owner: xiezm
```

**feature**（Feature README）
```yaml
type: feature
id: S5/F4                          # 或 BL-A
sprint: sprint-5
title: Git 双向同步
status: IN_PROGRESS
priority: P0                       # P0 | P1 | P2
owner: xiezm
```

**task**（Task 文件）
```yaml
type: task
id: S5/F4/T03                      # 或 BL-A/T03，必须与 feature 前缀一致
feature: S5/F4
title: git → wiki 入站同步
status: READY                      # DRAFT | READY | IN_PROGRESS | DONE | BLOCKED
priority: P0
owner: muse-spark                  # 人或 Agent 名
depends: [S5/F4/T02]
estimate: 2d                       # 可选
blocked_reason: ""                 # status=BLOCKED 时必填
```

**adr**
```yaml
type: adr
id: W-ADR-7
title: 同步语义
status: Accepted                   # Proposed | Accepted | Superseded | Rejected
date: 2026-09-27
supersedes: []                     # 被取代的 ADR id
```

**evidence**（`it/` 下的验收证据）
```yaml
type: evidence
id: S6/IT-03
covers: [S6/F4/T03, S6/F4/T04]
result: PASS                       # PASS | FAIL | PARTIAL
date: 2026-10-20
```

**page**（其他页面，全部可选）：`type: page`、`tags`、`owner`、`related`。

### 3.3 校验与行为
| 来源 | 校验失败时 |
|------|------------|
| 网页保存 / Agent 调用保存接口 | 422 `FRONTMATTER_INVALID`，返回字段级错误列表（`[{path, message}]`），不产生版本 |
| git 入站同步 | **照常入库**（不能拒绝 git 已有内容），`page_meta.valid = false`，页面显示黄色"属性不合规"徽标并列出错误 |
| 无 frontmatter 或 `type` 未知 | 视为 `page`，不校验 |

### 3.4 在 wiki 中的呈现
- 页面顶部**属性面板**（阅读态：`Descriptions` 紧凑展示；编辑态：按 Schema 生成的 antd `Form`，另有"YAML 源码"切换）。
- `id`、`depends`、`related` 渲染为可点击的页面引用（按 `page_meta.doc_id` 解析）。
- 看板/列表视图（backlog）：直接基于 `page_meta` 查询，例如"Sprint-5 所有 IN_PROGRESS 的 task"。统计数字由系统计算，文档中不再手写统计。

### 3.5 存量文档迁移（W12，见 10）
现有正文元数据提取到 frontmatter，但默认保留全部原行及说明；支持 BL/跨 Sprint ID、范围、aliases 与 depends_note，不能无损解析的条件保留并人工核对。具体规则以 10 §7 为准；脚本先 dry-run，确认后执行，迁移前后核对状态、ID 和依赖语义守恒。模板只更新仓库版本。

## 4. 图即代码

### 4.1 Mermaid
行内 ```` ```mermaid ```` 代码块。适合流程、时序、状态等简单图。wiki 懒加载 mermaid（仅页面中出现时加载），渲染失败时显示源码与错误信息。

### 4.2 archify（架构 / 流程 / 时序 / 数据流 / 生命周期图）
archify 是基于 typed JSON 规格生成独立交互 HTML（内嵌 SVG，支持缩放、搜索、主题切换、导出）的工具（技能 `archify` v2.16，MIT）。

**文件约定**（与引用它的 md 同目录）：
```
<页面目录>/
  01-系统架构.md
  diagrams/
    system-architecture.archify.json   ← 源文件（唯一事实来源；人与 Agent 只改这个）
    system-architecture.html           ← archify deliver 产物（wiki 展示用）
    system-architecture.png            ← 静态图（GitHub、打印、无脚本环境、Agent 看图）
```
命名：小写短横线；三个文件同名不同后缀。可选：在 HTML 的导出菜单手工导出双主题 SVG（`system-architecture.svg`），非必需。

**生成与更新流程**（谁改源文件，谁负责产物）：
```bash
node <archify>/bin/archify.mjs validate <type> diagrams/x.archify.json --quality showcase --json   # 必须 0 错误 0 警告
node <archify>/bin/archify.mjs deliver  <type> diagrams/x.archify.json diagrams/x.html --quality showcase --json
node <archify>/bin/archify.mjs visual-check diagrams/x.html --json
#   visual-check 写出 4 张 PNG（light/dark × 1440×900、2048×1320）与 JSON 旁注；
#   取 light 主题 1440×900 那张复制为 diagrams/x.png，其余截图不提交（加入 .gitignore）
git add diagrams/x.archify.json diagrams/x.html diagrams/x.png
```
archify CLI 没有无界面的 SVG/PNG 导出命令（SVG 只能在 HTML 的导出菜单手工导出），因此自动化流程统一用 `visual-check` 的 PNG 作静态图。
仓库提供封装脚本 `dts-wiki/tools/archify-build <json>`：依次执行 validate → deliver → visual-check → 复制 PNG，任何一步非 0 退出即失败。

CI（dts-rdc 与各产品仓库）：对变更的 `*.archify.json` 执行 `validate`，并检查同名 `.html`、`.png` 存在且提交时间不早于 json；失败则 PR 不通过。

**在 Markdown 中引用**：
````markdown
```archify src="./diagrams/system-architecture.archify.json" height="560"
![系统架构](diagrams/system-architecture.png)
```
````
- info string 属性：`src`（必填，指向 json）、`height`（可选，默认 520 px）、`view`（可选，archify 语义视图名）。
- 代码块内容是一行图片链接（静态 PNG）：GitHub 中显示为代码块文本（可点链接看图），纯文本环境可读；wiki 忽略内容，按 `src` 找到同名 `.html` 展示。

**wiki 展示与安全**：
- 渲染为 `<iframe sandbox="allow-scripts" src="/api/wiki/pages/{id}/raw/diagrams/x.html" loading="lazy">`，**不给 `allow-same-origin`**，因此 iframe 内脚本读不到 wiki 的 Cookie 与 DOM。
- 后端返回该 HTML 时附加响应头：`Content-Security-Policy: sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:`、`X-Content-Type-Options: nosniff`、`Cache-Control: private, max-age=300`（双保险：即使被直接打开也在沙箱中）。
- iframe 右上角工具：[新窗口打开]（同样经 raw 接口）、[下载 PNG]、[查看源文件]（跳到 json 附件）。
- 找不到 `.html` 时退化为显示 `.png`；都没有时显示错误卡片"缺少 archify 产物，请运行 tools/archify-build"。

### 4.3 其他图
PNG/JPG 截图仍可作为普通图片；**架构、流程类图禁止只提交位图**（Agent 无法修改），须用 Mermaid 或 archify。

## 5. Agent 访问（D18）

### 5.1 本 Sprint（Sprint-5）交付：为 Agent 打好基础
| 能力 | 接口 | 说明 |
|------|------|------|
| 原文读取 | `GET /api/wiki/pages/{id}/markdown` → `text/markdown; charset=utf-8`，响应头 `ETag: "v<versionNo>"`、`X-Wiki-Version`、`X-Wiki-Git-Path` | 含 frontmatter 的完整原文 |
| 按路径读取 | `GET /api/wiki/spaces/{slug}/markdown?path=worklog/v1.0.0/sprint-queue.md` | Agent 常以仓库路径思考 |
| 结构化查询 | `GET /api/wiki/query?space=&type=&status=&owner=&sprint=&feature=&tag=&page=&size=` → `[{pageId, docId, type, status, title, url, gitPath, updatedAt}]` | 基于 `page_meta` |
| 空间索引 | `GET /api/wiki/spaces/{slug}/llms.txt` → 纯文本 | §5.3 |
| 保存 | 沿用 `PUT /api/wiki/pages/{id}/content`（带 `baseVersionNo`），新增可选请求头 `X-Wiki-Agent: <agent 名>` | 版本记录 `viaAgent` |

### 5.2 本月 F3/T16：MCP 服务（2026-09-27 调入）
MCP 服务（同一 jar 内 Streamable HTTP 端点 `/mcp`，不另建进程）暴露工具：

| 工具 | 输入 | 输出 |
|------|------|------|
| `wiki_search` | `{query, space?, type?, limit?}` | 命中列表（标题、路径、摘要、`pageId`） |
| `wiki_get_page` | `{pageId}` 或 `{space, path}` | Markdown 原文 + 版本号 + 属性 |
| `wiki_list_tree` | `{space, path?, depth?}` | 子树（标题、类型、`docId`、状态） |
| `wiki_query` | `{space, type?, status?, ...}` | 同 §5.1 查询 |
| `wiki_update_page` | `{pageId, baseVersionNo, markdown, message}` | 新版本号；409 时返回当前版本供 Agent 重读合并 |
| `wiki_create_page` | `{space, parentPath, fileName, markdown, message}` | 新页面 |
| `wiki_get_diagram_spec` / `wiki_put_diagram` | archify 源文件；`put` 时服务端不渲染，要求同时提交 `.html`、`.png`（由调用方用 archify-build 生成） | — |

身份：Keycloak 新 client `dts-wiki-agent`；Agent 以**代表某个用户**的方式调用（令牌交换或用户个人访问令牌），权限 = 该用户的空间权限；版本作者 = 该用户，`viaAgent` = Agent 名。审计事件记录 Agent 名。速率限制：每用户每分钟 60 次写。

### 5.3 llms.txt 格式（每个空间）
```
# PRS 花卉租赁
> 花卉租赁业务系统（DTS 首个行业 App）的产品文档与研发日志。内容为 DTS-MD v1（见 wiki 规范页）。

## 产品文档
- [架构总览](/api/wiki/spaces/prs/markdown?path=docs/architecture/README.md): 系统架构与模块边界

## 工作日志
- [Sprint-1 可运行基线](/api/wiki/spaces/prs/markdown?path=worklog/v1.0.0/sprint-1-202609/README.md) [sprint · IN_PROGRESS]
```
按页面树顺序生成，最多 2000 行；每行 `标题 + 原文链接 + 一句摘要（frontmatter.title/goal 或首段前 80 字）+ [type · status]`。

## 6. 检索增强（RAG）就绪要求
- 标题锚点使用 GitHub slug 规则（`github-slugger`），同一文档内唯一，可作为引用锚点。
- 每节首段应能独立理解（写作规范，不做强制校验）。
- `page_search_doc` 与 `page_meta` 已提供全文与结构化过滤；后续向量检索按"标题分节切块 + 元数据过滤（空间权限）"实现，放入 DTS 知识中心规划。
