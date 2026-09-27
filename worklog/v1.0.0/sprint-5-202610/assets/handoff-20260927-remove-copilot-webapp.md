# 实施指令：不保留 copilot webapp，按模块吸收进 DTS Console（2026-09-27）

**决策来源**：用户 2026-09-27——“因为是新建产品，所以并不需要过渡阶段，可以把 copilot webapp 全部删除，只吸取其中有用的模块”。
**性质**：规划文档修改指令（只改 dts-rdc `worklog/` 下的文档，不涉及代码仓库）。由实施会话执行，本文件不自带修改。
**前置阅读**：ADR-013（`sprint-5-202610/features/F0-基线仓库落位与架构定案/T19-ADR013界面原型先行与契约驱动BFF.md`）、F6 README、BL-C README。

## 1. 决策要点（所有修改以此为准）

1. copilot webapp（`dts-copilot-webapp`，365 个 TS 文件）**不并入** dts-studio，不设过渡期，也不作为回退路径；其 git 历史留在冻结的 copilot 原仓库（F1/T05）。
2. 有用的模块按清单**吸收**进 `dts-studio/console/`：用 antd 6 与 F6/T03 模式重写或移植，不整目录拷贝。
3. 回退方式统一为“回滚到上一个 Console / BFF 镜像版本”，不再有“切回旧 webapp”。
4. 后端（engine-ai、engine-analytics）的合并与并行运行安排**不变**；本次只涉及前端。

## 2. 新增 Task：F6/T14 copilot webapp 可复用模块盘点与吸收

在 `sprint-5-202610/features/F6-DTS-Console外壳与全量UI原型/` 新建 `T14-copilot-webapp可复用模块吸收.md`，内容要点：

- 头部：`**原编号**: 新增（2026-09-27，用户决定 copilot webapp 不迁移、只吸收有用模块）`；`**优先级**: P0 · **状态**: READY · **依赖**: F1/T01（归属清单）、T01、T03`。
- 目标：盘点 copilot webapp 中值得保留的模块，形成吸收清单并迁入 Console；其余一律不迁移。
- 盘点对象（以账本#20 为起点）：
  | 模块 | 位置（CP/dts-copilot-webapp/src/） | 处置 | 去向 |
  |------|-----------------------------------|------|------|
  | 流式会话状态机 | `components/copilot/useCopilotStream.ts`、`copilotStreamReducer.ts` | 移植（改用 BL-A/T17 生成类型） | F6/T05 |
  | 消息渲染（表格、图表、动作建议、固定报表卡片） | `components/copilot/MessageList*`、`copilotFixedReportMessage*` | 按 T03 模式重写，保留渲染规则与测试样例 | F6/T05 |
  | 工作台页面交互 | `pages/AgentWorkspacePage.tsx` | 只吸收交互流程，不拷贝布局 | F6/T05 |
  | agent-reports | `agent-reports` 相关页面 | 评估：并入工作台或删除 | F6/T05 |
  | BI 页面（Cards/Dashboards/Collections/Database*/Metrics/Public*/fixed-reports） | `pages/*` | 不迁移，功能归 stack（ADR-006），Console 仅 `/bi` 跳转 | F6/T11、BL-D/T10 |
  | 登录页 `pages/auth` | — | 删除（Console 走 Keycloak OIDC，BL-S/T05） | — |
  | nginx/vite 代理配置与测试 | `webappNginx.test.ts` 等 | 参考后重写于 Console 部署 | F6/T01 |
- 产出：`sprint-5-202610/assets/copilot-webapp-harvest.md`（逐文件：吸收 / 重写 / 删除，理由，去向 Task）；被吸收模块在 Console 中的单元测试沿用原测试样例。
- 验证：吸收清单覆盖 webapp 全部顶层目录；F6/T05 工作台原型中流式、四态、表格/图表消息渲染与 copilot 现有截图对照一致。

同步：F6 README 的 Task 表加 T14 行，状态统计改为 READY=5、DRAFT=9；T05 的依赖改为 `T02–T04、T14`。

## 3. 逐文件修改清单

路径均相对 `worklog/v1.0.0/`。

| # | 文件 | 修改 |
|---|------|------|
| 1 | `sprint-5-202610/features/F1-copilot并入dts-studio/README.md` | 契约表“目录”行删去 `webapp/（原 dts-copilot-webapp）`；“镜像”行删去 `dts-studio-webapp`；“UI/UX 规格”改为：copilot webapp 不并入 studio，可用模块由 F6/T14 吸收；合并验收以 engine API 回归（F0/T02 golden set）为准，不再以 webapp 截图验收 |
| 2 | `…/F1-copilot并入dts-studio/T01-copilot逐包逐资源归属清单.md` | 第 7 项改为：webapp 不迁移，逐文件标注“吸收（去向 F6/T14）/ 删除”，清单交给 F6/T14 |
| 3 | `…/F1-copilot并入dts-studio/T02-保留历史的合并方案演练.md` | 删除 `--path-rename engine/dts-copilot-webapp/:engine/webapp/`；在第 4 步 `--invert-paths` 中加入 `--path engine/dts-copilot-webapp`；注明 webapp 历史保留在冻结的原仓库 |
| 4 | `…/F1-copilot并入dts-studio/T04-构建compose镜像与脚本路径修复.md` | 删除第 4 项（webapp vite/nginx）；验证项“webapp 可以打开工作台（截图）”改为“`curl` 调用 `/api/ai/agent/chat/send` 返回与 F0/T02 基线一致” |
| 5 | `sprint-5-202610/features/F6-DTS-Console外壳与全量UI原型/T01-外壳工程骨架与技术基线.md` | 删除“与旧 webapp 的关系……作为回退路径”一行，改为：copilot webapp 不迁移，有用模块由 T14 吸收；回退以 Console 镜像版本回滚实现 |
| 6 | `sprint-5-202610/features/F0-基线仓库落位与架构定案/T19-ADR013界面原型先行与契约驱动BFF.md` | 决策第 4 条末尾补：copilot webapp 不迁移，按 F6/T14 吸收有用模块，不设过渡期 |
| 7 | `sprint-5-202610/README.md` | ADR-13 行补同一句；端到端契约链“UI 入口”行改为：DTS Console `/workspace`（F6/T05，吸收 copilot 工作台交互，F6/T14）；账本#20 保持原样（事实记录） |
| 8 | `backlog/features/BL-S-铁律安全基座-网关出口审计/T05-Studio-webapp-OIDC登录.md` | 文件重命名为 `T05-Console-OIDC登录.md`，标题改为“Console OIDC 登录”；目标改为“DTS Console 使用 Keycloak OIDC（Authorization Code + PKCE）登录”，删去“过渡期保留的 Studio webapp”；同步改 BL-S README 的 Task 行链接与名称 |
| 9 | `backlog/features/BL-S-铁律安全基座-网关出口审计/README.md` | 路由契约 `studio.*` → `engine-ai / console / console-bff`；走查入口“访问 Studio webapp”改为“访问 DTS Console” |
| 10 | `backlog/features/BL-C-Console-BFF与真实数据接入/T08-Console切换真实数据与端到端验收.md` | 目标中删去“旧 studio webapp 下线前保留回退”；“回退”一项改为“回滚到上一版 Console / BFF 镜像，在 BL-E/T02 演练” |
| 11 | `backlog/features/BL-A-AppPack运行时与领域资产外置/T17-Agent-UI消息Schema与TS类型包.md` | “前端改造”改为 Console 工作台（F6/T05、F6/T14 吸收的消息渲染）使用生成类型；验证项 `webapp tsc` 改为 `console tsc --noEmit`，截图对照对象改为 F6/T05 原型 |
| 12 | `backlog/features/BL-A-AppPack运行时与领域资产外置/T14-头脑去领域化验收.md` | 扫描范围 `webapp/src/**` 改为 `console/src/**`、`console-bff/src/**` |
| 13 | `backlog/features/BL-A-AppPack运行时与领域资产外置/README.md` | UI 入口“Studio webapp → 管理 → 能力包（`/admin/packs`）”改为“DTS Console → Pack 管理（`/packs`，F6/T08）” |
| 14 | `backlog/features/BL-D-数据中台收敛-BI口径Finance/T10-前端收敛与engine-analytics下线.md` | 目标改为“`engine-analytics` 停止部署，Console 的 `/bi` 统一跳转 stack 分析中心”；“页面处置表”保留，改为记录 copilot BI 页面的功能在 stack 中的对应位置（供 F6/T14 与 stack 核对），删除“保留旧路由一个版本周期”一项 |
| 15 | `backlog/features/BL-E-端到端竖线验收与发布/T01-主竖线集成验收与回归比对.md` | 环境中 `studio（engine-ai、webapp）` 改为 `studio（engine-ai、console、console-bff）` |
| 16 | `sprint-queue.md` | Sprint-5 表 F6 行 Task 数 13→14、状态 READY 5 / DRAFT 9；统计改为 Feature 7 / Task 83、READY=12 |
| 17 | `sprint-5-202610/README.md` Feature 列表 | F6 行 Task 数 13→14，状态同上；本月统计 82→83 |
| 18 | `sprint-5-202610/assets/product-planning-validation-20260927.md` | 末尾追加一节“copilot webapp 不迁移（2026-09-27）”，列出本指令的第 1 节决策与受影响文件 |

## 4. 执行约束

- 只改上表文件与新增的 F6/T14、`copilot-webapp-harvest.md`（后者可在执行 F6/T14 时再建，本次只需在 T14 中写明产出路径）。
- 仓库里有其他会话未提交的修改：提交时只 `git add` 上表列出的明确路径，不用 `git add -A`；不要回退或覆盖他人改动。
- 不修改 `sprint-5-202610/assets/renumber-20260926.md`（历史对照）和账本条目（事实记录）。

## 5. 完成后自检（全部通过才算完成）

1. `grep -rn "webapp" worklog/v1.0.0/sprint-5-202610 worklog/v1.0.0/backlog | grep -v "platform-webapp\|admin-webapp\|metrics-webapp\|analytics-webapp\|renumber-20260926\|copilot-webapp-harvest\|T14-copilot"`：剩余命中只应是账本#10/#20/#21 事实记录、F6/T14 盘点表与 BL-D/T10 处置表中对 copilot webapp 的引用；不得再出现“迁移 webapp / 保留旧 webapp / 切回 webapp”。
2. Task 统计：Sprint-5 共 83 个 Task 文件，状态汇总与 `sprint-queue.md`、Sprint README、F6 README 一致；backlog 仍为 69 个。
3. 各 Feature README 的 Task 表与目录内 `T*.md` 一一对应（含重命名后的 BL-S/T05）。
4. 相对链接检查：除设计文档中 3 处示例占位路径外无断链。
5. `git diff --check -- worklog/v1.0.0` 通过。
