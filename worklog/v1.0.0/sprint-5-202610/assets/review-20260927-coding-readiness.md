# Sprint-5 编码就绪评审（2026-09-27）

> 09-28 校正：本报告是修改前评审，开头“83 项”包含当时尚未落地的 T14，不能当作当时实有文件数；原 G2 的“无用户表”判断不成立，当前代码与基线均有 jhi_user。Q1 已关闭，当前建议/任务状态以 [本轮复核](review-planning-20260928.md) 为准，不继续执行下面旧的 Q1 询问或 products.json 恢复命令。

**问题**：Sprint-5 各 Task 是否已有足够的详细设计，编码会话能否直接开工？
**方法**：
- 对 83 个 Task 文件做结构扫描：有无技术设计、验证和 DoD 章节，具体契约数量，未决标记，依赖是否就绪。
- 逐 Feature 抽读：Wiki 设计文档 00–10 与 JDL、F6 各 Task、F0/F1 的前置条件、dts-studio 仓库现状。
**性质**：评审结论与修正指令。文档修改由实施会话执行，本文件不自带修改。

## 1. 结论

| 工作流 | Feature | 判定 | 说明 |
|--------|---------|------|------|
| B Wiki | F2 平台骨架 | **可继续编码** | 已完成 8 个、进行中 2 个；剩余 T04（预算初稿）、T11（新建空间自动建 Keycloak 角色）设计足够 |
| B Wiki | F3 内容编辑与版本 | **可直接编码**（T10–T12、T14、T15）；T16 待 T15 | 设计文档 03/05/09/10 覆盖接口、渲染与契约；Task 文件短，以设计文档为准 |
| B Wiki | F4 Git 双向同步 | **可编码，真实推送被阻塞** | 04 同步设计完整（状态机、入站/出站、冲突）；先用本地裸仓库测试，真实推送需 GitHub deploy key（用户操作） |
| B Wiki | F5 检索协作上线 | **补设计后编码**（T03、T05），其余可编码 | 见 §3 G1、G2；T06 邮件依赖 SMTP，未配置时降级为站内通知 |
| C Console | F6 外壳与原型 | **T01–T03 可直接开工**；T04–T13 需先补 §3 G3–G6 | 原型阶段的契约由原型本身产出，设计粒度合适；缺 mock 身份、PRS 挂载对象、类型来源三项决定 |
| A 四模块 | F0 基线与架构定案 | **不是编码任务** | T06/T08/T09 是仓库/密钥运维（READY，可执行）；其余是调查与 ADR 文档；T01 被用户问题 Q1 阻塞，连带 T02–T04、T07、T12、T13、T16 |
| A 四模块 | F1 copilot 并入 studio | **暂不可编码** | 依赖 ADR-005（F0/T12）、ADR-006（F0/T13）定稿与 F0/T01；另需先执行 copilot webapp 删除的实施指令（`handoff-20260927-remove-copilot-webapp.md`，影响 T01–T04）；只有 T02 合并演练可在 F0/T08 后先做 |

**总判断**：
- Wiki 编码会话可以不停工继续；
- Console 编码会话可以从 F6/T01–T03 开工；
- 四模块工作流目前是"决策与运维"阶段，真正的编码（F1 合并）要等 Q1 与 ADR-005/006。

## 2. 各会话可立即开始的清单

| 会话 | 立即开始 | 开工前必读 | 完成后留证 |
|------|----------|------------|------------|
| Wiki（muse spark，dts-wiki `feat/W1-scaffold`） | F3/T15 → T14 → T16；F3/T10–T12；F4/T01–T06（本地裸仓库）；F5/T01、T02、T04 | 设计 08、10 §5 的执行顺序；本文 §3 G1、G2 修正后再做 F5/T03、T05 | `it/wiki/` |
| Console（待指派） | F6/T01 → T02、T03（G3–G6 修正后做 T04 起） | ADR-013（F0/T19）、F6 README、本文 §3 | `it/console/` |
| 运维/仓库 | F0/T08（studio 去嵌套 submodule）、F0/T09（密钥出库与轮换）、F0/T06（prs git 化） | 各 Task 文件；F0/T09 的轮换需要用户在各服务改密码 | `it/IT-01-repo-layout.md` |
| 规划（本会话） | F0/T12–T16、T19 的 ADR 推进（需用户拍板） | Sprint README ADR 表 | Sprint README |

## 3. 需要修正的缺口（实施会话执行）

| # | 位置 | 缺口 | 修正指令 |
|---|------|------|----------|
| G1 | F5/T03 收藏、最近浏览、标签 | Task 写了 `page_favorite`、`page_view` 两张表，但 `dts-wiki/jhipster/dts-wiki.jdl` 的 14 个实体中只有 `Label`，没有收藏和浏览记录；设计 02 领域模型也未收录 | 在 T03 中明确：`page_favorite`、`page_view` 走 JDL 实体还是自定义 Liquibase（按设计 02 的规则：非 JHipster 实体用 `9xxx_*.xml` + JdbcTemplate，参照 `9004_page_meta`）；补字段、唯一约束（`uk(user_login, page_id)`）、`page_view` 每人保留 50 条的清理方式；设计 02 同步增补 |
| G2 | F5/T05 提及与关注 | 提及候选来自 `app_user`，但工程是 oauth2 + `skipUserManagement true`，没有 JHipster 用户表 | 明确候选来源：从 Keycloak Admin API 按空间角色（`dts-wiki:space-<slug>`）查询并缓存，或维护登录时写入的本地用户快照表（自定义 changeset）；二选一写入 T05 与设计 03 |
| G3 | F6/T02、T04 mock 模式 | mock 模式下没有定义"当前身份"，T02 要求按角色截图菜单却无法切换角色 | 在 T04 增加 mock 身份：`mocks/identities.json` 定义 5 个演示身份（业务用户、数据维护者、Pack 维护者、审计员、平台管理员；各带租户），顶栏提供仅 mock 模式可见的身份切换器；BFF 模式下该控件不渲染 |
| G4 | F6/T11 PRS 页面挂载 | 挂载对象不明：`prs-stack/frontend` 是 3 月原型（React 18，无 antd），PRS BOM 的新前端（React 19.2 + antd 6.6）尚未实现；React 18 远程模块挂进 React 19 宿主会出现共享单例冲突 | 本月只做挂载机制：用一个符合 BOM 的最小 PRS 远程模块样例（单页）验证 host/remote 约定，3 月原型不挂载；PRS 真实页面的挂载在 PRS 新前端就绪后另加 Task。T11 目标与验证按此改写 |
| G5 | F6/T05 与吸收清单 | 实施指令中 F6/T14 写"改用 BL-A/T17 生成类型"，但 BL-A/T17 在 11 月，10 月原型拿不到 | 原型阶段消息类型一律由 `console/contracts/workspace.openapi.yaml` 经 `openapi-typescript` 生成；BL-A/T17 在 11 月把 DAP 消息 Schema 与该契约对齐（在 BL-A/T17 加一条"与 console-contracts-v1 的 workspace 契约对齐"） |
| G6 | F6/T01 仓库位置 | `dts-studio` 当前仍含嵌套的 `app-stack/`、`dts-stack/` 空目录（F0/T08 待清理），11 月前 F1 还要把 copilot 历史合并进来 | F6/T01 依赖补 F0/T08；Console 工作在 dts-studio 分支 `feat/console` 上进行，F1/T03 合并 copilot 后再 rebase；`console/` 与 `console-bff/` 不得与 F1 的 `engine/` 目录重名 |
| G7 | Sprint README / F0 README | F0/T01 被用户问题 Q1 阻塞，连带 T02–T04、T07、T12、T13、T16 与整个 F1，Sprint README 没有把这条关键阻塞显式标出 | 在 Sprint README 的 Gate Registry 下方增加"关键阻塞"一行：Q1（dts-stack 权威仓库）→ 阻塞 F0 大部分与 F1；需要用户在 10-09 前答复 |

## 4. 需要用户决定或操作的事项

| 事项 | 阻塞范围 | 期限建议 |
|------|----------|----------|
| **Q1 dts-stack 权威仓库**：GitHub `dts-stack` 当前内容是哪份？`s10-stack`（`/opt/prod/s10/v2.2.3`）与 `PRS/dts-stack` 的关系？ | F0/T01 及其下游、F1 全部 | 10-09 |
| ADR-005～010 拍板（推荐方案见 Sprint README ADR 表：Java 头脑、BI 归 stack、口径 SoT 归 stack、Traefik+forwardAuth、QueryGateway、版本基线只评估） | F1、11 月全部 backlog | 10-16 |
| GitHub deploy key（写权限）：dts-rdc、prs-stack | F4 真实推送、F5/T09 切换 | 10-19 |
| SMTP 账号 | F5/T06 邮件通知（可降级） | 可延后 |
| Wiki 开放问题 Q1–Q3（PRS 是否需要 docs/、原生页导出备份、`products/prs/` 去留） | F4/T02 配置、F5/T05–T06 | 10-19 |
| Console 执行会话指派 | F6 全部 | 10-08 |

## 5. 额外发现（紧急）

- **工作区中 `products.json` 被删除（未提交）**。现网 wiki（`wiki.yuzhicloud.com`，.50 `/data/dts-wiki`）的构建脚本 `wiki/scripts/prepare-content.mjs` 在读取不到 `products.json` 时直接报错。
  - 一旦这个删除被提交并推送，现网 wiki 的下一次同步构建就会失败。
  - `products.json` 必须保留到 F5/T09 切换完成、旧 wiki 下线之后。
  - 请删除它的会话恢复该文件：`git checkout -- products.json`。
- dts-app-stack 子模块内部有未提交改动，属于 prs-stack 工作副本，本次未评审。

## 6. 本评审未覆盖

- backlog（Sprint-6 候选）：按规则在 11-02 转入时再做就绪评审；
- 代码质量：dts-wiki 已有代码的评审另行进行。

## 7. G1～G7 落地回执（2026-09-28，仅文档）

| 缺口 | 修订结果 |
|---|---|
| G1 | F5/T03、design/02、03 已补自定义迁移、约束、并发裁剪、接口和权限测试；标签改为单一 frontmatter 写入源 |
| G2 | 纠正无用户表判断；F5/T05 复用 jhi_user，并补目标用户当前授权、候选/通知撤权与显式取消关注；没有新建 app_user |
| G3 | F6/T04 增加六类 mock 身份（补业务负责人）、异常身份与生产隔离 |
| G4 | F6/T11 改为同 BOM 最小 mock remote；真实 PRS 页面在已有 BL-C/T08 跟踪，未满足时不算完成 |
| G5 | 10 月类型从 workspace REST/SSE 契约生成；BL-A/T17 的领域 Schema 与 BFF 映射在 11 月对齐 |
| G6 | F6/T01 写入 studio 前依赖 F0/T08；设计可先行，集成共享分支不擅自 rebase |
| G7 | Q1 已关闭，F0/T01 改 IN_PROGRESS 继续剩余对账；未自动解锁全部下游 |

本轮未提交，不能填写“已修正（提交号）”或宣称代码开工条件全部满足。
