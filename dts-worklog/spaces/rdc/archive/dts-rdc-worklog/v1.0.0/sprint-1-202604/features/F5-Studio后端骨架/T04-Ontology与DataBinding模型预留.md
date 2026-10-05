# T04: Ontology + DataBinding 模型预留

**优先级**: P1
**状态**: READY
**依赖**: T01

## 目标
在 studio DB 中创建 Ontology 和 DataBinding 相关表，预留 API 骨架，暂不实现完整业务逻辑

## 技术设计

数据模型（建表，API 为空壳）：

```python
class ObjectType(Base):
    id: UUID
    namespace: str          # infra / energy / mfg / research
    name: str               # e.g. "Node", "Transformer"
    full_name: str          # namespace/name
    properties: JSON        # [{name, type, unit, description}]
    description: str
    version: str
    status: str             # draft / active / deprecated
    created_at: datetime

class Relationship(Base):
    id: UUID
    name: str               # e.g. "hosts", "depends_on"
    source_type: str        # ObjectType full_name
    target_type: str
    cardinality: str        # one-to-one / one-to-many / many-to-many
    description: str

class DataBinding(Base):
    id: UUID
    object_type_id: UUID    # FK → ObjectType
    version: str
    spec: JSON              # 完整绑定规范 (YAML → JSON)
    status: str             # draft / active / deprecated
    created_at: datetime

class BindingSource(Base):
    id: UUID
    binding_id: UUID        # FK → DataBinding
    source_id: str
    source_type: str        # jdbc / opc-ua / rest-api / kafka / file / kubernetes / prometheus / loki
    connection_ref: str
    config: JSON
    sync_policy: JSON

class PropertyMapping(Base):
    id: UUID
    binding_id: UUID
    property_name: str
    source_id: str
    expression: str
    mapping_type: str       # direct / computed / ai_inferred
    config: JSON            # unit_transform, dependencies, skill_ref

class QualityBinding(Base):
    id: UUID
    binding_id: UUID
    property_name: str
    rules: JSON             # [{type, threshold/skill_ref, action_type}]
                            # action_type supports: alert / self-healing
```

API 骨架（仅注册路由，返回 501 Not Implemented）：
```
GET    /api/v1/ontology/types           # 501
POST   /api/v1/ontology/types           # 501
GET    /api/v1/ontology/relationships   # 501
GET    /api/v1/bindings                 # 501
POST   /api/v1/bindings                 # 501
```

## 影响范围
- Alembic migration — 创建 6 张表
- `src/dts_studio/api/ontology.py` — 空壳路由

## 铁律合规
- Law 3: DataBinding 中 connection_ref 字段指向连接配置，不存储实际密码
- Law 3: source_type 支持 kubernetes/prometheus/loki（infra 数据源）
- Law 5: 表结构先于 API 实现，API 骨架先于前端

## 验证
- [ ] Alembic migration 成功创建 6 张表
- [ ] API 端点返回 501 Not Implemented
- [ ] source_type enum 包含 kubernetes/prometheus/loki

## 完成标准
- [ ] 表结构正确，支持 infra/* 命名空间
- [ ] API 路由注册完成（占位）
