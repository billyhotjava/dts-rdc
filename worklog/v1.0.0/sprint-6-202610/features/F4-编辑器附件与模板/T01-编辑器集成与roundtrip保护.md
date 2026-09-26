# T01: 编辑器集成与 roundtrip 保护

**优先级**: P0 · **状态**: DRAFT · **依赖**: F0/T02、F3/T04

## 技术设计
- 集成选定编辑器（React 组件封装）：工具栏、快捷键（Ctrl+S 保存）、全屏、源码/所见即所得切换。
- **roundtrip 保护**（W-ADR-3 的关键）：保存前若编辑器未产生用户修改（dirty=false）则不提交；
  保存时比对 `content_sha256`，内容未变不产生新版本、不触发 git 同步。
- 若 F0/T02 结论显示编辑器会规范化格式：首次打开 git 页时提示"编辑器将统一 Markdown 格式"，并把"纯格式化变更"作为单独版本（message=`format`），避免与业务修改混在一个 git 提交中。
- 保留 frontmatter：编辑器只编辑正文，frontmatter 原样保存（sprint-workflow 未来的元数据）。

## 验证
- [ ] F0/T02 的 20 个样本打开-保存无 diff（或仅产生一次 format 版本）
