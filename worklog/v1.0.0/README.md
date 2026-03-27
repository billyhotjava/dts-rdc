# DTS v1.0.0 Worklog

DTS AI Decision OS 统一工作记录入口。

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
| Sprint-5+ | 迭代 | PDCA 持续改进 | 全模块 |

## 文档索引

- `docs/plans/2026-03-11-ai-decision-os-design.md` — 架构设计 (APPROVED)
- `docs/plans/2026-03-11-dts-v3-implementation-plan.md` — 实施计划总览 (DRAFT, 待按新结构重构)
- `docs/plans/2026-03-26-dts-infra-design.md` — dts-infra 设计规格 (DRAFT)
- `docs/dts-agent-protocol.md` — DAP 协议规范
- `docs/knowledge-strategy.md` — 知识战略框架
- `docs/strategic-discussion-summary.md` — 战略讨论整理

## 归档说明

`draft/` 目录保留了旧版扁平 sprint 结构（sprint-01~12 + app-stack 旧任务），
这些内容在新 sprint 中会按需吸收重构，不再直接使用。
