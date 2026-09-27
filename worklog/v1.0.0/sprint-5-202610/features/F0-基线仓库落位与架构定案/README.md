# F0: 基线仓库落位与架构定案

**优先级**: P0
**状态**: IN_PROGRESS（DONE=1、DRAFT=14、READY=4）
**时间窗**: 2026-10 第 1–3 周
**整合来源**: Sprint-5 F0 G0 基线与权威源确认；Sprint-5 F1 仓库落位与 submodule 重整；Sprint-5 F2 架构决策定稿与规则体系修订（2026-09-26 按月度 Sprint 整合）

## 目标
10 月内完成 G0 基线与权威源确认、仓库落位（prs git 化、submodule 指针、密钥出库、工作副本切换）并定稿 ADR-005～010，使 11 月拉入 AppPack 运行时与安全基座时不再有未决边界；BI 分叉比对作为 ADR-006 输入，非功能预算作为全部后续 Feature 的适应度函数。

[2026-09-27 产品能力规划](../../../docs/plans/2026-09-27-product-capability-roadmap.md) 的本月承接：T04 确认 PRS 业务场景/期望集合与人工路径，T14 确认指标与数据产品最小契约，T18 完成预算及测量设计；运行达标交给后续 BL-D/T17、BL-E/T01，不能让本月设计任务等待 12 月发布。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-确认各模块权威仓库与基准提交.md) | 确认各模块权威仓库与基准提交 | Sprint-5 F0/T01 | P0 | DRAFT | 无 |
| [T02](T02-冻结合并前copilot行为基线.md) | 冻结合并前 copilot 行为基线（golden set 快照） | Sprint-5 F0/T02 | P0 | DRAFT | T01（基准 SHA） |
| [T03](T03-三系统交付基线.md) | 三系统交付基线（同机启动、登录、问数 smoke） | Sprint-5 F0/T03 | P0 | DRAFT | T01 |
| [T04](T04-领域画像摘要与铁律自检.md) | 领域画像摘要与铁律/领域包自检 | Sprint-5 F0/T04 | P1 | DRAFT | T01 |
| [T05](T05-PRS重写基础承接与差异登记.md) | PRS 重写基础承接与差异登记 | Sprint-5 F0/T05 | P0 | DONE | 无（用户已指定来源与目标；不依赖 Stack 权威仓库选择） |
| [T06](T06-dts-prs-git化并落位prs-stack.md) | PRS 重写基础纳入 prs-stack 版本控制 | Sprint-5 F1/T01 | P0 | READY | T05（本地资料接收已完成） |
| [T07](T07-修正dts-rdc各submodule指针.md) | 修正 dts-rdc 各 submodule 指针 | Sprint-5 F1/T02 | P0 | DRAFT | T01、T06、T08 |
| [T08](T08-dts-studio去除嵌套submodule与文档去重.md) | dts-studio 去除嵌套 submodule，evolution 文档去重 | Sprint-5 F1/T03 | P0 | READY | 无 |
| [T09](T09-密钥出库与轮换.md) | 密钥出库与轮换（copilot `.env`、prs `deploy/.env`） | Sprint-5 F1/T04 | P0 | READY | 无 |
| [T10](T10-入口文档与目录约定更新.md) | 入口文档与目录约定更新 | Sprint-5 F1/T05 | P1 | DRAFT | T07、F0（ADR 定稿后第二轮更新） |
| [T11](T11-工作副本迁移与旧路径过渡.md) | 工作副本迁移与旧路径过渡 | Sprint-5 F1/T06 | P1 | DRAFT | T07、F1/T03（copilot 已并入 studio） |
| [T12](T12-ADR005头脑实现语言与运行形态.md) | ADR-005 头脑实现语言与运行形态 | Sprint-5 F2/T01 | P0 | DRAFT | T01 |
| [T13](T13-ADR006-BI归属.md) | ADR-006 BI 归属 | Sprint-5 F2/T02 | P0 | DRAFT | T01、T17（波次 A 关闭 Q2/Q6；此只读调查不依赖本 ADR） |
| [T14](T14-ADR007口径指标单一事实源.md) | ADR-007 口径/指标单一事实源 | Sprint-5 F2/T03 | P0 | DRAFT | 无 |
| [T15](T15-ADR008-009统一网关身份与数据出口.md) | ADR-008/009 统一网关、身份与数据出口（含湖仓底座路线） | Sprint-5 F2/T04 | P0 | DRAFT | T03（确认 Keycloak 实例现状，Q4） |
| [T16](T16-ADR010版本基线评估.md) | ADR-010 版本基线评估（JDK 25 / Boot 4 spike） | Sprint-5 F2/T05 | P1 | DRAFT | T01 |
| [T17](T17-分叉差异深度比对与stack-BI前端落点.md) | 分叉差异深度比对与 stack BI 前端落点 | Sprint-5 F7/T01 | P0 | DRAFT | T01（只读调研先于 ADR-006） |
| [T18](T18-非功能预算与适应度函数.md) | 非功能预算与适应度函数 | Sprint-5 F13/T01 | P0 | DRAFT | T02（基线时延） |
| [T19](T19-ADR013界面原型先行与契约驱动BFF.md) | ADR-013 界面原型先行与契约驱动 BFF（铁律 #5 澄清） | 新增 | P0 | READY | 无 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 来源规格：Sprint-5 F0 G0 基线与权威源确认

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
在动任何代码之前，确认"以哪份代码为准"，并留下合并前的**可复现行为基线**，
使后续每一次搬迁、拆分都能用同一把尺子证明"没有回归"。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 文档 | `assets/source-of-truth.md` | 每个模块：权威仓库 URL、分支、基准 commit SHA、工作副本路径、构建路径、负责人 |
| 文档 | `assets/baseline-golden-answers.md` | 每题：`question, domain, tenant_id, user_id, dataset_snapshot, metric_version, pack_version, comparison_class, sql_hash, answer, evidence_level, latency_ms, run_at, commit_sha` |
| 数据 | `assets/baseline-golden-answers.jsonl` | 同上（机读，供 BL-E/T01 自动比对） |
| 文档 | `it/baseline.md` | 启动命令、端口表、健康检查、登录账号、问数 smoke 结果 |
| 文档 | `assets/domain-profile.md` | 花卉域词汇表摘要、核心不变量、数据量级（引用 prs F1、copilot S25/S30，不重做） |

### UI/UX 规格
非用户面 Feature；基线中的"问数 smoke"使用现有 copilot webapp 工作台（`/workspace`）手工走查并截图。

### Definition of Ready
- [ ] 契约已钉死（上表）  - [x] 竖切片：不涉及  - [x] UI 落点：不涉及  - [ ] 依赖：需用户确认 Q1（stack 权威仓库）  - [x] 验收可验证

### 完成标准
- [ ] `assets/source-of-truth.md` 经用户签字（在文档末尾记录确认人与日期）
- [ ] golden set 基线可由脚本一键重跑，两次重跑结果差异 ≤ 2%（LLM 非确定性容差）
- [ ] `it/baseline.md` 所有步骤有真实输出，无占位

## 来源规格：Sprint-5 F1 仓库落位与 submodule 重整

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
让 `dts-rdc` 成为真正可用的总纲仓库：`git clone --recursive dts-rdc` 能拿到 stack、studio、app-stack/prs-stack 的**真实代码**；
dts-prs 进入版本控制；没有循环嵌套、重复文档，也没有被跟踪的密钥。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 仓库 | `RDC/.gitmodules` | `dts-infra`, `dts-stack`, `dts-studio`, `dts-app-stack`（URL 以 T01 结论为准） |
| 仓库 | `dts-app-stack/.gitmodules` | `prs-stack` → `git@github.com:billyhotjava/prs-stack.git`；`metro-stack` 保持 |
| 目录 | prs-stack 仓库根结构 | `sources/`（原 dts-prs/sources）、`worklog/`（原 dts-prs/worklog）、`backend/`、`frontend/`、`pack/`（3 月原型保留；BL-A 另建迁移暂存目录）、`README.md`、`CLAUDE.md`、`.gitignore` |
| 约定 | `.gitignore` 基线 | `target/`, `node_modules/`, `.env`, `*.p12`, `*.key`, `.dev-logs/`, `.dev-pids/`, `.worktrees/` |
| 约定 | 工作副本路径 | 目标建议：开发 `/opt/prod/dts/dts-rdc/<module>`、构建 `/data/<module>`；须经 T01 确认并由 T11 切换，之前沿用各仓库现行约束 |

### UI/UX 规格
非用户面 Feature。

### Definition of Ready
- [x] 契约已钉死  - [x] 竖切片：不涉及  - [x] UI：不涉及  - [ ] 依赖：T07/T05/T06 依赖 T01  - [x] 验收可验证

### 完成标准
- [ ] 全新目录执行 `git clone --recursive <dts-rdc>` 后，`dts-stack/source/pom.xml`、`dts-studio/.rules/`、`dts-app-stack/prs-stack/sources/pom.xml` 均存在（证据写入 `it/IT-01-repo-layout.md`）
- [ ] `git ls-files | grep -E '(^|/)\.env$'` 在所有仓库中为空

## 来源规格：Sprint-5 F2 架构决策定稿与规则体系修订

> 以下为整合前 Feature 的契约 / UI / DoR / 完成标准，原样保留；其中的 Task 编号已按上表重编号。

### 目标
把 Sprint README 中"提议"状态的 ADR-5..ADR-10 逐条定稿（每条都要有备选方案对比、结论和签字），
再据此修订 `dts-studio/.rules` 与设计文档，让规则和现实一致，下游 Feature 不再"边做边吵"。

### 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 文档 | `RDC/worklog/v1.0.0/docs/adr/ADR-{NNN}-{slug}.md` | 固定章节：背景 / 备选方案（≥2）/ 评估维度表 / 决策 / 后果 / 回滚条件 / 状态（Proposed→Accepted）/ 签字人与日期 |
| 文档 | `RDC/worklog/v1.0.0/docs/adr/README.md` | ADR 索引表：编号、标题、状态、日期、取代关系 |
| 规则 | `dts-studio/.rules/10-architecture/*.rules` | 与已接受的 ADR 一致；每条修改的规则注明 `Source: ADR-NNN` |

ADR 编号映射：ADR-005 头脑语言、ADR-006 BI 归属、ADR-007 口径 SoT、ADR-008 统一网关与身份、ADR-009 数据出口与湖仓路线、ADR-010 版本基线；
ADR-001..004 为用户已定的决策，补写成文档存档即可。

### UI/UX 规格
非用户面 Feature。

### Definition of Ready
- [x] 契约（ADR 模板）已钉死  - [x] 竖切片：不涉及  - [x] UI：不涉及  - [ ] 依赖：T01  - [x] 验收：用户签字

### 完成标准
- [ ] ADR-001..010 全部为 Accepted（或 Rejected，并写明替代方案），用户签字
- [ ] `.rules` 中与 ADR 冲突的条款清零（BL-A/T20 附对照表）
