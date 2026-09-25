# F7: BI 收敛：copilot-analytics 并回 stack

**优先级**: P1
**波次**: C
**状态**: DRAFT（依赖 ADR-006；以下按推荐方案 A"BI 归 stack"编写，若 ADR 结论不同需重写）

## 目标
BI 只保留一份：以 stack `dts-analytics` 为基线，吸收 copilot 分叉期间新增的 BI 能力；
头脑通过 stack 的 BI API 生成卡片/看板；`engine-analytics`（原 copilot-analytics）下线。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| REST（stack） | `POST /api/analytics/cards` | req `{name, datasetRef|nativeQuery{datasourceRef, sql}, display, vizSettings, collectionId?, origin:{type:"agent", sessionId, messageId, packVersion}}`；resp `{id, url}` |
| REST（stack） | `POST /api/analytics/dashboards` / `POST /api/analytics/dashboards/{id}/cards` | 头脑创建看板、追加卡片 |
| REST（stack） | `GET /api/analytics/fixed-reports`、`/report-templates` | 回迁的 copilot 独有能力（路径与 copilot 现有路径保持一致，便于前端迁移） |
| 身份 | 头脑调用 stack | 转发用户身份头（F9）；stack 按用户权限创建资产，卡片归属于该用户 |
| 数据 | stack analytics 库 | 迁移 copilot `copilot_analytics` schema 中的业务对象（Q6） |

## UI/UX 规格
- **入口变化**：用户在 Studio 工作台的答案卡片上点击"保存为卡片"或"加入看板" → 调用 stack API → 成功后提示"已保存"，并提供"在分析中心打开"链接（深链 `https://<stack>/analytics/cards/{id}`）。
- **四态**：保存中（按钮 loading）/ 失败（toast 显示错误原因，例如无权限、数据源未登记）/ 成功（toast + 链接）/ 空（不适用）。
- **走查**：1. 工作台提问"本月各项目租金净额" → 2. 答案出现表格或图表 → 3. 点击"保存为卡片" → 4. 选择收藏夹 → 5. 提示成功 → 6. 点击链接，stack 分析中心显示该卡片，并标注来源为"智能体"。
- stack 侧的 BI 页面沿用 stack 现有的设计（落点见 T01 / Q2）。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 分叉差异深度比对与 stack BI 前端落点 | P0 | DRAFT | F2/T02 |
| T02 | 合并基线与 schema 映射 | P0 | DRAFT | T01 |
| T03 | copilot 独有 BI 能力回迁 stack | P1 | DRAFT | T02 |
| T04 | copilot-analytics 业务数据迁移 | P1 | DRAFT | T02、Q6 |
| T05 | 头脑 → stack BI 调用契约与智能体资源归位 | P1 | DRAFT | T03、F9/T03 |
| T06 | 前端收敛与 engine-analytics 下线 | P1 | DRAFT | T03–T05 |

## Definition of Ready
- [x] 契约  - [x] 竖切片：工作台 → 头脑 → stack BI API → stack 库 → 分析中心页面  - [x] UI 落点已命名  - [ ] 依赖：ADR-006、Q2、Q6  - [x] 验收

## 完成标准
- [ ] `engine-analytics` 不再部署；原 copilot BI 页面的功能在 stack 中都有对应（对照表 100% 覆盖）
- [ ] "保存为卡片"走查截图
