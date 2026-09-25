# T01: pack-manifest v1 Schema 与校验器

**优先级**: P0
**状态**: DRAFT
**依赖**: F2/T06（apppack-protocol.rules 修订）

## 目标
用 JSON Schema 固化 AppPack 清单和各类资产的格式，并提供可在 CI 中运行的校验器，让 Pack 的错误在打包阶段就被发现，而不是在运行时。

## 技术设计
- **文件**：
  - `dts-studio/protocol/pack-manifest.v1.schema.json`
  - `dts-studio/protocol/assets/ontology.v1.schema.json`（由现有语义包反推，账本#12：`domain, description, objects[], links[], metrics[], signals[], actions[], synonyms[], fewShots[], guardrails[]`，各子结构的字段从 6 个包中取并集，必填字段取交集）
  - `.../guardrail.v1.schema.json`、`template.v1.schema.json`（对应 Liquibase 中的查询模板表结构，F4/T06）、`evaluation.v1.schema.json`（对应 golden set 格式）、`action.v1.schema.json`（包含 endpoint 抽象，见 F5/T05）、`quality-rule.v1.schema.json`（对应 finance invariants 等，F6 可能扩展）
- **manifest 示例**：
  ```yaml
  apiVersion: dts.pack/v1
  name: prs-flower
  version: 1.0.0
  vendor: yuzhi
  requires: { dts-studio: ">=1.1.0" }
  datasources:            # 逻辑名 → 由部署侧绑定到 QueryGateway 的数据源
    - ref: prs-mart        # 默认 PG mart（xycyl_*）
    - ref: prs-app         # prs 新业务库（只读）
  capabilities:
    ontology:    [{path: ontology/flowerbiz.json, schemaVersion: 1}, ...]
    guardrails:  [{path: guardrails/caliber-rules.json}]
    templates:   [{path: templates/flowerbiz.yaml}]
    prompts:     [{path: prompts/flowerbiz-constraints.txt, kind: constraints, domain: flowerbiz}]
    actions:     [{path: actions/bad-debt.json}]
    quality_rules: [{path: quality/finance-invariants.json}]
    evaluations: [{path: eval/golden-set.json}]
    persona:     [{path: persona/flower-analyst.yaml}]
  ```
- **校验器**：Java CLI `engine/tools/pack-cli`（复用 engine 的 Jackson + `networknt/json-schema-validator`；新增依赖前按 dependency-policy 检查许可证）：
  - `pack-cli validate <dir>`：检查 schema、路径存在、`SHA256SUMS`、引用完整性（例如 action.object 必须存在于 ontology.objects，link 的 from/to 必须存在，metrics.object 必须存在）；
  - `pack-cli build <dir> -o <file>.dtspack`：先执行 validate，再打包；
  - 退出码：0 通过 / 1 有错误 / 2 只有警告（加 `--strict` 时视为 1）。
- **错误路径**：未知 capability → 报 warning（向前兼容）；schemaVersion 高于引擎支持的版本 → error。

## 验证（RED→GREEN）
- [ ] 先写单测：6 个现有语义包逐个用 schema 校验必须通过；构造 10 个非法样例（缺 name、坏的 link 引用、重复 object 等）必须失败
- [ ] `pack-cli validate` 对 F5 的 prs-pack 目录返回 0

## Definition of Done
- [ ] Schema 与 CLI 合入 studio，CI 中有 pack 校验步骤
