# T06: 编辑器集成与 roundtrip 保护

**原编号**: Sprint-6 F4/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0 · **状态**: DONE（2026-09-28：F1 minimalDiff 真机20/20 + F2 方言保真/源码模式/提及；NodeView 美化延期见 it/wiki/W5c-editor.md）（W5c：F1 minimalDiff + F2 方言 + 源码模式；编辑器封装与粘贴已就绪） · **依赖**: F2/T02、T04

## 技术设计
- 集成选定编辑器（React 组件封装）：工具栏、快捷键（Ctrl+S 保存）、全屏、源码/所见即所得切换。
- **roundtrip 保护**（W-ADR-3 的关键）：保存前若编辑器未产生用户修改（dirty=false）则不提交；
  保存时比对 `content_sha256`，内容未变不产生新版本、不触发 git 同步。
- 若 F2/T02 结论显示编辑器会规范化格式：首次打开 git 页时提示"编辑器将统一 Markdown 格式"，并把"纯格式化变更"作为单独版本（message=`format`），避免与业务修改混在一个 git 提交中。
- 保留 frontmatter：编辑器只编辑正文，frontmatter 原样保存（sprint-workflow 未来的元数据）。

## 验证
- [ ] F2/T02 的 20 个样本打开-保存无 diff（或仅产生一次 format 版本）

## v1.1 追加范围（W5c，2026-09-26 并入本 Task）
- **最小差异保存**（`frontend/src/features/edit/minimalDiff.ts`，纯函数）：对顶层 mdast 块做 LCS，只替换用户改动过的块，其余字节保持原样；取消"导入时归一化"。契约与算法见 `../F2-Wiki平台骨架身份与性能/design/10-v1.1变更与重构清单.md` §4.1、`design/05` §4.3。
- **方言支持**（`features/edit/milkdown/`）：源码块、提示框（GitHub alerts）节点、不认识的块原样保留为只读块（`design/09` §2.4）；archify 卡片归 T14。
- **源码模式**：CodeMirror 6 markdown，与所见即所得模式切换时内容字节一致。
- **附件标签页**与**模板**入口挂在编辑页（与 T08、T09 共用接口）。
- 验证追加：`minimalDiff` 20 个样本单测全绿（改一个块 → diff 只含该块）；编辑器 E2E（打开 → 改一段 → 保存 → git diff 只有一处）。证据 `../../it/wiki/W5c-editor.md`。
