# T02: bbolt 本地存储

**优先级**: P0
**状态**: READY
**依赖**: F1/T01

## 目标
实现 bootstrap 的轻量本地存储，记录安装状态和预检历史

## 技术设计

`internal/bootstrap/store/` 基于 bbolt 实现：

```go
type Store interface {
    SavePrecheckResult(result *PrecheckReport) error
    GetLastPrecheckResult() (*PrecheckReport, error)
    SaveInstallState(state *InstallState) error
    GetInstallState() (*InstallState, error)
    Close() error
}

type InstallState struct {
    Phase     string    // precheck / pg_deploying / pg_ready / commander_deploying / commander_ready / done
    StartedAt time.Time
    UpdatedAt time.Time
    Error     string    // 最近错误信息
}
```

存储文件位置: `~/.dts/bootstrap.db`（可配置）
支持 AES-256 加密（通过 `--encrypt-key` flag 或环境变量）

## 影响范围
- `internal/bootstrap/store/bolt_store.go` — 存储实现
- `internal/bootstrap/store/encrypt.go` — 可选加密层

## 验证
- [ ] 写入/读取预检结果正确
- [ ] 安装状态正确持久化和恢复
- [ ] 加密模式下数据不可明文读取
- [ ] 单元测试覆盖 CRUD + 加密

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 4 (Audit Trail) | Audit records in bbolt must be append-only | Add an `audit_log` bucket in bbolt; records are keyed by monotonic timestamp+sequence; no overwrite or delete operations allowed on this bucket |
| Law 4 (Audit Trail) | Audit sync interface for future commander PG sync | Store interface must include `ListAuditRecords(since time.Time) ([]AuditRecord, error)` and `MarkSynced(upTo time.Time) error` to support bootstrap→commander audit handoff |
| Law 3 (Data Security) | Sensitive data (passwords) must be encrypted even in bbolt | PG credentials and other CONFIDENTIAL data stored in bbolt must use AES-256 encryption (already supported via `--encrypt-key`); ensure password fields are never stored in plaintext buckets |

## 完成标准
- [ ] Store 接口完整实现
- [ ] 加密功能可选启用
- [ ] audit_log bucket 为 append-only，无删改操作 (铁律 4)
- [ ] ListAuditRecords/MarkSynced 接口定义 (铁律 4)
- [ ] 密码等敏感数据在 bbolt 中加密存储 (铁律 3)
