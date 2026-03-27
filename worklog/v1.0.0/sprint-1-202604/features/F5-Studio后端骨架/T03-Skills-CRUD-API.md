# T03: Skills CRUD API

**优先级**: P0
**状态**: READY
**依赖**: T01

## 目标
将 .skills/ 目录下的技能定义管理 API 化，支持生命周期管理

## 技术设计

数据模型：
```python
class Skill(Base):
    id: UUID
    namespace: str         # e.g. "infra", "energy", "platform"
    name: str              # e.g. "diagnose/root-cause-analysis"
    full_name: str         # namespace/name
    type: str              # LLM / Rule / Hybrid / Workflow
    risk_level: str        # low / medium / high / critical
    priority: str          # P0 / P1 / P2
    description: str
    input_schema: JSON     # JSON Schema
    output_schema: JSON
    config: JSON           # model_tier, timeout, context_sources 等
    version: str           # semver
    status: str            # draft / testing / active / deprecated / retired
    created_at: datetime
    updated_at: datetime
    created_by: str
```

API 端点：
```
GET    /api/v1/skills                     # 列表（支持 namespace/status/type 过滤）
GET    /api/v1/skills/{id}                # 详情
POST   /api/v1/skills                     # 创建
PUT    /api/v1/skills/{id}                # 更新
PATCH  /api/v1/skills/{id}/status         # 状态变更（Draft→Testing→Active→Deprecated）
DELETE /api/v1/skills/{id}                # 软删除（→ Retired）
POST   /api/v1/skills/import              # 从 .skills/ 目录批量导入
GET    /api/v1/skills/namespaces          # 列出所有命名空间
```

种子数据：启动时扫描 `.skills/` 目录，导入 57 个技能定义。
命名空间支持：`platform/*`, `infra/*`, `energy/*`, `mfg/*`, `research/*`, `ops/*`

## 影响范围
- `src/dts_studio/api/skills.py` — API 路由
- `src/dts_studio/db/models.py` — Skill 模型
- Alembic migration — 创建 skills 表

## 铁律合规
- Law 1: risk_level 字段不可被 API 绕过设为更低值（只能升不能降，需 admin）
- Law 4: 状态变更全部记录审计日志
- Law 5: 完整 API + OpenAPI 文档

## 验证
- [ ] 创建 skill 成功，status 默认 draft
- [ ] 状态变更链路 draft → testing → active 正常
- [ ] /import 批量导入 57 个技能定义
- [ ] namespace 过滤正确（infra/* 只返回 infra 技能）
- [ ] risk_level 不可被普通用户降低

## 完成标准
- [ ] CRUD + 生命周期 + 批量导入
- [ ] 命名空间支持 infra/*
- [ ] 审计日志完整
