# T02: Commander Helm Chart + Dockerfile

**优先级**: P0
**状态**: READY
**依赖**: T01

## 目标
创建 commander 的容器化构建和 K8s 部署配置

## 技术设计

**Dockerfile** (`builds/commander.Dockerfile`):
```dockerfile
# 多阶段构建
FROM golang:1.22-alpine AS builder
# ... build commander binary

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/commander /commander
ENTRYPOINT ["/commander"]
```

**Dockerfile** (`builds/bootstrap.Dockerfile`):
```dockerfile
# bootstrap 不需要容器化（运行在集群外），但提供可选镜像
FROM golang:1.22-alpine AS builder
# ... build bootstrap binary

FROM alpine:3.19
COPY --from=builder /app/bootstrap /usr/local/bin/dts-bootstrap
ENTRYPOINT ["dts-bootstrap"]
```

**Helm Chart** (`deploy/helm/dts-infra/`):
```yaml
# values.yaml
commander:
  image:
    repository: billyhotjava/dts-commander
    tag: "latest"
  replicas: 1
  resources:
    requests: { cpu: 100m, memory: 128Mi }
    limits: { cpu: 500m, memory: 256Mi }
  env:
    PG_HOST: dts-global-pg.dts-system.svc
    PG_PORT: "5432"
    PG_DATABASE: dts
    PG_SCHEMA: infra
    GRPC_PORT: "9090"
    HTTP_PORT: "8080"
  pgSecretRef: dts-global-pg-credentials
```

Chart 包含: Deployment, Service (ClusterIP), ServiceAccount, ConfigMap, readiness/liveness probes

## 影响范围
- `builds/commander.Dockerfile` — 新建
- `builds/bootstrap.Dockerfile` — 新建
- `deploy/helm/dts-infra/` — 新建完整 chart

## 验证
- [ ] `docker build -f builds/commander.Dockerfile .` 成功
- [ ] `helm lint deploy/helm/dts-infra/` 通过
- [ ] `helm template` 输出有效 manifests
- [ ] 镜像启动后 health check 通过

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 3 (Data Security) | Helm values must not contain plaintext secrets | `values.yaml` must reference secrets via `pgSecretRef` (K8s Secret name), never inline passwords; document that secrets are created by bootstrap, not by helm install |
| Law 2 (Security) | Image must not include debug tools in production | Commander image uses `distroless/static` base — no shell, no curl, no debug utilities; bootstrap image (alpine-based) is acceptable as it runs outside the cluster during install only |

## 完成标准
- [ ] 多阶段构建，最终镜像基于 distroless
- [ ] Helm chart 支持自定义资源和副本数
- [ ] values.yaml 无明文密码，仅 Secret 引用 (铁律 3)
- [ ] Commander 生产镜像无调试工具 (铁律 2)
