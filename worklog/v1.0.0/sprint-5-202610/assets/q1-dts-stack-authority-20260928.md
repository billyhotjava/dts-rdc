# Q1 事实核查：dts-stack 权威仓库（2026-09-28）

**用途**：F0/T01 的输入证据，供用户拍板 Q1。只读核查，没有修改任何仓库。
**方法**：比较三个本地工作副本与 GitHub 两个远端的分支、根提交和分叉点。分叉计算在临时裸仓库里完成（fetch 本地副本与远端 main），不触碰原工作副本。

## 1. 事实

| 对象 | 远端 / 分支 | HEAD | 提交数 | 与其他仓库的关系 |
|------|-------------|------|--------|------------------|
| GitHub `billyhotjava/dts-stack` | `main`（远端只有这一个分支） | `8568eb9` 2026-09-25 “docs(governance): record successful administrator browser acceptance” | — | **与 s10-stack `v2.2.3` HEAD 是同一个提交** |
| `/opt/prod/s10/v2.2.3` | `s10-stack.git` `v2.2.3`（与 origin 同步） | `8568eb9` 2026-09-25 | 3020 | 当前开发线；工作区 10 个未提交文件 |
| `/opt/prod/prs/source/dts-stack` | `dts-stack.git` `main`（本地 origin 引用未更新） | `af84d71` 2026-09-19 | 2877 | **是 v2.2.3 的祖先**：自 `af84d71` 起 v2.2.3 又多 143 个提交，本副本没有独有提交；工作区 5 个未提交文件（账本#2） |
| GitHub `billyhotjava/s10-stack` `main` | `main` | `a596be9` 2026-06-15 | — | 旧线：与 v2.2.3 在 `da2273c`（2026-06-12）分叉；main 独有 22 个提交，v2.2.3 独有 1085 个 |
| dts-rdc 子模块 `dts-stack` | 指针 `b2a674b` 2026-03-27 “first commit” | — | 1 | **该提交已不在 GitHub `dts-stack` 上**（远端历史已被替换），全新 `git clone --recursive dts-rdc` 会检出失败 |

三个大仓库的根提交都是 `7d35cfb`（2025-09-28 “init”），属于同一段历史。

## 2. 结论与建议

1. **权威仓库**：GitHub `billyhotjava/dts-stack` 的 `main`。它与 s10-stack 的 `v2.2.3` 是同一条线；开发工作副本沿用 stack 自己 CLAUDE.md 规定的 `/opt/prod/s10/v2.2.3`，构建目录为 `/data/dts-stack`。
2. **dts-rdc 子模块指针**：由 F0/T07 从 `b2a674b` 改为 `8568eb9`（或拍板时的最新 `main`）。这同时修复了递归克隆失败的问题。
3. **`/opt/prod/prs/source/dts-stack`**：是落后 143 个提交的旧副本，不再作为开发或基线来源。它的 5 个未提交文件需要先与 v2.2.3 比对：有价值的改动列入待迁移清单，其余仅登记处置建议（F0/T01 只读对账，实际提交/丢弃由 stack 负责人执行）。
4. **s10-stack `main`**：6 月的旧线，其 22 个独有提交需要确认是否已被 v2.2.3 吸收，确认后标记为归档，不再推送。
5. **双远端**：s10-stack `v2.2.3` 与 dts-stack `main` 目前内容相同。建议以后只向 dts-stack 推送，s10-stack 转为只读镜像或归档，避免两个远端再次分叉。

## 3. 需要用户确认

- A. 是否以 GitHub `dts-stack` `main` 为权威（第 1 条）；
- B. s10-stack 的去留：只读镜像 / 归档 / 继续双推（第 5 条）；
- C. 两个工作副本中的未提交文件（v2.2.3 有 10 个、prs 副本有 5 个）由谁处理。

确认后：F0/T01 关闭 Q1，F0/T07 更新子模块指针，下游 F0/T02–T04、T12、T13、T16 与 F1 解除阻塞。

## 4. 用户决定（2026-09-28）

- A：**以 GitHub `billyhotjava/dts-stack` 的 `main` 为权威**；开发工作副本为 `/opt/prod/s10/v2.2.3`。
- B：**s10-stack 转为只读镜像/归档**，以后只向 dts-stack 推送。
- C：未提交文件的处理并入 F0/T01 执行（见 `handoff-20260928-q1-and-review-fixes.md` 第 2 步）。

Q1 关闭。

## 文档落地状态（09-28）

Q1 决定已同步到 F0/T01、T07、T11、Sprint 和产品规划；仓库操作未执行。后续固定基准 SHA，不自动跟随 main 漂移；独有提交用 patch/内容核对，不能仅凭标题判断吸收。其余模块基准与脏文件对账仍属于 F0/T01 未完成范围。

## 5. 补充决定：dts-stack 与 s10-stack 完全隔离（2026-09-29）

用户：“S10-stack 现在可以不用管了，dts-stack 的 main 分支已经从 s10-stack 的 v2.2.3 版本获取了最新的，从现在开始 dts-stack 和 s10-stack 完全隔离。”

- 隔离基线：dts-stack `main` = `8568eb9`（09-29 核对远端未变化）。此后 dts-stack 独立演进，不再从 s10-stack 同步，也不向其推送。
- **取代 §4 的 B、C 与 §2 第 4、5 条**：不再归档 s10-stack，不核对其 `main` 的 22 个独有提交，不修改 `/opt/prod/s10/v2.2.3` 的 remote，不处理 s10 副本的 10 个未提交文件。
- **路径归属**：`/opt/prod/s10/v2.2.3` 与 `/data/dts-stack`（origin 为 s10-stack，HEAD `72ffaa0`）属于 s10，DTS 不再使用、不再修改。
- **dts-stack 新路径（默认方案，用户可改）**：开发副本 `/opt/prod/dts/dts-rdc/dts-stack`（子模块，检出 `main`）；构建/运行目录 `/data/dts-rdc/dts-stack`。
- 仍保留：`/opt/prod/prs/source/dts-stack`（origin 为 dts-stack，属 DTS 旧副本）的 5 个未提交文件与 dts-stack `main` 比对登记。
