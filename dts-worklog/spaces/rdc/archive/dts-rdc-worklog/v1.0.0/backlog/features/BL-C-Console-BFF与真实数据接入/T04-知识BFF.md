# T04: 知识BFF

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01；BL-S/T01、BL-S/T03 的委托身份契约；Sprint-5 F2/T09、F3/T15、F5/T01

## 目标
实现 `knowledge.openapi.yaml`：以用户身份调用 Wiki 检索、查询与原文接口。

## 技术设计
- 下游：Sprint-5 F3/T15 的 `/api/wiki/query`、检索接口、`/markdown`；Wiki 与 Console 的委托身份是本 Task 的必交付输入，由 BL-S/T01/T03 和 Wiki 身份维护方确认；不能等待可选 RAG 探索，也不能假定同一 realm 的任意 token 可用于 Wiki。
- 无权限内容在 BFF 层不缓存、不聚合计数。

## 验证（RED→GREEN）
- [ ] 无权限空间在结果、计数、摘要中均不出现的测试

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权

## 必须交付的身份集成

开发前记录调用主体、issuer/audience、授权方式、scope、撤权/过期行为及 Wiki 的接收校验落点；若现有 REST 仅支持浏览器 session，需要在 Wiki 侧适配现有身份/空间权限服务并验证，不能在 BFF 伪造 session 或用管理员凭据兜底。本 Task 负责该最小接入和跨模块验证，BL-A/T22 只消费已确认方案做检索增益实验。

- [ ] 正常、错 audience、无空间权限、撤权、过期、删除、旧缓存均有集成断言；失败不可返回敏感标题/摘要/计数。
- [ ] T22 推迟或结论不采用 RAG 时，Console 的授权关键词检索与原文读取仍可独立交付。
