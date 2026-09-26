# F1: 仓库、数据模型与应用骨架

**优先级**: P0 · **状态**: DRAFT

## 目标
后端、前端、数据库骨架可运行；数据模型一次设计到位（空间、页面树、版本、附件、评论、同步状态、审计），后续 Feature 只加业务。

## 契约定义（数据模型要点，Liquibase 管理）

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

## Task 列表
| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 后端骨架（Spring Boot 4、分层、错误信封、健康检查） | P0 | DRAFT | F0/T01 |
| T02 | 数据模型与 Liquibase 基线 | P0 | DRAFT | T01 |
| T03 | 前端骨架（路由、布局、API 客户端生成） | P0 | DRAFT | F0/T01 |
| T04 | 本地开发环境与 CI | P1 | DRAFT | T01–T03 |
