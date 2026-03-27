# Sprint-1 集成测试

## 测试环境
- kind 集群（单节点，K8s >= 1.27）
- 本地 Docker registry

## 端到端验证场景

### E2E-1: 全新安装
```bash
# 1. 创建 kind 集群
kind create cluster --name dts-test

# 2. 执行预检
dts-bootstrap precheck
# 预期: 全部 PASS

# 3. 执行安装
dts-bootstrap install
# 预期: global-pg ready → commander ready → "done"

# 4. 验证 commander
grpcurl -plaintext <commander-svc>:9090 grpc.health.v1.Health/Check
# 预期: SERVING

# 5. 验证状态
dts-bootstrap status
# 预期: phase=done
```

### E2E-2: 断点恢复
```bash
# 1. 安装过程中在 PG 部署阶段 kill bootstrap
# 2. 重新执行 dts-bootstrap install
# 预期: 跳过 precheck，从 PG 等待就绪继续
```

### E2E-3: 清理重装
```bash
# 1. dts-bootstrap reset
# 预期: 删除 commander + PG + namespace
# 2. dts-bootstrap install
# 预期: 全新安装成功
```

### E2E-4: AI mode switch test
```bash
# 1. 设置 ai-mode=disabled
dts-bootstrap install --ai-mode=disabled

# 2. 验证 commander 功能正常（无 AI 依赖）
grpcurl -plaintext <commander-svc>:9090 grpc.health.v1.Health/Check
# 预期: SERVING — commander 独立运行，不依赖任何 Python AI 服务

# 3. 验证 AI 相关端点返回降级响应
# 预期: AI 功能关闭，系统照常可用（铁律 1: 人工随时可接管）
```

### E2E-5: Audit trail verification
```bash
# 1. 执行完整 bootstrap 流程
dts-bootstrap install

# 2. 检查 bbolt 本地审计日志
dts-bootstrap audit list
# 预期: 所有 bootstrap 操作（precheck/deploy-pg/deploy-commander）均有记录

# 3. 验证审计日志同步到 commander PG
psql -h <global-pg-svc> -U dts -d dts_audit -c "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;"
# 预期: bbolt 中的记录已同步到 PG，append-only 不可篡改（铁律 4: 全操作可追溯）
```

### E2E-6: Security - commander rejects unauthenticated gRPC calls
```bash
# 1. 发送无认证 gRPC 请求到 commander 业务接口
grpcurl -plaintext <commander-svc>:9090 dts.commander.v1.ComponentService/List
# 预期: 返回 UNAUTHENTICATED 错误

# 2. 发送带有效 token 的 gRPC 请求
grpcurl -plaintext -H "authorization: Bearer <valid-token>" <commander-svc>:9090 dts.commander.v1.ComponentService/List
# 预期: 返回正常响应（铁律 2: 核心安全不可绕过）
```

## 测试结果记录

| 场景 | 日期 | 结果 | 备注 |
|------|------|------|------|
| E2E-1 | - | - | - |
| E2E-2 | - | - | - |
| E2E-3 | - | - | - |
| E2E-4 | - | - | - |
| E2E-5 | - | - | - |
| E2E-6 | - | - | - |
