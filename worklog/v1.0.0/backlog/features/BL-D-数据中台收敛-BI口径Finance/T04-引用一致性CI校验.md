# T04: 引用一致性 CI 校验

**原编号**: Sprint-5 F8/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P2
**状态**: DRAFT
**依赖**: T03、BL-A/T13

## 目标
在 prs-stack 的 Pack CI 中检查 `indicatorRef` 是否指向 stack 中已发布的指标版本，以及 `expr` 是否与 stack 一致，防止两边再次漂移。

## 技术设计
- 在 `pack-cli` 中新增子命令 `pack-cli check-refs --stack-url ... --token ...`：逐个查询 stack 指标 → 版本不存在则报 error；表达式不一致则报 warning（`--strict` 时视为 error）；
- CI：在 tag 发布流程中执行（需要能访问 stack 测试环境；访问不到时跳过并标记 warning，不阻断离线构建）；
- 输出报告作为发布附件。

## Definition of Done
- [ ] 一次发布的报告附件入档
