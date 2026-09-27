# BL-C: Console-BFF与真实数据接入

**优先级**: P0
**状态**: DRAFT（DRAFT=8）
**时间窗**: 2026-11（Sprint-6 W2 起骨架，W3 工作台与数据产品接入支撑 11-20 阶段 A，W4 全量切换）
**整合来源**: 新增工作流（2026-09-27 用户确定交付方法；决策见 Sprint-5 F0/T19 ADR-013）

## 目标
按 Sprint-5 F6 冻结的 Console 契约 v1 实现 BFF，把 DTS Console 的全部页面从 mock 切到真实数据。BFF 只负责与前端的交互（聚合、裁剪、校验、错误映射、身份透传）；领域能力由 BL-A/BL-S/BL-D、Wiki 与 PRS 按常规设计提供。

## 契约定义
| 类型 | 契约 | 说明 |
|------|------|------|
| OpenAPI | `dts-studio/console/contracts/*.openapi.yaml`（tag `console-contracts-v1`） | 由 Sprint-5 F6/T13 冻结 |
| 映射 | `../../../sprint-5-202610/assets/console-contract-map.md` | 页面动作 → BFF 端点 → 领域 API |
| 身份 | `X-DTS-*` 请求头（网关注入） | 原样透传，缺租户 fail-closed |

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-BFF骨架、身份透传与错误映射.md) | BFF骨架、身份透传与错误映射 | 新增 | P0 | DRAFT | BL-S/T04；Sprint-5 F6/T13（契约 v1 冻结） |
| [T02](T02-工作台BFF.md) | 工作台BFF | 新增 | P0 | DRAFT | T01；BL-S/T09（租户上下文）；BL-A/T04（注册表供数）；BL-S/T15（审计 outbox） |
| [T03](T03-数据产品BFF.md) | 数据产品BFF | 新增 | P0 | DRAFT | T01；BL-D/T17 |
| [T04](T04-知识BFF.md) | 知识BFF | 新增 | P1 | DRAFT | T01 |
| [T05](T05-Pack管理BFF.md) | Pack管理BFF | 新增 | P1 | DRAFT | T01；BL-A/T03；BL-A/T07（Pack 查询 API） |
| [T06](T06-审计BFF.md) | 审计BFF | 新增 | P1 | DRAFT | T01；BL-S/T17（审计存储与查询） |
| [T07](T07-评估与接管BFF.md) | 评估与接管BFF | 新增 | P1 | DRAFT | T01；BL-A/T10（评测集） |
| [T08](T08-Console切换真实数据与端到端验收.md) | Console切换真实数据与端到端验收 | 新增 | P0 | DRAFT | T02–T07；BL-S/T05（Console OIDC 登录） |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## 完成标准
- [ ] 所有 BFF 端点契约测试全绿，无业务规则、无业务数据库、无服务账号提权
- [ ] Console 全部页面在运行实例上以真实数据走查通过（T08）
- [ ] 关闭 Console 与 BFF 后，领域 API 与 PRS 原业务路径仍可用（铁律 #1）
