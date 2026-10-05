# T10: 前端收敛与 engine-analytics 下线

**原编号**: Sprint-5 F7/T06（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T07–T09

## 目标
`engine-analytics` 停止部署；Console `/bi` 统一跳转 stack 分析中心，存量 BI 功能按处置表核对，不把旧 copilot 前端迁入 Console。

## 技术设计
- **页面处置表**（`assets/bi-page-disposition.md`）：copilot webapp 的每个 BI 页面（Cards、CardDetail、CardEditor、Dashboards、DashboardDetail、DashboardEditor、Collections、CollectionItems、Database*、DataPage、ModelsPage、MetricsPage、Public*、fixed-reports 等）→ `stack 对应功能/授权深链 | Console 吸收（F6/T14） | 不迁入及理由`；
- **路由**：不保留旧 copilot 前端路由作为过渡；核对 Console `/bi` 与批准的 stack 深链。已发布/分享链接是否有真实使用者由 T08 迁移清单确认，处理记录不能因前端不迁移而省略。
- **导航**：侧边栏中 BI 相关菜单改为外链图标并加上说明；
- **部署**：compose 中移除 `engine-analytics`（旧名 `copilot-analytics`）；Traefik 中 `/api/*` → analytics 的路由（账本#21 所在 compose）改为 stack BI，或删除；
- **Pack/Liquibase**：engine 中与 `copilot_analytics` 相关的配置清理；数据库 schema 保留只读 30 天后再删除（需要用户确认）。

## 验证
- [ ] 遍历当前 Console 入口及处置表中承诺保留的 stack 功能/分享链接，权限和目标页面符合映射（Playwright 脚本）
- [ ] `docker compose ps` 中没有 analytics 容器，工作台问数正常

## Definition of Done
- [ ] Playwright 报告进入 `it/IT-07-bi-merge.md`
