# T03: 头脑指标读取改为以 stack 为准（缓存与降级）

**原编号**: Sprint-5 F8/T03（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T01、BL-S/T03（服务间身份）

## 目标
头脑在生成 SQL 时，对带有 `indicatorRef` 的指标使用 stack 的表达式；只在当前授权可验证、已发布版本仍有效、缓存未过期且服务暂时不可用时使用缓存，并降低证据等级。

## 技术设计
- **类**：`service/indicator/IndicatorCatalog`（接口）→ `StackIndicatorCatalog`（HTTP + `studio_indicator_cache`）；复用 S29 的配置项 `DTS_PLATFORM_*`（账本#19），不另建一套配置；
- **读取策略**：缓存命中不替代当前授权/发布状态校验；允许刷新窗口和硬过期阈值由 F0/T14 定稿。401/403、404/未发布/撤回、缺租户或授权无法确认时停止该指标供数，不能仅降为 LOW 后继续返回。服务超时仅在授权及版本仍有效、未硬过期时降级；不存在此有效性证明则拒绝。stack 表达式与 Pack `expr` 不一致 → 使用当前已发布版本，并记录 `INDICATOR_REF_MISMATCH`；固定版本失效时不得静默切换；
- **接入点**：`IndicatorMatcherService`、`SemanticPackService` 中组装 metric 表达式的地方（实施时找到具体的方法，并在账本中追加记录）；
- **Liquibase**：`v1_1_0_020__indicator_cache.xml`；
- **可观测**：指标 `studio_indicator_cache_hit_ratio`、`studio_indicator_fetch_errors_total`。

## 验证（RED→GREEN）
- [ ] 契约测试：正常、401/403、404/撤回、超时、硬过期、缺租户、表达式不一致；拒绝场景不执行 SQL、不返回旧值；原因符合 F0/T14。
- [ ] 集成：stack 不可用时，在授权/版本有效期内允许的降级显示 `CALIBER_CACHE_STALE`；超过边界停止供数。权限撤销、发布撤回后不能由旧缓存读取（截图与接口断言）。

## Definition of Done
- [ ] 证据进入 `it/IT-08-caliber-sot.md`
