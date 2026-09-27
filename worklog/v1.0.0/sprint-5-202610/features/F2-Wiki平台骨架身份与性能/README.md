# F2: Wiki平台骨架身份与性能

**优先级**: P0
**状态**: IN_PROGRESS（DONE=8、DRAFT=2、IN_PROGRESS=2）
**时间窗**: 2026-10 第 1–2 周（W0–W3 已于 9 月末先行）
**整合来源**: Sprint-6 F0 基线与技术选型 spike；Sprint-6 F1 仓库、数据模型与应用骨架；Sprint-6 F2 统一登录与产品级权限（2026-09-26 按月度 Sprint 整合）

## 目标
dts-wiki 工程骨架（JHipster 9 + antd）、Keycloak 登录与产品级空间权限、.50 交付基线全部可用，并满足 v1.1 性能预算（首屏 JS ≤ 300 KB gz、RSS < 400 MB），为内容/同步/上线类 Feature 提供底座。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-建仓与交付基线.md) | 建仓与交付基线 | Sprint-6 F0/T01 | P0 | DONE | 用户在 GitHub 新建空仓库 `billyhotjava/dts-wiki` |
| [T02](T02-编辑器选型spike.md) | 编辑器选型 spike（Milkdown vs Vditor） | Sprint-6 F0/T02 | P0 | DONE | - |
| [T03](T03-中文全文检索spike.md) | 中文全文检索 spike（pg_bigm vs zhparser） | Sprint-6 F0/T03 | P0 | DONE | - |
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

## 来源规格：Sprint-6 F0 基线与技术选型 spike

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
在写业务代码前，定下三件有不确定性的事：交付基线能否跑通（建仓 → 构建 → 传镜像 → .50 启动 → 登录）、
编辑器选型、中文全文检索方案。每个 spike ≤ 1 人日，产出结论写进 Sprint README 的 ADR。

### 概要设计（`design/`）
DTS Wiki v1 的完整设计，编码会话以此为准：

| 文档 | 内容 |
|------|------|
| [00-概述与架构决策](design/00-概述与架构决策.md) | 目标、非目标、架构决策 D1–D14 |
| [01-系统架构](design/01-系统架构.md) | 组件、登录与请求流程、与现网 wiki 的关系 |
| [02-领域模型](design/02-领域模型.md) | 实体、不变量、自定义 Liquibase（实体以 dts-wiki `jhipster/dts-wiki.jdl` 为准） |
| [03-后端设计](design/03-后端设计.md) | 包结构、权限、REST API、事务、定时任务 |
| [04-git同步设计](design/04-git同步设计.md) | 同步模型、状态机、入站/出站、冲突、首次导入 |
| [05-前端设计](design/05-前端设计.md) | React + antd：路由、布局、编辑器、渲染、管理后台 |
| [06-部署与运维](design/06-部署与运维.md) | 镜像、compose、Keycloak、备份、切换与回退 |
| [07-测试与验收](design/07-测试与验收.md) | 测试分层、权限矩阵、同步场景、验收脚本 |
| [08-编码任务与交接说明](design/08-编码任务与交接说明.md) | 工作包顺序、硬性约束、需求方配合事项 |
| [09-Agent与内容规范](design/09-Agent与内容规范.md) | **v1.1**：DTS-MD v1 方言、frontmatter Schema、图即代码（archify）、Agent 访问、llms.txt |
| [10-v1.1变更与重构清单](design/10-v1.1变更与重构清单.md) | **v1.1**：现状快照、逐项重构（含最小差异算法）、新执行顺序、工具与迁移脚本 |

### 完成标准
- [ ] `it/wiki/baseline.md` 有真实输出；W-ADR-8 状态改为 Accepted；编辑器结论写入 F3

## 来源规格：Sprint-6 F1 仓库、数据模型与应用骨架

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

> 实现方式：用 JHipster 9 按 `dts-wiki/jhipster/dts-wiki.jdl` 生成单体工程（设计 `../F2-Wiki平台骨架身份与性能/design/02`、`03`）；
> 下表为设计意图摘要，字段与关系以 JDL 为准。

### 目标
后端、前端、数据库骨架可运行；数据模型一次设计到位（空间、页面树、版本、附件、评论、同步状态、审计），后续 Feature 只加业务。

### 契约定义（数据模型要点，Liquibase 管理）

| 表 | 关键列 | 约束/索引 |
|----|--------|-----------|
| `space` | id, slug, name, description, git_repo_url, created_at | uk(slug) |
| `space_sync_root` | id, space_id, repo_path（如 `worklog`）, mount（空间内挂载点，如 `/worklog`）, branch | uk(space_id, repo_path) |
| `page` | id, space_id, parent_id, title, slug, position, kind(`GIT`/`NATIVE`/`FOLDER`), git_path, current_version_id, sync_status(`SYNCED`/`PENDING`/`CONFLICT`), deleted_at | uk(space_id, git_path) where git_path not null；idx(space_id, parent_id, position) |
| `page_version` | id, page_id, version_no, content_md, content_sha256, author_id, author_name, source(`WEB`/`GIT`/`MERGE`), git_commit, message, created_at | uk(page_id, version_no) |
| `attachment` | id, page_id, filename, mime, size, sha256, storage_key, git_path, created_by | idx(page_id) |
| `comment` | id, page_id, parent_id, author, body_md, anchor(可空，行内评论预留), created_at, resolved_at | idx(page_id) |
| `sync_state` | space_id, repo_path, last_synced_commit, last_run_at, status, message | pk(space_id, repo_path) |
| `sync_conflict` | id, page_id, base_version_id, wiki_version_id, git_blob_sha, git_content_md, detected_at, resolved_by, resolved_at | idx(page_id) |
| `audit_event` | id, time, actor, action, target_type, target_id, detail jsonb | idx(time) |

## 来源规格：Sprint-6 F2 统一登录与产品级权限

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
用现有 Keycloak（realm `yuzhicloud`）登录；权限只到空间（产品）一级，沿用现网角色与组，**切换时用户无感**。

### 契约
| 类型 | 契约 |
|------|------|
| OIDC | client `dts-wiki`：新增 redirect `https://wiki.yuzhicloud.com/login/oauth2/code/keycloak`；开发期另加内网 `http://10.20.0.50:18091/login/oauth2/code/keycloak`（上线后删除） |
| 角色 | `dts-wiki:space-<slug>` 读该空间；`dts-wiki:editor` + 空间读权限 = 可写；`dts-wiki:admin` 全部空间 + 管理功能 |
| API | 所有 `/api/spaces/{slug}/**` 与 `/api/pages/{id}/**` 经 `SpaceAccessPolicy` 校验；无权 → 403 `SPACE_FORBIDDEN`（不泄露页面是否存在：未知 id 与无权同样返回 404） |
