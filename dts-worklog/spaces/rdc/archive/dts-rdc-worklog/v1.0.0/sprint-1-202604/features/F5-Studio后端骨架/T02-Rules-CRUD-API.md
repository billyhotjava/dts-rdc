# T02: Rules CRUD API

**优先级**: P0
**状态**: READY
**依赖**: T01

## 目标
将 .rules/ 目录下的规则文件管理 API 化，支持版本控制

## 技术设计

数据模型：
```python
class Rule(Base):
    id: UUID
    path: str              # e.g. "00-foundation/five-iron-laws"
    category: str          # foundation / architecture / development / testing / ...
    priority: str          # HIGHEST / HIGH / NORMAL
    title: str
    content: str           # 规则正文（Markdown）
    version: int           # 自增版本号
    status: str            # active / draft / deprecated
    created_at: datetime
    updated_at: datetime
    created_by: str        # JWT subject
```

API 端点：
```
GET    /api/v1/rules                  # 列表（支持 category/status 过滤）
GET    /api/v1/rules/{id}             # 详情
GET    /api/v1/rules/{id}/versions    # 版本历史
POST   /api/v1/rules                  # 创建
PUT    /api/v1/rules/{id}             # 更新（自动版本+1）
DELETE /api/v1/rules/{id}             # 软删除（status → deprecated）
POST   /api/v1/rules/import           # 从 .rules/ 目录批量导入
POST   /api/v1/rules/export           # 导出为 .rules/ 目录格式
```

种子数据：启动时扫描 `.rules/` 目录，自动导入已有 22 个规则文件。

## 影响范围
- `src/dts_studio/api/rules.py` — API 路由
- `src/dts_studio/db/models.py` — Rule + RuleVersion 模型
- Alembic migration — 创建 rules, rule_versions 表

## 铁律合规
- Law 4: 规则的每次修改产生新版本记录（不可覆盖旧版本）
- Law 5: API-first，支持 .rules/ 文件双向同步

## 验证
- [ ] POST 创建规则成功
- [ ] PUT 更新后 version 自增，旧版本保留
- [ ] DELETE 后 status 变为 deprecated，数据不删除
- [ ] /import 批量导入 22 个规则文件
- [ ] 审计日志记录所有操作

## 完成标准
- [ ] CRUD + 版本化 + 批量导入导出
- [ ] 审计日志完整
