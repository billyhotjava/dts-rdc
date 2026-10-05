# Frontmatter 补齐 dry-run 报告（2026-10-05，F0/T20 M8c）

**性质**: 只读分析，没有修改任何文件。依据 `wiki-content` v1（dts-common 1.1.0）推导 DTS-MD frontmatter，等用户确认方案后再执行。
**生成方式**: 解析归档 `dts-rdc-worklog/v1.0.0/` 中 Sprint-5 和 backlog 的 Feature README 与 Task 文件（`**状态**`、`**优先级**`、`**依赖**` 字段和一级标题），并与 Feature README 中的任务表交叉核对。

## 1. 结论

- 全仓（3 个空间、434 个文件）目前**没有任何文件带 frontmatter**，wiki 的 sprint 看板和结构化查询没有数据可用。
- Feature 和 Task 的原文都在**已封存的归档**中（`content-lint` 会校验哈希），不能直接在原文里补 frontmatter。
- 归档元数据质量很高，可以自动推导：
  - 共 13 个 Feature、187 个 Task，其中 Sprint-5 有 118 个，backlog 有 69 个；
  - 状态全部能映射到标准值；
  - Task 文件中的状态与 README 任务表一致，没有冲突；
  - 每个 Task 都在任务表中登记，优先级全部能解析。
- **建议采用方案 A**：在活动 worklog 中按归档的目录结构，为每个 Feature 和 Task 建一张**元数据卡片**。卡片只包含 frontmatter、指向归档原文的链接和状态变更记录；以后状态以卡片为准，归档保持不动。

## 2. 统计

| 范围 | Feature | Task | DRAFT | READY | IN_PROGRESS | DONE | BLOCKED |
|---|---|---|---|---|---|---|---|
| Sprint-5 | 8 | 118 | 74 | 11 | 13 | 20 | 0 |
| backlog | 5 | 69 | 57 | 0 | 12 | 0 | 0 |

## 3. 发现的问题

| # | 问题 | 影响 | 建议 |
|---|---|---|---|
| P1 | backlog 的编号（如 `BL-A/T01`）不符合 v1 schema：Task id 要求 `^S[0-9]+/F[0-9]+/T[0-9]{2}$`，Feature id 要求 `^S[0-9]+/F[0-9]+$` | 69 个 backlog Task 和 5 个 backlog Feature 无法通过校验 | **backlog 暂不建卡片**。按 sprint-workflow 规则，月初拉入 Sprint 时会重新编号（如 `S6/F…/T…`），届时再建卡片；不改动 v1 契约 |
| P2 | `**依赖**` 是自由文本，括号里的说明会被误认成依赖（例如 BL-A/T01 的“不等待 T20 整体完成”） | 去掉括号内容前后，有 6 个 Task 的解析结果不同 | 采用去掉括号后的解析结果；指向不存在编号的依赖见 §5，执行时不写入 `depends` |
| P3 | 卡片状态取自 2026-10-05 归档时的快照，没有逐项核对实际进度（例如 F1 的 copilot 合并已推送到 main） | 看板上可能出现过时状态 | 卡片建好后，由各 Feature 负责人复核；本次不改状态 |
| P4 | sprint 类型的 frontmatter 要求 `timebox` 和 `goal` 两个字段 | Sprint-5 续的 README 目前没有这两项 | 补齐：`id: sprint-5`，timebox 为 2026-10-01～2026-10-31，goal 取归档 README 中“四条工作流”的摘要 |

## 4. 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|---|---|---|---|
| **A（建议）** | 在活动 worklog 中为 Sprint-5 的 8 个 Feature 和 118 个 Task 建元数据卡片，并给 Sprint README 补 frontmatter；backlog 等拉入 Sprint 后再建 | 不动归档，也不改契约；看板马上有数据；以后状态只改卡片 | 多出 126 个小文件；正文在归档、状态在卡片，分在两处 |
| B | 新增一个旁路索引文件（如 `dts-worklog/index/rdc.yml`），记录归档路径到元数据的映射 | 文件少 | 需要扩展 wiki-content 契约，wiki 也要支持读取这个索引，增加 wiki 会话的工作量 |
| C | 解除归档封存，直接在原文中补 frontmatter，再重新封存 | 正文和元数据在同一个文件 | 违反 D20“归档只读”，还要放开 `seal` 的防覆盖保护 |
| D | 存量不处理，从 Sprint-6 起新文件都带 frontmatter | 没有额外工作 | 10 月剩余工作在看板上看不到 |

## 5. 方案 A 卡片样例

路径与归档对应：`spaces/rdc/worklog/v1.0.0/sprint-5-202610/features/<Feature 目录>/<Task 文件名>`。

```markdown
---
type: task
id: S5/F7/T01
feature: S5/F7
title: "ADR-014 dts-infra 定位与 K8s 交付底座定稿"
status: READY
priority: P0
depends: []
---
# T01: ADR-014 dts-infra 定位与 K8s 交付底座定稿

原文（2026-10-05 归档，只读）：[T01-ADR014-dts-infra定位与K8s交付底座.md](../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F7-dts-infra-K8s交付底座/T01-ADR014-dts-infra定位与K8s交付底座.md)

## 状态变更

| 日期 | 状态 | 说明 |
|---|---|---|
| 2026-10-05 | READY | 由归档状态初始化 |
```

依赖中指向不存在编号的项（执行时保留原文，但不写入 `depends`）：`S5/F1/T25`

## 6. Sprint-5 Task 明细（方案 A 将写入的字段）

| id | 标题 | 状态 | 优先级 | depends |
|---|---|---|---|---|
| S5/F0/T01 | 确认各模块权威仓库与基准提交 | IN_PROGRESS | P0 |  |
| S5/F0/T02 | 冻结合并前 copilot 行为基线（golden set 快照） | DRAFT | P0 | S5/F0/T01 |
| S5/F0/T03 | 三系统交付基线（同机启动、登录、问数 smoke） | DRAFT | P0 | S5/F0/T01 |
| S5/F0/T04 | 领域画像摘要与铁律/领域包自检 | DRAFT | P1 | S5/F0/T01 |
| S5/F0/T05 | PRS 重写基础承接与差异登记 | DONE | P0 |  |
| S5/F0/T06 | PRS 重写基础纳入 prs-stack 版本控制 | READY | P0 | S5/F0/T05 |
| S5/F0/T07 | 修正 dts-rdc 各 submodule 指针 | DRAFT | P0 | S5/F0/T01, S5/F0/T06, S5/F0/T08 |
| S5/F0/T08 | dts-studio 去除嵌套 submodule，evolution 文档去重 | IN_PROGRESS | P0 |  |
| S5/F0/T09 | 密钥出库与轮换（copilot `.env`、prs `deploy/.env`） | READY | P0 |  |
| S5/F0/T10 | 入口文档与目录约定更新 | DRAFT | P1 | S5/F0/T07, S5/F0/T12, S5/F0/T16, S5/F0/T19 |
| S5/F0/T11 | 工作副本迁移与旧路径过渡 | DRAFT | P1 | S5/F0/T07, S5/F1/T03 |
| S5/F0/T12 | ADR-005 头脑实现语言与运行形态 | DRAFT | P0 | S5/F0/T01 |
| S5/F0/T13 | ADR-006 BI 归属 | DRAFT | P0 | S5/F0/T01, S5/F0/T17 |
| S5/F0/T14 | ADR-007 口径/指标单一事实源 | DRAFT | P0 |  |
| S5/F0/T15 | ADR-008/009 统一网关、身份与数据出口（含湖仓底座路线） | DRAFT | P0 | S5/F0/T03 |
| S5/F0/T16 | ADR-010 版本基线评估（JDK 25 / Boot 4 spike） | DRAFT | P1 | S5/F0/T01 |
| S5/F0/T17 | 分叉差异深度比对与 stack BI 前端落点 | DRAFT | P0 | S5/F0/T01 |
| S5/F0/T18 | 非功能预算与适应度函数 | DRAFT | P0 | S5/F0/T02 |
| S5/F0/T19 | ADR-013 界面原型先行与契约驱动 BFF（铁律 #5 澄清） | READY | P0 |  |
| S5/F1/T01 | copilot 逐包/逐资源归属清单 | IN_PROGRESS | P0 | S5/F0/T12, S5/F0/T13 |
| S5/F1/T02 | 保留历史的合并方案演练 | DONE | P0 | S5/F0/T08 |
| S5/F1/T03 | 执行合并进入 studio/engine | IN_PROGRESS | P0 | S5/F1/T01, S5/F1/T02, S5/F0/T12, S5/F0/T01 |
| S5/F1/T04 | 构建、镜像与交付路径修复 | IN_PROGRESS | P0 | S5/F1/T03, S5/F7/T02 |
| S5/F1/T05 | copilot 原仓库冻结与 worklog 迁移 | DRAFT | P1 | S5/F1/T03 |
| S5/F1/T06 | 合并后回归验证 | IN_PROGRESS | P0 | S5/F1/T04, S5/F0/T02 |
| S5/F2/T01 | 建仓与交付基线 | DONE | P0 |  |
| S5/F2/T02 | 编辑器选型 spike（Milkdown vs Vditor） | DONE | P0 |  |
| S5/F2/T03 | 中文全文检索 spike（pg_bigm vs zhparser） | DONE | P0 |  |
| S5/F2/T04 | 非功能预算初稿 | DRAFT | P1 | S5/F2/T02, S5/F2/T03 |
| S5/F2/T05 | 后端骨架 | DONE | P0 | S5/F2/T01 |
| S5/F2/T06 | 数据模型与 Liquibase 基线 | DONE | P0 | S5/F2/T05 |
| S5/F2/T07 | 前端骨架 | DONE | P0 | S5/F2/T01 |
| S5/F2/T08 | 本地开发环境与 CI | IN_PROGRESS | P1 | S5/F2/T05, S5/F2/T07 |
| S5/F2/T09 | 应用内 OIDC 登录与会话 | IN_PROGRESS | P0 | S5/F2/T05 |
| S5/F2/T10 | 空间访问策略与测试矩阵 | DONE | P0 | S5/F2/T09, S5/F2/T06 |
| S5/F2/T11 | 新建空间时自动创建 Keycloak 角色与组 | DRAFT | P1 | S5/F2/T10 |
| S5/F2/T12 | 前端性能预算与阅读观感（v1.1 W5a） | DONE | P0 | S5/F2/T05, S5/F2/T07 |
| S5/F3/T01 | 空间与页面树 API + 左栏页面树 | DONE | P0 | S5/F2 |
| S5/F3/T02 | 页面阅读 | DONE | P0 | S5/F3/T01 |
| S5/F3/T03 | 新建 / 改名 / 移动 / 复制 / 删除与回收站 | DONE | P0 | S5/F3/T01 |
| S5/F3/T04 | 乐观并发保存与编辑提示 | DONE | P0 | S5/F3/T02 |
| S5/F3/T05 | 空间首页与"我的空间"首页 | DONE | P1 | S5/F3/T01 |
| S5/F3/T06 | 编辑器集成与 roundtrip 保护 | DONE | P0 | S5/F2/T02, S5/F3/T04, S5/F3/T13 |
| S5/F3/T07 | 图片粘贴上传 | DONE | P0 | S5/F3/T06, S5/F3/T08 |
| S5/F3/T08 | 附件存储、上传、列表与预览 | DONE | P0 | S5/F2/T06 |
| S5/F3/T09 | 页面模板 | DONE | P1 | S5/F3/T06 |
| S5/F3/T10 | 版本列表与版本详情 | DRAFT | P0 | S5/F3/T02 |
| S5/F3/T11 | 版本对比与恢复 | DRAFT | P0 | S5/F3/T10 |
| S5/F3/T12 | 最近更新与活动流 | DRAFT | P1 | S5/F3/T10 |
| S5/F3/T13 | DTS-MD 内容契约与 frontmatter 元数据（v1.1 W5b） | DONE | P0 | S5/F3/T01, S5/F3/T05, S5/F2/T12 |
| S5/F3/T14 | archify 图即代码（v1.1 W6.5 之一） | READY | P1 | S5/F3/T08, S5/F3/T13 |
| S5/F3/T15 | Agent 只读接口与 llms.txt（v1.1 W6.5 之二） | READY | P1 | S5/F3/T13 |
| S5/F3/T16 | Wiki MCP 服务 | DRAFT | P1 | S5/F3/T15, S5/F3/T04, S5/F3/T14, S5/F2/T10, S5/F5/T01 |
| S5/F4/T01 | 同步模型定稿与状态机 | DRAFT | P0 | S5/F2/T06 |
| S5/F4/T02 | 空间同步配置与 deploy key 管理 | DRAFT | P0 | S5/F4/T01 |
| S5/F4/T03 | git → wiki 入站同步 | DRAFT | P0 | S5/F4/T02 |
| S5/F4/T04 | wiki → git 出站同步（含改名/删除/附件） | DRAFT | P0 | S5/F4/T03, S5/F3/T03 |
| S5/F4/T05 | 首次导入与现网内容迁移 | DRAFT | P0 | S5/F4/T03, S5/F4/T04, S5/F4/T06, S5/F3/T13 |
| S5/F4/T06 | 冲突检测、三方合并界面与同步监控页 | DRAFT | P0 | S5/F4/T03, S5/F4/T04 |
| S5/F5/T01 | 中文全文检索 | DRAFT | P0 | S5/F2/T03, S5/F2/T10 |
| S5/F5/T02 | 搜索筛选与结果页 | DRAFT | P1 | S5/F5/T01 |
| S5/F5/T03 | 收藏、最近浏览、标签 | DRAFT | P2 | S5/F2/T06, S5/F2/T10, S5/F3/T02, S5/F3/T13 |
| S5/F5/T04 | 页面评论与回复 | DRAFT | P1 | S5/F3/T02 |
| S5/F5/T05 | @提及与关注 | DRAFT | P1 | S5/F5/T04, S5/F2/T09, S5/F2/T10, S5/F3/T06 |
| S5/F5/T06 | 站内通知与邮件通知 | DRAFT | P1 | S5/F5/T05 |
| S5/F5/T07 | 生产部署编排与非功能验证 | DRAFT | P0 | S5/F2/T04, S5/F2/T08, S5/F2/T12 |
| S5/F5/T08 | 备份恢复与 runbook | DRAFT | P0 | S5/F5/T07 |
| S5/F5/T09 | 并行运行、切换与回退 | DRAFT | P0 | S5/F4/T05, S5/F5/T08, S5/F5/T10 |
| S5/F5/T10 | 竖线验收与 DoD | DRAFT | P0 | S5/F5/T01, S5/F5/T08, S5/F4, S5/F5/T09 |
| S5/F6/T01 | 外壳工程骨架与技术基线 | READY | P0 | S5/F0/T19, S5/F0/T08 |
| S5/F6/T02 | 信息架构、导航与权限菜单 | READY | P0 | S5/F6/T01 |
| S5/F6/T03 | 设计令牌与交互模式库 | READY | P0 | S5/F6/T01 |
| S5/F6/T04 | 契约与Mock工具链 | DRAFT | P0 | S5/F6/T01, S5/F6/T02, S5/F0/T19 |
| S5/F6/T05 | 智能体工作台原型 | DRAFT | P0 | S5/F6/T02, S5/F6/T04, S5/F6/T14 |
| S5/F6/T06 | 数据产品原型-在营项目 | DRAFT | P0 | S5/F6/T02, S5/F6/T04 |
| S5/F6/T07 | 知识检索与引用原型 | DRAFT | P1 | S5/F6/T02, S5/F6/T04 |
| S5/F6/T08 | Pack管理原型 | DRAFT | P1 | S5/F6/T02, S5/F6/T04 |
| S5/F6/T09 | 审计与追溯原型 | DRAFT | P1 | S5/F6/T02, S5/F6/T04 |
| S5/F6/T10 | 评估与人工接管原型 | DRAFT | P1 | S5/F6/T02, S5/F6/T04 |
| S5/F6/T11 | PRS 与 stack 页面挂载 | DRAFT | P1 | S5/F6/T01, S5/F6/T02, S5/F6/T04 |
| S5/F6/T12 | 我的身份与租户页 | DRAFT | P2 | S5/F6/T02, S5/F6/T04 |
| S5/F6/T13 | 原型评审与契约冻结v1 | DRAFT | P0 | S5/F6/T05, S5/F6/T12 |
| S5/F6/T14 | copilot webapp 可复用模块盘点与吸收 | DRAFT | P0 | S5/F1/T01, S5/F6/T01, S5/F6/T03, S5/F6/T04 |
| S5/F7/T01 | ADR-014 dts-infra 定位与 K8s 交付底座定稿 | READY | P0 |  |
| S5/F7/T02 | chart 规范与连接契约规范（chart-spec / contract-spec） | IN_PROGRESS | P0 | S5/F7/T01 |
| S5/F7/T03 | 总部制品中心与构建/验证环境 | READY | P0 | S5/F7/T01 |
| S5/F7/T04 | 估算收敛 spike：stack 离线化、昇腾推理、国产 OS SELinux | READY | P0 | S5/F7/T03 |
| S5/F7/T05 | RKE2 与系统镜像源码构建流水线（多架构） | DRAFT | P1 | S5/F7/T03 |
| S5/F7/T06 | RKE2 用户可见层品牌补丁队列 | DRAFT | P1 | S5/F7/T05 |
| S5/F7/T07 | 国产 OS 依赖本地源与 SELinux 策略 | DRAFT | P1 | S5/F7/T05, S5/F7/T04 |
| S5/F7/T08 | OS × 架构适配测试矩阵 | DRAFT | P1 | S5/F7/T06, S5/F7/T07, S5/F7/T13 |
| S5/F7/T09 | dtsctl 骨架、DtsRelease CRD 与 BOM | IN_PROGRESS | P0 | S5/F7/T01, S5/F7/T02 |
| S5/F7/T10 | 编排器：依赖图、组件状态机、resume、Lease、Helm v4 | IN_PROGRESS | P0 | S5/F7/T09 |
| S5/F7/T11 | 连接契约与 profile（rke2-box / rke2-cluster / ack） | DRAFT | P0 | S5/F7/T02, S5/F7/T09 |
| S5/F7/T12 | 预检（主机级 + 集群级） | IN_PROGRESS | P0 | S5/F7/T09 |
| S5/F7/T13 | RKE2 airgap 安装、节点加入与升级 | DRAFT | P0 | S5/F7/T05, S5/F7/T12 |
| S5/F7/T14 | 离线包：build / verify / diff / split / mirror | DRAFT | P0 | S5/F7/T03, S5/F7/T09 |
| S5/F7/T15 | 升级/回滚/升级前备份、审计事件与诊断包 | DRAFT | P0 | S5/F7/T10, S5/F7/T14, S5/F7/T21 |
| S5/F7/T16 | dtsctl 测试框架与端到端测试工具 | IN_PROGRESS | P0 | S5/F7/T09 |
| S5/F7/T17 | PostgreSQL：CNPG 与自建 operand 镜像 | DRAFT | P0 | S5/F7/T02, S5/F7/T03 |
| S5/F7/T18 | Kafka、SeaweedFS、Valkey、OpenSearch | DRAFT | P0 | S5/F7/T02, S5/F7/T03 |
| S5/F7/T19 | Keycloak Operator 与 realm 代码化 | DRAFT | P0 | S5/F7/T17 |
| S5/F7/T20 | 网关公共件：Traefik、forwardAuth、cert-manager | DRAFT | P0 | S5/F7/T19 |
| S5/F7/T21 | 可观测性与三级健康模型 | DRAFT | P1 | S5/F7/T18 |
| S5/F7/T22 | 备份恢复与灾备演练 | DRAFT | P1 | S5/F7/T13, S5/F7/T17, S5/F7/T18 |
| S5/F7/T23 | Kyverno 准入与镜像签名校验 | DRAFT | P1 | S5/F7/T14 |
| S5/F7/T24 | dts-stack chart 化与离线改造 | DRAFT | P0 | S5/F7/T02, S5/F7/T04, S5/F7/T17, S5/F7/T20 |
| S5/F7/T25 | dts-studio chart 化、推理服务与模型包 | DRAFT | P0 | S5/F7/T02, S5/F7/T04, S5/F7/T17, S5/F7/T20 |
| S5/F7/T26 | prs-stack chart 化 | DRAFT | P0 | S5/F7/T02, S5/F7/T17, S5/F7/T20 |
| S5/F7/T27 | dts-wiki chart 化与附件迁移 S3 | DRAFT | P1 | S5/F7/T02, S5/F7/T17, S5/F7/T18, S5/F7/T20 |
| S5/F7/T28 | 运维控制台（DTS Console 运维域 + BFF） | DRAFT | P1 | S5/F7/T09, S5/F7/T15, S5/F7/T21, S5/F7/T22, S5/F6/T02 |
| S5/F7/T29 | dts-operator 常驻对账 | DRAFT | P1 | S5/F7/T10, S5/F7/T15 |
| S5/F7/T30 | AppPack CRD 与生命周期（对接 PackRegistry） | DRAFT | P1 | S5/F7/T23, S5/F7/T29, BL/BL-A/T01 |
| S5/F7/T31 | 离线 license | DRAFT | P2 | S5/F7/T14 |
| S5/F7/T32 | ACK profile 与端到端验收 | DRAFT | P0 | S5/F7/T11, S5/F7/T12, S5/F7/T24, S5/F7/T27 |
| S5/F7/T33 | 端到端验收、演练与 runbook | DRAFT | P0 | S5/F7/T13, S5/F7/T32 |
| S5/F7/T34 | 下线 dts-stack 运维体系与现网迁移 | DRAFT | P1 | S5/F7/T33 |
| S5/F7/T35 | Infra Agent（可选） | DRAFT | P2 | S5/F7/T15, S5/F7/T21, S5/F7/T29 |

## 7. 需要用户确认

1. 采用方案 A，还是 B、C、D。
2. 是否同意 backlog 拉入 Sprint 后再建卡片（P1）。
3. 是否同意卡片先按归档快照初始化状态，之后再复核（P3）。
