# T08: Console切换真实数据与端到端验收

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P0 · **状态**: DRAFT · **依赖**: T02–T07；BL-S/T05（Console OIDC 登录）

## 目标
Console 在生产配置下全部使用 bff 模式；按 F6 走查脚本逐页在运行实例上验收；旧 studio webapp 下线前保留回退。

## 技术设计
- 配置：`VITE_API_MODE=bff`，关闭 MSW；mock 仅保留给开发与 Storybook。
- 验收：F6 各页面走查在真实数据上执行，四态截图；缺失或不一致的契约回写 F6 契约并登记变更。
- 回退：旧 webapp 在 BL-E/T02 发布窗口内可一键切回。

## 验证（RED→GREEN）
- [ ] F6 全部页面在运行实例上走查通过，证据写入拉入后 Sprint 的 `it/IT-11-console.md`
- [ ] Playwright E2E 覆盖工作台、数据产品、Pack、审计四条主路径

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权
