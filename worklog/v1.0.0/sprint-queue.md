# Sprint Queue — DTS v1.0.0

## 迭代节奏规则（2026-09-26 起）

1. **一个自然月一个 Sprint**：目录 `sprint-<N>-<YYYYMM>`，同一个 `YYYYMM` 只能有一个 Sprint；Sprint 不跨月、不延长。
2. **Feature 是稳定的工作流**：一个 Sprint 保持 4–8 个 Feature；新需求、review 发现的问题、设计修订一律**追加为既有 Feature 的 Task**，不临时新建 Feature，更不新建 Sprint。
3. **Backlog 是下一个 Sprint 的已细化待办**：放在 [`backlog/`](backlog/README.md)（`BL-<字母>` Feature），月初整体转入当月 Sprint；不按人力容量把连贯的工作切散到多个月。
4. **月底收尾**：未完成的 Task 退回 backlog 或随 Feature 进入下月 Sprint，在 Sprint README 记录去向；本表更新状态统计。
5. 新增 Feature（含 backlog 的 `BL-*`）须在月度规划评审中确认，并在本表登记。
6. **Sprint 紧凑连贯**：每个 Sprint 是一段按依赖编排的端到端交付（周次按依赖层级排），多个 Feature 并行推进同一条竖线；**不为单个 Feature 开 Sprint**，也不为收尾单独留一个 Sprint。

## 产品能力与交付顺序（2026-09-27）

需求依据：[DTS 产品能力规划](docs/plans/2026-09-27-product-capability-roadmap.md)。稳定能力为 DTS-C01 可信经营数据、C02 授权知识供给、C03 行业能力复用、C04 可评估与人工接管。

- 10 月（Sprint-5）82 Task：定案、落位、copilot 合并；Wiki v1 含 MCP 收口；DTS Console 外壳与全部功能点 UI 原型（F6），10-23 冻结契约 v1；ADR-013 确定“UI 原型先行 → UI 驱动 BFF → 领域模块常规设计”的交付方法。
- 11 月（Sprint-6）backlog 全部 69 Task 连贯完成：W1–W2 Pack/身份/出口/审计底座与 BFF 骨架，W3（11-20）在 Console 上完成 PRS 场景首次受控联调（BL-E/T01 阶段 A），W4 Console 全量切真实数据、BI/Finance 收口、全回归与发布（阶段 B、T02～T04）。v1.0.0 不再安排 Sprint-7。
- Wiki RAG 由 BL-A/T22 在 W2 探索，生产接入按结论另行细化，不列入 v1.0.0 必达。

## Sprint-1: dts-infra bootstrap (202604)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| F1-仓库初始化与项目骨架 | 3 | SUPERSEDED |
| F2-环境预检 | 2 | SUPERSEDED |
| F3-GlobalPG部署 | 2 | SUPERSEDED |
| F4-Commander部署与交接 | 3 | SUPERSEDED |
| F5-Studio后端骨架 | 5 | SUPERSEDED |

**历史统计**: 原 READY=5；当前活动任务=0（未执行，后续重排）

---

## Sprint-2: dts-infra commander (202605)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| F1-中间件生命周期管理 | TBD | SUPERSEDED |
| F2-Platform组件管理 | TBD | SUPERSEDED |
| F3-健康巡检与告警 | TBD | SUPERSEDED |
| F4-InfraAgent基础能力 | TBD | SUPERSEDED |
| F5-Commander CLI客户端 | TBD | SUPERSEDED |

**历史统计**: 原 READY=5；当前活动任务=0（未执行，后续重排）

---

## Sprint-3: dts-stack 第一版原型 (202606)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| TBD | TBD | SUPERSEDED |

**历史统计**: 当前活动任务=0（未执行，后续重排）

---

## Sprint-4: app-stack 第一版原型 (202607)

| Feature | Task 数 | 状态 |
|---------|---------|------|
| TBD | TBD | SUPERSEDED |

**历史统计**: 当前活动任务=0（未执行，后续重排）

---

> 注：Sprint-1 ~ Sprint-4 为 2026-03 的规划，均未执行；目标架构调整后由 Sprint-5 取代或重排（2026-09-25）。

## Sprint-5: 四模块合并落位 + DTS Wiki v1 上线 (202610)

**目录**: `worklog/v1.0.0/sprint-5-202610`
**时间**: 2026-10-01 ～ 2026-10-31
**状态**: IN_PROGRESS
**目标**: A）dts-rdc submodule 指向真实仓库、dts-prs 进入版本控制、ADR-005～010 定稿、copilot 保留历史并入 dts-studio 且回归等价；B）DTS Wiki v1（PG 事实源 + 产品 git 双向同步）在 wiki.yuzhicloud.com 上线替换现网 wiki。
**依赖**: copilot S1–S34（引擎与证据链）、prs Sprint-1（F3 Keycloak / F7 骨架 / R-008 / R-010）；现网 wiki 的同步与权限经验、Keycloak realm yuzhicloud。
**整合记录**: 2026-09-26 由原 Sprint-5（14 Feature/83 Task，跨 10–12 月）与原 Sprint-6（Wiki，10 Feature/39 Task，同为 10 月）合并；11–12 月内容移入 backlog；编号对照 `sprint-5-202610/assets/renumber-20260926.md`。

**产品补充**: 2026-09-27 细化已有 Task 的业务验收与边界，10 月 Task 数不变；backlog 新增 BL-D/T17、BL-A/T22，状态均为 DRAFT。

| Feature | 工作流 | 优先级 | Task 数 | 状态 |
|---------|--------|--------|---------|------|
| F0-基线仓库落位与架构定案 | A | P0 | 19 | IN_PROGRESS（DONE 1 / READY 4 / DRAFT 14） |
| F1-copilot并入dts-studio | A | P0 | 6 | DRAFT |
| F2-Wiki平台骨架身份与性能 | B | P0 | 12 | IN_PROGRESS（DONE 8 / IN_PROGRESS 2 / DRAFT 2） |
| F3-Wiki内容编辑与版本 | B | P0 | 16 | IN_PROGRESS（DONE 10 / READY 2 / DRAFT 3） |
| F4-Wiki-Git双向同步 | B | P0 | 6 | DRAFT |
| F5-Wiki检索协作与上线 | B | P0/P1 | 10 | DRAFT |
| F6-DTS-Console外壳与全量UI原型 | C | P0 | 13 | DRAFT（READY 4 / DRAFT 9） |

**统计**: Feature 7 / Task 82；READY=11, IN_PROGRESS=2, DONE=19, DRAFT=50, BLOCKED=0（按当前 Task 状态汇总）
**执行顺序**: A：F0 → F1；B：F2 → F3 → F4 → F5（执行顺序以 `F2/design/10` §5 为准）；A、B 并行。
**关键决策**: ADR-1..4 已定；ADR-5..10 本月定稿（推荐：Java 头脑、BI 归 stack、口径 SoT 归 stack、Traefik+forwardAuth、QueryGateway）；Wiki：PG 事实源、JHipster 9 + antd、DTS-MD v1 内容契约、权限仅到产品级。
**已知风险**: stack 权威仓库不明（账本#2/#3）；prs Sprint-1 进行中需避免干扰；Wiki 各同步仓库 deploy key 需用户在 GitHub 添加；.50 不可 docker pull。

---

## Backlog（v1.0.0）

**目录**: `worklog/v1.0.0/backlog`（规则见其 README）

| 序 | Feature | 优先级 | Task 数 | 目标月份 |
|----|---------|--------|---------|----------|
| 1 | BL-A-AppPack运行时与领域资产外置 | P0 | 22 | 2026-11（W1–W3） |
| 2 | BL-S-铁律安全基座-网关出口审计 | P0 | 18 | 2026-11（W1–W3） |
| 3 | BL-D-数据中台收敛-BI口径Finance | P0/P1 | 17 | 2026-11（W1–W4） |
| 4 | BL-E-端到端竖线验收与发布 | P0 | 4 | 2026-11（W3 阶段 A，W4 阶段 B 与发布） |
| 5 | BL-C-Console-BFF与真实数据接入 | P0 | 8 | 2026-11（W2 骨架，W3 页面接入，W4 全量切换） |

**统计**: Feature 5 / Task 69（全部 DRAFT）；待细化条目 2 个（Wiki 看板视图、Wiki RAG 生产接入）。
**计划**: 11-02 创建 `sprint-6-202611`，backlog 5 个 Feature 整体转入（BL-A、BL-S、BL-D、BL-C、BL-E 依次编为 F0–F4），周次见 [产品能力规划](docs/plans/2026-09-27-product-capability-roadmap.md) §4。
