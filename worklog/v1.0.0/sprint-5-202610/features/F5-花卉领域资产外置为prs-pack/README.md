# F5: 花卉领域资产外置为 prs-pack

**优先级**: P0
**波次**: B
**状态**: DRAFT

## 目标
copilot 中所有花卉领域资产（语义包、治理规则、提示词、模板、工具、动作、评测集）迁移到 `prs-stack/pack/`，
由 prs 团队维护，以 `prs-flower-<ver>.dtspack` 的形式交付给头脑；头脑的代码和 classpath 中不再有花卉资产。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 目录 | `prs-stack/pack/` | `pack-manifest.yaml`、`ontology/`、`guardrails/`、`quality/`、`templates/`、`prompts/`、`actions/`、`skills/`、`eval/`、`persona/`、`assets/dbt-reference/`、`SHA256SUMS`（构建时生成） |
| 制品 | `prs-flower-<semver>.dtspack` | 由 `pack-cli build` 生成；以 GitHub Release 附件或内部制品库发布 |
| 动作 | `actions/*.json` endpoint 抽象 | `{"target":{"serviceRef":"prs-legacy-adminapi","draft":{"method":"POST","path":"..."},"commit":{...}}}`；serviceRef 由部署侧绑定 base-url |
| 数据源 | `datasources[].ref` | `prs-mart`（PG `public.xycyl_*`）、`prs-app`（prs 新业务库，只读） |
| 版本 | Pack 版本规则 | 资产不兼容变更 → major；新增域/模板 → minor；修正 → patch |

## UI/UX 规格
无新页面；在工作台的答案卡片"来源"中能看到 `pack: prs-flower@x.y.z`（F4/T04 + F12）。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | prs-stack/pack 目录与 manifest 骨架 | P0 | DRAFT | F4/T01、F1/T01 |
| T02 | 迁移语义包、提示词与直答规则 | P0 | DRAFT | T01 |
| T03 | 迁移治理规则与评测集 | P0 | DRAFT | T01 |
| T04 | garden 工具声明化 | P1 | DRAFT | T01、F10/T02 |
| T05 | 动作 endpoint 抽象（adminapi → 服务引用） | P0 | DRAFT | T01 |
| T06 | Pack 构建、CI 与发布流程 | P1 | DRAFT | T02、T03 |
| T07 | 头脑去领域化验收 | P0 | DRAFT | T02–T06、F4/T05、F4/T06 |

## Definition of Ready
- [x] 契约已钉死  - [x] 竖切片：prs 仓库 → 制品 → 注册表 → 问数  - [x] UI 落点：答案来源  - [ ] 依赖：F4/T01  - [x] 验收：T07

## 完成标准
- [ ] `pack-cli validate prs-stack/pack` 返回 0
- [ ] 头脑开启 `fallback-classpath=false` 并删除领域资源后，golden set 与基线一致
