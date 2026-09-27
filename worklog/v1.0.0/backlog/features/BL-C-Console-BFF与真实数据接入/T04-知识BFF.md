# T04: 知识BFF

**原编号**: 新增（2026-09-27，ADR-013：UI 驱动的 BFF 只承担与前端的交互）

**优先级**: P1 · **状态**: DRAFT · **依赖**: T01

## 目标
实现 `knowledge.openapi.yaml`：以用户身份调用 Wiki 检索、查询与原文接口。

## 技术设计
- 下游：Sprint-5 F3/T15 的 `/api/wiki/query`、检索接口、`/markdown`；Wiki 与 Console 身份域映射按 BL-A/T22 结论，结论前只透传同一 Keycloak realm 的用户身份。
- 无权限内容在 BFF 层不缓存、不聚合计数。

## 验证（RED→GREEN）
- [ ] 无权限空间在结果、计数、摘要中均不出现的测试

## Definition of Done
- [ ] 对应契约（Sprint-5 F6 冻结的 `console-contracts-v1`）的契约测试全绿
- [ ] 端点与 `../../../sprint-5-202610/assets/console-contract-map.md` 中的映射一致；不含业务规则、不直连数据库、不提权
