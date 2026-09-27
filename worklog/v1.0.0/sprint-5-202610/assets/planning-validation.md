# 规划与资料接收校验（2026-09-26）

范围：本轮修改的 RDC 规划/入口、app-stack/PRS 入口与承接文档；原样接收的历史文档保留原字节及原状态，历史链接不作现行验收证据。

| 检查 | 结果 |
|---|---|
| Task 文件与 Feature 行数 | 83 个 Task / 83 行，14 个 Feature |
| 状态汇总 | READY=3、DRAFT=79、DONE=1；DONE 仅 F0/T05 文档/原型接收 |
| 父子状态及显式依赖 | Task 与 Feature 表一致；显式 Task 引用无缺失、无循环；Feature 级依赖另按波次人工核对 |
| 活动队列 | Sprint-1～4 退出 READY；历史 Task 由目录声明统一标为停用，未冒充已执行 |
| 核心冲突复核 | Q2/Q6 前置；Schema/规则解环；OBO 用户归属；主竖线禁 NONE；Pack 不扩权；回归上下文；不可变迁移例外；波次/并行回退对齐 |
| 相对链接 | 本轮新增/修改的当前文档链接逐个检查，目标存在；未来交付物仍以代码路径标注，不伪造文件 |
| 来源文件 | 93 文件原/目标 bytes 与 SHA256 一致；10 XML、1 JSON 解析通过 |
| 配置 | PRS Compose 使用 .env.example 静态展开成功；PG 挂载与公共镜像声明一致 |
| 差异卫生 | RDC / app-stack / prs-stack 的 git diff --check 均通过 |

本次未 build/test/deploy 产品；未更新远端或 gitlink。来源验证详见 PRS `integration-20260926/import-validation.md`。

## 仍然开放

- Q1 Stack 权威仓库与正式构建路径；Q2/Q6 BI 落点/真实资产盘点；Q4 共享 Keycloak 的运行事实。
- ADR-005～012 的正式决策，PRS R-013 与历史 SPEC/队列的后续同步。
- 新 BOM 构建与业务基线，PRS-G01～04 的身份、路由、口径与只读/RLS 验证。
- PRS 子仓库提交可拉取及两级父仓库指针更新，旧工作副本冻结与迁移。

这些事项均已有 Task 承接；本轮文档校验通过不将它们置为 PASS。
