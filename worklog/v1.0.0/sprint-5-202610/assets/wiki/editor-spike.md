# T02 编辑器选型 spike：Milkdown vs Vditor

**Task**: `F2/T02` · **状态**: DONE · **日期**: 2026-09-26 · **耗时**: 约半人日
**结论**: 选 **Milkdown（Crepe 预设，7.x 最新稳定补丁）**，理由见 §5。结论已回写 `design/00` D11。

## 1. 方法

- 语料：dts-rdc 抽 20 个真实 md（`harness/samples/sample-01~20.md`，清单见 §6），覆盖大表格、
  嵌套列表、代码块、任务列表、YAML frontmatter、HTML 实体 `&lt;`、中文标点、相对链接、
  图片引用；语料库无 Mermaid/脚注，`sample-20.md` 为合成边缘样本（frontmatter + mermaid
  fence + 脚注 + `*`/`+` 混合列表 + 对齐表格 + 任务列表）。
- Milkdown 路径（代理）：`remark-parse + remark-gfm + remark-frontmatter` → `remark-stringify`
 （`bullet:'-'`）。Milkdown 的 transformer 即基于 remark（mdast ↔ ProseMirror），
  mdast 层的归一化行为两者共有；ProseMirror 层残余差异在 W5 用真实组件复测（05 §4 验收）。
- Vditor 路径（真实引擎）：`vditor@3.11.3` 自带 Lute（`dist/js/lute/lute.min.js`，Node 直载），
  用与 `Vditor.getValue()` IR 模式完全相同的字符串函数
  `Md2VditorIRDOM` → `VditorIRDOM2Md`（`dist/index.js:5191` `getMarkdown`），
  Lute 选项对齐 Vditor 默认（含 IR 模式下 Vditor 自己设置的 `SetVditorIR(true)`，见 `dist/index.js:9056`）。
- 判定指标：①零差异率（原文 == 导出）；②幂等性（`f(f(x))==f(x)`，无改动重复保存是否稳定）；
  ③渲染等价（`Md2HTML(原文)==Md2HTML(导出)`，有无内容损失）；④小修改 containment。
- 复现：`harness/roundtrip.cjs`、`harness/stability.cjs`、`harness/analyze.cjs`
  （开发机 `/tmp/opencode/editor-spike/`，node_modules 含 `remark@15`、`vditor@3.11.3`、
  `@milkdown/transformer@7`）。

## 2. 结果总表（20 样本）

| # | 样本（来源） | 大小 | Milkdown 代理 | Vditor IR（Lute 真实） |
|---|--------------|------|---------------|------------------------|
| 01 | sprint-queue.md | 5.8K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 02 | sprint-6 README | 12K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✗（中文链接被转义） |
| 03 | design/00 | 6.7K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 04 | design/05 | 9.8K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 05 | design/04 | 10K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 06 | sprint-5 README | 25K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✗（同 02） |
| 07 | sprint-1 README | 2K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✗（任务列表空格漂移） |
| 08 | dts-agent-protocol.md | 12K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 09 | dts-wiki/CLAUDE.md | 2.6K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 10 | README.md | 2.1K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 11 | CLAUDE.md | 5.8K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 12 | PRODUCT-SPEC（55K，大表+实体） | 55K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 13 | BUSINESS-PLAN（46K） | 46K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 14 | infra-design（46K） | 46K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 15 | PRICING（12K） | 13K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✓ |
| 16 | F3/T11（code fence 含 `&lt;`） | 2.8K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✗（fence 内实体被解码） |
| 17 | F2/T04（同上） | 2.9K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✗（同上） |
| 18 | F2/T02 基线（含 JSON `&lt;`） | 3.4K | DIFF/幂等✓/渲染✓ | DIFF/幂等✓/渲染✗（同上，空行另有漂移） |
| 19 | sprint-5 index（25K） | 25K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✓（空行漂移） |
| 20 | 合成边缘（mermaid+脚注+混合列表） | 1K | DIFF/幂等✓/渲染✓ | DIFF/幂等✗/渲染✗（任务列表空格漂移） |

汇总：零差异率 **0/20 vs 0/20**（打平，任何 AST 编辑器都做不到字节不变）；
幂等 **20/20 vs 12/20**；渲染等价 **20/20 vs 12/20**。

## 3. 差异归因

两条路径的差异都是"打开即归一化"，无一零差异；性质不同：

- Milkdown（remark）差异：表格列对齐补空格、`---`→`---` 间距、`~`/`_` 转义（`Finance*`→`Finance\*`）、
  列表/表格前后补空行。全部渲染等价且幂等，属纯排版归一化，不可配除（remark-stringify 表格必然对齐），
  但一次归一化后永久稳定。
- Vditor IR（Lute）差异：除上述排版归一化外，还有三类内容级问题——
  1. 任务列表 `- [ ] x` → `- [ ]  x`，无 `SetVditorIR(true)` 时**每次保存多一个空格**（无界漂移）；
     Vditor 自身在 IR 模式会置该标志，置后单空格变双空格即稳定，但首次仍 churn；
  2. 代码围栏内 HTML 实体被解码（`List&lt;String>` → `List<String>`，sample-16/17/18），渲染结果改变；
  3. 中文链接 href 被 percent-encode（sample-02/06），`Md2HTML` 字节变化；
  4. 16/17/19 在 v1→v2 仍有空行增加（非幂等），重复保存会持续产生新版本。
- 小修改 containment（sample-02 追加一行）：Milkdown 输出 diff 3/8 行（含全表重排版基线 churn），
  Vditor 为 0/1 行。两者都不丢失用户修改；Milkdown 的多改行全属既有归一化。

## 4. 其他维度

| 维度 | Milkdown（Crepe） | Vditor 3.11.3 |
|------|-------------------|---------------|
| 许可证 | MIT ✓ | MIT ✓ |
| 体积 | `@milkdown/*` 约 3.4MB（unpacked；Crepe 单包约 0.8MB） | 23.6MB（all-in-one，含编辑器全家桶） |
| 维护 | 7.x 活跃（`time.modified` 2026-09-23，最新 7.22.x） | 3.11.3（2026-08-30），单作者国产项目 |
| 中文/IME | ProseMirror 标准 IME 支持，W5 实测 | 中文友好，**现网 wiki 已验证** |
| 图片粘贴钩子 | 上传插件可接 `onUploadImage`（05 §4）✓ | `upload` 配置可接 ✓ |
| 表格编辑 | Crepe 表格块编辑 ✓ | 工具栏建表 ✓ |
| 协同扩展 | `@milkdown/plugin-collab`（Yjs）✓，呼应"后续接 Yjs"预留 | 无 |
| 源码模式兜底 | 无（需另配 CodeMirror 做源码切换） | sv 源码模式按实现返回原文（`getMarkdown` sv 分支），字节稳定 |

## 5. 结论与后续

1. **选 Milkdown（Crepe 预设）**：零差异率打平后，按 T02 判定规则"选差异可通过序列化配置消除/性质更轻者"——
   Milkdown 差异全部是稳定、可预期、无内容损失的排版归一化（20/20 幂等+渲染等价），
   Vditor IR 有实体解码与非幂等漂移（12/20）；并列条款同样指向 Milkdown（Yjs 扩展）。
   版本：W5 时取 7.x 最新稳定补丁（R-012），假设 Crepe API 在 7.x 内稳定。
2. **D6 的"字节不变"验收必须降为"稳定等价"**：任何 AST 所见即所得编辑器打开即归一化，
   建议 05 §4 验收改为 —— ①无修改不触发 `onChange`；②保存前以 sha256 比对 gard：归一化后无实质变化
   不建新版本（I9 已要求内容相同不建版本，实现时比较**归一化后** sha）；③20 样本用真实 `MarkdownEditor`
   组件复测本报告（幂等+渲染等价须 20/20）。
3. **首次导入即做归一化**：`ImportService`（04 §8）导入时跑一次选定编辑器的序列化，
   使 git 原文与 wiki 规范形式一致，避免上线后首次打开即全库 churn。
4. 备选：若需求方坚持 Vditor（现网经验），则默认 `mode:'ir'` + 确认 `SetVditorIR(true)`，
   并接受代码围栏实体改写的一次性 churn；纯源码场景可用 sv 模式（字节稳定，非所见即所得）。

## 6. 样本清单

`sample-01..19` 为 dts-rdc 真实文件（见 §2 表），`sample-20` 为合成边缘样本。
测试脚本与原始输出：开发机 `/tmp/opencode/editor-spike/`（`harness/*.cjs`，
`results.json` 摘要，`results-full.json` 含每次输出全文）。
本文件为结论归档；样本与脚本在 W5 复测时重新取出（届时如需进 `worklog`，按 08 §3 放入对应 Task 证据）。
