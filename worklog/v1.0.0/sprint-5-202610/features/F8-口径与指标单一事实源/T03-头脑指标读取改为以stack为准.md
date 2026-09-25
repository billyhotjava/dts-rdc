# T03: 头脑指标读取改为以 stack 为准（缓存与降级）

**优先级**: P1
**状态**: DRAFT
**依赖**: T01、F9/T03（服务间身份）

## 目标
头脑在生成 SQL 时，对带有 `indicatorRef` 的指标使用 stack 的表达式；stack 不可用时使用缓存，并降低证据等级。

## 技术设计
- **类**：`service/indicator/IndicatorCatalog`（接口）→ `StackIndicatorCatalog`（HTTP + `studio_indicator_cache`）；复用 S29 的配置项 `DTS_PLATFORM_*`（账本#19），不另建一套配置；
- **读取策略**：先查缓存；缓存过期后异步刷新（stale-while-revalidate）；stack 返回 404 → 视为 `INDICATOR_NOT_PUBLISHED`（证据等级降为 LOW）；stack 表达式与 Pack `expr` 不一致 → 以 stack 为准，并记录 reason `INDICATOR_REF_MISMATCH`（提示需要升级 Pack）；
- **接入点**：`IndicatorMatcherService`、`SemanticPackService` 中组装 metric 表达式的地方（实施时找到具体的方法，并在账本中追加记录）；
- **Liquibase**：`v1_1_0_020__indicator_cache.xml`；
- **可观测**：指标 `studio_indicator_cache_hit_ratio`、`studio_indicator_fetch_errors_total`。

## 验证（RED→GREEN）
- [ ] 契约测试：stack 正常 / 404 / 超时 / 表达式不一致，四种情况下的 SQL 与 reasons 都符合预期
- [ ] 集成：停掉 stack 的 platform 服务后，工作台问数仍然返回答案，证据中显示 `CALIBER_CACHE_STALE`（截图）

## Definition of Done
- [ ] 证据进入 `it/IT-08-caliber-sot.md`
