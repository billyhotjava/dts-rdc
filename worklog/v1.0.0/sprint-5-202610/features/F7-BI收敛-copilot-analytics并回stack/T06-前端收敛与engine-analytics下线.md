# T06: 前端收敛与 engine-analytics 下线

**优先级**: P1
**状态**: DRAFT
**依赖**: T03–T05

## 目标
Studio webapp 中移除 BI 管理类页面（改为跳转到 stack 分析中心），`engine-analytics` 服务停止部署，同时不留死链。

## 技术设计
- **页面处置表**（`assets/bi-page-disposition.md`）：copilot webapp 的每个 BI 页面（Cards、CardDetail、CardEditor、Dashboards、DashboardDetail、DashboardEditor、Collections、CollectionItems、Database*、DataPage、ModelsPage、MetricsPage、Public*、fixed-reports 等）→ `redirect(stack 深链) | keep(属于智能体) | delete`；
- **路由**：保留旧路由一个版本周期，访问时 302 或前端 `Navigate` 到 stack 深链，并显示一次提示"分析功能已迁移到分析中心"；
- **导航**：侧边栏中 BI 相关菜单改为外链图标并加上说明；
- **部署**：compose 中移除 `engine-analytics`（旧名 `copilot-analytics`）；Traefik 中 `/api/*` → analytics 的路由（账本#21 所在 compose）改为 stack BI，或删除；
- **Pack/Liquibase**：engine 中与 `copilot_analytics` 相关的配置清理；数据库 schema 保留只读 30 天后再删除（需要用户确认）。

## 验证
- [ ] 遍历处置表中的全部旧路由，每个都能到达预期页面（Playwright 脚本）
- [ ] `docker compose ps` 中没有 analytics 容器，工作台问数正常

## Definition of Done
- [ ] Playwright 报告进入 `it/IT-07-bi-merge.md`
