# Sprint 规划复核与 PRS 基础承接（2026-09-26）

**范围**：文档规划、既有原型/资料接收、静态核对。没有实施 Sprint-5 的产品功能、运行新版本或发布仓库。

## 当前权威与状态

以 2026-09-25/26 的 Sprint-5 为本轮执行规划；ADR-1～4 已定，ADR-5～12 仍按各自 Task 定稿，不能因文档日期更新而视为已接受。
3 月 Sprint-1～4 未执行，其 READY 为历史记录，现退出活动队列。旧架构获批记录保留，变更部分按下表重排；未冲突的能力仍可用作后续设计输入。

| 历史规划/冲突 | 当前承接 | 验收或剩余事项 |
|---|---|---|
| Sprint-1 F1～F4、Sprint-2：Go bootstrap/commander、中间件生命周期 | 后续 infra sprint 重排 | 本期不实施 k8s/infra；并非功能已完成或取消 |
| Sprint-1 F5：Studio Python 后端骨架 | F1 合并现有 copilot；F0/ADR-005 决定实现语言 | 复用真实引擎，不同时建设独立头脑 |
| Sprint-3：Stack 同时承载 AI、数据、安全、平台 | 数据/BI 保留 Stack（ADR-6 待定），AI 进入 Studio（ADR-3 已定）；BL-S 承接安全 | Trino/Ranger/Iceberg 未运行，本期不假定已有 |
| Sprint-4：metro 首包、Operator 安装、签名信任链 | 首个验证 App 改 PRS；BL-A 做 Pack 注册运行时 | metro/Operator/完整第三方生态后排，不因有 Schema 就宣称信任链完成 |
| 旧 All-in-K8s、25 服务、Python/LangGraph 与新模块分工 | 旧文档加历史标记，BL-A/T20 后续按 Accepted ADR 修订规则 | 当前 Compose；Java 主体仍是 ADR-005 提议 |
| BL-D 调研等待 ADR-006，而 ADR 又等待 Q2/Q6 | F0/T17 前置波次 A 只读调查，F0/T13 定案后再 BL-D/T06～T10 | Q6 首次盘点不再后置到迁移 Task |
| 规则修订与 Schema 互相等待 | F0 先定原则，BL-A/T01 出 Schema/ADR-012，再 BL-A/T20 对齐细则 | Schema 用自带 fixture 验证，真实 Pack 在 BL-A 校验 |
| BI 用户资产允许服务账号代持 | BL-D 与 BL-S/T06 统一：已验证委托、真实用户权限/归属 | 不支持委托则拒绝保存；origin 字段不能替代鉴权 |
| mart 可用 NONE 却要求双租户安全 | BL-S 主竖线仅 RLS 或 VIEW_COLUMN | 无 tenant_id 的旧数据源不得计为主竖线 PASS |
| Pack 可放宽 SQL 函数白名单 | BL-S/T07 平台拥有允许清单，Pack 仅取交集 | 未知函数默认拒绝 |
| 旧答案/SQL hash 强制不变 | F0/T02 区分纯搬迁与已接受安全/口径变化 | 同租户/用户/快照/指标/Pack/模型上下文；安全零容差 |
| 留历史 Liquibase 与“白名单清零”冲突 | 不可变 changeset 按哈希登记例外，运行期 Finance 例外 BL-D 清零 | 不删除已执行迁移，不从历史迁移继续供运行数据 |
| BL-A/T18 在 B 却依赖 C 的 BL-S；预算在收尾才定义 | T04 移 C；F0/T18 在 A 定义、C 实测 | 最终竖线还依赖 BL-A/T17 的 UI 契约 |
| 新旧部署同 container_name、删改旧表影响回退 | F1/T04 独立部署身份；BL-D 保留旧表到回退窗口结束 | BL-E 证明旧版本可用及镜像/数据恢复 |

## PRS 资产已经接收，执行成果未自动继承

- [承接总表与 PRS-G01～G07 差异](../../../../dts-app-stack/prs-stack/worklog/v1.0.0/integration-20260926/README.md)
- [后端底座及 21 个历史页面能力映射](../../../../dts-app-stack/prs-stack/worklog/v1.0.0/integration-20260926/prototype-capability-map.md)
- [BOM 与公共镜像版本承接](../../../../dts-app-stack/prs-stack/worklog/v1.0.0/integration-20260926/version-handoff.md)
- [93 文件来源/字节数/SHA256 清单](../../../../dts-app-stack/prs-stack/worklog/v1.0.0/integration-20260926/source-manifest.json)
- [导入验证记录](../../../../dts-app-stack/prs-stack/worklog/v1.0.0/integration-20260926/import-validation.md)

9 月重写输入进入 `prs-stack/sources/` 与 `worklog/`，已有 3 月 `backend/ frontend/ pack/` 原样保留。
F0/T05 仅关闭“资料接收与静态差异登记”；F0/T06 仍待提交可拉取和构建，F0/T03 仍待新 BOM 运行验收。
来源目录没有独立 Git 历史，使用每文件哈希追溯；本轮没有修改原目录、提交/推送或移动 gitlink，也没有复制真实 `.env`。
镜像清单是 9 月 20 日锁定快照；本轮未向镜像仓库查新，不能称为今天最新，更不代表容器实际运行这些版本。

## 下一执行入口

1. F0/T01 关闭 Stack 权威仓库 Q1，确认正式构建路径；F0/T06 完成 PRS 子仓库交付，再由 F0/T07 更新指针。
2. F0/T03 新 BOM 基线；F0/T02 冻结带上下文的比较集；F0/T04 确认 K4 与待定业务口径。
3. F0/T17 先补 Q2/Q6；F0 完成 ADR-005～010，F1/T02 与 BL-A/T01 分别负责 ADR-011/012。
4. BL-S 按 PRS-G01～04 修复与验证身份、同步路由、只读/RLS 和主指标，不能把源码已有 DDL 视作通过。

## 本轮规划检查

Task/Feature 统计、父子状态、依赖及资料链接按最终工作副本检查；结果见 [planning-validation.md](planning-validation.md)。
