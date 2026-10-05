# Wiki 产品与 worklog 内容分离及模块关系设计（2026-10-05）

**状态**: 方向经用户 2026-10-05 两轮确认；目录调整已在本地执行（见 [F0/T20](../T20-wiki产品与worklog内容分离迁移.md)），尚未提交
**范围**: dts-wiki、dts-worklog、dts-docs、dts-rdc 四者的职责与接口，以及它们与 base、studio、infra、common 的关系
**关系**: **取代 [模块边界与公共底座设计](../../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F0-基线仓库落位与架构定案/design/2026-10-03-模块边界与公共底座设计.md) 的 D17**；D10（入站优先、git 绑定页只读）不变；修订 S4 范围与 [S4a 计划](../../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F4-Wiki-Git双向同步/design/01-S4a研发文档统一与入站同步实施计划.md) 的同步源定义
**分工**: dts-wiki 的程序开发由独立的开发会话负责，按 §7 的输入执行；本文和目录迁移（§6）由 RDC 架构会话负责

## 1. 问题

D17 把所有产品的研发文档放进了 dts-wiki 仓库的 `content/<产品>/`，结果把“wiki 这个产品”和“wiki 里的内容”混在了一起：

- dts-wiki 要作为 DTS 的一部分交付给客户，仓库里却带着 DTS 研发、PRS 等业务内容；产品源码和内容的权限、发布节奏、历史互相绑死。
- 每写一次文档都会改动产品仓库的 `main`，wiki 的版本号不再能代表程序版本。
- 客户现场需要的是“DTS 产品能力文档 + 客户自己的行业 App 空间”，不需要也不应该看到研发中心的内容。

## 2. 决策

| # | 决策 | 结论 |
|---|------|------|
| D18 | dts-wiki 产品中立 | dts-wiki 只包含程序、部署物（Compose/chart）和内容契约的实现；**仓库内不放任何业务或研发内容，代码里也不写死任何空间名**。它是 DTS 的一个可选模块，随 DTS 交付给客户；研发中心用的是同一个产品的一个部署实例。取代 D17 |
| D19 | dts-worklog 内容目录 | dts-worklog 是 **dts-rdc 下的普通目录**，不设子模块，历史就是 dts-rdc 的历史。它由三部分组成：模板（`templates/space/`）、空间清单（`spaces.yml`）、内容空间（`spaces/<slug>/{worklog,docs,archive}`）。研发中心有两个空间：`rdc`（DTS 研发）、`prs`（PRS App），其他 App 按需追加 |
| D20 | 旧 worklog 整体归档 | dts-rdc 的 `worklog/` 和 prs-stack 的 `worklog/` 原样整体放入 `spaces/rdc/archive/dts-rdc-worklog/`、`spaces/prs/archive/prs-stack-worklog/`，原位置删除。归档只读；新的记录写在 `spaces/<slug>/worklog/`。归档里尚未关闭的规划（Sprint-5 的 Feature/Task、backlog）继续有效，状态变更写在新 worklog 里，不改归档原文 |
| D21 | 产品能力文档放在 dts-docs | dts-rdc 的 `docs/` 改名为 **`dts-docs/`**，专门存放 DTS 产品能力文档（正式、可交付），对应 wiki 的 `dts` 空间。研发中心的 wiki 从这里同步；发布时打成内容包随版本交付，在客户的 wiki 中只读预置。旧的静态 wiki 配置 `products/`、`products.json` 删除 |
| D22 | 内容源与契约 | wiki 的运行配置只声明一个**内容源**：仓库 URL、分支、清单路径、只读 key、同步开关。空间、显示名、访问角色全部来自清单；清单里的 `roots` 是相对于内容仓库根目录的路径。研发中心的内容源是 **dts-rdc 仓库**，清单为 `dts-worklog/spaces.yml`。清单格式和 DTS-MD frontmatter schema 作为 `wiki-content` v1 放进 dts-common，wiki 与内容仓库的 lint 使用同一版本 |
| D23 | wiki 的两种部署形态 | **研发形态**（E1 10.20.0.50）：用公司 SSO 登录，内容源是 dts-rdc（一把只读 deploy key），空间为 `dts`、`rdc`、`prs`。**产品形态**（E3 / 客户现场）：用产品 Keycloak `dts` 登录，`dts` 空间由随版本交付的内容包导入、只读；客户的 App 空间默认直接在 wiki 中编辑（PG 为事实源），也可以绑定客户自己的 git 仓库（按 dts-worklog 模板初始化，契约相同） |

## 3. 模块关系

```
 研发协作面（不进交付物）
 ┌──────────────────────────── dts-rdc 仓库 ─────────────────────────────┐
 │ 子模块：dts-infra / dts-stack / dts-studio / dts-app-stack / dts-wiki  │
 │ 目录：dts-common（契约）· dts-docs（产品能力文档）· dts-worklog（研发与 App 内容）│
 └───────────────────────────────────────────────────────────────────────┘
   agent / 开发者 ──git 写──► dts-rdc main
                                  │ git 拉取（只读 key，入站，清单 dts-worklog/spaces.yml）
                                  ▼
                           dts-wiki（研发形态，E1）── 空间：dts · rdc · prs ──► 团队成员（公司 SSO）

 发布：dts-docs ──打包──► 产品能力内容包（随 DTS release）

 产品运行面（随 DTS 交付）
 用户界面   门户(base)  Wiki  数据平台(stack)  BI(analytics)  AI工作台(studio)  行业App
 业务能力   dts-wiki   dts-stack ◄── dts-analytics ◄── dts-studio ──► dts-app-stack
              ▲   ▲                                     │
              │   └──── K6：REST/MCP，以用户本人身份访问（RAG 只看授权空间，铁律 3）
              └── 导入产品能力内容包（只读 `dts` 空间）；客户 App 空间为原生页或绑定客户 git
 公共底座   dts-base：门户应用登记（K4）· base-auth · 审计中心（K3）
 基础设施   dts-infra：Compose（E1）/ chart（E3、客户）· PostgreSQL · S3 · Keycloak
```

依赖规则沿用 F0 设计 §2：单向、经带身份的 API、不共享数据库。新增三条：

1. **内容与程序互不引用源码**：dts-worklog 和 dts-docs 只用 URL 或仓库内相对路径链接代码，不放代码；代码仓库不放开发文档，只保留随代码版本走的模块 `docs/`（runbook、契约规范、README）。
2. **dts-wiki 不知道任何具体空间**：空间名、显示名、角色全部来自清单。
3. **研发协作面不进交付物**：dts-worklog 不随版本交付；交付物里只有 dts-wiki 程序、内容契约和 dts-docs 内容包。

## 4. 接口

| 接口 | 提供方 → 使用方 | 形式 | 约束 |
|---|---|---|---|
| 内容源 | dts-rdc 仓库 → dts-wiki | git over SSH，只读 deploy key，跟随 `main` | D10：本期只入站；git 绑定页在 wiki 中只读；改动 1 分钟内可见。只读取清单中声明的 `roots`，其他路径不导入 |
| 空间清单 | `dts-worklog/spaces.yml` → dts-wiki | YAML `version: 1`；每项包含 `slug`、`name`、`description`、`roots[]`、`role` | slug 为小写 ASCII，不可改名；删除条目时只停止同步，不删除空间数据 |
| 内容契约 | dts-common `wiki-content/v1` → wiki、内容 lint | JSON Schema（清单 + frontmatter） | 按版本固定，不引用 sibling 源码 |
| 产品能力内容包 | dts-docs → 发布流水线 → 产品形态 wiki | 离线包（Markdown + 附件 + 清单片段），随 release | 只读导入；不包含内部地址和凭据 |
| 空间权限 | 身份代码 → Keycloak → dts-wiki | client role `space-<slug>` | 研发形态由 dts-infra `deploy/sso/apps/wiki-spaces.sh` 按清单生成；无权访问的空间返回 404 |
| 知识读取 | dts-wiki → dts-studio | REST 查询 + MCP（K6） | 以用户本人身份访问，空间权限照常生效 |
| 应用登记、审计 | dts-wiki → dts-base | K4 values 声明、K3 CloudEvents | 只在产品形态启用 |
| 部署 | dts-infra → dts-wiki | 研发形态用 Compose（.50 `/data/dts-wiki-v2`）；产品形态用 chart（F7/T27） | .50 的约束不变：不 `docker pull`，不动现网 wiki、Jira、公司 Keycloak |

## 5. 文档归属

| 内容 | 位置 |
|---|---|
| DTS 产品能力（对外、可交付） | `dts-docs/` |
| DTS 研发过程：规划、设计、ADR、Sprint/Feature/Task、评审、证据、交接 | `dts-worklog/spaces/rdc/worklog/` |
| 行业 App 研发过程（PRS 等） | `dts-worklog/spaces/<app>/worklog/`；App 自己的正式文档放 `spaces/<app>/docs/` |
| 2026-10-05 之前的记录 | `dts-worklog/spaces/<slug>/archive/`，只读 |
| 模块正式文档（runbook、契约规范、README） | 各代码仓库的 `docs/`、README，随代码版本 |
| 跨模块规则、入口说明 | dts-rdc 的 `CLAUDE.md`、`AGENTS.md`、`README.md` |
| 模块内既有的历史 worklog（dts-stack `worklog/v2.x`、dts-studio `engine/worklog-history`） | 原地冻结，不再追加；是否迁入 `spaces/rdc/archive/` 见 O8 |

sprint-workflow 的目标目录改为 `dts-worklog/spaces/<slug>/worklog/v{x}/`，在 dts-rdc 中默认 `rdc`。

## 6. 迁移步骤（F0/T20）

| # | 步骤 | 状态 |
|---|---|---|
| M1 | 建立 dts-worklog：README、AGENTS、`spaces.yml`、`templates/space/`；删除早先误建的独立 git 仓库 | 已完成（本地） |
| M2 | 归档：dts-rdc `worklog/` 改名移入 `spaces/rdc/archive/dts-rdc-worklog/`（git 识别为重命名，历史保留）；prs-stack `worklog/` 复制到 `spaces/prs/archive/prs-stack-worklog/` 后从 prs-stack 删除 | 已完成（本地） |
| M3 | 守恒校验：文件集合一致（rdc 383、prs 45），内容差异只有相对链接改写；共改写 57 个链接 | 已完成，见 T20 证据 |
| M4 | `docs/` 改名为 `dts-docs/` 并重写 README；删除 `products/`、`products.json` | 已完成（本地） |
| M5 | 更新入口文档：dts-rdc `CLAUDE.md`、`AGENTS.md`、`README.md`，sprint-workflow skill，dts-studio `CLAUDE.md`，dts-app-stack 与 prs-stack 的 README | 已完成（本地） |
| M6 | 提交，顺序为 prs-stack → dts-app-stack → dts-studio → dts-rdc；推送 | 待用户确认 |
| M7 | dts-wiki 按 §7 改造，部署到 .50，接入 dts-rdc 内容源 | wiki 会话 |
| M8 | `wiki-content/v1` 契约放进 dts-common；为 dts-worklog/dts-docs 增加 lint；dts-docs 内容包纳入发布流水线（F7） | 待排期 |

## 7. 给 dts-wiki 开发会话的输入

S4a 计划的目标不变：入站同步、git 绑定页只读、部署到 .50。变更如下：

1. dts-wiki 仓库中**不建 `content/` 目录**，不放任何内容；S4a Task 6（迁入 `content/`）作废，由本文 M1–M5 替代。
2. 内容源为 **dts-rdc 仓库**（`git@github.com:billyhotjava/dts-rdc.git`，`main`），清单为 `dts-worklog/spaces.yml`。wiki 的配置只保留 `application.wiki.content.{repo-url, branch, manifest-path, deploy-key-path}` 和 `outbound-enabled=false`，不再使用 `application.wiki.spaces`。
3. **只用一把只读 deploy key**，加在 dts-rdc 仓库上（S4a 的 G4 由 3 把改为 1 把）。每个空间的同步根取自 `roots[]`，路径相对于仓库根目录；`roots` 以外的路径一律不导入（dts-rdc 中还有代码与子模块指针）。
4. 代码里不得写死清单中的任何 slug。新增条目时自动建立空间并完成首轮导入；删除条目时只停止同步，不删除数据。
5. 本期 `dts` 空间同样走 git 入站。产品形态下的内容包导入，只在 F7/T27 中记录需求，本期不实现。
6. 在 M8 完成之前，frontmatter schema 以 dts-wiki 现有的 `src/main/resources/content-schemas/` 为准，字段保持不变。
7. dts-wiki 的 `CLAUDE.md` 要改为指向 `dts-worklog/spaces/rdc/worklog/` 和归档中的 F2–F5 设计；现在写的 `sprint-6-202610` 路径已经失效。验收证据写入 `dts-worklog/spaces/rdc/worklog/v1.0.0/sprint-5-202610/it/wiki/`，不写进 dts-wiki。

## 8. 对既有计划的影响

| 既有项 | 影响 |
|---|---|
| F0 设计 D17 | 由 D18–D23 取代（归档原文中已加注） |
| F0 设计 §6 S4 | 研发文档的去向改为 dts-worklog（本文） |
| F4/T02 空间同步配置与 deploy key 管理 | 改为由“内容源 + 清单”驱动，只用一把 key |
| F4/T05 首次导入与现网内容迁移 | 首次导入的来源改为 dts-rdc 内容源 |
| S4a 计划 | Task 6 作废；Task 3–5、7–9 按 §7 调整；证据路径改到新的 worklog |
| F7/T27 产品形态 wiki | 新增 dts-docs 内容包只读导入，以及“原生空间可以不绑定 git”两项要求 |
| phase-handoff-20261004 | 其中仓库状态已过时，以 [Sprint-5 续](../../../README.md) 的状态差异表为准 |

## 9. 开放问题

| # | 问题 | 建议 |
|---|---|---|
| O5 | 客户现场的产品能力空间从哪里来 | **已关闭（D21）**：来自 dts-docs，打成内容包随版本交付 |
| O6 | wiki 能读取 dts-rdc 全仓（含代码），权限是否过大 | deploy key 只读，wiki 只导入 `roots` 中的路径；如果以后需要更严格的隔离，可以把 dts-worklog 拆成独立仓库，契约不变 |
| O7 | 客户现场是否提供 git 服务 | 不提供；git 同步是可选能力，客户有自己的 git 时再绑定 |
| O8 | 模块内的历史 worklog 是否迁入 | 暂时原地冻结；之后按模块逐个评估，是否归档到 `spaces/rdc/archive/` |
| O9 | 现网 wiki 中的组与空间如何映射 | 沿用 S4a 的 G2，按清单中的 `role` 生成 |

## 10. 风险

- **agent 写错位置**：如果 CLAUDE/AGENTS 和 sprint-workflow skill 没有同步更新，新会话会重新创建 `worklog/`。M5 已更新这几处；`check-boundaries.py` 可以加一条规则，拒绝根目录出现 `worklog/`（待 M8）。
- **改写归档**：AGENTS 已规定归档只读；以后可以在 lint 中校验归档文件的哈希。
- **跨仓库链接**：prs-stack README 中指向归档的相对路径，只在 dts-rdc 的完整检出里有效；在 prs-stack 单独检出时，需要改用 URL（M6 前处理）。
