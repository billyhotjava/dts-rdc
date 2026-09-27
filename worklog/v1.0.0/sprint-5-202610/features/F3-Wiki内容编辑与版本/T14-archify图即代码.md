# T14: archify 图即代码（v1.1 W6.5 之一）

**原编号**: 新增（2026-09-26，来自 v1.1 设计 `design/10` §5 W6.5）

**优先级**: P1 · **状态**: READY · **依赖**: T08（附件存储）、T13（阅读渲染栈）

## 目标
架构/流程/时序等图以 `diagrams/x.archify.json` 为源、`x.html` + `x.png` 为产物入库；阅读页用沙箱 iframe 展示交互图，失败退化为 PNG；源文件与产物随 git 同步。

## 技术设计
| 项 | 契约 / 落点 | 出处 |
|----|-------------|------|
| B5 附件白名单 | `*.archify.json`（≤ 2 MB、JSON 可解析）、`diagrams/*.html`（≤ 5 MB）；SVG 仍拒绝；`raw/**` 返回 html 时带 CSP 沙箱头 + `nosniff` | `design/10` §3.5、`design/09` §4.2 |
| 编辑器卡片 | Milkdown 中 ```` ```archify ```` 块显示为只读卡片（预览 + "如何修改"提示），不可在编辑器内改图 | `design/10` §4.2 |
| 阅读组件 | `ArchifyFrame`：`sandbox` iframe、工具栏（全屏/打开源文件/下载 PNG）、加载失败退化为 `x.png` | `design/09` §4.2、`design/10` §4.4 |
| 构建工具 | `tools/archify-build`：validate → deliver → visual-check → 复制 light 1440×900 PNG | `design/10` §6 |

## 验证
- [ ] 示例页（含 1 张 architecture 图）端到端：本地 build → 提交 → 入站同步 → 阅读页交互图可见
- [ ] `curl -sI .../raw/diagrams/x.html` 含 CSP `sandbox` 与 `X-Content-Type-Options: nosniff`
- [ ] 断开 html 产物时退化显示 PNG（截图）
- [ ] 上传 `.svg` 被拒（400）

## Definition of Done
- [ ] 证据写入 `../../it/wiki/W6.5-diagram-agent.md`（与 T15 共用）
