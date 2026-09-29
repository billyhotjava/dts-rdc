# dts-infra K8s 交付底座设计

**日期**: 2026-09-29（设计讨论 2026-09-28～29，用户逐段确认）
**状态**: 设计已确认，待 F7/T01 以 ADR-014 形式定稿
**取代**: [`docs/plans/2026-03-26-dts-infra-design.md`](../../../../docs/plans/2026-03-26-dts-infra-design.md)（3 月 DRAFT：bootstrap + commander、bbolt、global-pg infra schema、gRPC、Helm 集中、Infra Agent 内置）。3 月文档仅保留历史参考价值；可沿用的只有铁律检查单思路、三级健康模型、备份目标清单与兼容矩阵概念。
**上位约束**: 五条铁律（CLAUDE.md）；Sprint-5 ADR-008（Traefik + forwardAuth）、ADR-009（QueryGateway）、ADR-012（AppPack 资产载体）、ADR-013（Console 交付方法）、R-012（版本原则、S3 对象存储）、W-ADR-9（附件走 S3）。

---

## 0. 已确认决策一览

| # | 决策 | 结论 | 确认 |
|---|------|------|------|
| D1 | 旧运维体系 | **放弃 dts-stack 运维体系**（`init.sh`、compose 编排、opmanager、imgversion）；K8s 路径验收后删除 | 用户 2026-09-28 |
| D2 | 实现语言与底座 | dts-infra 用 **Go**；底座为 **Rancher 开源社区版生态**（非 SUSE Prime 订阅），自行改造 | 用户 2026-09-28 |
| D3 | 信创目标 | **国产 CPU 与 OS 适配**（鲲鹏/飞腾 arm64、海光 x86；openEuler/麒麟/统信）+ **自主品牌/自主可控**；**不做**国密、**不做**龙芯 loong64 | 用户 2026-09-28 |
| D4 | 现场交付物 | 只交付**品牌化 RKE2**（单节点与集群），**不交付 Rancher Manager**；运维界面为 DTS 自研控制台，人工接管走 kubectl/helm | 用户 2026-09-28 |
| D5 | 发行版 | v1 只做 **RKE2**，不做 K3s（避免构建/测试矩阵翻倍）；Lite 档遇内存瓶颈时再引入 K3s（上层 chart 不变） | 用户确认 |
| D6 | 发布节奏 | **v1.0.0 直接以 K8s 交付，不保留 Compose 回退**；K8s 未验收则发布顺延（用户接受打破“Sprint 不延长”规则的代价） | 用户 2026-09-28 |
| D7 | 实现路线 | **A 起步按 B 演进**：`dtsctl` 安装器 + Helm 伞形编排 + `DtsRelease` CRD，编排逻辑为库；随后同一库装入 `dts-operator` 常驻对账 | 用户确认 |
| D8 | 公有云 | `install`（自有 RKE2）与 `deploy`（已有集群）双模式共用编排库/BOM/chart；**v1.0.0 同时验收 RKE2 与阿里云 ACK**；EKS/ACS 按客户需求 | 用户确认 |
| D9 | 模块边界 | chart 归各模块仓库；dts-infra 持 L2 中间件 chart、伞形 BOM、网关公共件；dts-rdc 不再放 `deploy/` | 用户确认 |
| D10 | 镜像分发 | 总部 **Harbor** 为制品中心；现场默认 **RKE2 内置镜像分发**（airgap 镜像 + embedded registry），客户已有 Harbor 走 BYO，可选 **Zot** | 用户确认 |
| D11 | 离线 | **离线包是唯一标准路径**，在线 = 自动获取离线包 | 用户确认 |
| D12 | 中间件 | CNPG、Strimzi、SeaweedFS、Keycloak Operator + keycloak-config-cli、Traefik、cert-manager、Valkey、**OpenSearch 替代 ES**；**全面不用 Bitnami**、不用 MinIO | 用户确认 |
| D13 | Helm | 使用 **Helm v4 SDK** | 用户 2026-09-29 |
| D14 | 可观测性 | 指标 **Prometheus**（Prometheus Operator），日志 **VictoriaLogs**（避开 Loki AGPL）；Grafana 仅作不修改的可选组件 | 用户确认 |
| D15 | 品牌改造边界 | **只改用户可见层**，内部路径（`/etc/rancher/rke2`、`/var/lib/rancher`）与配置键保留 | 用户确认 |
| D16 | 规划方式 | 按完整目标排工作量，不以交付日期削减范围 | 用户 2026-09-28 |

## 1. 整体架构与模块边界

```
┌─ 控制面 ─────────────────────────────────────────────────────────────┐
│ dtsctl (Go)  install --distro rke2  |  deploy --profile ack          │
│   └ pkg/orchestrator（契约推导依赖图）· pkg/profile · pkg/preflight   │
│   └ 状态：DtsRelease CRD（BOM + 组件版本 + 回滚点）                    │
│   └ 审计：自发 CloudEvents → Kafka dts.audit.v1（apiserver 审计补充）  │
│ dts-operator（复用 pkg/orchestrator）· DTS Console 运维页（经 BFF）    │
└──────────────┬───────────────────────────────────────────────────────┘
L4 AppPack     │ prs-stack（AppPack CRD 管理工作负载与信任）
L3 领域模块    │ dts-stack · dts-studio · dts-wiki
L2 平台中间件  │ Traefik 网关 + dts-auth · Keycloak · PG · Kafka · S3 · Valkey · OpenSearch
               │   └ 每项依赖 = 连接契约 Secret：集群内自建 | 云托管 | 客户已有
L1 K8s         │ 品牌化 RKE2（现场）| ACK（v1.0.0）| EKS/ACS（按需）
L0 OS/硬件     │ openEuler / 麒麟 / 统信 / RHEL ; x86_64 + arm64
```

### 1.1 职责划分

| 归属 | 负责 |
|------|------|
| 各模块仓库（stack/studio/wiki/prs） | 本模块 Helm chart + 多架构镜像，以 OCI 制品发布；本模块 IngressRoute；遵守 `chart-spec.md` 并在 CI 跑规范检查 |
| dts-infra | ① RKE2 品牌构建（补丁队列）② L2 中间件 chart ③ 伞形 BOM ④ `dtsctl`/`dts-operator` ⑤ 离线包 ⑥ 网关公共件（Traefik 实例、forwardAuth Middleware、TLS）⑦ 准入策略、可观测性、备份 ⑧ `chart-spec.md` 与规范检查 CI 步骤 |
| dts-rdc | 规划、ADR、跨模块验收；不再承载部署配置（现网 `deploy/{wiki,sso}` 在 K8s 验收后迁出） |

ADR-008 与 BL-S/T04 的“网关部署编排放 dts-rdc 还是 dts-infra”由本设计回答：**放 dts-infra**。

### 1.2 铁律落点

| 铁律 | 落点 |
|------|------|
| 1 人工随时可接管 | 任何组件可直接 `helm`/`kubectl` 操作，`dtsctl`/operator/控制台停掉不影响运行；AI 组件 `ai.enabled=false` 可关；Infra Agent 可选且只建议 |
| 2 核心安全不可绕过 | 业务流量唯一入口 Traefik + forwardAuth；NetworkPolicy 默认拒绝；运维操作只经 apiserver（现场对接 Keycloak OIDC；云上以云 IAM→RBAC 映射约束，云控制台旁路写入交付检查单）；控制台以 impersonation 代表真实用户 |
| 3 数据安全是基因 | infra 不读业务数据；密钥现场生成、只入 Secret；诊断包脱敏且不含业务数据 |
| 4 全操作可追溯 | `dtsctl`/operator 自发 CloudEvents 到 `dts.audit.v1`（主链）；安装早期本地 journal 兜底后补发；apiserver/云审计为补充 |
| 5 能力先于界面 | API = CRD（`infra.dts.yuzhicloud.com`）；CLI、operator、控制台均为其客户端；编排库先有完整测试 |

## 2. 平台中间件（L2）

原则：成熟开源 Operator 优先；许可证须允许修改与再分发（Apache/MIT/BSD/MPL）；官方 arm64 镜像；可经连接契约替换为云托管。

| 组件 | 集群内 | 云托管映射（ACK） | 要点 |
|------|--------|-------------------|------|
| PostgreSQL | CloudNativePG Operator | RDS PG | 自建 operand 镜像：PG 18 + pgvector + pg_bigm（多架构）；barman 插件备份 + PITR。**待核实**：RDS 是否支持 pg_bigm（不支持则 wiki 云上用自建 PG） |
| Kafka | Strimzi Operator（KRaft，Kafka 4.x） | 阿里云消息队列 Kafka 版 | `KafkaTopic`/`KafkaUser` 声明 `dts.audit.v1` 等；kafka-ui 可选 |
| 对象存储 | SeaweedFS | OSS | 与 R-012、W-ADR-9 一致；不用 MinIO（社区版分发与功能收缩，最新状态待 T01 复核记录） |
| 身份 | Keycloak Operator + keycloak-config-cli | 云上同样自建 | realm/client/role 全部代码化；DB 在 CNPG；现场 apiserver OIDC 对接 |
| 网关 | Traefik 官方 chart | 同，Service=LoadBalancer | 关闭 RKE2 默认 ingress-nginx；公共 Middleware（forwardAuth → dts-auth）由 infra 提供 |
| 证书 | cert-manager | 同 | 内部 CA 或客户 CA |
| 缓存 | Valkey（StatefulSet chart） | 云数据库 Redis/Tair | prs 在用 |
| 检索 | OpenSearch | 阿里云 OpenSearch/ES | 替代 ES 8.11（Elastic License/SSPL）；OpenMetadata 支持 OpenSearch |
| 密钥 | K8s Secret + RKE2 secrets-encryption | 云 KMS 加密 Secret | 离线包不含密钥；暂不引入 Vault |

**硬约束**：全面不用 Bitnami（镜像目录已停止免费更新）；第三方 chart 默认引用的 Bitnami 子 chart/镜像须逐一替换，写入 `chart-spec.md`。

**部署粒度**（profile 决定，chart 不变）：Box = 共享单 PG 集群（每模块独立 database + role）、Kafka 单 broker、SeaweedFS 单实例；集群 SKU = PG 按域拆 2～3 集群（1 主 1 备）、Kafka 3 broker、SeaweedFS 3 副本。

Airflow、OpenMetadata、dbt、Trino 归 stack（L3），推理服务归 studio。

## 3. dtsctl 与编排核心

### 3.1 仓库结构（`billyhotjava/dts-infra`）

```
cmd/dtsctl/  cmd/dts-operator/
api/v1alpha1/          DtsRelease, AppPack
pkg/bom  pkg/orchestrator  pkg/contract  pkg/profile  pkg/preflight
pkg/distro/rke2  pkg/bundle  pkg/audit  pkg/backup  pkg/supportbundle
charts/                L2 中间件与网关公共件
distro/                RKE2 品牌补丁队列与构建脚本
policies/              Kyverno 策略
docs/chart-spec.md     各模块 chart 规范
docs/contract-spec.md  连接契约规范
```

### 3.2 BOM（`dts-release.yaml`）

```yaml
apiVersion: infra.dts.yuzhicloud.com/v1alpha1
kind: ReleaseBOM
release: dts-1.0.0
kubernetes: ">=1.33 <1.36"
distro: { name: rke2, version: v1.34.x+dts.1 }
components:
  - name: pg-main
    chart: { ref: oci://harbor.dts/charts/dts-pg, version: 1.0.0, digest: "sha256:…" }
    provides: [pg]
    images: ["sha256:…"]
  - name: dts-studio
    chart: { ref: oci://harbor.dts/charts/dts-studio, version: 1.0.0, digest: "sha256:…" }
    requires: [pg, kafka, oidc, gateway]
    migrations: forward-only      # 升级前强制备份；回滚 = 备份恢复
    images: ["sha256:…"]
```

- 依赖图由 `requires`/`provides` 推导，不写死层级。
- profile 声明某能力为 `external` 时，提供该能力的组件不安装，`dtsctl` 用外部连接信息生成同名契约 Secret。

### 3.3 连接契约（`docs/contract-spec.md` 定稿，此处为最小字段）

每个“消费者 × 能力”一份 Secret，名称 `dts-<consumer>-<capability>`，标签 `infra.dts.yuzhicloud.com/contract=<capability>`；自建时 `dtsctl` 为每个消费者生成独立凭据（最小权限）。

| capability | 键 |
|------------|----|
| pg | `host, port, database, username, password, sslmode, jdbcUrl` |
| kafka | `bootstrapServers, securityProtocol, saslMechanism, username, password` |
| oidc | `issuerUrl, clientId, clientSecret, realm` |
| s3 | `endpoint, region, bucket, accessKey, secretKey, pathStyle` |
| redis | `host, port, password, tls` |
| opensearch | `url, username, password` |
| registry | `server, username, password`（BYO/ACR 时） |

应用只从契约 Secret 读连接信息，不写死集群内服务名。

### 3.4 `DtsRelease` CRD（cluster-scoped 单例 `dts`）

```yaml
spec:
  bomRef: dts-1.0.0            # 已导入的 BOM（ConfigMap dts-bom-<release>）
  profile: rke2-box | rke2-cluster | ack
  overrides: {}                # 现场 values 覆盖
status:
  phase: Installing | Ready | Upgrading | Failed | RollingBack
  observedBom: dts-1.0.0
  components:
    - name: dts-studio
      phase: Pending|Contracting|Installing|Verifying|Ready|Failed
      chartVersion: 1.0.0
      helmRevision: 3
      message: ""
  history:
    - bom: dts-0.9.0
      revisions: { dts-studio: 2, pg-main: 1 }
      backupRef: backup-20261120-0200
  lastOperation: { id, type, actor, startedAt, finishedAt, result }
```

### 3.5 组件状态机与执行规则

```
Pending → Contracting → Installing → Verifying → Ready
                                   ↘ Failed（下游暂停，上游不动）
```

- 拓扑序执行，同层无依赖并行；每步完成写 `status`，`dtsctl resume` 断点续做。
- K8s Lease `dts-operation` 互斥，同时只允许一个操作。
- Verifying = workload 就绪 + 契约探测（真实连接 PG、建 Kafka topic、OIDC discovery、S3 put/get）。
- 回滚：按 `history` 的 Helm revision 逐组件回滚；`forward-only` 组件回滚 = 恢复升级前备份，CLI 明确提示，不假装一键回滚。

### 3.6 预检（每项含 id、级别、修复建议；输出 JSON + 可读报告）

- 主机级（install）：OS 版本/架构、内核模块（br_netfilter、overlay）、sysctl、swap、SELinux、firewalld、端口、磁盘容量/IOPS、时钟偏差、主机名/DNS、外部备份目标。
- 集群级（deploy）：K8s 版本、默认 StorageClass、LoadBalancer、NetworkPolicy 实测生效、Pod Security、CRD 权限、可分配资源 vs SKU 规格、架构。

### 3.7 命令集与审计

`preflight`、`install`、`deploy`、`status`、`upgrade`、`rollback`、`resume`、`uninstall`、`bundle build|diff|verify|split`、`mirror`、`backup|restore|dr-drill`、`support-bundle`、`secret rotate`。

审计事件沿用 `dts.audit.v1`（CloudEvents 1.0）：`type` 前缀 `dts.infra.`（如 `dts.infra.release.upgrade.started|succeeded|failed`、`dts.infra.component.phase.changed`、`dts.infra.bundle.imported`）；`tenantid=system`；`actorid` = OS 用户 + kube 身份；`actortype=human|system`；`data` 含 `bom, component, fromVersion, toVersion, result`。安装早期写本地 journal（`/var/lib/dts/audit/journal.ndjson`），Kafka 就绪后按事件 id 幂等补发。

### 3.8 演进到 Operator

`dts-operator` 监听 `DtsRelease.spec` 变化，调用同一 `pkg/orchestrator`；`dtsctl upgrade` 变为“导入离线包 + 改 spec”。控制台经 BFF 读写 CRD，不另建 gRPC。

## 4. 镜像分发与离线交付

### 4.1 两层分发

| 层 | 方案 |
|----|------|
| 总部制品中心 | Harbor：多架构镜像 + OCI chart；cosign 签名、SBOM（syft）、Trivy；BOM 按 digest 锁定；离线包构建源；第三方 AppPack 扫描在此进行 |
| 现场默认 | 离线镜像放入 RKE2 airgap 目录自动导入 + embedded registry（Spegel P2P）；无额外组件、无鸡生蛋问题 |
| 现场 BYO | 客户 Harbor：`dtsctl mirror` 推入；与 ACR 同路径 |
| 现场可选 | Zot（多集群、现场推 AppPack） |

镜像一律“上游原名 + digest”引用，现场由 RKE2 `registries.yaml` 重写到本地/客户仓库；ACK 无 `registries.yaml`，由 profile 改写 `global.imageRegistry`。

### 4.2 离线包分层

| 层 | 内容 |
|----|------|
| base | `dtsctl`（x86/arm64 静态二进制）、品牌化 RKE2 二进制与系统镜像、OS 依赖本地源（el8/el9/openEuler/麒麟 V10/统信） |
| platform | L2/L3 镜像（OCI layout，zstd）、OCI chart、BOM |
| model（可选） | LLM/embedding 权重，按 SKU 分 4090 版与昇腾版 |
| apppack | 业务包 |
| 元数据 | `manifest.json`、逐文件 SHA256、包级 cosign 签名、SBOM、扫描报告 |

支持按固定大小分卷（U 盘/光盘/摆渡/单向网闸）。体积（单架构十几～二十几 GB，模型另计）由 T14 实测。

### 4.3 离线安装与升级

- `dtsctl install --bundle <dir> --offline`：预检 → OS 依赖 → RKE2 airgap → 校验签名/digest → 分层 helm 安装 → 健康检查 → 报告 + `DtsRelease`。`--offline` 下任何外连尝试即报错退出。
- `bundle diff` 基于已装 `DtsRelease` 与新 BOM 的 digest 差异生成增量包；`upgrade`：验签 → 兼容检查（RKE2 逐个 minor）→ 升级前备份（etcd 快照、PG）→ 分层升级 → 失败回滚。
- 月度安全补丁包走同一流程。

### 4.4 离线信任与日常

- cosign 公钥内置 `dtsctl`，离线校验，不依赖 Rekor；公钥轮换经签名包下发。
- license：离线签名文件，可绑定硬件指纹。
- 时间：预检强制 NTP/时钟偏差检查。TLS：cert-manager 内部 CA 或客户 CA。
- `support-bundle`：脱敏诊断包（日志、事件、版本、健康），不含 Secret 与业务数据。

### 4.5 运行时联网排查（每个模块必做）

已知风险点：Airflow `pip install`、`dbt deps`、OpenMetadata 在线 connector、`ollama pull`、HuggingFace 模型下载、前端 CDN/Google Fonts、Keycloak 主题外部资源、运行时插件下载、遥测与更新检查。验收门禁：出站全部丢弃的 x86 VM 上完整安装并跑通主竖线。

## 5. 运维能力

### 5.1 可观测性

| 能力 | 选型 |
|------|------|
| 指标 | Prometheus（Prometheus Operator）；chart 约定 `ServiceMonitor`/`PodMonitor`，集群 SKU 长保留时后端可换 VictoriaMetrics |
| 日志 | Fluent Bit + VictoriaLogs；ACK/ACS profile 改用 SLS |
| 链路 | OpenTelemetry Collector，后端 Jaeger 可选；沿用 `X-DTS-Trace-Id` |
| 告警 | Prometheus 规则 + Alertmanager；内网邮件/企业微信/钉钉 webhook；告警同时作为事件入 Kafka 供控制台 |
| 看板 | 核心视图在 DTS Console 运维页；Grafana 原样可选（AGPL，不改品牌） |

三级健康：组件就绪 → 契约可用 → 业务探针（可选合成检查主竖线）。

### 5.2 备份恢复

etcd（RKE2 定时快照）、PG（CNPG barman 基础备份 + WAL，PITR）、SeaweedFS（异步复制到外部目标）、K8s 资源与其他 PV（Velero + Kopia）；审计以 dts-audit-log append-only 存储为准。集群内对象存储与集群同故障域，**不算备份**：生产必须配置外部目标（NAS/NFS/S3），Box 至少第二块盘或外接介质，预检检查。`dtsctl backup|restore|dr-drill` 编排；RPO/RTO 按 SKU 写入 F0/T18 非功能预算。

### 5.3 运维控制台（DTS Console 运维域）

页面：版本与组件、导入离线包 → 差异预览 → 执行升级、备份恢复、告警、审计查询、诊断包下载、授权信息。角色 `dts-ops`（Keycloak）；BFF 以 K8s impersonation 代表当前用户访问 apiserver；控制台只是 CRD 客户端。

### 5.4 AppPack 生命周期

infra 管“工作负载、镜像与信任”：`AppPack` CRD；导入（离线包/OCI）→ 验签（DTS 或 ISV 密钥）→ 按信任级准入 → 在 `dts-pack-<name>` 安装 chart → 调 studio PackRegistry 注册资产（ADR-012，资产为 OCI artifact 由 studio 加载）。隔离约束（Kyverno 强制）：禁 privileged、NetworkPolicy 默认拒绝、仅经网关对外、ResourceQuota、禁读他 namespace Secret。

### 5.5 准入策略

Kyverno：DTS namespace 只允许 DTS 签名镜像（cosign 离线公钥）、强制 Pod Security `restricted`、必需标签与资源限制。

### 5.6 Infra Agent（可选，最后阶段）

studio 智能体读取诊断包/指标/告警给出诊断建议，只建议不执行；关闭不影响运维能力。

## 6. 发行版改造、信创适配与构建链

### 6.1 RKE2 品牌改造

- 自主可控：`rke2`、runtime 镜像、约 20 个系统镜像（`rancher/image-build-*`）、`rke2-selinux`、安装脚本全部由我们的 CI 从锁定的上游源码提交重建，并生成 SBOM。
- 改造边界（D15）：CLI/二进制名、systemd unit、安装脚本、版本字符串、RPM 包名、镜像仓库命名空间、文档与报错中的品牌字样；内部路径与配置键保留。保留 Apache 2.0 LICENSE/NOTICE。
- 补丁队列跟随上游：每月 patch 重建；约每 4 个月 minor rebase + 全量回归（长期固定成本）。

### 6.2 信创适配

- CPU：x86_64 + arm64；鲲鹏 ECS 作 arm64 原生构建/测试机。
- OS 矩阵：openEuler 22.03/24.03 LTS、麒麟 V10 SP3、统信 UOS 1070、RHEL 8/9；每 OS 家族一份 SELinux 策略 RPM 与依赖源；内核检查（cgroup v2、overlay）。
- 互认证（鲲鹏兼容性、麒麟/统信生态）为商务流程，需要实机，不计入核心工作量。

### 6.3 构建链

```
源码 → buildx 多架构（x86 与鲲鹏原生 runner）→ SBOM(syft) → Trivy → cosign 签名 → Harbor
     → chart 规范检查 → 组装 BOM → 离线包 → 断网 VM e2e + ACK e2e → 发布
```

chart 规范检查为可复用 CI 步骤：`helm lint`、Kyverno CLI 离线策略、禁 Bitnami、restricted、digest 引用、StorageClass 变量化、ServiceMonitor 与探针必备。构建集群用自托管 runner（.50 无法访问 GitHub https）。

## 7. 各模块改造

（2026-09-29 T02 定稿：⑨ 的路由对象改为 Gateway API `HTTPRoute`，挂到共享 Gateway，forwardAuth 经 `ExtensionRef` 引用 Traefik Middleware；细则见 dts-infra `docs/chart-spec.md`）共性十项：① chart ② 替换 Bitnami/ES 依赖 ③ 运行时联网排查修复 ④ 配置外置为契约 Secret ⑤ restricted（非 root、只读根文件系统）⑥ 迁移改 Job/initContainer ⑦ 多架构构建 ⑧ ServiceMonitor + 探针 ⑨ 经网关 IngressRoute ⑩ Keycloak client 由 config-cli 声明。

| 模块 | 特殊项 |
|------|--------|
| dts-stack（约 22 服务） | Airflow 官方 chart（DAG 交付方式、执行器）；OpenMetadata 切 OpenSearch；dbt/ingestion/addax 离线化；Trino 去留随 ADR-009；platform/admin/analytics 与各 webapp |
| dts-studio | ai/analytics/webapp；pgvector；推理服务 GPU（NVIDIA 设备插件、Ascend 设备插件）；模型进 model 包 |
| prs-stack（5 服务） | 复用 `sources/deploy/helm/prs-service` 骨架；Valkey；RLS 所需 PG 角色由契约生成 |
| dts-wiki | pg_bigm PG 镜像；附件改 S3（W-ADR-9）；git deploy key 为 Secret |
| 跨模块 | Keycloak realm 全代码化（`yuzhicloud` 内部 realm 与客户 realm 分开）；stack 运维体系在 K8s 验收后删除 |

## 8. 工作量与依赖

单位人天，熟悉 Go/K8s 的工程师，±30%。

| 包 | 内容 | 人天 | F7 Task |
|----|------|------|---------|
| P0 基础 | ADR-014、chart/契约规范、总部环境、估算收敛 spike | 13–20（spike 另计于 T04） | T01–T04 |
| P1 发行版 | RKE2 源码构建 20–30；品牌补丁 8–12；OS 依赖与 SELinux 15–25；适配矩阵 20–30 | 63–97 | T05–T08 |
| P2 dtsctl | CRD/BOM 8–12；编排器 20–30；契约与 profile 15–23；预检 12–18；RKE2 airgap 12–18；离线包 15–20；升级回滚/审计/诊断包 20–31；测试框架 15–20 | 117–172 | T09–T16 |
| P3 中间件 | PG 8–12；Kafka/SeaweedFS/Valkey/OpenSearch 16–26；Keycloak 10–15；网关与证书 6–10；规格 5–8 | 45–71 | T17–T20 |
| P4 运维能力 | 可观测性 16–25；备份恢复 20–30；Kyverno 8–12；健康模型 6–10 | 50–77 | T21–T23 |
| P5 模块改造 | stack 60–90；studio 20–30；prs 10–15；wiki 6–10；联网排查 10–15（分摊入各模块 Task） | 106–160 | T24–T27 |
| P6 控制台 | BFF impersonation 10–15；页面 20–30 | 30–45 | T28 |
| P7 Operator/AppPack | operator 15–25；AppPack 20–30；license 8–12 | 43–67 | T29–T31 |
| P8 ACK | profile + e2e | 15–25 | T32 |
| P9 验收收尾 | e2e 自动化、主竖线、升级/回滚/DR 演练、runbook 20–30；下线旧体系 3–5 | 23–35 | T33–T34 |
| **核心合计** | | **约 505–770** | |
| 可选/另计 | Infra Agent 15–25（T35）；每增一云 10–15；互认证每项 5–10 工程配合；**持续维护约 6–9 人天/月** | | |

```
P0 ─┬─ P1 发行版 ─────────────────────────────┐
    ├─ P2 dtsctl ─┬─ P6 控制台                 │
    │             └─ P7 Operator/AppPack       │
    ├─ P3 中间件 ── P4 运维能力                 ├─ P9 验收
    └─ chart-spec ── P5 模块改造 ── P8 ACK ────┘
```

最长链：P5 stack 改造与 P2 编排核心。估算不确定性最大的三项（stack 离线/restricted、昇腾推理、麒麟/统信 SELinux）由 T04 spike 收敛。

## 9. 非功能预算（提议，并入 F0/T18）

| 指标 | 提议目标 |
|------|----------|
| 断网 Box 全新安装（不含介质拷贝） | ≤ 60 min |
| 增量升级（无 forward-only 组件）业务不可用时间 | ≤ 10 min |
| `dtsctl` 中断后 `resume` 成功率 | 100%（e2e 注入中断验证） |
| 离线安装外连尝试 | 0（断网 VM 验证） |
| 审计事件丢失（含 journal 补发） | 0 |
| RKE2 单节点控制面额外内存 | ≤ 2 GB（Box 规格核算） |

## 10. 待决项（有责任 Task，不阻断设计确认）

| # | 问题 | 责任 |
|---|------|------|
| O1 | 自有镜像 base image 策略（单一 vs Debian/openEuler 双轨） | T02 |
| O2 | 发行版对外品牌名与二进制名 | T06 |
| O3 | RDS PG 是否支持 pg_bigm；不支持时 wiki 云上方案 | T17 |
| O4 | MinIO/Bitnami 最新分发状态复核（作为 ADR 依据留证） | T01 |
| O5 | Airflow 执行器与 DAG 交付方式 | T24 |
| O6 | Trino 去留（随 ADR-009） | T24、F0/T15 |
| O7 | 现网 `deploy/{wiki,sso}`（.50 Compose）迁移到 K8s 的时点 | T34 |
| O8 | 信创实机（鲲鹏、麒麟/统信授权）采购或租用 | T03 |
