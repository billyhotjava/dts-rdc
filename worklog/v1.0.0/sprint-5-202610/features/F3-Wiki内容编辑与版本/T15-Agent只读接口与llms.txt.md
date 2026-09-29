# T15: Agent 只读接口与 llms.txt（v1.1 W6.5 之二）

**原编号**: 新增（2026-09-26，来自 v1.1 设计 `design/10` §5 W6.5；MCP 后于本 Task，由本月 T16 承接）

**优先级**: P1 · **状态**: READY · **依赖**: T13（`page_meta`、`viaAgent`）

## 目标
Agent（muse-spark、Claude 等）能以用户身份按页面或仓库路径读取 Markdown 原文、按结构化条件查询页面、读取每个空间的 `llms.txt`；经 Agent 写入的版本有署名；全部接口遵守空间权限。

## 技术设计（`WikiContentResource`，契约见 `design/10` §3.3）
| 方法 | 路径 | 要点 |
|------|------|------|
| GET | `/api/wiki/pages/{id}/markdown` | `text/markdown`；`ETag: "v{no}"`、`X-Wiki-Version`、`X-Wiki-Git-Path`、`X-Wiki-Doc-Type` |
| GET | `/api/wiki/spaces/{slug}/markdown?path=` | gitPath 精确匹配 → `<path>/README.md`；否则 404 |
| GET | `/api/wiki/query` | `space` 必填；type/status/owner/sprint/feature/tag/q；`size ≤ 200` |
| GET | `/api/wiki/spaces/{slug}/llms.txt` | `design/09` §5.3 格式；缓存 60 s |
| GET | `/api/wiki/content-schemas/{type}` | JSON Schema |
| 工具 | `tools/mdfmt [--check]` | 与编辑器相同的 remark-stringify 选项（`design/09` §2.5） |

所有接口经 `SpaceAccessService`；无权限空间返回 404（不泄露存在性），与 `F2/T10` 权限矩阵一致。

## 验证
- [ ] 契约测试：每个接口的成功、404、无权限三种情况；`ETag` 与版本号一致
- [ ] 权限矩阵追加 5 行（Agent 接口 × 有权/无权空间）
- [ ] `X-Wiki-Agent: muse-spark` 保存后，历史界面显示"（经 muse-spark）"，git 提交信息含 `(via muse-spark)`
- [ ] `mdfmt --check` 对 20 个 roundtrip 样本退出码 0

## Definition of Done
- [ ] 证据写入 `../../it/wiki/W6.5-diagram-agent.md`

## 2026-09-27 产品能力承接（DTS-C02）

本 Task 交付“授权知识可读取、可识别版本”，供后续 BL-A/T22 探索消费，不宣称 RAG 已上线，也不新增机器身份认证方案。

- [ ] 撤销空间权限后，Markdown、query、llms.txt 与缓存均不继续返回该空间的标题、摘要或正文；无权限仍按既有约定返回 404。
- [ ] 读取前执行当前授权检查，`ETag`/304 与缓存命中不绕过检查；删除页不可被旧路径或缓存继续读取，正文更新后版本和 ETag 改变。
- [ ] 接口结果可关联空间、页面 ID、版本及现有 Git 路径；同一文档供人和 Agent 使用相同事实源与空间权限。
- [ ] 以上新增用例计入本 Task 测试工作量，在原 W6.5 证据中分项记录；未执行不标 PASS。
