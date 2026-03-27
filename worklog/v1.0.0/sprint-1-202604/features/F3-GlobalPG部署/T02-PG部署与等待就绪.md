# T02: PG 部署与等待就绪

**优先级**: P0
**状态**: READY
**依赖**: T01, F2/T01

## 目标
在 bootstrap install 流程中集成 global-pg 部署，包含密码生成、Helm 安装、等待就绪

## 技术设计

`internal/bootstrap/installer/pg_installer.go`:

```go
type PGInstaller struct {
    helmClient HelmClient
    k8sClient  kubernetes.Interface
    store      store.Store
}

func (p *PGInstaller) Install(ctx context.Context, opts PGOptions) error {
    // 1. 生成随机密码 -> 存入 bbolt + K8s Secret
    // 2. helm install dts-global-pg deploy/helm/dts-middleware/global-pg/
    //    --namespace dts-system --create-namespace
    //    --set auth.postgresPassword=<generated>
    // 3. 等待 StatefulSet ready（轮询 pg_isready，超时 5min）
    // 4. 执行初始 DDL（CREATE SCHEMA IF NOT EXISTS infra）
    // 5. 更新 InstallState -> pg_ready
}
```

使用 Helm SDK（`helm.sh/helm/v3`）进行编程式 Helm 操作，不依赖 helm CLI。

## 影响范围
- `internal/bootstrap/installer/pg_installer.go` — PG 安装逻辑
- `internal/bootstrap/installer/helm_client.go` — Helm SDK 封装
- `cmd/bootstrap/main.go` — install 子命令集成

## 验证
- [ ] `dts-bootstrap install` 在 kind 集群成功部署 PG
- [ ] PG 密码存储在 bbolt 和 K8s Secret 中
- [ ] `psql` 可连接并查看 infra schema
- [ ] 重复执行 install 幂等（不报错）

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 3 (Data Security) | PG password must not appear in logs or LLM context | Generated password must be masked in all log output (replace with `***`); password must not be passed via CLI args (visible in /proc); use env vars or file-based secret injection only |
| Law 4 (Audit Trail) | Deployment operation must be audit-logged to bbolt | Each step (password generation, helm install, wait ready, DDL execution) must write an AuditRecord to bbolt audit_log bucket with timestamp, action, and result (success/failure) |

## 完成标准
- [ ] PG 部署全自动，无需手工干预
- [ ] 幂等性：已安装时跳过
- [ ] 超时和错误处理完善
- [ ] PG 密码不出现在日志或命令行参数中 (铁律 3)
- [ ] 每步操作写入 bbolt audit_log (铁律 4)
