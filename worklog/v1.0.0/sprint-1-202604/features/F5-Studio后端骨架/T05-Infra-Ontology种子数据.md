# T05: Infra Ontology 种子数据

**优先级**: P1
**状态**: READY
**依赖**: T04

## 目标
定义基础设施 Ontology 种子数据（ObjectTypes + Relationships），为 commander 自愈能力奠基

## 技术设计

在 `.memory/ontology/industry/infra/` 下创建种子数据文件：

```yaml
# domain-knowledge.md — Infra 领域知识文档

# object-types.yaml — 6 个 ObjectTypes
infra/Node:
  properties:
    - {name: cpu_total, type: float, unit: cores}
    - {name: cpu_used, type: float, unit: cores}
    - {name: memory_total, type: int, unit: bytes}
    - {name: memory_used, type: int, unit: bytes}
    - {name: disk_total, type: int, unit: bytes}
    - {name: disk_used, type: int, unit: bytes}
    - {name: os, type: string}
    - {name: kernel, type: string}

infra/Pod:
  properties:
    - {name: name, type: string}
    - {name: namespace, type: string}
    - {name: status, type: enum, values: [Running, Pending, Failed, Succeeded]}
    - {name: restarts, type: int}
    - {name: cpu_request, type: float, unit: cores}
    - {name: memory_request, type: int, unit: bytes}

infra/Deployment:
  properties:
    - {name: name, type: string}
    - {name: namespace, type: string}
    - {name: replicas_desired, type: int}
    - {name: replicas_ready, type: int}
    - {name: image, type: string}
    - {name: version, type: string}

infra/DtsService:
  properties:
    - {name: name, type: string}
    - {name: module, type: enum, values: [infra, studio, stack, apppack]}
    - {name: kind, type: enum, values: [middleware, platform, apppack]}
    - {name: version, type: string}
    - {name: health, type: enum, values: [healthy, degraded, unhealthy, unknown]}
    - {name: latency_p95, type: float, unit: ms}
    - {name: error_rate, type: float, unit: percent}

infra/Middleware:
  properties:
    - {name: type, type: enum, values: [postgresql, kafka, clickhouse, neo4j, minio, keycloak]}
    - {name: version, type: string}
    - {name: connections_active, type: int}
    - {name: storage_used, type: int, unit: bytes}

infra/PersistentVolume:
  properties:
    - {name: capacity, type: int, unit: bytes}
    - {name: used, type: int, unit: bytes}
    - {name: storage_class, type: string}
    - {name: status, type: enum, values: [Bound, Available, Released]}

# relationships.yaml
relationships:
  - {name: hosts, source: infra/Node, target: infra/Pod, cardinality: one-to-many}
  - {name: belongs_to, source: infra/Pod, target: infra/Deployment, cardinality: many-to-one}
  - {name: implements, source: infra/Deployment, target: infra/DtsService, cardinality: one-to-one}
  - {name: depends_on, source: infra/DtsService, target: infra/DtsService, cardinality: many-to-many}
  - {name: uses, source: infra/DtsService, target: infra/Middleware, cardinality: many-to-many}
  - {name: runs_on, source: infra/Middleware, target: infra/Node, cardinality: many-to-one}
  - {name: bound_to, source: infra/PersistentVolume, target: infra/Pod, cardinality: one-to-one}
```

提供导入脚本：`backend/scripts/seed_infra_ontology.py`
- 读取 YAML → 插入到 object_types + relationships 表

## 影响范围
- `.memory/ontology/industry/infra/` — 新建 3 个文件
- `backend/scripts/seed_infra_ontology.py` — 种子数据导入脚本

## 铁律合规
- Law 3: 种子数据为 PUBLIC 级别（通用基础设施模型，不含具体部署信息）
- Law 4: 导入操作记录审计日志
- Law 5: 种子数据可通过 API 或脚本导入，不依赖 UI

## 验证
- [ ] 6 个 ObjectTypes 导入成功
- [ ] 7 个 Relationships 导入成功
- [ ] GET /api/v1/ontology/types?namespace=infra 返回 6 条（需先实现此端点查询）
- [ ] 数据与设计文档 Section 18.2 一致

## 完成标准
- [ ] YAML 种子文件完整
- [ ] 导入脚本可执行
- [ ] 数据一致性校验通过
