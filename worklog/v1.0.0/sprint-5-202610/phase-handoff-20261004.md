# 阶段交接（2026-10-04）：S1 完成、S4a 计划就绪、开发环境从 WSL 迁到开发服务器

本文是这一阶段的收口记录。在新的开发服务器上恢复工作时，从这里开始。本文不含任何口令、token 或私钥。

## 1. 本阶段成果

| 项 | 状态 | 位置 |
|---|---|---|
| 模块边界与公共底座设计（D1–D17） | 已定稿；D17 = 研发文档统一迁入 dts-wiki `content/<产品>/` | [F0 设计](features/F0-基线仓库落位与架构定案/design/2026-10-03-模块边界与公共底座设计.md) |
| S1 产品身份底座（E3） | ✅ 完成并验证 | [计划](features/F7-dts-infra-K8s交付底座/design/02-S1产品身份底座实施计划.md) · [证据](it/infra/S1-identity.md) |
| S4a 研发文档统一与入站同步 | 计划已写并对照代码核对，**未执行** | [S4a 计划](features/F4-Wiki-Git双向同步/design/01-S4a研发文档统一与入站同步实施计划.md) |
| S2 研发构建与制品流、S3 dts-base、S5 产品形态 wiki | 未开始 | F0 设计 §6 |

S1 上线的能力：
- 产品 Keycloak `https://sso.dts.yuzhicloud.com`，realm 为 `dts-ops` 与 `dts`；
- apiserver OIDC，kubectl 经 kubelogin 登录；
- Rancher 重装在 `https://rancher.dts.yuzhicloud.com`，只接 `dts-ops`；
- E3 节点镜像经 Harbor `mirror` 拉取；
- 应急通道已演练。

## 2. 仓库状态（交接时）

| 仓库 | 分支 | 远端 | 说明 |
|---|---|---|---|
| dts-rdc | `feature/studio/pack-runtime` | 已推送（含本文提交） | `main` 未随本阶段前移 |
| dts-infra | `feat/T02-chart-spec` | 已推送 `bbc9d3a` | S1 的 16 个提交已快进合入 |
| dts-wiki | `feat/W1-scaffold` | 已推送 `1d5f7fe` | S4a Task 2 再快进到 `main` |
| dts-app-stack | `feature/studio/pack-runtime` | 无未推送提交 | 记录的 prs-stack 指针 `8d867d5` 落后于 prs-stack HEAD `804f80a` |
| dts-stack | `feature/stack/modular-baseline`（孤立分支，单提交 `b2a674b`） | **无上游，按 F0 设计 §7 在多租户设计前不推送** | rdc 指针悬空（F0/T07） |
| dts-studio | `feature/studio/engine-import` | 无未推送提交 | — |

### 只在本机存在的未提交工作（2026-10-02 另一会话的“本地源码整理”，不是本阶段产生）

| 位置 | 规模 | 内容 |
|---|---|---|
| dts-studio | 401 删除、18 修改、1 未跟踪 | 删除 `engine/deploy/legacy/` 等；改 CLAUDE/README/docs/pack-runtime 等 |
| dts-stack | 1 修改、4 未跟踪（`analytics/` 约 111 MB、`build.sh`、`scripts/`、`.gitignore`） | analytics 迁入 stack（CLAUDE.md 顶部注记） |
| prs-stack | 3 修改 | `README.md`、`pack/STUDIO-RUNTIME.md`、`tools/build-studio-pack` |
| `/opt/prod/dts/review-backups/` | 38 MB | 首次 review 时的备份 |

这些改动没有提交、也不能推送（dts-stack 受 §7 约束）。**迁移时必须整目录同步 `/opt/prod/dts`（含各 `.git`），不能在新机器上重新 clone**，否则会丢失。

## 3. 开发环境迁移清单（WSL → 开发服务器）

### 3.1 代码

```bash
# on the WSL workstation; <dev> = the dev server
rsync -aHX --info=progress2 /opt/prod/dts/ <dev>:/opt/prod/dts/
```

保持同一路径 `/opt/prod/dts/dts-rdc`，Claude 的项目记忆目录名才能对上（`~/.claude/projects/-opt-prod-dts-dts-rdc/`）。同步后在新机器上核对：

```bash
cd /opt/prod/dts/dts-rdc && git status --short && git submodule status
```

两边结果应一致（dts-stack/dts-studio/dts-app-stack 显示 `m`）。

### 3.2 网络与访问

新机器需要能访问：

| 目标 | 用途 |
|---|---|
| 192.168.1.100/.110–.113 | E3：PVE、RKE2 VIP、三节点 |
| 10.20.0.50 | E1：Harbor `:18443`、wiki v2 `:18091`、公司 SSO、Jira |
| 39.106.43.56 | 阿里云边缘：Nginx、WireGuard hub |
| GitHub | 推送 |

建议为新机器单独生成 SSH 密钥，并把公钥加到上表各主机的 root 和 GitHub。不要复制工作站私钥。

### 3.3 工具链

| 工具 | 恢复方式 |
|---|---|
| Go 1.27.1、kubectl v1.35.9、Helm v4.2.4、crane v0.22.1、kubelogin v1.36.4 | `dts-infra/deploy/e3/tools.sh`（带校验和，装到 `~/.local/dts-tools`） |
| JDK 25.0.4-tem | `sdk install java 25.0.4-tem`。本机只有 21-graal；S4a Task 1 需要 25 |
| Node 24（本机 v24.14.1，nvm）、pnpm | dts-wiki 前端 |
| uv、python3、docker | 通用；S4a 需要 `uv tool install git-filter-repo` |
| 镜像 `dts-wiki-db:18-bigm` | wiki 测试用：`ssh root@10.20.0.50 'docker save dts-wiki-db:18-bigm' \| docker load` |

### 3.4 配置与凭据

只传文件或重新生成，不进仓库：

| 项 | 本机位置 | 新机器上的做法 |
|---|---|---|
| 内部 CA | `~/.config/dts/ca-bundle.pem`、`harbor-ca.crt` | 复制（公开证书），供 `chart-release.sh`/`sync.sh` 的 `SSL_CERT_FILE` 使用 |
| Harbor 推送机器人凭据 | `~/.config/dts/harbor-e2-push.json` | 安全传输；或在 .50 上用 `deploy/harbor/robots.sh` 刷新密钥 |
| Harbor docker 登录 | `~/.docker/config.json` 中的 `10.20.0.50:18443` | 用机器人凭据重新 `docker login` |
| kubeconfig `e3-oidc` | `~/.kube/config` | 运行 `dts-infra/deploy/e3/oidc-kubeconfig.sh` 重新生成，浏览器登录 `dts-ops` |
| 集群证书 kubeconfig | 只在节点上（`rke2.yaml` 不离开节点） | 不迁移 |

### 3.5 Claude 环境

| 内容 | 位置 |
|---|---|
| 项目记忆 | `~/.claude/projects/-opt-prod-dts-dts-rdc/memory/` |
| 全局指令 | `~/.claude/CLAUDE.md` |
| 技能 | `~/.claude/skills/`（graphify、sprint-workflow、browser-use） |
| 插件 | superpowers 等，`~/.claude/plugins/installed_plugins.json` |

这些都需要复制到新机器的同名位置。

### 3.6 不需要迁移

- 会话级 ProxyJump 包装：WG 路由已恢复（2026-10-04 复核：.50、k8s-01、阿里云均可直连）。
- 本机 dts-ingestion、airflow、dbt 等旧镜像。

## 4. 下一步

1. **S4a 执行**。用户选执行方式：子代理逐个执行，或本会话分批执行。需要用户确认或操作的四个点：
   - G1：迁移守恒报告确认后，才删除原 `worklog/`；
   - G2：`产品-研发中心` 的成员名单；
   - G3：备份后重置 wiki v2 验收库；
   - G4：在 GitHub 添加 3 把只读 deploy key。

   Task 6 执行之后，研发文档改写在 `dts-wiki/content/rdc/worklog/`，本文也随之迁移。
2. **S1 遗留（用户）**：
   - `billy` 首次登录（初始口令在 k8s-01 `/root/dts-identity/`）；
   - 严格镜像源开启的时间窗；
   - 是否删除公司 SSO 中的 `dts-rancher` client；
   - 是否清理 k8s-01 `/root/dts-rancher` 下约 1.3 GB 的旧包；
   - 验收后删除 S1 的 PVE/etcd 快照。
3. **S2**：在新的开发服务器（即 E2）上建工具链、CI runner、镜像与 chart 构建推送。本次迁移就是 S2 的起点。
4. **2026-10-02 未提交整理的处置**：dts-studio、dts-stack、prs-stack 中的改动由用户决定提交、拆分还是放弃。在此之前保持原样。

## 5. 持续有效的约束

- 仓库、日志、证据中不出现任何口令、token、密钥。凭据只放在节点的 `/root/dts-identity`、`/root/dts-rancher`、`/root/dts-harbor`（700/600）。
- 10.20.0.50 上：
  - 不 `docker pull`，不重启 dockerd；
  - 不动现网 wiki（`/data/dts-wiki`，端口 18090）、Jira、公司 Keycloak 容器；
  - wiki v2 只用 `/data/dts-wiki-v2`，端口 18091。
- 不 `push --force`；只在用户要求时提交。
- DTS 产品域名一律 `*.dts.yuzhicloud.com`。
