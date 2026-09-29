# 实施指令：dts-infra 编码开工（2026-09-29）

**执行方**：
- 第 1 节文档修改：实施（文档）会话；
- 第 2 节编码：dts-infra 编码会话。

本会话（规划）只出指令。
**依据**：用户 2026-09-29——“开始进行 dts-infra 的编码工作，go 的包名采用 com.yuzhi.dts 这种”；随后确认模块路径为 **`yuzhi.com/dts/infra`**。
**编码依据**：`sprint-5-202610/features/F7-dts-infra-K8s交付底座/design/01-dtsctl编码设计与首批工作包.md`（下称 design/01）与 `design/00`。

## 1. 文档修改（实施会话，先于编码或并行）

| # | 文件（相对 `worklog/v1.0.0/sprint-5-202610/features/F7-dts-infra-K8s交付底座/`） | 修改 |
|---|------|------|
| 1 | `design/00-dts-infra-K8s交付底座设计.md` §3.1 | 仓库结构前加一行：Go 模块路径 `yuzhi.com/dts/infra`（用户 2026-09-29），编码细则见 design/01 |
| 2 | `T09-dtsctl骨架-DtsRelease-CRD与BOM.md` | 输出契约中的 `Go module github.com/billyhotjava/dts-infra` 改为 `yuzhi.com/dts/infra`；设计依据加 design/01 §1–§6、§8 W1–W3；依赖改为“T01（可并行：00 §0 决策已经用户确认）”；删除末尾“DRAFT 原因”；状态改 **READY** |
| 3 | `T12-预检.md` | 设计依据加 design/01 §7、§8 W4；目标注明“本月先交付主机级，集群级在 W5 后补”；删除“DRAFT 原因”；状态改 **READY** |
| 4 | `T16-dtsctl测试框架与e2e.md` | 注明单测与 envtest 层随 W1–W4 交付（design/01 §1 测试约定、§8），真实集群 e2e 与断网 VM 依赖 T03；状态保持 DRAFT，但在头部写“单测/envtest 部分已开工” |
| 5 | `T10-编排器-依赖图与组件状态机.md` | 设计依据加 design/01 §4.2、§8 W4（Plan 部分）；注明“执行阶段待 design/01 §9 补齐”；状态保持 DRAFT |
| 6 | `README.md`（F7） | Task 表中 T09、T12 状态改 READY；状态统计同步；设计链接补 design/01 |
| 7 | `../../README.md`（Sprint README）与 `../../../sprint-queue.md` | F7 行的状态统计同步 |
| 8 | 全仓库检索 `github.com/billyhotjava/dts-infra`（worklog 内） | 作为 Go 模块路径出现的地方改为 `yuzhi.com/dts/infra`；作为 git 远端地址出现的地方保持不变（仓库仍在 GitHub） |

## 2. 编码（dts-infra 编码会话）

- **仓库**：`git@github.com:billyhotjava/dts-infra.git`。dts-rdc 中的子模块路径是 `dts-infra/`，当前只有 README（`b549059`）。在子模块中新建分支 `feat/W1-skeleton` 开工。
- **顺序**：design/01 §8 的 W1 → W2 → W3，W4 在 W2 完成后可与 W3 并行。每个工作包完成后：
  1. 推送分支并开 PR，CI 绿后合入 main；
  2. 在 dts-rdc `worklog/v1.0.0/sprint-5-202610/it/infra/W<n>-<topic>.md` 写证据：命令原文、输出、覆盖率、golden 差异；
  3. 更新对应 Task 状态（T09 在 W3 完成后标 DONE；T12 在 W4 完成后标 DONE，只含主机级时须在 Task 中注明集群级仍未做）。
- **硬约束**：
  - 模块路径必须是 `yuzhi.com/dts/infra`，不得改回 github 路径；包名遵守 Go 规则（单词小写）；
  - `pkg/` 不得依赖 `internal/cli`，不读 flag、不直接打印；
  - 不引入 Bitnami、MinIO、Loki 等已被设计排除的组件，新增依赖须登记许可证；
  - .50 上禁止 `docker pull`、禁止重启 dockerd、不安装 RKE2（W4 只做只读预检）；
  - 不在 dts-rdc 的 `worklog/` 以外写开发文档；dts-infra 仓库的 `docs/` 只放规范类正式文档（`chart-spec.md`、`contract-spec.md`、`go-bom.md`）。
- **遇到以下情况暂停并交回规划会话**：
  - design/01 的类型或规则与 00 冲突；
  - 需要新增能力名或 Issue ID；
  - 依赖库在许可证或 arm64 支持上有问题；
  - W5 以后的内容（Helm 执行、Lease、resume）需要设计时，按 design/01 §9 由规划会话补齐。

## 3. 自检

1. `go list -m` 输出 `yuzhi.com/dts/infra`；`make build test lint generate` 全部通过，且 `git status` 在 `make generate` 后没有差异。
2. `dtsctl version --output json`、`dtsctl bom validate testdata/bom/full-valid.yaml`、`dtsctl preflight --output json` 在 x86_64 上可运行；arm64 二进制至少用 `file` 确认架构（实机验证留到信创环境）。
3. worklog 中 T09、T12 状态与 F7 README、Sprint README、`sprint-queue.md` 一致。
