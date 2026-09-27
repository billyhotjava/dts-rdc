# T02: 编辑器选型 spike（Milkdown vs Vditor）

**原编号**: Sprint-6 F0/T02（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: DONE（2026-09-26，结论见 `assets/wiki/editor-spike.md`）

## 目标
选定 Markdown 原生（W-ADR-3）的所见即所得编辑器，保证"打开→不改→保存"得到**字节级相同**的 Markdown（否则 git 同步会产生伪变更）。

## 评估方法
1. 从 dts-rdc 抽 20 个有代表性的 md（含大表格、嵌套列表、代码块、Mermaid、中文标点、HTML 实体 `&lt;`、YAML frontmatter）。
2. 每个候选：加载 → 不做任何修改 → 导出 Markdown → 与原文 `diff`；再做一次小修改，看 diff 是否只含该修改。
3. 其他维度：图片粘贴上传钩子、表格编辑体验、中文输入法（IME）兼容、包体积、许可证、维护活跃度、实时协同扩展能力（Yjs）。

| 候选 | 预期优势 | 风险 |
|------|----------|------|
| Milkdown（Crepe 预设，MIT，ProseMirror） | 块编辑体验接近 Notion/Confluence；有 Yjs 协同插件 | Markdown 序列化可能规范化格式（列表符号、表格对齐）→ 伪 diff |
| Vditor 3.11.3（MIT） | 现网已验证、中文友好；IR 模式保留原文较好 | 协同能力弱；样式偏旧 |

## 产出
`assets/wiki/editor-spike.md`：20 个样本的 roundtrip 结果表、结论与理由。
**判定规则**：roundtrip 零差异率高者优先；若都有差异，选差异可通过序列化配置消除者；并列时选 Milkdown（协同扩展）。
