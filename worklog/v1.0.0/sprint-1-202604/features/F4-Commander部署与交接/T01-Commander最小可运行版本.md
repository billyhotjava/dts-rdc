# T01: Commander 最小可运行版本

**优先级**: P0
**状态**: READY
**依赖**: F1/T01, F1/T02

## 目标
实现 commander 的最小可运行版本：启动 → 连接 PG → 暴露 gRPC health → 就绪

## 技术设计

`cmd/commander/main.go` 启动流程：

```go
func main() {
    // 1. 读取配置（PG 连接串、gRPC 端口、日志级别）
    // 2. 连接 global-pg（schema: infra）
    // 3. 执行 DB migration（schema_migrations 版本表）
    // 4. 启动 gRPC server
    //    - 注册 grpc.health.v1.Health（标准 gRPC 健康检查）
    //    - 注册 ClusterService（仅 GetStatus 返回基础信息）
    // 5. 启动 HTTP server（/healthz, /readyz, /metrics placeholder）
    // 6. 等待 SIGTERM 优雅关闭
}
```

`internal/store/schema.go`:
- 使用 golang-migrate 管理 DB migration
- 初始 migration: 创建 component_state, deploy_history, audit_log 表

此 Task 只实现"活着"，不实现组件管理等业务逻辑。

## 影响范围
- `cmd/commander/main.go` — 启动逻辑
- `internal/store/schema.go` — DDL migration
- `internal/store/repository.go` — 基础 CRUD placeholder

## 验证
- [ ] commander 连接本地 PG 启动成功
- [ ] `grpcurl -plaintext localhost:9090 grpc.health.v1.Health/Check` 返回 SERVING
- [ ] `curl localhost:8080/healthz` 返回 200
- [ ] DB 中 schema_migrations 表存在且版本正确

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 2 (Security) | Commander must validate JWT from Keycloak | Add JWT validation middleware for gRPC and HTTP endpoints; in Sprint-1, support both authenticated mode (JWT required) and bootstrap mode (JWT optional, for initial setup); even before gateway is deployed, commander must not be openly accessible |
| Law 1 (Human Override) | ai-mode config support (default: advisory) | Commander config must include `ai_mode` field (disabled/advisory/autonomous, default: advisory); all component management endpoints must work when ai_mode=disabled; InfraAgent features gated behind ai_mode check |
| Law 4 (Audit Trail) | audit_log table must be append-only, no DELETE/UPDATE | DB migration must create `infra.audit_log` with PG rule/trigger denying DELETE and UPDATE; all commander operations must write audit records |
| Law 3 (Data Security) | /healthz endpoint data classified as PUBLIC | Health/readiness endpoints return only PUBLIC-classified data (status: ok/not-ok); no internal state, PG connection details, or version internals in health response |
| Migration | DB migration must use schema_migrations version table | golang-migrate creates `schema_migrations` table automatically; ensure migration files are numbered sequentially and idempotent |

## 完成标准
- [ ] commander 可独立启动运行
- [ ] gRPC + HTTP 双端口就绪
- [ ] DB migration 框架可用
- [ ] JWT validation middleware 存在 (铁律 2, 可配置为 bootstrap mode)
- [ ] ai_mode 配置项存在，默认 advisory (铁律 1)
- [ ] audit_log 表有 append-only 约束 (铁律 4)
- [ ] /healthz 仅返回 PUBLIC 级别数据 (铁律 3)
