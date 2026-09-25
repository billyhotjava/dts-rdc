# F13: 端到端竖线验收、发布与运维

**优先级**: P0
**波次**: C
**状态**: DRAFT

## 目标
在运行实例上完成 Sprint 主竖线（alice 问"当前在营项目数"），证明架构、UI、切片三维都达标；
按照可回退的方式把合并后的头脑发布上线（旧 copilot 并行保留），交付 runbook，并收尾 sprint。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 文档 | `assets/nfr-budget.md` | 指标、预算、测量方式、适应度函数（CI 中如何检查） |
| 文档 | `it/IT-10-e2e-slice.md` | 竖线各层的证据（命令、输出、截图、审计事件 id） |
| 文档 | `assets/release-plan.md` | 并行运行、切换步骤、回退触发条件与步骤、演练记录 |
| 文档 | `assets/runbook.md` | 启停、健康检查、告警、常见故障处理、容量 |

## UI/UX 规格
主竖线走查（即最终验收脚本）：
1. 打开 `https://studio.<domain>/workspace` → 跳转登录 → alice/test1234；
2. 输入"当前在营项目数" → 流式显示答案；
3. 答案卡片显示：数值、证据等级（HIGH/MEDIUM）、来源 `pack: prs-flower@1.x.x`、指标 `stack v?`、审计号；
4. 点击"保存为卡片" → 在 stack 分析中心打开；
5. 以 bob 登录重复第 2 步 → 数值不同（租户隔离）；
6. 管理员在能力包页面回滚 Pack → 再次提问，来源版本随之变化。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 非功能预算与适应度函数 | P0 | DRAFT | F0/T02 |
| T02 | 主竖线集成验收与回归比对 | P0 | DRAFT | F4–F11 |
| T03 | 发布计划：并行运行、切换与回退演练 | P0 | DRAFT | T02 |
| T04 | Runbook 与可观测性 | P1 | DRAFT | T02 |
| T05 | Sprint 收尾：文档、队列、记忆与复盘 | P1 | DRAFT | T02–T04 |

## Definition of Ready
- [x] 契约  - [x] 竖切片（见 Sprint README）  - [x] UI 走查脚本  - [ ] 依赖  - [x] 验收

## 完成标准
- [ ] Sprint README 中 Gate Registry 的全部项目为 PASS 或 N/A（附理由）
- [ ] 追溯矩阵每一行都有证据链接
