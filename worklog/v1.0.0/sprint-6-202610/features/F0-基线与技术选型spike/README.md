# F0: 基线与技术选型 spike

**优先级**: P0 · **状态**: DRAFT

## 目标
在写业务代码前，定下三件有不确定性的事：交付基线能否跑通（建仓 → 构建 → 传镜像 → .50 启动 → 登录）、
编辑器选型、中文全文检索方案。每个 spike ≤ 1 人日，产出结论写进 Sprint README 的 ADR。

## Task 列表
| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 建仓与交付基线 | P0 | DRAFT | 用户在 GitHub 建 `dts-wiki` 空仓库 |
| T02 | 编辑器选型 spike（Milkdown vs Vditor） | P0 | DRAFT | - |
| T03 | 中文全文检索 spike（pg_bigm vs zhparser） | P0 | DRAFT | - |
| T04 | 非功能预算初稿 | P1 | DRAFT | T02、T03 |

## 完成标准
- [ ] `it/baseline.md` 有真实输出；W-ADR-8 状态改为 Accepted；编辑器结论写入 F4
