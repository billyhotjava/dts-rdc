# F5: Studio 后端骨架

**优先级**: P0
**状态**: READY

## 目标
搭建 dts-studio Python(FastAPI) 后端服务，实现 Rules/Skills CRUD API，预留 Ontology + DataBinding 数据模型

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | FastAPI 项目初始化 | P0 | READY | F3/T02 (global-pg) |
| T02 | Rules CRUD API | P0 | READY | T01 |
| T03 | Skills CRUD API | P0 | READY | T01 |
| T04 | Ontology + DataBinding 模型预留 | P1 | READY | T01 |
| T05 | Infra Ontology 种子数据 | P1 | READY | T04 |

## 完成标准
- [ ] FastAPI 服务连接 global-pg (schema: studio)，启动正常
- [ ] Rules CRUD: 创建/读取/更新/删除/版本化 规则
- [ ] Skills CRUD: 创建/读取/更新/删除/生命周期管理
- [ ] DB 中 object_types, data_bindings, quality_bindings 表已创建（空数据）
- [ ] infra/* 命名空间 ObjectTypes 种子数据可导入
- [ ] 所有 API 遵循铁律 5（API-first，无前端）

## 铁律合规
- Law 2: API 端点需验证 JWT（Keycloak，可暂用简化验证，后续对接）
- Law 3: Rules/Skills 内容不含业务数据，分类为 INTERNAL
- Law 4: 所有 CRUD 操作记录审计日志（studio schema audit 表）
- Law 5: 纯 API，无前端；所有端点有 OpenAPI 文档 + 测试
