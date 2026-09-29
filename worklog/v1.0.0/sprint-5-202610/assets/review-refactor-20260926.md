# Sprint 文档重构复核（2026-09-26）

> 历史快照：本文保留当次统计、发现与结论，不作为当前 Task 数、状态或依赖证明。最新复核及修订结果见 [2026-09-27 文档复核](review-planning-20260927.md)；排期以最新产品规划和队列为准。

结论：**编号迁移与任务统计基本完整，但当前文档仍有阻断排程、接口实现、同步一致性和上线验收的冲突，不宜直接按整套 Task 顺序执行。**

本轮为文档评审，只新增本报告；不修改 Task/Feature 状态、不改产品代码、不构建或部署。评审对象为本地工作副本（含暂存与未暂存重构），读取时 HEAD 为 `179d718`；结论不代表该提交自身包含本轮全部重构。

## 范围与已通过检查

- Sprint-5 总览、6 个 Feature、67 个 Task；backlog 4 个 Feature、59 个 Task；编号映射、Wiki design/00–10 的相关契约与执行顺序、IT 证据及入口。
- `83 + 39 + 4 = 126`：122 个历史 Task 原编号唯一，另有 4 个新增；未发现 Task 因移动丢失或重复。
- 当前 Sprint 文档头汇总：DRAFT=45、READY=7、IN_PROGRESS=2、DONE=13；与 Feature/队列一致。Backlog 59 个全部 DRAFT。这里是文档状态核对，不是重新执行运行验收。
- 扫描 169 个链接候选；5 处属于示例内容或应用路由，实际文档链接未发现失效。不能据此推定代码块内的未来产物路径或自然语言任务引用都正确。
- 3 月 Sprint-1～4 保持历史停用定位；本轮不重新激活旧范围。

严重级别：P1 需在相关实现/排程/上线前修正；P2 需在关联 Task 转为可执行前对齐。以下按影响列出，共 P1=5、P2=5。

## R01 · P1 · 本月完成标准仍要求完成已调出的跨月工作

证据：[F0 完成标准](../features/F0-基线仓库落位与架构定案/README.md#L118)；[F0/T18 DoD](../features/F0-基线仓库落位与架构定案/T18-非功能预算与适应度函数.md#L28)；[本月与 backlog 范围](../README.md#L203)。

F0 仍要求 `.rules` 冲突清零，而执行者 BL-A/T20 已放到 11 月；F0/T18 仍要求 SqlGuard、Pack、审计等检查进入 CI 并实测，且明确“波次 C 才完成 Task”，对应实现则已移到 11–12 月。Sprint 本月目标只要求 ADR 定稿、冲突登记和预算定义。

影响：按 Task/Feature DoD 执行，10 月 F0 无法完成；按 Sprint DoD 关闭，又会留下未完成子项。

建议：在既有 F0 中明确本月可独立验收的原则/预算定义产出，将后续接入 CI、实测、完整规则修订的完成条件交给对应 BL Task；同步 Feature DoD 与 Gate 适用范围。

## R02 · P1 · Wiki 主契约仍指向旧 API 和旧 OIDC 回调

证据：[主竖线契约](../README.md#L99)；[路径授权及业务 API](../features/F2-Wiki平台骨架身份与性能/design/03-后端设计.md#L76)；[OIDC Task 的现状说明](../features/F2-Wiki平台骨架身份与性能/T09-应用内OIDC登录与会话.md#L5)。

主竖线仍写 `/login/oauth2/code/keycloak`、`PUT /api/pages/{id}` 和 `{baseVersion,content}`。当前权威设计规定回调 `/login/oauth2/code/oidc`、`PUT /api/wiki/pages/{id}/content` 和 `{baseVersionNo,contentMd}`；`/api/pages` 等生成实体端点仅 ADMIN 可用。F3/F5 的附件、历史、评论 Task 也仍写旧 `/api/...` 路径。

影响：实现者按总览或 Task 接线会得到 403/404、保存字段不匹配或登录回调失败；用管理员测试还可能掩盖误接生成接口的问题。

建议：以 design/03 和实际验收记录为基准，统一主竖线、Feature 契约与消费 API 的 Task；旧契约保留在明确的历史区，不作为本期实现指令。

## R03 · P1 · 同步推送被拒后，成功 rebase 会跳过远端入站

证据：[同步周期步骤 4–7](../features/F2-Wiki平台骨架身份与性能/design/04-git同步设计.md#L47)；[入站以 lastSyncedCommit 求差异](../features/F2-Wiki平台骨架身份与性能/design/04-git同步设计.md#L65)；[出站重试与推进同步点](../features/F4-Wiki-Git双向同步/T04-wiki到git出站同步.md#L10)。

设计在入站完成后执行出站；若这时远端产生新提交，push 被拒后的分支是 fetch → rebase → push。rebase 成功的路径没有再次入站，却在 push 成功后把 lastSyncedCommit 设为包含该远端提交的新 HEAD。

影响：例：本轮已导入 R0，网页改 A，开发者并发提交 B=R1；rebase 后推送 P1 并把同步点设为 P1，但 PG 从未应用 B。下一轮 diff(P1, P1) 为空，Wiki 会永久漏掉 B，违背双向一致。这是设计路径推演，未声称现有产品已出现该故障。

建议：任何远端前移都应先完成新的入站/冲突处理，再重放 outbox；只有 PG 已吸收该远端区间才能推进 checkpoint。补“入站后、push 前远端新增不同文件/同文件不同段”的竞争用例，并验证 PG/git 最终内容一致。

## R04 · P1 · 生产切换排在完整竖线验收之前

证据：[切换前置](../features/F5-Wiki检索协作与上线/T09-并行运行切换与回退.md#L5)；[竖线验收前置](../features/F5-Wiki检索协作与上线/T10-竖线验收与DoD.md#L5)；[设计要求先验收再切换](../features/F2-Wiki平台骨架身份与性能/design/06-部署与运维.md#L99)。

F5/T09 只依赖导入和备份，随后修改生产域名并停止旧容器；完整验收 F5/T10 反而依赖 T09。设计明确要求先在 18091 完成验收再切换；搜索、评论通知等 F5/T01–T06 也不在 T09 前置链中。

影响：遵循 Task 顺序可能先切生产，再发现同步、权限、检索或协作不符合要求。

建议：将 T10 的完整验收拆成“切换前验收”和“切换后冒烟”两个明确阶段；T09 必须消费切换前通过证据及本期必交付能力清单，不能等待生产切换后才首次执行完整验收。

## R05 · P1 · W12 被合进首次导入 Task 后形成先后顺序冲突

证据：[T05 新增 W12 完成范围](../features/F4-Wiki-Git双向同步/T05-首次导入与现网内容迁移.md#L20)；[唯一执行顺序](../features/F2-Wiki平台骨架身份与性能/design/10-v1.1变更与重构清单.md#L203)；[上线依赖 T05](../features/F5-Wiki检索协作与上线/T09-并行运行切换与回退.md#L5)。

F4/T05 现在同时包含首次导入和 W12 frontmatter 迁移，后者要求 dry-run 确认及 apply 证据。但 design/10 将 W12 排在 W7–W10“上线”之后；W6 本身又要求完成 F4/T01–T06，上线 T09 还直接依赖 T05。

影响：若 T05 必须含 W12 才 DONE，W6 和上线就必须等待排在它们之后的 W12；若导入完成即关 T05，则新增迁移范围失去跟踪。

建议：在既有 F4 中将首次导入与后续元数据迁移设为两个可独立验收的 Task/切片，或明确调整 W12 到上线前；同步 Task 依赖、Feature 表、执行顺序和切换前置。

## R06 · P2 · 部署 Task 会把已定单 jar 和内存预算改回旧架构

证据：[生产编排 Task](../features/F5-Wiki检索协作与上线/T07-生产部署编排与非功能验证.md#L8)；[单 jar 及 JVM 预算](../features/F2-Wiki平台骨架身份与性能/design/06-部署与运维.md#L25)；[已定 W-ADR-2](../README.md#L68)。

T07 仍要求 wiki-web nginx 独立前端服务、app MaxRAMPercentage=60、上限 2 GB；最新设计与 W-ADR-2 要求前端打入同一 jar、wiki-app 直接提供页面，SerialGC、50%、768 MB 上限、RSS <400 MB。F2/T01 也保留旧 app/web 双镜像与 actuator 路径。

影响：后续发布实现可能按旧 Task 重建多余服务，并回退 F2/T12 已要求的性能结果。

建议：统一镜像集合为当前 app/db、健康检查路径为 management，T07 直接消费已定部署/性能契约，删除有效正文里的旧架构指令。

## R07 · P2 · frontmatter 迁移规则不能正确保留重构后的依赖

证据：[W12 解析与删行规则](../features/F2-Wiki平台骨架身份与性能/design/10-v1.1变更与重构清单.md#L220)；[实际 BL 交叉依赖](../../backlog/features/BL-A-AppPack运行时与领域资产外置/T11-garden工具声明化.md#L7)。

迁移覆盖 backlog，但 depends 只提取 `F\d+/T\d{2}` 和 `T\d{2}`。实际有 `BL-S/T08`、`BL-A/T20`、Task 范围及整 Feature 依赖；前两类可能被当成当前 Feature 的本地 T08/T20，范围只能留下端点。抽取成功还会删除原依赖行。类型推断也只写 F<n> 目录，未写 BL-* 与 it/wiki 嵌套证据目录。

影响：JSON Schema 校验即使通过，也可能已经改错依赖关系或丢失原说明，影响后续 Agent 按 frontmatter 排程。

建议：定义覆盖 S/F/T、BL、范围、整 Feature 的解析规则；无法无损解析时保留完整 depends_note 和原行。迁移前后按完整 ID 比对依赖边集合，不能仅校验字段类型。

## R08 · P2 · 重编号后部分依赖变成自引用，READY 也未重新评估

证据：[F0/T10 依赖整个 F0](../features/F0-基线仓库落位与架构定案/T10-入口文档与目录约定更新.md#L7)；[READY 依赖 DRAFT 附件](../features/F3-Wiki内容编辑与版本/T14-archify图即代码.md#L5)；[READY 依赖未完成内容契约](../features/F3-Wiki内容编辑与版本/T15-Agent只读接口与llms.txt.md#L5)。

原入口文档任务依赖旧 F2；合并后改成 F0/T10 依赖整个 F0，而它自己就在 F0 内。F3/T14 标 READY，但直接依赖 DRAFT 的 T08；F3/T13–T15 又把待完成的 T12/T13 当作可用前置。主顺序规定 T13 先于编辑器 T06，T06 的依赖栏却没有 T13。

影响：按 Feature 完成条件调度会自阻塞；按 READY 开工则容易在契约尚未实现时启动集成任务。

建议：F0/T10 精确依赖本月 ADR Task 集合；区分可先行设计的 READY 与要求组件可用的开发/集成 READY，并同步实际前置 Task。不要再对新旧编号做不带语义的整段替换。

## R09 · P2 · 两个工作流会写同一个预算文件，证据位置仍有旧路径

证据：[工作流 A 预算产物](../features/F0-基线仓库落位与架构定案/T18-非功能预算与适应度函数.md#L29)；[Wiki 预算产物](../features/F2-Wiki平台骨架身份与性能/T04-非功能预算初稿.md#L8)；[Wiki Gate 期待命名空间路径](../README.md#L194)。

F0/T18 和 F2/T04 都指定 `assets/nfr-budget.md`，但 Sprint Wiki Gate 指向 `assets/wiki/nfr-budget.md`；F5/T07 也引用未分流的预算路径。Wiki 的若干 Task/DoD 仍写 `it/IT-03-sync.md`、`it/IT-05-cutover.md`，实际证据索引已移到 `it/wiki/`。

影响：并行编写会覆盖或混合两套预算，验收执行可能读到错误门槛；证据文件即使存在也不能被登记表准确定位。

建议：A 保留 assets/it 根目录；Wiki 统一 assets/wiki、it/wiki，修正所有产出方和消费方的路径，包括反引到该文件的 Gate。

## R10 · P2 · 历史校验结论及登录 Gate 没有随重构失效或同步

证据：[旧 83 Task 校验报告](planning-validation.md#L7)；[Wiki G0 仍 PENDING](../README.md#L191)；[基线自报 PASS](../it/wiki/baseline.md#L40)；[登录 Task 仍称未做真实登录](../features/F2-Wiki平台骨架身份与性能/T09-应用内OIDC登录与会话.md#L5)。

planning-validation 仍写 14 Feature/83 Task、DONE=1、显式依赖无环，却没有明确标成重构前快照。Wiki baseline 的人工确认段已写 PASS，F2/T01 也据此 DONE，但 Sprint Gate 和 it/wiki 索引仍 PENDING，F2/T09 还保留“待执行回调脚本/真实登录”。

影响：后续执行者会把旧结构的校验结论当成当前保证，或重复已记录完成的登录配置；也难以区分登录通过与登出/会话等剩余项。

建议：将旧校验报告明确标记适用的旧结构/时间点；按最新证据刷新 Gate 与剩余事项，F2/T09 只列尚未完成的验证。不因一条登录证据把整项会话能力自动改成 DONE。

## 容量与验收边界

目前只给出约 17 个工作日、67 个 Task、10-20 再退回 P1 的安排，尚未给出人员可用容量、任务估算、QA/联调/修复占用。不能仅凭 Task 数断言一定超载，也不能据此确认两条工作流能在 10-31 同时交付。建议先选定最小可验收范围并给出容量假设，再把候选范围与月度承诺分开。

本轮未重新连接 .50，也未核验历史文档所称的运行 PASS。R10 仅比较现有证据与状态登记的内部一致性。

## 建议修订顺序

1. 先处理 R01/R05/R08：确定本月边界，拆清跨阶段验收，消除自依赖并统一 READY 语义。
2. 统一 R02/R06/R09：以已定 Wiki 架构和最新 design 为准回写所有 Task、API、部署和证据路径。
3. 补 R03/R04 的同步竞争场景与切换前验收门槛，再让同步/上线 Task 进入实施。
4. 修复 R07 的迁移语法和依赖守恒校验，最后按 R10 刷新本轮校验与 Gate。旧报告保留历史，不覆写原证据。
