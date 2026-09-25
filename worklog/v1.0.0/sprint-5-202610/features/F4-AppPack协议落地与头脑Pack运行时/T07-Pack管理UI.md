# T07: Pack 管理 UI

**优先级**: P1
**状态**: DRAFT
**依赖**: T03

## 目标
管理员可以在 Studio 界面上完成 Pack 的上传、查看、激活、回滚，不需要执行 curl。

## 技术设计
- **位置**：`engine/webapp/src/pages/admin/packs/`（copilot 已有 `pages/admin/` 目录，沿用其布局和导航注册方式，不另造框架）。
- **文件**：`PackListPage.tsx`、`PackDetailDrawer.tsx`、`PackUploadModal.tsx`、`api/packs.ts`（类型由 OpenAPI 生成：在 webapp 构建脚本中加入 `openapi-typescript` 步骤，产出 `src/types/generated/packs.ts`；与 prs R-001 的"类型从 OpenAPI 生成"原则一致）。
- **组件**：antd 5 的 `Table`、`Drawer`、`Upload.Dragger`、`Timeline`、`Modal.confirm`；样式沿用 webapp 现有的 `page.css` 与 `PageContainer` 组件（账本#20 附近的 components 目录）。
- **交互细节**：
  - 上传：只接受 `.dtspack` 文件，≤ 20 MB，拖拽或点击；上传中显示百分比；返回 422 时在弹窗内以列表展示 `validation.errors[]`（字段：path、message），warnings 用黄色折叠面板显示；
  - 激活 / 回滚：`Modal.confirm`，文案写明影响范围；成功后使用 `message.success` 提示并刷新列表；失败时显示后端错误码对应的中文文案（映射表放在 `i18n`）；
  - 状态徽标：ACTIVE 绿色、INSTALLED 蓝色、SUPERSEDED 灰色、FAILED 红色；
  - 可访问性：表格操作按钮有 `aria-label`，弹窗支持 Esc 关闭，焦点回到触发按钮。
- **权限**：路由守卫检查 `STUDIO_ADMIN`（F9 之后读取 token 中的角色；之前读取 admin 模式开关）。

## 验证
- [ ] 组件测试（vitest + testing-library）：四态渲染、422 错误列表渲染、确认弹窗
- [ ] UI 走查：按 F4 README 的走查步骤 1–6 截图，放到 `it/IT-04-pack-install.md`

## Definition of Done
- [ ] 四态截图、走查截图齐全
