# S1 产品身份底座 — E3 验证证据（2026-10-03～04）

**计划**: [`02-S1产品身份底座实施计划.md`](../../features/F7-dts-infra-K8s交付底座/design/02-S1产品身份底座实施计划.md) · **设计**: [F0 模块边界与公共底座设计](../../features/F0-基线仓库落位与架构定案/design/2026-10-03-模块边界与公共底座设计.md) D12–D16
**代码**: dts-infra 16 个提交 `09cb126`…`bbc9d3a`，2026-10-04 快进合并入 `feat/T02-chart-spec`，已推送 origin
**环境**: E3 = PVE 192.168.1.100 上 RKE2 v1.35.9+rke2r1 三节点（k8s-01..03，API VIP 192.168.1.110）；E1 Harbor 10.20.0.50:18443；阿里云边缘 39.106.43.56
本文不含任何口令、token、客户端密钥或授权码；凭据只在 k8s-01 `/root/dts-identity/`、`/root/dts-rancher/`（700/600）。

## 1. 结果总览

| 能力 | 状态 | 关键证据 |
|---|---|---|
| 产品 Keycloak `https://sso.dts.yuzhicloud.com` | ✅ | Keycloak 26.7.5（Operator）2 实例分布 k8s-03/k8s-02；`Ready=True HasErrors=False`；公网证书校验 0 |
| realm 代码化 `dts-ops`、`dts` | ✅ | config-cli 6.5.1 导入无 ERROR/WARN；重复导入前后 realm 哈希一致（`9da6e23d02a59674`） |
| 暴露面 | ✅ | 公网仅 `/realms/dts-ops`、`/realms/dts`、`/resources`；`/realms/master`、`/admin` 公网 404 |
| apiserver OIDC（kubectl） | ✅ | 三节点 `--authentication-config` 生效；真实 token：viewer 列 Pod 60、建 namespace forbidden；无组用户全部 forbidden |
| Rancher 重装为产品组件 | ✅ | `https://rancher.dts.yuzhicloud.com` 仅接 `dts-ops`；无任何公司 SSO 身份；验收见 §6 |
| 镜像只经 Harbor | ⚠️ 第一阶段 | 节点 `registries.yaml` 已经 Harbor `mirror` 拉取（Harbor 访问日志可见）；严格模式未开启（§8） |
| 应急通道 | ✅ | Keycloak 全停时证书 kubeconfig 与 Rancher 本地 admin 可用；约 55 秒恢复（§7） |

## 2. 版本与镜像（按 digest 锁定于 Harbor `mirror`）

| 组件 | 版本 | Lock |
|---|---|---|
| CloudNativePG operator / PostgreSQL | 1.30.1 / 18.6 | `deploy/mirror/s1-images.lock` |
| Keycloak / Keycloak Operator | 26.7.5 | 同上 |
| keycloak-config-cli | 6.5.1（构建基线 26.5.5，兼容门禁通过） | 同上 |
| rancher-cleanup | v1.1.1（镜像内 `cleanup.sh`/`verify.sh` SHA-256 与审阅源码一致） | 同上（6 个镜像，`--verify` 通过） |
| E3 在用镜像 | 24 个去重镜像（含 Rancher 预载集） | `deploy/mirror/e3-running.lock`（`--verify` 通过） |
| Rancher | 2.15.2（本地 chart `rancher-2.15.2.tgz`） | — |

工作站工具链：Go 1.27.1、kubectl v1.35.9、Helm v4.2.4、crane 0.22.1、kubelogin v1.36.4（`deploy/e3/tools.sh` 校验和通过）；dtsctl `4ca141b` 安装于 k8s-01。

## 3. 部署（dtsctl）

BOM `dts-0.1.0-s1`（profile `rke2-cluster`）：`dts-gateway 0.1.0`、`dts-cnpg-operator 0.1.0`、`dts-pg 0.1.0`（`dependsOn: dts-cnpg-operator`）、`dts-keycloak 0.2.0`；`dtsctl bom graph` 三层；`dtsctl status` 全部 Ready。四个 chart `dtsctl chart check` 均 `passed: true, issues: []`。
- Gateway：GatewayClass `traefik` Accepted，Gateway `dts-gateway` Programmed；Rancher Ingress 不受影响。
- PG：`3/3 Cluster in healthy state`，三实例分布三节点；契约 Secret `dts-dts-keycloak-pg` 键齐全，`sslmode=require` 登录 `keycloak|keycloak|PostgreSQL 18.6`。

## 4. Keycloak 与 realm

- master：config-cli 服务账号 `dts-config-cli`（客户端凭据可列 realm）；应急管理员 `dts-breakglass`；Operator 临时管理员已删除；kcadm 会话文件退出即清除（Pod `/tmp` 0 个）。
- `dts-ops`：组 `ops-admins/ops-developers/ops-viewers`；`kubernetes`（public，PKCE S256，回调 localhost:8000/18000）；`dts-rancher`（confidential，回调 `https://rancher.dts.yuzhicloud.com/verify-auth`，mappers groups/full_group_path/audience，服务账号仅 query-users/query-groups/view-users）。
- `dts`：Organizations 启用；暂无客户端（S3/S5 接入）。
- 用户：`billy`（ops-admins，一次性口令，首次登录改密）；测试账号 s1-admin/viewer/outsider 已删除（Keycloak 与 Rancher 两侧）。

## 5. apiserver OIDC

结构化认证配置 `apiserver.config.k8s.io/v1`：issuer `https://sso.dts.yuzhicloud.com/realms/dts-ops`，aud `kubernetes`，用户 `oidc:<preferred_username>`，组 `oidc:<group>`。ClusterRoleBinding：ops-admins→cluster-admin，ops-developers/viewers→view。

| 身份 | apiserver 识别 | 列 Pod | 建 namespace |
|---|---|---|---|
| s1-viewer（真实 ID token） | `oidc:s1-viewer`，`oidc:ops-viewers` | 60 | forbidden |
| s1-outsider（真实 ID token） | `oidc:s1-outsider`，仅 `system:authenticated` | forbidden | forbidden |

本机 kubeconfig context `e3-oidc`（kubelogin，PKCE）已生成；`billy` 浏览器登录的管理员正向验证由用户执行（待记录）。

## 6. Rancher（2026-10-04 重装）

- 清理：pinned `rancher-cleanup` v1.1.1 Job；cattle CRD 0、webhook 仅 CNPG 两个、`helm.cattle.io`/`k3s.cattle.io` CRD 4 个与 8 个 HelmChart 保留；各 DTS/系统命名空间 Running Pod 数与清理前基线一致；verify Job 仅报告 CNPG webhook 与 `etcdsnapshotfiles.k3s.cattle.io`（应保留）。残留 `cattle-local-user-passwords`、`cattle-ui-plugin-system` 与孤儿 fleet Pod 手工清理。
- 重装：3 副本 Ready，fleet/webhook/system-upgrade-controller Running，`local` 集群 Ready；`activate-dts-ops.py` bootstrap→rbac（二次运行无变更）→activate（初始化用户 `dts-oidc-init-dd726ce3` 已删除）→accept。
- 验收（重装后与 Keycloak 恢复后各一次，结果相同）：

| 身份 | 结果 |
|---|---|
| ops-admins 测试用户 | 读取 authconfig 200；登出后 401 |
| ops-viewers 测试用户 | Default 项目 200；System 项目 403；authconfig 403；登出后 401 |
| 无组用户 | 登录 401 |

- 用户表仅剩本地 admin 与两个系统用户；公司 SSO principal 0；`k8s.yuzhicloud.com` 301 → `rancher.dts.yuzhicloud.com`。

## 7. 应急通道演练（2026-10-04 03:52Z）

Keycloak Operator 与 StatefulSet 缩到 0 期间：证书 kubeconfig 3 节点可见；OIDC 发现与授权端点 503；Rancher 本地 admin 登录成功且 API 200；dts-pg 3/3、Rancher 3/3、lakehouse 3/3 不受影响。Operator 恢复后约 55 秒两实例 Ready，kubectl OIDC 与 Rancher 验收复测通过。

## 8. 回滚点与遗留

回滚点（etcd + PVE 快照）：`s1-start`、`s1-pre-registries`、`s1-pre-apiserver-oidc`、`s1-pre-rancher`（vm-data 精简池超配，S1 验收后删除）。

| 遗留 | 承接 |
|---|---|
| 严格镜像源（`disable-default-registry-endpoint`）未开启；前提（24 镜像全部在 Harbor）已满足 | 待用户确定时间窗（一次滚动重启） |
| `billy` 首次登录与 kubectl 管理员正向验证 | 用户 |
| 公司 SSO 中 `dts-rancher` client 已不再使用 | 用户决定删除 |
| dtsctl 对 CNPG Cluster 初始化、Keycloak 滚动更新判定 Ready 过早 | T10/T11（Verifying 阶段契约探测） |
| Helm `crds/` 仅首装：Keycloak CRD 升级需 dtsctl 处理 | T10 |
| Rancher 仍由 helm 手工安装，未 chart-spec 化 | F7 新 Task（D12 产品化） |
| PSS restricted、Kyverno | T23 |
| CNPG 备份到外部 S3 | S2 / T22 |
| `dts-lakehouse` NodePort 绕过网关 | 待归属 |
| Harbor 主机重启后容器不自启 | E1 运维（boot unit） |
| `deploy/e3` 节点脚本 | T13（dtsctl install 吸收） |
| k8s-01 `/root/dts-rancher` 旧镜像包约 1.3 GB 与上一会话脚本/日志 | 用户决定清理 |

## 9. 执行中与计划的偏差

1. BOM `release` 须符合 `dts-X.Y.Z(-suffix)`（`dts-0.1.0-s1`）。
2. Harbor 主机（RHEL 8）无 `python3`：robots.sh 用 platform-python，并在机器人已存在时刷新密钥；Harbor 重启后容器未自启，执行中顺带恢复。
3. E1 出网约 70 KB/s：镜像改由工作站同步（约 0.9 MB/s），sync.sh 增加跳过已存在与 `DTS_SYNC_ONLY`。
4. `index.docker.io` 为独立 containerd 主机，registries.yaml 增加同路径改写；严格模式改为开关、推迟。
5. chart-release.sh 需 `SSL_CERT_FILE` 让 crane 信任内部 CA。
6. Keycloak chart 补 PodMonitor（CHART010）；`startOptimized: false`；Keycloak 26.7 新增 2 个 CRD（vendor 改读上游 kustomization）；首装失败两次后清理重装（0.1.2）。
7. Keycloak 默认无反亲和：0.2.0 加 preferred 反亲和。
8. kcadm 脚本：`kubectl exec -i` 会吞掉 `bash -s` 的脚本，去掉 `-i`；会话文件退出即删。
9. Keycloak 声明式用户档案要求 email/firstName/lastName；keycloak-user.sh 支持在创建时填写。
10. RKE2 会自动挂载 `kube-apiserver-arg` 引用的文件，计划中的 `kube-apiserver-extra-mount` 造成重复 mountPath，k8s-03 降级约 12 分钟（其余两节点持续服务），移除后正常。
11. `kubectl get cluster` 解析为 CAPI 资源，须用 `clusters.postgresql.cnpg.io`。
12. Rancher：由“原地切换认证”改为“清理后重装”（用户 2026-10-04 决定，使 E3 不留公司身份）；激活改为脚本自动化（隔离初始化用户 + ops-admins 测试用户），无需浏览器激活；`helm install` 不支持 `--history-max`；`telemetry-opt` 设置不存在；fleet 早于 fleet-crd 安装导致短暂崩溃后自愈。
13. 工作站 Windows WireGuard 隧道曾覆盖 192.168.1.0/24 路由，期间经阿里云 ProxyJump 操作（会话内包装，不改用户配置）。
