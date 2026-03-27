# T01: FastAPI 项目初始化

**优先级**: P0
**状态**: READY
**依赖**: F3/T02 (global-pg 就绪)

## 目标
创建 dts-studio Python 后端项目，连接 global-pg，建立基础框架

## 技术设计

在 dts-studio 仓库中创建后端项目（studio 仓库已存在 `github.com/billyhotjava/dts-studio`）：

```
studio/
├── backend/                    # FastAPI 后端
│   ├── pyproject.toml          # uv 管理，Python >= 3.12
│   ├── src/
│   │   └── dts_studio/
│   │       ├── __init__.py
│   │       ├── main.py         # FastAPI app 入口
│   │       ├── config.py       # 配置（PG 连接、JWT 等）
│   │       ├── db/
│   │       │   ├── engine.py   # SQLAlchemy async engine
│   │       │   ├── migrate.py  # Alembic migration
│   │       │   └── models.py   # ORM models
│   │       ├── api/
│   │       │   ├── rules.py
│   │       │   ├── skills.py
│   │       │   ├── ontology.py # placeholder
│   │       │   └── health.py
│   │       ├── auth/
│   │       │   └── jwt.py      # Keycloak JWT 验证
│   │       └── audit/
│   │           └── logger.py   # 审计日志（append-only）
│   └── tests/
├── .rules/                     # 现有规则文件（不动）
├── .skills/                    # 现有技能文件（不动）
└── .memory/                    # 现有知识文件（不动）
```

核心依赖：
- `fastapi` + `uvicorn` — Web 框架
- `sqlalchemy[asyncio]` + `asyncpg` — 异步 PG
- `alembic` — DB migration
- `pyjwt` + `cryptography` — JWT 验证
- `pydantic` — 数据校验

PG 连接：global-pg 的 `studio` schema

## 影响范围
- studio 仓库新增 `backend/` 目录
- global-pg 需创建 `studio` schema（由 Alembic migration 处理）

## 铁律合规
- Law 2: JWT 验证中间件，所有 API 端点需认证（/health 除外）
- Law 4: 审计中间件，所有写操作自动记录到 audit 表
- Law 5: 纯 API 服务，OpenAPI 文档自动生成（FastAPI 内置）

## 验证
- [ ] `uv run uvicorn dts_studio.main:app` 启动成功
- [ ] `GET /health` 返回 200 + PG 连接状态
- [ ] `GET /docs` 显示 OpenAPI 文档
- [ ] Alembic migration 创建 studio schema 成功

## 完成标准
- [ ] FastAPI 项目结构完整
- [ ] PG 连接 + migration 框架可用
- [ ] JWT 验证中间件就位
- [ ] 审计日志中间件就位
