# T01: GlobalPG Helm Chart

**优先级**: P0
**状态**: READY
**依赖**: F1/T01

## 目标
创建 global-pg 的 Helm chart，部署 PostgreSQL 16 作为 DTS 全局配置库

## 技术设计

`deploy/helm/dts-middleware/global-pg/` Helm chart:

```yaml
# values.yaml 核心配置
image:
  repository: postgres
  tag: "16-alpine"
storage:
  size: 10Gi
  storageClass: ""          # 使用集群默认
resources:
  requests: { cpu: 250m, memory: 512Mi }
  limits: { cpu: 1000m, memory: 1Gi }
auth:
  postgresPassword: ""      # 必填，bootstrap 生成随机密码
  database: dts
initSchemas:
  - infra                   # commander 用
  - keycloak                # 预留
```

包含:
- StatefulSet（单副本起步，生产可扩展）
- Service（ClusterIP）
- PVC（持久化）
- ConfigMap（postgresql.conf 优化参数）
- Secret（密码）
- initdb SQL（创建 schemas + 扩展 pgcrypto）
- readiness probe（pg_isready）

## 影响范围
- `deploy/helm/dts-middleware/global-pg/` — 新建完整 chart

## 验证
- [ ] `helm lint` 通过
- [ ] `helm template` 输出有效 K8s manifests
- [ ] 在 kind 集群 `helm install` 成功，PG 可连接
- [ ] infra schema 存在

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 4 (Audit Trail) | Infra schema must include `audit_log` table with append-only constraints | initdb SQL must create `infra.audit_log` table; apply PG rule or trigger to deny DELETE/UPDATE on this table; columns: id (BIGSERIAL), timestamp, actor, action, resource_type, resource_id, detail (JSONB) |
| Law 3 (Data Security) | PG credentials classified as CONFIDENTIAL | `auth.postgresPassword` must be stored in K8s Secret (not ConfigMap); values.yaml must NOT contain plaintext passwords; document that password is generated at runtime by bootstrap |
| Ontology Prep | initdb must create `data_bindings` and `quality_bindings` tables | Add `infra.data_bindings` (type, source, target, config JSONB) and `infra.quality_bindings` (binding_id, rule, threshold) tables in initdb SQL as ontology DataBinding persistence layer |

## 完成标准
- [ ] Chart 符合 Helm 最佳实践
- [ ] 支持自定义 storageClass 和资源配额
- [ ] infra.audit_log 表存在且有 append-only 约束 (铁律 4)
- [ ] 密码仅存在于 K8s Secret，values.yaml 无明文密码 (铁律 3)
- [ ] infra.data_bindings 和 infra.quality_bindings 表存在 (本体准备)
