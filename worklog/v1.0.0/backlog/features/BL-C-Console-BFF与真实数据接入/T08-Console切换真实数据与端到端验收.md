# T08: Console切换真实数据与端到端验收

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T02–T07；BL-S/T05（Console OIDC 登录）

## 目标
Console 在生产配置下全部使用 bff 模式；按 F6 走查脚本逐页在运行实例上验收；回退按 BL-E/T02 记录 Console/BFF 的兼容镜像组合。

## 技术设计
- 配置：`VITE_API_MODE=bff`，关闭 MSW；mock 仅保留给开发与 Storybook。
- 验收：F6 各页面走查在真实数据上执行，四态截图；缺失或不一致的契约回写 F6 契约并登记变更。
- 回退：使用已验证的上一版 Console/BFF 组合；首版无稳定旧版本时撤回新入口并保持 PRS/stack 原应用可用，不回到旧 webapp。

## 验证（RED→GREEN）
- [ ] F6 全部页面在运行实例上走查通过，证据写入拉入后 Sprint 的 `it/IT-11-console.md`
- [ ] Playwright E2E 覆盖工作台、数据产品、Pack、审计四条主路径

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权

- [ ] `/me`、知识、评估/AI 开关、PRS remote 与 BI 外链纳入动作矩阵验收；mock 构建标识与拦截器不进入生产，不能缺接口时静默退回 fixture。
- [ ] 原应用外链沿各自受控网关；壳内 remote 使用 BFF client，不新增绕过统一身份的直连路径；不在 URL 传 token。

PRS 挂载依赖重建前端提供符合 Sprint-5 F6/T11 协议的实际 remote；开工前登记 PRS 责任人、版本与到位日期。该外部依赖未满足时明确阻塞对应验收，不能把 3 月原型或 10 月样例算作真实接入。
