# T03: Bootstrap 部署 Commander 与交接验证

**优先级**: P0
**状态**: READY
**依赖**: T02, F3/T02

## 目标
实现 bootstrap install 的最后一步：部署 commander 到 K8s 并验证交接成功

## 技术设计

`internal/bootstrap/installer/commander_installer.go`:

```go
func (c *CommanderInstaller) Install(ctx context.Context) error {
    // 1. 从 bbolt 读取 PG 连接信息
    // 2. helm install dts-commander deploy/helm/dts-infra/
    //    --namespace dts-system
    //    --set commander.pgSecretRef=dts-global-pg-credentials
    // 3. 等待 Deployment ready（Pod running + readiness probe pass）
    // 4. 验证 gRPC health：grpc.health.v1.Health/Check == SERVING
    // 5. 验证 ClusterService.GetStatus 返回正常
    // 6. 更新 InstallState -> done
    // 7. 输出交接信息：
    //    "Commander is ready at dts-commander.dts-system.svc:9090"
    //    "Use 'dts cluster status' to manage your DTS platform"
}
```

`dts-bootstrap install` 完整流程整合：
```
install = precheck → deploy_pg → wait_pg → deploy_commander → wait_commander → done
```

每步更新 InstallState，支持从中断处恢复（幂等）。

## 影响范围
- `internal/bootstrap/installer/commander_installer.go` — commander 安装逻辑
- `internal/bootstrap/installer/orchestrator.go` — 安装流程编排
- `cmd/bootstrap/main.go` — install 子命令最终集成

## 验证
- [ ] `dts-bootstrap install` 在 kind 集群端到端执行成功
- [ ] 中途 kill bootstrap 后重新执行可从断点恢复
- [ ] 完成后 commander gRPC/HTTP 均可访问
- [ ] `dts-bootstrap status` 显示 "done"
- [ ] `dts-bootstrap reset` 可清理全部资源后重装

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 4 (Audit Trail) | All bootstrap operations must be audit-logged to bbolt | Every install step (precheck, pg_deploy, pg_wait, commander_deploy, commander_wait, handoff) must write an AuditRecord to bbolt audit_log bucket with timestamp, action, actor="bootstrap", and result |
| Law 4 (Audit Trail) | On commander ready, sync bootstrap audit to commander PG | After commander health check passes, call `store.ListAuditRecords()` and insert all records into `infra.audit_log` table in commander PG; mark records as synced via `store.MarkSynced()` |
| Law 2 (Security) | Bootstrap emergency repair path documented | `dts-bootstrap repair` subcommand must be documented (even if not fully implemented in Sprint-1); defines how to recover when commander is down but bootstrap still has bbolt state; emergency access must also be audit-logged |

## 完成标准
- [ ] 全流程自动化，零手工干预
- [ ] 幂等性：重复执行不出错
- [ ] 断点恢复：从最近成功步骤继续
- [ ] 超时处理：每步有独立超时（precheck 30s, pg 5min, commander 3min）
- [ ] 每步操作写入 bbolt audit_log (铁律 4)
- [ ] Commander 就绪后 bootstrap 审计记录同步到 PG (铁律 4)
- [ ] Bootstrap emergency repair 路径已文档化 (铁律 2)
