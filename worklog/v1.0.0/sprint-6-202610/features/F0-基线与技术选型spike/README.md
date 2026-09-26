# F0: 基线与技术选型 spike

**优先级**: P0 · **状态**: DRAFT

## 目标
在写业务代码前，定下三件有不确定性的事：交付基线能否跑通（建仓 → 构建 → 传镜像 → .50 启动 → 登录）、
编辑器选型、中文全文检索方案。每个 spike ≤ 1 人日，产出结论写进 Sprint README 的 ADR。

## 概要设计（`design/`）
DTS Wiki v1 的完整设计，编码会话以此为准：

| 文档 | 内容 |
|------|------|
| [00-概述与架构决策](design/00-概述与架构决策.md) | 目标、非目标、架构决策 D1–D14 |
| [01-系统架构](design/01-系统架构.md) | 组件、登录与请求流程、与现网 wiki 的关系 |
| [02-领域模型](design/02-领域模型.md) | 实体、不变量、自定义 Liquibase（实体以 dts-wiki `jhipster/dts-wiki.jdl` 为准） |
| [03-后端设计](design/03-后端设计.md) | 包结构、权限、REST API、事务、定时任务 |
| [04-git同步设计](design/04-git同步设计.md) | 同步模型、状态机、入站/出站、冲突、首次导入 |
| [05-前端设计](design/05-前端设计.md) | React + antd：路由、布局、编辑器、渲染、管理后台 |
| [06-部署与运维](design/06-部署与运维.md) | 镜像、compose、Keycloak、备份、切换与回退 |
| [07-测试与验收](design/07-测试与验收.md) | 测试分层、权限矩阵、同步场景、验收脚本 |
| [08-编码任务与交接说明](design/08-编码任务与交接说明.md) | 工作包顺序、硬性约束、需求方配合事项 |
| [09-Agent与内容规范](design/09-Agent与内容规范.md) | **v1.1**：DTS-MD v1 方言、frontmatter Schema、图即代码（archify）、Agent 访问、llms.txt |
| [10-v1.1变更与重构清单](design/10-v1.1变更与重构清单.md) | **v1.1**：现状快照、逐项重构（含最小差异算法）、新执行顺序、工具与迁移脚本 |

## Task 列表
| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 建仓与交付基线 | P0 | DRAFT | 用户在 GitHub 建 `dts-wiki` 空仓库 |
| T02 | 编辑器选型 spike（Milkdown vs Vditor） | P0 | DRAFT | - |
| T03 | 中文全文检索 spike（pg_bigm vs zhparser） | P0 | DRAFT | - |
| T04 | 非功能预算初稿 | P1 | DRAFT | T02、T03 |

## 完成标准
- [ ] `it/baseline.md` 有真实输出；W-ADR-8 状态改为 Accepted；编辑器结论写入 F4
