# DTS — AI Decision Operating System

> Decision Twins System: Ontology + Intent + Agent
> 把专家脑中的隐性经验变成系统里能自动运转的能力包
> RDC = Research Development Center (研发中心)

## Five Iron Laws (五条铁律 — 最高优先级)

1. **人工随时可接管** — 关掉 AI 系统照样能用。Python 服务全部可降级，Java 层独立运行。
2. **核心安全不可绕过** — 所有请求必经 dts-gateway 认证，无旁路直连，AppPack 无特权。
3. **数据安全是基因** — 所有数据出口必经 dts-data-security（含 AI RAG 检索），AI 只看授权数据。
4. **全操作可追溯** — 人和 AI 的操作 → Kafka → dts-audit-log，append-only 不可篡改。
5. **能力先于界面** — API-first，每个服务先有完整 API + 测试，再做前端。

## Architecture

### Four-Module Platform
- **dts-infra** (Go): 基础设施平台 — dts-bootstrap (安装引导) + dts-commander (运维中枢)
- **dts-studio** (Python+React): 设计中心 — Rules/Skills/Ontology/DataBinding 管理
- **dts-stack** (Java+Python): Agent 能力中心 — 25 微服务 (10 Java + 10 Python + 3 Frontend)
- **app-stack**: 客户 Agent 中心 — 行业能力包 (metro-stack, prs-stack, ...)

### Tech Stack
- **Communication**: gRPC (control plane) + Kafka KRaft (data plane)
- **Storage**: Global PG (config) + ClickHouse (analytics) + Neo4j CE + pgvector + MinIO
- **Auth**: Keycloak (global identity platform) + JWT propagation
- **Observability**: OpenTelemetry + Grafana (Tempo/Prometheus/Loki)
- **Deployment**: All-in-K8s, online/offline unified architecture
- **AI-Native**: Infrastructure as Ontology — DTS 用自己管理自己

## Rules & Skills

详细规则和技能定义在 `dts-studio/` 仓库中，开发前必须阅读对应层级的规则：

### dts-studio/.rules/ — 工作守则 (23 rule files)
- `00-foundation/` — 五条铁律 + 产品理念 (**HIGHEST priority**)
- `10-architecture/` — 架构原则 + 服务边界 + AppPack 协议 + **Infra 铁律应用**
- `20-development/` — 编码规范 + Git 工作流 + API 设计 + 依赖策略
- `30-testing/` — 测试策略 + 质量门禁 (PR/Nightly/Release)
- `40-deployment/` — K8s 部署运维 + 发布流程
- `50-appstack/` — Pack 开发指南 + 行业规则 (energy/research/manufacturing)
- `60-skills/` — AI 技能设计规范 + 分类体系 + 生命周期
- `90-process/` — worklog 组织规范

### dts-studio/.skills/ — 技能清单 (57 skills, placeholder)
- `00-platform/` — 17 个平台内置技能 (data/ontology/query/governance/report/action)
- `10-data/` — 6 个数据层技能 (connector/quality)
- `20-ai/` — 9 个 AI 核心技能 (agent/eval)
- `30-industry/` — 18 个行业技能 (energy/research/manufacturing)
- `40-devops/` — 7 个运维技能

## Project Structure

```
/opt/prod/dts/dts-rdc/           # RDC = Research Development Center
├── dts-infra/                   # 基础设施平台 (submodule, Go)
├── dts-studio/                 # 设计中心 (submodule, Python+React)
│   ├── .rules/                  # 工作守则 (23 rule files)
│   ├── .skills/                 # 技能清单 (57 skills)
│   └── .memory/                 # 领域知识 (ontology/conversations/decisions)
├── dts-stack/                   # Agent 能力中心 (submodule, Java+Python)
├── dts-app-stack/               # 客户 Agent 中心 (submodule)
├── worklog/                     # 工作日志 (sprint-workflow 格式)
│   └── v1.0.0/                  # 当前版本工作记录
│       ├── sprint-queue.md      # Sprint 全局队列
│       ├── sprint-{N}-{YYYYMM}/ # Sprint 目录 (Feature > Task > IT)
│       ├── docs/                # 设计文档 / 计划
│       ├── draft/               # 旧版 sprint 归档
│       └── evolution/           # 产品文档
└── CLAUDE.md                    # 本文件 — 项目入口
```

## Key References

- Infra design: `worklog/v1.0.0/docs/plans/2026-03-26-dts-infra-design.md`
- Architecture design: `worklog/v1.0.0/docs/plans/2026-03-11-ai-decision-os-design.md`
- Infra iron laws: `dts-studio/.rules/10-architecture/infra-iron-laws.rules`
- Product docs: `~/Documents/dts/` (商业计划书, 产品介绍, Palantir 分析)
- Memory: `~/.claude/projects/-opt-prod-dts-dts-rdc/memory/`

## Working Language

- 与用户交流使用中文
- 代码注释和文档使用英文
- 规则文件使用英文（技术标准化）
