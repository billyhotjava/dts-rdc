# T13: DTS-MD 内容契约与 frontmatter 元数据（v1.1 W5b）

**原编号**: 新增（2026-09-26，来自 v1.1 设计 `design/10` §5 W5b）

**优先级**: P0 · **状态**: DONE（2026-09-28：B1/B2/B4/B6 + 属性面板/表单 + F4渲染（除archify）；证据 it/wiki/W5b-content.md）（2026-09-28：B1/B2/B4/B6 + 属性面板/表单 + F4渲染（除archify），证据 it/wiki/W5b-content.md 待补） · **依赖**: T01–T05（页面与保存路径已实现）、F2/T12（`/bootstrap`）

## 目标
所有页面以 DTS-MD v1 为内容契约：保存时解析 YAML frontmatter 并按 JSON Schema 校验（网页/Agent 保存严格、git 入站宽松），元数据落 `page_meta` 可查询，阅读页显示属性面板、编辑页提供属性表单。

## 技术设计（契约见 design/09、design/10）
| 项 | 契约 / 落点 | 出处 |
|----|-------------|------|
| B1 内容分析 | `service/wiki/content/ContentService.analyze(md, STRICT/LENIENT)` → `ContentAnalysis`；STRICT 不合规 → 422 `FRONTMATTER_INVALID {errors:[{path,message}]}` | `design/10` §3.1、`design/09` §3 |
| B2 元数据表 | Liquibase `9004_page_meta.xml`（非 JHipster 实体，`JdbcTemplate`）；`ContentReindexJob` 补齐存量 | `design/10` §3.2 |
| B4 Agent 署名 | JDL `PageVersion.viaAgent`；增量 changeset `9005_page_version_via_agent.xml`；请求头 `X-Wiki-Agent` | `design/10` §3.4 |
| B6 检索文档 | `page_search_doc` 去掉 frontmatter，标题含 title/tags/doc_id | `design/10` §3.6 |
| F3 属性面板/表单 | `PropertiesPanel.tsx`（阅读）、`PropertiesForm.tsx`（编辑，schema → antd 控件，`yaml` Document API 保留键序与注释，ajv 预校验） | `design/10` §4.3 |
| F4 阅读渲染 | `MarkdownView.tsx` 重写：markdown-it + footnote/container/alerts/anchor/task-lists，Shiki/mermaid/KaTeX 懒加载，`resolve-batch` 链接改写（archify 渲染归 T14） | `design/10` §4.4 |

## 错误路径
YAML 语法错误 / 未知 type（按 page）/ 重复 `id` / CRLF：行为按 `design/10` §3.1 列表；git 入站永不因 frontmatter 拒收。

## 验证（RED→GREEN）
- [ ] `ContentServiceTest`：`design/09` §3.2 每种类型合法样例 + 每类 ≥ 3 个非法样例、YAML 错误、无 frontmatter、CRLF、重复 id、title 推导
- [ ] `page_meta` 查询 IT：按 type/status/owner/sprint 过滤
- [ ] 属性面板四态截图（无 frontmatter / 合规 / 不合规警告 / 加载中）；表单保存后原有键顺序与注释不变（字节比对）

## Definition of Done
- [ ] 证据写入 `../../it/wiki/W5b-content.md`
- [ ] .50 上存量页面经 reindex 后 `page_meta` 行数 = 未删除页面数
