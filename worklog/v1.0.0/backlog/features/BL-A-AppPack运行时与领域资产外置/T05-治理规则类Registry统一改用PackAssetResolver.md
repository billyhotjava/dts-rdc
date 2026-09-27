# T05: 治理规则类 Registry 统一改用 PackAssetResolver

**原编号**: Sprint-5 F4/T05（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: DRAFT
**依赖**: T04

## 目标
所有从 classpath 读取 `governance/*.json`、`prompts/*`、`planner/*` 的类（账本#13，例如 `CaliberRuleRegistry.java:19`、`FinanceInvariantRegistry.java:20` 以及其他 `*Registry`）改成通过 `PackAssetResolver` 读取，统一"资源 → Pack 资产 kind/key"的映射。

## 技术设计
- **盘点**：用 F1/T01 归属清单中标记为 `pack:prs` 的资源，生成映射表 `assets/resource-to-asset-map.md`：
  `classpath 路径 | 读取它的类:行 | pack kind | pack key`。例如：
  `governance/caliber-rules.v1.json | CaliberRuleRegistry:19 | guardrails | caliber-rules`；
  `governance/finance-invariants.v1.json | FinanceInvariantRegistry:20 | quality_rules | finance-invariants`；
  `prompts/flowerbiz-constraints.txt | <读取类> | prompts | flowerbiz/constraints`。
- **改造模式**（每个 Registry 都一样）：
  ```java
  // before: new ClassPathResource(RULE_RESOURCE)
  // after:
  private final PackAssetResolver assets;
  JsonNode doc = assets.resolve("guardrails", "caliber-rules").map(PackAsset::json)
        .orElseGet(() -> fallback.read(RULE_RESOURCE));   // fallback 与 T04 共用同一开关
  ```
  抽出公共基类或工具 `PackBackedJsonRegistry<T>`，负责处理 generation 刷新，避免 20 多个类各写一遍。
- **范围控制**：本 task 只改"读取来源"，不改 Finance* 的业务逻辑（那是 BL-D 的工作）。

## 验证（RED→GREEN）
- [ ] 静态检查：`grep -rn "ClassPathResource\|getResourceAsStream" engine-ai/src/main/java` 只剩 fallback 实现类中的一处
- [ ] 单测：每个 Registry 在 Pack 源和 classpath 源下加载结果一致（参数化测试）

## Definition of Done
- [ ] 映射表入档，测试通过
