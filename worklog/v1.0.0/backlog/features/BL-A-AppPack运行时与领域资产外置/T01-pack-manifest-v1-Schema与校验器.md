# T01: pack-manifest v1 Schema 与校验器

**原编号**: Sprint-5 F4/T01（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P0
**状态**: IN_PROGRESS
**依赖**: F0/T12、F0/T15、F1/T03（原则与 CLI 工程落点；不等待 T20 整体完成）

## 目标
用 JSON Schema 固化 AppPack 清单和各类资产的格式，并提供可在 CI 中运行的校验器，让 Pack 的错误在打包阶段就被发现，而不是在运行时。

## 技术设计
- **文件**：
  - `dts-studio/protocol/pack-manifest.v1.schema.json`
  - `dts-studio/protocol/assets/ontology.v1.schema.json`（由现有语义包反推，账本#12：`domain, description, objects[], links[], metrics[], signals[], actions[], synonyms[], fewShots[], guardrails[]`，各子结构的字段从 6 个包中取并集，必填字段取交集）
  - `.../guardrail.v1.schema.json`、`template.v1.schema.json`（对应 Liquibase 中的查询模板表结构，T06）、`evaluation.v1.schema.json`（对应 golden set 格式）、`action.v1.schema.json`（包含 endpoint 抽象，见 T12）、`quality-rule.v1.schema.json`（对应 finance invariants 等，BL-D 可能扩展）
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
- [ ] `pack-cli validate` 对本 Task 自带的最小合法 fixture 返回 0；真实 prs-pack 的集成校验由 T08 执行，避免反向依赖 BL-A

## Definition of Done
- [ ] Schema 与 CLI 合入 studio，CI 中有 pack 校验步骤

## 2026-09-26 承接约束

本 Task 同时产出 ADR-012 的正式决策记录；对照 prs-stack 既有 `pack/pack-manifest.json`，列出 RPC/前端入口与新领域资产契约的对应、保留和延期项。旧 `prs-pack@0.1.0` 不可直接改名宣称兼容 `dts.pack/v1`。Schema 完成后回写 T20；未接受前本 Task 保持 DRAFT。

## 2026-09-29 编码进展

Schema、离线 CLI、ZIP/校验和/引用校验、CI 工作流已编码；ADR-012 正式接受与远端 CI 运行仍待闭合。

证据与未完成项：[Pack runtime checkpoint](assets/pack-runtime-20260929.md)。状态不等同于部署或业务验收完成。
