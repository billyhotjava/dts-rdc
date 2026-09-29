# F6: DTS-Console外壳与全量UI原型

**优先级**: P0
**状态**: DRAFT（READY=3 / DRAFT=11）
**时间窗**: 2026-10（T01～T04 于 10-09 起；页面原型 10-12～10-21；T13 契约冻结 10-23）
**整合来源**: 新增工作流（2026-09-27 用户确定交付方法；决策见 F0/T19 ADR-013）

## 目标
基于 antd 6 自建、借鉴 shadcn-admin 模式的 DTS Console 外壳，用 mock 数据把 v1.0.0 T02 路由与 T05～T12 约定动作的全部界面先做出来，经业务评审后冻结 OpenAPI 契约 v1，驱动 Sprint-6 的 BFF（BL-C）与领域模块开发。

## 契约定义
| 类型 | 契约 | 说明 |
|------|------|------|
| REST + SSE | `dts-studio/console/contracts/*.openapi.yaml` | REST 契约源，配套 SSE 事件 Schema；按页面域拆分；T13 冻结为 `console-contracts-v1` |
| Mock | `dts-studio/console/mocks/` | MSW，按契约实现；fixture 取 PRS 种子数据的真实形状 |
| 映射 | `assets/console-contract-map.md` | 页面动作 → BFF 端点 → 领域 API（T13 输出） |

## UI/UX 规格
- 入口、导航与页面清单：见 T02 路由表。
- 视觉与交互模式：见 T03；每个页面都有空/加载/错误/成功四态。
- 操作走查：各页面 Task 的“验证”即走查脚本，由 T13 汇总执行。

## Task 列表

| ID | Task | 原编号 | 优先级 | 状态 | 依赖 |
|----|------|--------|--------|------|------|
| [T01](T01-外壳工程骨架与技术基线.md) | 外壳工程骨架与技术基线 | 新增 | P0 | READY | 设计准备消费 F0/T19 已定方向；写入 studio/console 前须 F0/T08 完成 |
| [T02](T02-信息架构、导航与权限菜单.md) | 信息架构、导航与权限菜单 | 新增 | P0 | READY | T01 |
| [T03](T03-设计令牌与交互模式库.md) | 设计令牌与交互模式库 | 新增 | P0 | READY | T01 |
| [T04](T04-契约与Mock工具链.md) | 契约与Mock工具链 | 新增 | P0 | DRAFT | T01、T02 路由/角色设计、F0/T19 |
| [T05](T05-智能体工作台原型.md) | 智能体工作台原型 | 新增 | P0 | DRAFT | T02–T04、T14（可独立测试的吸收模块，不等待 T05 页面验收） |
| [T06](T06-数据产品原型-在营项目.md) | 数据产品原型-在营项目 | 新增 | P0 | DRAFT | T02–T04 |
| [T07](T07-知识检索与引用原型.md) | 知识检索与引用原型 | 新增 | P1 | DRAFT | T02–T04 |
| [T08](T08-Pack管理原型.md) | Pack管理原型 | 新增 | P1 | DRAFT | T02–T04 |
| [T09](T09-审计与追溯原型.md) | 审计与追溯原型 | 新增 | P1 | DRAFT | T02–T04 |
| [T10](T10-评估与人工接管原型.md) | 评估与人工接管原型 | 新增 | P1 | DRAFT | T02–T04 |
| [T11](T11-PRS与stack页面挂载.md) | PRS与stack页面挂载 | 新增 | P1 | DRAFT | T01、T02、T04 |
| [T12](T12-我的身份与租户页.md) | 我的身份与租户页 | 新增 | P2 | DRAFT | T02、T04 |
| [T13](T13-原型评审与契约冻结v1.md) | 原型评审与契约冻结v1 | 新增 | P0 | DRAFT | T05–T12 |

| [T14](T14-copilot-webapp可复用模块吸收.md) | copilot webapp 可复用模块盘点与吸收 | 新增（09-28 落地用户决定） | P0 | DRAFT | 盘点阶段可先读冻结的 copilot 基准；实施阶段依赖 F1/T01 前端归属清单、T01、T03、T04 |

> 新需求或 review 发现的问题：在本表追加 Task（编号顺延），不新建 Feature。

## Definition of Ready
- [x] 交付方法与边界已定（ADR-013）  - [x] 路由与角色已列（T02）  - [ ] 页面契约随原型产出  - [x] 验收为 mock 走查 + 业务签字

## 完成标准
- [ ] T02 路由表中每个页面在 mock 模式下可完整走查，四态齐全
- [ ] 契约 v1 冻结，`console-contract-map.md` 覆盖全部页面动作，领域 API 缺口已登记为对应 Feature 的 Task
- [ ] 业务负责人签字确认原型

copilot webapp 不迁移，T14 先交独立模块与测试供 T05 集成；界面契约不等待 11 月 DAP 类型包。T11 本月仅验证同 BOM 的 mock remote；真实 PRS 页面供给由 BL-C/T08 跟踪。
