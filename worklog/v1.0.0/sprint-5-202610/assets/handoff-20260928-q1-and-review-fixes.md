# 实施指令：Q1 关闭落地 + 编码就绪缺口修正（2026-09-28）

> 09-28 文档落地记录：Q1 状态、前端策略和 G1～G7 文档已同步，见 [复核结果](review-planning-20260928.md)。下列 gitlink、remote/upstream、归档、构建、提交与推送仍未执行；不得因文档更新勾选这些实施项。

**执行方**：实施会话。本会话（规划）只出指令。
**依据**：
- `q1-dts-stack-authority-20260928.md`（Q1 事实与用户决定）；
- `review-20260927-coding-readiness.md`（缺口 G1–G7）；
- `handoff-20260927-remove-copilot-webapp.md`（尚未执行）。

## 执行顺序

| 步 | 内容 | 依据 | 备注 |
|----|------|------|------|
| 1 | 执行 copilot webapp 删除指令全部 18 项，新建 F6/T14 | `handoff-20260927-remove-copilot-webapp.md` | 先做：它改动 F1/F6，后面几步在其基础上修改 |
| 2 | Q1 落地（见下节） | Q1 文档 §4 | 仓库操作与文档修改 |
| 3 | 修正 G1–G7 | 评审文档 §3 | G7 按 Q1 已关闭改写：Sprint README 不再列 Q1 为阻塞，改为记录“Q1 于 09-28 关闭” |
| 4 | 自检并提交 | 本文件末节 | 只 `git add` 明确路径 |

## 第 2 步：Q1 落地

1. **F0/T01**：
   - 状态由“DRAFT（等待用户回答开放问题 Q1）”改为 IN_PROGRESS；
   - 在技术设计中写入权威源结论并链接 Q1 文档：dts-stack = GitHub `billyhotjava/dts-stack` `main`，开发副本 `/opt/prod/s10/v2.2.3`，构建目录 `/data/dts-stack`；
   - 基准提交：dts-stack `8568eb9`；其余模块的基准 SHA 按 T01 原有步骤记录。
2. **Sprint README**：
   - 开放问题 Q1 标记“已关闭（2026-09-28，见 assets/q1-dts-stack-authority-20260928.md）”；
   - 账本追加一条事实：“#36 GitHub dts-stack main = s10-stack v2.2.3 = `8568eb9`；RDC 子模块指针 `b2a674b` 已不在远端；PRS/dts-stack 是落后 143 个提交的祖先副本”。
3. **F0/T07（子模块指针）**：
   - 执行 `git -C dts-stack fetch origin && git -C dts-stack checkout 8568eb9`（固定到基准表的完整 SHA，不自动选择浮动 main），然后在 dts-rdc 提交子模块指针；
   - 验证：在临时目录执行 `git clone --recursive git@github.com:billyhotjava/dts-rdc.git`，确认 dts-stack 能检出，且 `dts-stack/source/pom.xml` 存在；
   - 其余子模块（studio、app-stack）仍按 T07 原有依赖处理，本步只动 dts-stack。
4. **未提交文件的处理**（F0/T01 范围，只读比对，不擅自提交到 stack）：
   - `/opt/prod/prs/source/dts-stack` 有 5 个未提交文件：`docker-compose-app.yml`、`docker-compose.dev.yml`、`imgversion.conf`、`init.sh`、`services/dts-pg/init/10-init-users.sh`（账本#2）。逐个与 v2.2.3 同路径文件 diff，结论记入 `assets/stack-dirty-files-20260928.md`（保留并迁移 / 已被 v2.2.3 覆盖 / 丢弃）。
   - `/opt/prod/s10/v2.2.3` 有 10 个未提交文件：只登记清单与归属，不做处理；这是 stack 开发线的在制品，由 stack 负责人决定。
   - 所有需要迁移到 v2.2.3 的改动只列清单，由 stack 开发会话提交。
5. **s10-stack 归档**：
   - 在 `assets/stack-dirty-files-20260928.md` 末尾写明两件事：s10-stack `main` 的 22 个独有提交（自 `da2273c` 起）是否已被 v2.2.3 吸收（按 patch/内容与依赖比对并列出未吸收项；标题仅作线索）；归档操作由用户在 GitHub 执行（Settings → Archive repository），或经用户同意后执行 `gh repo archive billyhotjava/s10-stack`。
   - `/opt/prod/s10/v2.2.3` 的 origin 在归档前改为 dts-stack：`git remote set-url origin git@github.com:billyhotjava/dts-stack.git`，并把分支 `v2.2.3` 的上游设为 `origin/main`。执行前先确认该副本的未提交文件不受影响；**这一步需用户或 stack 负责人确认后再做**。
6. **下游解阻**：F0/T02–T04、T12、T13、T16 与 F1 的“依赖 F0/T01 / Q1”说明更新为“Q1 已关闭”；各自状态按 DoR 重新判断，不要自动标 READY。

## 执行约束

- dts-rdc 中只 `git add` 本次修改的明确路径；不要提交 `package.json` 与 dts-app-stack 子模块内部改动；`products.json` 必须保留（已于 09-28 恢复）。
- 不在 `/opt/prod/s10/v2.2.3`、`/opt/prod/prs/source/dts-stack` 中提交或丢弃任何文件（第 5 步的 remote 修改除外，且需确认）。
- 不修改 `renumber-20260926.md` 与已有账本条目的原文（只追加）。

## 完成后自检

1. `git clone --recursive` 的全新克隆中，dts-stack 检出为 `8568eb9`（完整 SHA 以已确认基准表为准）。
2. Sprint README 中 Q1 为已关闭，账本有 #36；F0/T01 链接到 Q1 文档。
3. webapp 指令第 5 节的 5 项自检通过；Sprint-5 Task 数为 83，且各处统计一致。
4. G1–G7 均有对应修改，可在评审文档 §3 各行后注明“已修正（提交号）”。
5. `git diff --check` 通过；除设计文档中 3 处示例占位路径外无断链。
