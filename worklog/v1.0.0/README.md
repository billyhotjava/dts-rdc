# DTS v1.0.0 Worklog

DTS AI Decision OS 统一工作记录入口。当前活动规划为 [Sprint-5](sprint-5-202610/README.md)，3 月 Sprint-1～4 是未执行的历史规划。

[2026-09-26 整体复核与 PRS 资料承接](sprint-5-202610/assets/planning-reconciliation-20260926.md)。

当前产品能力与交付依据：[2026-09-27 产品能力规划](docs/plans/2026-09-27-product-capability-roadmap.md)。以 PRS 可信经营数据、Wiki 授权知识供给、行业能力复用和可评估交付为主线；保留数据治理基础，按业务场景验证 AI 价值。10 月沿用现有 67 个 Task，后续新增任务进入既有 backlog。

## 组织规则

遵循 sprint-workflow 规范：**Sprint > Feature > Task > IT**

```
worklog/v1.0.0/
  sprint-queue.md              # Sprint 全局队列
  sprint-{N}-{YYYYMM}/        # Sprint 目录
    README.md                  # Sprint 概览
    features/
      F{N}-{中文名}/
        README.md              # Feature 概览
        T{NN}-{中文名}.md      # Task 文件
    assets/                    # 截图/附件
    it/
      README.md                # 集成测试记录
  docs/                        # 全局文档
    plans/                     # 设计文档/实施计划
    specs/                     # 规格说明
  draft/                       # 旧版 sprint（扁平结构，归档保留）
  evolution/                   # 产品文档（商业计划/产品说明/定价）
```

## PDCA 迭代路线

| Sprint | 月份 | 目标 | 模块 |
|--------|------|------|------|
| Sprint-1 | 2026-04 | dts-infra bootstrap — 从零到 commander 运行 | dts-infra |
| Sprint-2 | 2026-05 | dts-infra commander — 运维中枢核心能力 | dts-infra |
| Sprint-3 | 2026-06 | dts-stack 第一版原型 — 核心服务跑通 | dts-stack |
| Sprint-4 | 2026-07 | app-stack 第一版原型 — 首个 Pack 全流程 | app-stack |
| Sprint-5 | 2026-10 | 四模块合并落位（仓库、ADR 定稿、copilot 并入 studio）+ DTS Wiki v1 上线；Sprint-1~4 未执行，由本 sprint 取代或重排 | 全模块 + dts-wiki |
| Sprint-6 | 2026-11 | backlog 全量：AppPack 全量外置、统一身份与受控出口、完整审计、BI/口径/Finance 收敛；11-20 PRS 场景首次受控联调，11-30 全回归与发布 | studio / app-stack / stack |

> 节奏：一个自然月一个 Sprint；下一个 Sprint 的已细化待办在 [`backlog/`](backlog/README.md)；不为单个 Feature 开 Sprint，规则见 [`sprint-queue.md`](sprint-queue.md) §迭代节奏规则。

## 文档索引

- `docs/plans/2026-09-27-product-capability-roadmap.md` — 当前产品能力、业务验收与月度切片；具体实现仍以 Accepted ADR 为准
- `docs/plans/2026-03-11-ai-decision-os-design.md` — 架构设计（历史 APPROVED；模块定位/实施路径已部分被 Sprint-5 替代）
- `docs/plans/2026-03-11-dts-v3-implementation-plan.md` — 实施计划总览 (DRAFT, 待按新结构重构)
- `docs/plans/2026-03-26-dts-infra-design.md` — dts-infra 设计规格 (DRAFT)
- `docs/dts-agent-protocol.md` — DAP 协议规范
- `docs/knowledge-strategy.md` — 知识战略框架
- `docs/strategic-discussion-summary.md` — 战略讨论整理

## 归档说明

`draft/` 目录保留了旧版扁平 sprint 结构（sprint-01~12 + app-stack 旧任务），
这些内容在新 sprint 中会按需吸收重构，不再直接使用。
