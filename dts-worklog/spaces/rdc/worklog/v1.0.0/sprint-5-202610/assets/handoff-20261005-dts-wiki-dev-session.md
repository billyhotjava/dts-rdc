# dts-wiki 开发会话工作指导（2026-10-05）

本文是 dts-wiki 开发会话的**唯一入口**：先读本文，再按 §1 的顺序读其他文档。所有工作按 §4 的工作包推进，状态和证据按 §6 回写。

RDC 架构会话负责模块边界、内容契约和 dts-worklog/dts-docs 的组织；wiki 开发会话负责 dts-wiki 的代码、部署和验收。两者的分界见 §7。

## 1. 阅读顺序

| # | 文档 | 用途 |
|---|---|---|
| 1 | 本文 | 范围、工作包、规则 |
| 2 | [wiki 产品与 worklog 内容分离设计](../features/F0-基线仓库落位与架构定案/design/2026-10-05-wiki产品与worklog内容分离及模块关系设计.md)（重点 §2、§4、§7） | D18–D23：产品定位、内容源、接口 |
| 3 | [S4a 计划](../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F4-Wiki-Git双向同步/design/01-S4a研发文档统一与入站同步实施计划.md)（归档，按本文 §4 的修订执行） | Task 3–5、7–9 的详细步骤与 TDD 用例 |
| 4 | [F2 设计 00–10](../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F2-Wiki平台骨架身份与性能/design/)，尤其 `08-编码任务与交接说明.md`、`09-Agent与内容规范.md`、`10-v1.1变更与重构清单.md` | 架构、领域模型、同步、前端、部署、测试、内容规范 |
| 5 | dts-common `README.md` 中的 “Wiki content contract” 一节，以及 `src/main/resources/protocol/wiki-content/` | 清单与 frontmatter 契约 v1 |
| 6 | [dts-worklog/README.md](../../../../../../README.md)、[spaces.yml](../../../../../../spaces.yml) | 内容仓库布局与当前空间 |

归档中的设计文档仍然有效，但凡是和 D18–D23 冲突的地方（`content/` 目录、`application.wiki.spaces`、每个空间各配一把 deploy key、`sprint-6-202610` 路径），一律以本文和分离设计为准。

## 2. 产品定位（必须遵守）

- dts-wiki 是**产品中立**的轻量级 Confluence 式 wiki。它会作为 DTS 的一个模块交付给客户；研发中心使用的只是它的一个部署实例。
- 仓库里**不放任何内容**：不建 `content/` 或 `worklog/`，`scripts/check-boundaries.py` 会拦截。代码中**不写死任何空间名**（如 `rdc`、`prs`、`dts`）；空间、显示名和访问角色全部来自内容源的清单。
- PostgreSQL 是唯一事实源。git 是同步端：本期只做入站（D10 A′），绑定 git 的页面在 wiki 中只读，wiki 原生页可以编辑。
- 两种部署形态：
  - **研发形态**（本期）：部署在 E1 10.20.0.50，使用公司 SSO（realm `yuzhicloud`）。
  - **产品形态**（F7/T27，本期只记录需求）：使用产品 Keycloak realm `dts`，导入 dts-docs 内容包，客户的原生空间可以不绑定 git。

## 3. 现状（2026-10-05）

| 项 | 状态 |
|---|---|
| 代码 | dts-wiki `main` = `1d5f7fe`，所有分支已合并到 main。W0–W5c 已完成：骨架、身份、页面、附件、编辑器、性能预算、DTS-MD 内容契约。`service/wiki/sync/` 下已有入站、出站、冲突、导入的实现（W6），但 F4 的卡片仍标为 DRAFT，**需要先核对实现与卡片，再更新状态** |
| 部署 | 10.20.0.50 `/data/dts-wiki-v2`，端口 18091，验收库只有 2 个空间、3 个种子页（S4a 记载）。现网旧 wiki（18090）不能动 |
| 开发机 | 10.20.0.6，用户 devops。已有 JDK 25（`~/.sdkman/candidates/java/25.0.4-tem`）、Node 24、Docker、Maven。**本机 SSH 公钥尚未加入 .50 的 root**（`Permission denied`）。本机没有 `dts-wiki-db:18-bigm` 镜像 |
| 任务卡片 | F2–F5 的状态卡片在活动 worklog 的 `../features/F2-*`～`F5-*`，状态取自归档快照，**未经复核** |
| 内容源 | dts-rdc 仓库 `main`，清单为 `dts-worklog/spaces.yml`，包含 `dts`（`dts-docs`）、`rdc`、`prs` 三个空间。当前共 561 个文件，其中 128 个带 frontmatter（Sprint-5 的 Feature/Task 卡片），`content-lint` 0 错误 |
| 契约 | dts-common 1.1.0 `protocol/wiki-content/`：`space-manifest.v1` + 6 个 frontmatter schema。字段与 dts-wiki 现有的 `content-schemas/` 一致，只有 `$id` 加了版本号 |

## 4. 工作包（按顺序执行）

Sprint-5 截止于 10-31，工作流 B（Wiki v1 上线）必须在 10-31 前可以验收。WP1–WP5 是本月必须完成的；WP6–WP9 按剩余时间推进，做不完的转入 backlog。

### WP1 新机器基线（S4a Task 1，按新环境修订）

- 修改 `deploy/release.sh`：`JAVA_HOME` 不再写死 `/home/billy/...`，改为取 `$HOME/.sdkman/candidates/java/25.0.4-tem` 或调用方的环境变量；临时目录不再写死 `/tmp/opencode`。
- 数据库镜像：等 .50 的 SSH 打通后（G0），执行 `ssh root@10.20.0.50 'docker save dts-wiki-db:18-bigm' | docker load`；在此之前，用 `src/main/docker/postgres.Dockerfile` 在本机构建同一 tag。
- 跑出基线：`./mvnw clean verify`、`cd frontend && pnpm install --frozen-lockfile && pnpm test`。如果基线本身有失败，先登记，后面不要当成回归。
- **完成标准**：基线测试数量和结果写入证据 `../it/wiki/WP1-baseline.md`。

### WP2 内容源与清单驱动的空间（S4a Task 3、4 修订版，后端 TDD）

- 配置：`application.wiki.content.{repo-url, branch, manifest-path, deploy-key-path}`，以及 `outbound-enabled`（默认 `false`）。**删除** S4a 原计划的 `application.wiki.spaces`。
- 启动时和每个同步周期都读取清单，并按 `space-manifest.v1` 校验，校验失败就拒绝本次同步并告警，不得部分应用。
- 对每个空间做 reconcile：
  - 新增条目：建立空间和同步根（`roots[]` 中的路径都相对内容仓库根），首个周期自动全量导入（含 git 历史，S4a Task 4 的逻辑）。
  - 删除条目：只停止同步，不删除数据。
  - slug 一律不得改名。
- 复用现有模型：`Space` 的 git 地址统一为内容源地址，`SyncRoot.path` 取自 `roots`。所有空间共用一把只读 key；可以共用一个工作副本，但这只是优化，不是必须。
- 只导入 `roots` 下的文件，其他路径一律忽略（内容源 dts-rdc 中还有代码、子模块指针和 `dts-worklog/checksums/`）。
- 只读与只入站按 S4a Task 3 执行：
  - git 绑定页的所有写入口返回 409 `GIT_PAGE_READ_ONLY`；
  - 附件同样受此限制；
  - `outbound-enabled=false` 时不产生任何 outbox。
- **测试**：用本地 bare 仓库作为夹具（S4a 中的 `GitFixtures`），覆盖以下场景：清单增删条目、清单非法、roots 之外的路径、只读写入口返回 409、首轮导入、增量入站，以及 frontmatter 不合法时以宽松模式入库并带 `valid=false`。
- **完成标准**：后端测试全部通过；代码中搜不到任何空间 slug 字面量。

### WP3 前端只读呈现（S4a Task 5）

- `PageView.gitReadOnly`、`TreeNode.readOnly`，以及“来自 git · 只读”标签；只读页隐藏编辑入口，原生页不受影响。
- **完成标准**：前端测试通过；截图写入证据。

### WP4 空间角色（S4a Task 7，G2）

- 研发形态的角色为 `dts-wiki` client 的 `space-<slug>`。dts-infra 的 `deploy/sso/apps/wiki-spaces.sh` 改为读取 `spaces.yml` 生成角色和组，不再手写空间名。这个文件属于 dts-infra，改动单独提交到 dts-infra。
- 无权访问的空间一律返回 404（现有 `SpaceAccessService` 的行为保持不变）。
- **完成标准**：脚本可以重复执行且结果不变；三个空间各用一个有权和一个无权账号验证。

### WP5 部署到 .50 与入站验收（S4a Task 8、9，G3、G4）

- 前置条件：
  - G0：本机公钥已加入 .50；
  - G4：dts-rdc 仓库已添加一把只读 deploy key；
  - G3：用户同意备份后重置验收库。
- 按 `deploy/release.sh` 构建并通过 `docker save | ssh docker load` 发布。`.env` 和密钥只放在 `/data/dts-wiki-v2/`。
- 验收项：
  - 三个空间自动建立，首轮导入完成；
  - 在 dts-rdc 推送一个改动后，1 分钟内可以在 wiki 中看到；
  - git 页只读，原生页可以编辑；
  - 无权空间返回 404；
  - 现网 18090 不受影响。
- **完成标准**：证据写入 `../it/wiki/S4a-sync.md`，包括时间戳、提交 SHA 和截图，不含任何口令。

### WP6 结构化查询与看板（S4b，F3/T15）

- Sprint-5 的卡片已经有 frontmatter，可以直接作为看板数据。提供结构化查询 API（按 sprint、feature、status、priority 过滤），提供 sprint 看板页面，以及 `llms.txt`。
- frontmatter 补齐已经由 RDC 会话完成（M8c，方案 A：卡片），wiki 侧**不需要**再做 frontmatter 迁移。

### WP7 检索与历史（S4c：F5/T01–T02，F3/T10–T12）

pg_bigm 全文检索（spike 结论见 F2/T03），以及页面历史、差异对比、活动流。

### WP8 MCP（S4d：F3/T16）

Streamable HTTP + OAuth 2.1 资源服务器，Keycloak client `dts-wiki-agent`。agent 以个人身份接入，空间权限照常生效（K6）。

### WP9 上线切换（S4e：F5/T07–T10）

备份与 runbook；旧链接重定向（旧静态站 `/p/dts/…` → `rdc` 空间）；并行运行；`wiki.yuzhicloud.com` 切换与回退演练（切换时间窗由用户确认）。

## 5. 硬规则

- 实体只通过 JDL 和生成器修改；手工修改的生成代码要标注 `// DTS-WIKI: customized`。
- 业务接口只放在 `/api/wiki/**` 下，并且一律经过 `SpaceAccessService`。git 命令只出现在 `service.wiki.sync` 中。不允许 `push --force`。
- 页面版本不可修改；内容相同（sha256 一致）时不生成新版本。
- 10.20.0.50 的限制：
  - 不执行 `docker pull`，不重启 dockerd；
  - 不碰现网 wiki（`/data/dts-wiki`、18090）、Jira 和公司 Keycloak 容器；
  - 只使用 `/data/dts-wiki-v2` 和 18091 端口。
- 仓库、日志和证据中不得出现口令、token、私钥、`.env`。
- 依赖只用发布满 30 天的稳定版（R-012），新增依赖要做许可审查。
- 不改变 wiki-content 契约的语义。需要扩展契约时，提交给 RDC 会话，由 dts-common 发布新版本。

## 6. 状态、证据与提交

| 事项 | 做法 |
|---|---|
| Task 状态 | 修改活动 worklog 中对应卡片的 frontmatter `status`，并在“状态变更”表中追加一行。**不要改动归档**，`content-lint` 会检测到 |
| 新增 Task | 追加到已有 Feature（F2–F5）下：在卡片目录新建 `T<nn>-<名称>.md`，编号顺延，带完整 frontmatter（`id: S5/F<n>/T<nn>`）。正文直接写在这张卡片里，不再另建原文 |
| 设计变更 | 新建 `../features/F4-Wiki-Git双向同步/design/` 等目录下的文档，并注明它修订了哪份归档文档 |
| 证据 | 写到 `../it/wiki/` 下，按工作包命名 |
| 代码提交 | dts-wiki 使用 `feat/<wp>-<topic>` 分支，提交信息写成 `feat(F<n>/T<nn>): …`，合并到 `main` 后推送 |
| 文档提交 | 文档在 dts-rdc 仓库提交。提交前先 `git pull --rebase`，只提交与 wiki 相关的文件；运行 `dts-common/tools/content-lint check .` 和 `python3 scripts/check-boundaries.py`。更新 dts-rdc 中的 dts-wiki 子模块指针，放在里程碑时做 |
| 回报 | 每个工作包完成后，把卡片状态、证据路径和提交 SHA 汇报给用户 |

## 7. 与 RDC 架构会话的分界

| wiki 会话负责 | RDC 会话负责 |
|---|---|
| dts-wiki 代码、测试、部署、验收；F2–F5 卡片状态；dts-infra 中 `wiki-spaces.sh` 的改动 | D18–D23 与模块边界；dts-common 的 wiki-content 契约；`spaces.yml` 的空间增减；dts-docs 与 dts-worklog 的组织；内容包发布（M8b） |

如果遇到契约不够用、清单需要新增字段，或者与本文冲突的情况，先停下来，把问题和建议写进证据，交给用户转给 RDC 会话，不要自行扩展契约。

## 8. 需要用户处理的事项

| # | 时点 | 事项 |
|---|---|---|
| G0 | WP1 | 把开发机 10.20.0.6 的专用密钥 `id_ed25519_dts_e2.pub` 加入 10.20.0.50 的 root（公钥和完整访问清单见 dts-infra `docs/development-ci-host.md` 的 Access map） |
| G2 | WP4 | 确认各空间的成员名单（默认：`rdc` 沿用“产品-DTS 平台”现有成员） |
| G3 | WP5 | 同意先备份、再重置验收库 `/data/dts-wiki-v2` |
| G4 | WP5 | 在 GitHub `billyhotjava/dts-rdc` → Settings → Deploy keys 中添加 1 把**只读** key |
| G5 | WP9 | 确认 `wiki.yuzhicloud.com` 的切换时间窗 |
