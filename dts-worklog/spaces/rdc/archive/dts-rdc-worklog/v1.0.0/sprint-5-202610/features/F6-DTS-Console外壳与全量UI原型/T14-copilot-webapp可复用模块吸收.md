# T14: copilot webapp 可复用模块盘点与吸收

**原编号**: 新增（2026-09-27 用户决定，2026-09-28 文档落地：旧 webapp 不迁移，只吸收有用模块）

**优先级**: P0 · **状态**: DRAFT · **依赖**: 盘点阶段可先读冻结的 copilot 基准；实施阶段依赖 F1/T01 前端归属清单、T01、T03、T04
**类型**: 盘点与前端移植；负责人待确认

## 目标与产出

`assets/copilot-webapp-harvest.md` 逐文件记录来源 SHA/路径、吸收/重写/不迁移、理由、目标文件、责任 Task 和原测试样例，覆盖旧 webapp 所有顶层目录。来源保持只读；“不迁移/删除”指新产品目标树不包含它，不是删除原仓库或其历史。

| 候选模块（原 src/ 下） | 处置与落点 |
|---|---|
| `components/copilot/useCopilotStream.ts`、`copilotStreamReducer.ts` | 提取状态转换与测试，适配 10 月 workspace REST/SSE 契约，由 T05 消费 |
| `MessageList*`、`copilotFixedReportMessage*` | 按 T03 的 antd 6 模式吸收表格/图表/引用规则；T05 负责页面集成 |
| `pages/AgentWorkspacePage.tsx`、agent-reports 相关页面 | 保留必要交互和用例，合并进 T05 或登记不迁移，不照搬布局 |
| BI 的 Cards/Dashboards/Collections/Database/Metrics/Public/fixed-reports | 不迁入 Console；在 BL-D/T10 对账 stack 功能与授权深链，T11 仅提供入口 |
| `pages/auth`、旧 nginx/vite 代理与部署脚本 | 不迁移旧登录；参考必要约束后由 T01、BL-S/T05 重建 |

## 实施边界与依赖

10 月类型来自 `console/contracts/workspace.openapi.yaml` 及其引用的 SSE Schema，不能等待 11 月 BL-A/T17。T14 交付可独立测试的模块及清单，T05 消费后完成页面四态、流式与消息渲染验收；T14 不反向依赖 T05 完成。11 月 BL-A/T17 对齐领域消息 Schema，BL-C/T02 做适配，不保留两套同名手写类型。

不得将旧 webapp 整目录、登录绕过或旧代理复制到新产品。来源中的凭据、用户数据与构建产物不进入吸收清单的交付内容。

## 完成标准

- [ ] 清单覆盖来源顶层目录，逐文件决定有来源 SHA、理由和目标责任，无遗漏模块被默认迁移。
- [ ] 被吸收模块按 T04 生成类型编译通过；原状态机/渲染样例转为组件测试，覆盖乱序/终止/错误事件和未知消息块。
- [ ] T05 已收到模块与测试入口；完整页面截图及 mock 走查由 T05、T13 验收，不用旧页面截图代替。
- [ ] 证据入 `it/console/harvest.md`（Sprint 根相对路径），原 webapp 不在 studio 构建、镜像或运行依赖中。
