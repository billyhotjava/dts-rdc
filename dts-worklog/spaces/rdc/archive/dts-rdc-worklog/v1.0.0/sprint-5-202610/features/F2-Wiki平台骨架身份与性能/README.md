# F2: Wiki平台骨架身份与性能

**优先级**: P0
**状态**: IN_PROGRESS（DONE=8 / IN_PROGRESS=2 / DRAFT=2）
**时间窗**: 2026-10 第 1–2 周（W0–W3 已于 9 月末先行）
**整合来源**: Sprint-6 F0 基线与技术选型 spike；Sprint-6 F1 仓库、数据模型与应用骨架；Sprint-6 F2 统一登录与产品级权限（2026-09-26 按月度 Sprint 整合）

## 目标
dts-wiki 工程骨架（JHipster 9 + antd）、Keycloak 登录与产品级空间权限、.50 交付基线全部可用，并满足 v1.1 性能预算（首屏 JS ≤ 300 KB gz、RSS < 400 MB），为内容/同步/上线类 Feature 提供底座。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-建仓与交付基线.md) | 建仓与交付基线 | Sprint-6 F0/T01 | P0 | DONE | 用户在 GitHub 新建空仓库 `billyhotjava/dts-wiki` |
| [T02](T02-编辑器选型spike.md) | 编辑器选型 spike（Milkdown vs Vditor） | Sprint-6 F0/T02 | P0 | DONE | — |
| [T03](T03-中文全文检索spike.md) | 中文全文检索 spike（pg_bigm vs zhparser） | Sprint-6 F0/T03 | P0 | DONE | — |
| [T04](T04-非功能预算初稿.md) | 非功能预算初稿 | Sprint-6 F0/T04 | P1 | DRAFT | T02、T03 |
| [T05](T05-后端骨架.md) | 后端骨架 | Sprint-6 F1/T01 | P0 | DONE | T01 |
| [T06](T06-数据模型与Liquibase基线.md) | 数据模型与 Liquibase 基线 | Sprint-6 F1/T02 | P0 | DONE | T05 |
| [T07](T07-前端骨架.md) | 前端骨架 | Sprint-6 F1/T03 | P0 | DONE | T01 |
| [T08](T08-本地开发环境与CI.md) | 本地开发环境与 CI | Sprint-6 F1/T04 | P1 | IN_PROGRESS | T05–T07 |
| [T09](T09-应用内OIDC登录与会话.md) | 应用内 OIDC 登录与会话 | Sprint-6 F2/T01 | P0 | IN_PROGRESS | T05 |
| [T10](T10-空间访问策略与测试矩阵.md) | 空间访问策略与测试矩阵 | Sprint-6 F2/T02 | P0 | DONE | T09、T06 |
| [T11](T11-新建空间时自动创建Keycloak角色与组.md) | 新建空间时自动创建 Keycloak 角色与组 | Sprint-6 F2/T03 | P1 | DRAFT | T10 |
| [T12](T12-前端性能预算与阅读观感.md) | 前端性能预算与阅读观感（v1.1 W5a） | 新增 | P0 | DONE | T05–T07（骨架已在 .50 运行，镜像 `w6a3`） |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 当前设计与完成标准

合并前编号见 Task 表；接口、实体、身份和部署以本 Feature `design/00–10` 及已记录的实现差异为准，避免重复维护旧契约。

- 模型与迁移：`design/02`，JHipster 实体与 Liquibase；身份用户复用 `jhi_user`。
- 身份与 API：`design/03`，业务 `/api/wiki/**`；生成实体 API 仅管理用途。入口 `/oauth2/authorization/oidc`，回调 `/login/oauth2/code/oidc`；单实例内存会话。
- 权限：读权限不足与不存在同为 404；有读权限但无写权限为 403；所有入口复用 SpaceAccessService。
- 部署与性能：`design/06` 和 F2/T12；单 jar app + PG 两个服务，`/management/health/**`；预算写 `assets/wiki/nfr-budget.md`，实际运行结果写 `it/wiki/`（Sprint 根相对路径）。
- [ ] T01 交付基线引用 `it/wiki/baseline.md` 的版本化证据；它不替代后续登录会话、性能及发布验收。
- [ ] T02/T03 选型和 T04 预算完成；T05～T12 对应实现、权限矩阵、当前版本的构建/部署/性能验证有证据。
