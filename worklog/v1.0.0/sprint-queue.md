# Sprint Queue — DTS v1.0.0

## Sprint-1: dts-infra bootstrap (202604)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| F1-仓库初始化与项目骨架 | 3 | READY |
| F2-环境预检 | 2 | READY |
| F3-GlobalPG部署 | 2 | READY |
| F4-Commander部署与交接 | 3 | READY |
| F5-Studio后端骨架 | 5 | READY |

**统计**: READY=5, IN_PROGRESS=0, DONE=0, BLOCKED=0

---

## Sprint-2: dts-infra commander (202605)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| F1-中间件生命周期管理 | TBD | READY |
| F2-Platform组件管理 | TBD | READY |
| F3-健康巡检与告警 | TBD | READY |
| F4-InfraAgent基础能力 | TBD | READY |
| F5-Commander CLI客户端 | TBD | READY |

**统计**: READY=5, IN_PROGRESS=0, DONE=0, BLOCKED=0

---

## Sprint-3: dts-stack 第一版原型 (202606)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| TBD | TBD | READY |

**统计**: READY=0, IN_PROGRESS=0, DONE=0, BLOCKED=0

---

## Sprint-4: app-stack 第一版原型 (202607)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| TBD | TBD | READY |

**统计**: READY=0, IN_PROGRESS=0, DONE=0, BLOCKED=0

---

> 注：Sprint-1 ~ Sprint-4 为 2026-03 的规划，均未执行；目标架构调整后由 Sprint-5 取代或重排（2026-09-25）。

## Sprint-5: DTS 四模块合并与边界重整 (202610)

**目录**: `worklog/v1.0.0/sprint-5-202610`
**状态**: DRAFT
**目标**: dts-studio（并入 copilot 引擎）运行时加载 prs-stack 的花卉 AppPack，经统一网关登录后在工作台完成"当前在营项目数"问数：受控出口（只读 + 租户隔离 + AST 校验）、审计进入 Kafka、结果与合并前基线一致、头脑中不含花卉硬编码。
**依赖**: copilot S1–S34（引擎与证据链）、prs Sprint-1（F3 Keycloak / F7 骨架 / R-008 / R-010）、stack governance 指标（copilot S29 联邦）。

| Feature | 优先级 | 波次 | Task 数 | 状态 |
|---------|--------|------|---------|------|
| F0-G0基线与权威源确认 | P0 | A | 4 | DRAFT |
| F1-仓库落位与submodule重整 | P0 | A | 6 | READY(4)/DRAFT(2) |
| F2-架构决策定稿与规则体系修订 | P0 | A | 7 | DRAFT |
| F3-copilot并入dts-studio | P0 | A | 6 | DRAFT |
| F4-AppPack协议落地与头脑Pack运行时 | P0 | B | 7 | DRAFT |
| F5-花卉领域资产外置为prs-pack | P0 | B | 7 | DRAFT |
| F6-Finance证明链去领域化 | P1 | C | 6 | DRAFT |
| F7-BI收敛-copilot-analytics并回stack | P1 | C | 6 | DRAFT |
| F8-口径与指标单一事实源 | P1 | B | 5 | DRAFT |
| F9-统一身份网关与租户上下文 | P0 | B | 6 | DRAFT |
| F10-数据出口安全-受控查询网关 | P0 | B | 7 | DRAFT |
| F11-审计统一入Kafka | P1 | C | 5 | DRAFT |
| F12-DAP协议代码化与AgentUI契约 | P1 | B | 5 | DRAFT |
| F13-端到端竖线验收发布与运维 | P0 | C | 5 | DRAFT |

**统计**: Feature 14 / Task 82；READY=4, DRAFT=78, IN_PROGRESS=0, DONE=0, BLOCKED=0
**执行顺序**: 波次 A（F0→F1→F2→F3）→ 波次 B（F4→F5；F9→F10；F8 ∥ F12）→ 波次 C（F6、F7、F11 → F13）
**关键决策**: ADR-1..4 已定（rdc 总纲 / stack 湖仓 / studio+copilot 合并 / prs 进入 app-stack）；ADR-5..12 提议中，由 F2 定稿（推荐：Java 头脑、BI 归 stack、口径 SoT 归 stack、Traefik+forwardAuth 网关、QueryGateway 出口）。
**已知风险**: stack 权威仓库不明（账本#2/#3）；prs Sprint-1 进行中，需要避免干扰；F6 工作量大，可能溢出到 Sprint-6；copilot 旧部署的外部依赖方（老 rs-gateway、prs F7/T04）需要在切换时协调。
