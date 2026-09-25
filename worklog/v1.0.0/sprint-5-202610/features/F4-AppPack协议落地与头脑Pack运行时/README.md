# F4: AppPack 协议落地与头脑 Pack 运行时

**优先级**: P0
**波次**: B
**状态**: DRAFT

## 目标
头脑不再从 classpath 读取领域资产，改为从 **Pack 注册表**读取。Pack 以版本化制品的形式安装、激活、回滚；
这样 prs（以及将来的 metro）只要交付一个 Pack，就能驱动头脑的问数、动作、评测，**不需要改头脑代码**。

## 契约定义 (Contracts)

| 类型 | 契约 | 关键字段/签名 |
|------|------|---------------|
| 制品 | `pack-manifest.yaml`（Schema：`dts-studio/protocol/pack-manifest.v1.schema.json`） | `apiVersion: dts.pack/v1`、`name`、`version`(semver)、`vendor`、`requires.dts-studio`、`capabilities.{ontology,metrics,actions,skills,guardrails,quality_rules,templates,prompts,persona,evaluations}[]`（每项为 `{path, kind, schemaVersion}`） |
| 制品 | Pack 包 | `<name>-<version>.dtspack`（zip：`pack-manifest.yaml` + 资产 + `SHA256SUMS`） |
| 数据 | `studio_pack` | `id bigint pk`, `name varchar(64) uk`, `vendor`, `created_at` |
| 数据 | `studio_pack_version` | `id pk`, `pack_id fk`, `version varchar(32)`, `status enum(INSTALLED,ACTIVE,SUPERSEDED,FAILED)`, `manifest jsonb`, `checksum char(64)`, `installed_by`, `installed_at`, `activated_at`；uk(pack_id, version)；部分唯一索引：每个 pack 最多一条 ACTIVE |
| 数据 | `studio_pack_asset` | `id pk`, `pack_version_id fk`, `kind varchar(32)`, `key varchar(128)`, `content jsonb`, `content_text text`, `sha256`；uk(pack_version_id, kind, key) |
| REST | `POST /api/ai/packs`（multipart `file`） | 201 `{packId, versionId, name, version, status:"INSTALLED", validation:{errors[],warnings[]}}`；422 校验失败 |
| REST | `POST /api/ai/packs/{name}/versions/{version}/activate` | 200 `{name, version, status:"ACTIVE", previousVersion}`；409 已经是 ACTIVE |
| REST | `POST /api/ai/packs/{name}/rollback` | 200 回到上一个 SUPERSEDED 版本 |
| REST | `GET /api/ai/packs`、`GET /api/ai/packs/{name}`、`GET /api/ai/packs/{name}/versions/{version}/assets?kind=` | 列表/详情/资产 |
| Java | `PackAssetResolver` | `Optional<PackAsset> resolve(String kind, String key)`；`List<PackAsset> list(String kind)`；`long generation()`（激活时 +1，用于刷新缓存） |
| 事件 | `dts.audit.v1` type `dts.pack.{installed,activated,rolledback}` | 见 F11 |

## UI/UX 规格（T07）
- **入口**：Studio webapp → 左侧导航"管理" → "能力包"（路由 `/admin/packs`），只有 `STUDIO_ADMIN` 角色可见。
- **线框**：
  ```
  ┌ 能力包 ─────────────────────────────────────────────┐
  │ [上传能力包]                        [搜索名称____]  │
  │ ┌──────────┬────────┬────────┬──────────┬────────┐ │
  │ │ 名称     │当前版本│ 状态   │ 激活时间  │ 操作   │ │
  │ │prs-flower│ 1.0.0  │ ●ACTIVE│10-30 14:2│详情 回滚│ │
  │ └──────────┴────────┴────────┴──────────┴────────┘ │
  └────────────────────────────────────────────────────┘
  详情抽屉：版本时间线（INSTALLED/ACTIVE/SUPERSEDED）| 资产分类计数 | 校验警告 | [激活此版本]
  ```
- **四态**：空（"尚未安装能力包" + 上传按钮）/ 加载（表格骨架屏）/ 错误（接口失败时顶部 Alert，可重试；上传校验失败时在弹窗内逐条列出 errors）/ 成功（列表）。
- **关键交互**：上传 → 显示进度 → 返回校验结果（有 warnings 也可以继续）→ 版本处于 INSTALLED → 点击"激活"弹出二次确认（写明"会影响所有用户的问答"）→ 成功提示并刷新；回滚同样需要二次确认。
- **走查**：1. 管理员登录 → 2. 管理/能力包 → 3. 上传 `prs-flower-1.0.0.dtspack` → 4. 看到 INSTALLED 和 0 个错误 → 5. 激活 → 6. 到工作台提问，答案卡片的来源中显示 `pack: prs-flower@1.0.0`。

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | pack-manifest v1 Schema 与校验器 | P0 | DRAFT | F2/T06 |
| T02 | Pack 注册表数据模型与迁移 | P0 | DRAFT | T01、F3/T03 |
| T03 | Pack 安装/激活/回滚 API | P0 | DRAFT | T02 |
| T04 | 语义包与本体服务改为从注册表读取 | P0 | DRAFT | T03 |
| T05 | 治理规则类 Registry 统一改用 PackAssetResolver | P0 | DRAFT | T04 |
| T06 | 领域查询模板从 Liquibase 数据迁为 Pack 资产 | P1 | DRAFT | T04 |
| T07 | Pack 管理 UI | P1 | DRAFT | T03 |

## Definition of Ready
- [x] 契约已钉死（上表）  - [x] 竖切片：上传 → API → 注册表 → Resolver → 问数  - [x] UI 落点已命名  - [ ] 依赖：F3 合并完成  - [x] 验收可验证

## 完成标准
- [ ] 删除 `engine-ai/src/main/resources/{semantic-packs,governance,prompts,planner}` 后，安装 prs-pack 再跑 golden set，结果与基线一致
- [ ] Pack 管理页走查截图（四态）
