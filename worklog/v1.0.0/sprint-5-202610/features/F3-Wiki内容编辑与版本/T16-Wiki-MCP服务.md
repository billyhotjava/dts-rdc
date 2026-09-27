# T16: Wiki MCP 服务

**原编号**: 新增（2026-09-27，由 backlog 待细化条目转入；设计见 `design/09` §5.2，使 Wiki v1 在本 Sprint 内收口）

**优先级**: P1 · **状态**: READY · **依赖**: T15（Agent 只读接口与 `viaAgent`）、T04（乐观并发保存）、T14（archify 产物规则）、F2/T10（空间权限矩阵）

## 目标
Agent 通过 MCP（Streamable HTTP `/mcp`，与应用同一 jar）以**代表某个用户**的身份检索、读取、查询、更新和新建 Wiki 页面；权限等于该用户的空间权限，版本作者为该用户，`viaAgent` 记录 Agent 名。

## 技术设计（契约见 `../F2-Wiki平台骨架身份与性能/design/09-Agent与内容规范.md` §5.2）
| 工具 | 输入 | 输出 / 行为 | 复用 |
|------|------|-------------|------|
| `wiki_search` | `{query, space?, type?, limit?}` | 命中（标题、路径、摘要、`pageId`） | F5 检索服务 |
| `wiki_get_page` | `{pageId}` 或 `{space, path}` | Markdown 原文 + 版本号 + 属性 | T15 `/markdown` |
| `wiki_list_tree` | `{space, path?, depth?}` | 子树（标题、类型、`docId`、状态） | T01 页面树 |
| `wiki_query` | `{space, type?, status?, …}` | 同 `/api/wiki/query` | T15、T13 `page_meta` |
| `wiki_update_page` | `{pageId, baseVersionNo, markdown, message}` | 新版本号；409 返回当前版本供重读合并 | T04 乐观并发，STRICT 校验 |
| `wiki_create_page` | `{space, parentPath, fileName, markdown, message}` | 新页面 | T03 |
| `wiki_get_diagram_spec` / `wiki_put_diagram` | archify 源；`put` 须同时提交 `.html`、`.png` | 服务端不渲染 | T14 |

- **身份**：Keycloak client `dts-wiki-agent`；用户个人访问令牌或令牌交换得到用户身份，禁止服务账号全量读取；所有调用经 `SpaceAccessService`。
- **写入约束**：每用户每分钟 60 次写（超限 429）；内容按 DTS-MD STRICT 校验（422 `FRONTMATTER_INVALID`）；页面正文中的指令性文本只作为数据，不触发工具调用。
- **审计**：每次调用记录用户、Agent 名、工具、`pageId`、版本与 traceId；日志不含正文。

## 验证（RED→GREEN）
- [ ] 每个工具的契约测试：成功、无权限空间（与 T15 一致返回不存在）、参数非法
- [ ] `wiki_update_page` 并发冲突返回 409 与当前版本；重读后合并保存成功
- [ ] 以用户 A 的令牌调用看不到用户 A 无权空间的任何标题、摘要或正文（权限矩阵追加 MCP 行）
- [ ] 经 MCP 保存的版本在历史界面显示"（经 <agent>）"，git 提交信息含 `(via <agent>)`
- [ ] 用 Claude Code 连接 `/mcp` 完成一次"检索 → 读取 → 修改 → 保存"真实走查

## Definition of Done
- [ ] 证据写入 `../../it/wiki/W6.5-diagram-agent.md`（MCP 小节）
- [ ] 无占位证据
