# PRS 原型与能力承接

2026-09-26：用户所指原型为导入的 `sources/` 后端底座。既有 3 月页面原型作为补充参考保留，不扩大本期业务实现范围。

## 9 月后端原型（当前重写输入）

| 模块 | 已有内容 | 必须补证的部分 |
|---|---|---|
| prs-common | R 信封、异常、Long 字符串、身份上下文、OpenAPI | 新 BOM 编译与契约；部门头映射 |
| prs-auth | forwardAuth JWT/JWKS、会话代码 | groups→Organizations、缺租户拒绝、多组织选择；会话仍按原计划后续启用 |
| prs-platform | Liquibase 基线、tenant/dict/org/audit/outbox、项目表 | 空库迁移与角色权限实测；表存在不代表 Kafka relay 已实现 |
| prs-shadow | 身份回显、健康端点、模板实例 | 仅测试环境使用；不能作为业务功能验收 |
| prs-project | 项目只读接口、RLS、老库单向同步原型 | 新 BOM、受控只读账号、同步端点鉴权、K4 口径、双租户数据集、ODS 兼容链路 |

## 3 月页面原型（历史参考）

基准提交 `fc3d0e7`；21 个非测试页面文件。只确认文件与模块入口存在，本轮未启动浏览器、未验证交互或真实后端。
独立启动入口只挂载 MobileWorkbenchPage；联邦声明提供工作台/客户门户/经营看板三入口，不能把 21 个文件都算作可达菜单。
`exposes.ts` 的经营入口指向 OperatingCockpitPage，而 remote-entry 导出 ExecutiveCockpitPage，后续页面收敛需先确认实际构建入口。

| 文件 | 能力参考 | 承接方式 |
|---|---|---|
| [CustomerOverviewPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/customer/CustomerOverviewPage.tsx) | 客户入口与服务反馈 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [CustomerPortalHomePage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/customer/CustomerPortalHomePage.tsx) | 客户入口与服务反馈 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ServiceHistoryPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/customer/ServiceHistoryPage.tsx) | 客户入口与服务反馈 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [SubmitFeedbackPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/customer/SubmitFeedbackPage.tsx) | 客户入口与服务反馈 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ExecutiveCockpitPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/executive/ExecutiveCockpitPage.tsx) | 经营概览 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [OperatingCockpitPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/executive/OperatingCockpitPage.tsx) | 经营概览 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ReceivablesPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/finance/ReceivablesPage.tsx) | 财务对账与应收 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ReconciliationWorkbenchPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/finance/ReconciliationWorkbenchPage.tsx) | 财务对账与应收 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [FieldWorkbenchPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/mobile/FieldWorkbenchPage.tsx) | 现场作业与任务 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [MaintenanceRecordPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/mobile/MaintenanceRecordPage.tsx) | 现场作业与任务 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [MobileWorkbenchPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/mobile/MobileWorkbenchPage.tsx) | 现场作业与任务 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [MyTasksPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/mobile/MyTasksPage.tsx) | 现场作业与任务 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [PlantChangeDraftPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/mobile/PlantChangeDraftPage.tsx) | 现场作业与任务 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [TaskDetailPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/mobile/TaskDetailPage.tsx) | 现场作业与任务 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ContractListPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/pc/contract/ContractListPage.tsx) | 后台业务管理 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [CustomerListPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/pc/customer/CustomerListPage.tsx) | 后台业务管理 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [FeedbackTriagePage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/pc/ops/FeedbackTriagePage.tsx) | 后台业务管理 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [PositionTreePage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/pc/project/PositionTreePage.tsx) | 后台业务管理 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ProjectDetailPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/pc/project/ProjectDetailPage.tsx) | 后台业务管理 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [ProjectListPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/pc/project/ProjectListPage.tsx) | 后台业务管理 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |
| [PrsWorkbenchPage](../../../../../../../dts-app-stack/prs-stack/frontend/src/pages/workbench/PrsWorkbenchPage.tsx) | 工作台参考 | PRS 后续业务切片参考；分析类能力归 Stack，Agent 消息消费 Studio 契约 |

## 数据、制品与验收边界

- 3 月 `backend` 的 ProjectService 等以 ConcurrentHashMap 保存业务对象；工作台示例数值写在组件内。它们用于概念与交互参考，不能证明持久化、租户隔离或生产数据正确性。
- 3 月 `pack/pack-manifest.json` 声明 RPC 与联邦前端；Sprint-5 的 YAML 领域包承载语义/规则/模板/指标引用。F4/F5 须提供逐字段迁移表，不能因名称都含 Pack 就认为协议兼容。
- 迁入的 `sources/` 与原 `backend/` 独立构建；业务主线选择明确后才能删旧目录或切换默认脚本。本次不把两套后端同时部署。
- 新业务域范围、首批域排序、财务单据与口径签字仍归 PRS F1/F6；Sprint-5 只承接跨模块集成，不假定这些业务结论已完成。
