# T06: Pack 构建、CI 与发布流程

**优先级**: P1
**状态**: DRAFT
**依赖**: T02、T03

## 目标
prs-stack 每次合并到 main 时自动校验 Pack；打 tag `pack-v*` 时自动构建 `.dtspack` 并发布；安装到环境的操作可追溯到提交 SHA。

## 技术设计
- **CI**（`prs-stack/.github/workflows/pack.yml`）：
  - PR：`paths: pack/**` 触发 → `pack-cli validate --strict`；
  - tag `pack-v1.2.3`：先校验 manifest 版本与 tag 一致 → `pack-cli build` → 生成 `SHA256SUMS` → 发布到 GitHub Release（或内部制品库，以 F0/T01 的交付约定为准）；
  - 离线交付：制品和 sha256 一起纳入交付包（遵循 stack CLAUDE.md 中"包内包含声明的全部依赖、记录校验和"的规则，账本#3）。
- **manifest 注入构建信息**：`build.commit`、`build.time`，写入 `studio_pack_version.manifest`，Pack 管理页的详情中显示。
- **版本规则**：F5 README 中的语义化版本规则写入 `pack/README.md`；CI 检查"删除或重命名 object/metric → 必须 major 升级"（比较上一个 tag 的 ontology 键集合）。

## 验证
- [ ] 实际发布一次 `pack-v1.0.0`，在 Pack 管理页上传该制品后，详情中显示的 commit 与 tag 一致

## Definition of Done
- [ ] 流程文档与首次发布记录进入 `it/IT-04-pack-install.md`
