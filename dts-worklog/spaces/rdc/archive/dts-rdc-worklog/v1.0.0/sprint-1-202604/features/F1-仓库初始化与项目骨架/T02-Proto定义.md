# T02: Proto 定义（infra/v1）

**优先级**: P0
**状态**: READY
**依赖**: T01

## 目标
定义 commander 管理 API 的 gRPC proto 文件，并配置 buf 代码生成

## 技术设计

在 `proto/infra/v1/` 下创建 7 个 proto 文件：

```protobuf
// cluster.proto   — ClusterService (GetStatus, GetTopology, UpgradeCommander, Backup, Restore)
// component.proto — ComponentService (List, Get, Deploy, Remove, Upgrade, Rollback, Scale, Health, Logs)
// pack.proto      — PackService (Import, List, Deploy, Upgrade, Uninstall, Approve, Reject)
// bundle.proto    — BundleService (Create, Import, List)
// pipeline.proto  — PipelineService (Build, Publish, ListBuilds)
// audit.proto     — InfraAuditService (Query)
// agent.proto     — InfraAgentService (Chat, Diagnose, PlanUpgrade, ReviewPack, AnalyzeTrend)
```

配置 `buf.yaml` + `buf.gen.yaml`：
- Go 代码生成到 `gen/infra/v1/`
- gRPC-Go 代码生成

## 影响范围
- `proto/infra/v1/*.proto` — 新建
- `buf.yaml`, `buf.gen.yaml` — 新建
- `gen/` — 生成代码目录
- Makefile 添加 `proto-gen` target

## 验证
- [ ] `buf lint` 无错误
- [ ] `buf generate` 成功生成 Go 代码
- [ ] 生成的 Go 包可被 internal/ 代码引用
- [ ] proto 内容与设计文档 Section 6.1 一致

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 1 (Human Override) | ComponentService must work without InfraAgentService | All component management RPCs (List, Get, Deploy, Remove, etc.) must be callable independently; agent.proto is AI-only and must not be a dependency of component.proto |
| Law 1 (Human Override) | Proto must include `AiMode` enum | Define `enum AiMode { AI_MODE_DISABLED = 0; AI_MODE_ADVISORY = 1; AI_MODE_AUTONOMOUS = 2; }` in a shared types.proto or cluster.proto; ClusterService.GetStatus response must include current ai_mode |
| Law 4 (Audit Trail) | AuditEntry message must be append-only | InfraAuditService must only expose `Query` RPC — no Update/Delete RPCs allowed; AuditEntry must include immutable fields (id, timestamp, actor, action, resource, detail) |
| Ontology Prep | Proto messages should align with infra/* ontology namespace | Component, Cluster messages map to ontology object types; include `data_bindings` field placeholder for K8s/Prometheus/Loki DataBinding references |

## 完成标准
- [ ] 7 个 proto 文件语法正确
- [ ] buf 工具链配置完整
- [ ] 生成代码可编译
- [ ] AiMode enum 定义存在 (铁律 1)
- [ ] InfraAuditService 仅有 Query RPC，无 Update/Delete (铁律 4)
- [ ] ComponentService 不依赖 InfraAgentService (铁律 1)
