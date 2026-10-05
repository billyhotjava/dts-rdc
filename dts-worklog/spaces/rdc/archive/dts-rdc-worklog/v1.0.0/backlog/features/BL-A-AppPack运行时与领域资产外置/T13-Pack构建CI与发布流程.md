# T13: Pack 构建、CI 与发布流程

**原编号**: Sprint-5 F5/T06（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: IN_PROGRESS
**依赖**: T09、T10

## 目标
prs-stack 每次合并到 main 时自动校验 Pack；打 tag `pack-v*` 时自动构建 `.dtspack` 并发布；安装到环境的操作可追溯到提交 SHA。

## 技术设计
- **CI**（`prs-stack/.github/workflows/pack.yml`）：
  - PR：`paths: pack/**` 触发 → `pack-cli validate --strict`；
  - tag `pack-v1.2.3`：先校验 manifest 版本与 tag 一致 → `pack-cli build` → 生成 `SHA256SUMS` → 发布到 GitHub Release（或内部制品库，以 F0/T01 的交付约定为准）；
  - 离线交付：制品和 sha256 一起纳入交付包（遵循 stack CLAUDE.md 中"包内包含声明的全部依赖、记录校验和"的规则，账本#3）。
- **manifest 注入构建信息**：`build.commit`、`build.time`，写入 `studio_pack_version.manifest`，Pack 管理页的详情中显示。
- **版本规则**：BL-A README 中的语义化版本规则写入 `pack/README.md`；CI 检查"删除或重命名 object/metric → 必须 major 升级"（比较上一个 tag 的 ontology 键集合）。

## 验证
- [ ] 实际发布一次 `pack-v1.0.0`，在 Pack 管理页上传该制品后，详情中显示的 commit 与 tag 一致

## Definition of Done
- [ ] 流程文档与首次发布记录进入 `it/IT-04-pack-install.md`

## 2026-09-26 承接约束

执行新包最终路径切换前，验收 T08 的旧 JSON→新 YAML 能力映射并归档旧制品；构建/CI 必须唯一指向最终 `pack/`，不能混打 `pack-next/` 或 `pack-legacy/`。

## 2026-09-29 编码进展

PRS 打包入口及 Studio CI 校验工作流已编码，真实包 CLI 严格校验成功；制品仓发布与 PRS 远端 CI 的跨仓工具供应仍待集成。

证据与未完成项：[Pack runtime checkpoint](assets/pack-runtime-20260929.md)。状态不等同于部署或业务验收完成。
