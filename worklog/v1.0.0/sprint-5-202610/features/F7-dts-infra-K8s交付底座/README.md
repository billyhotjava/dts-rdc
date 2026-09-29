# F7: dts-infra K8s 交付底座

**优先级**: P0
**状态**: IN_PROGRESS（READY=4 / IN_PROGRESS=4 / DRAFT=27）
**时间窗**: 2026-10 起（按月度规则，10 月未完成的 Task 于 11-02 随 Feature 进入 Sprint-6）
**整合来源**: 新增工作流（2026-09-28～29 用户确定：放弃 dts-stack 运维体系，dts-infra 以 Go + Rancher 开源生态 RKE2 为底座，v1.0.0 以 K8s 交付）
**设计**: [`design/00-dts-infra-K8s交付底座设计.md`](design/00-dts-infra-K8s交付底座设计.md)；编码细则 [`design/01-dtsctl编码设计与首批工作包.md`](design/01-dtsctl编码设计与首批工作包.md)（取代 `docs/plans/2026-03-26-dts-infra-design.md`）

## 目标
运维人员拿到离线包，在客户数据中心的国产或通用服务器上（x86/arm64，openEuler/麒麟/统信/RHEL），或在阿里云 ACK 上，用 `dtsctl` 完成 DTS 全模块的安装、升级、回滚、备份与诊断；安装后主竖线（alice 问“在营项目数”）可用且全过程可审计；关掉 dtsctl/operator/控制台，人工可用 helm/kubectl 接管。

## 端到端契约链（运维竖线）

| 层 | 契约/落点 | 签名要点 |
|----|-----------|----------|
| 入口（CLI） | `dtsctl install --distro rke2 --bundle <dir> --offline` / `dtsctl deploy --profile ack` | 退出码 0 成功；非零附 check id 或组件名；`--output json` |
| 入口（UI，T28） | Console `/ops/upgrade`：导入离线包 → 差异预览 → 执行 | BFF `POST /api/ops/bundles`、`GET /api/ops/bundles/{id}/diff`、`POST /api/ops/upgrades`（SSE 进度） |
| 预检 | `pkg/preflight` | 结果 `{checks:[{id,level,passed,message,remediation}]}` |
| 编排 | `pkg/orchestrator` → Helm v4 | 依赖由 BOM `requires/provides` 推导；组件状态机 Pending→Contracting→Installing→Verifying→Ready |
| 状态（API） | CRD `DtsRelease`（`infra.dts.yuzhicloud.com/v1alpha1`，单例 `dts`） | `spec{bomRef,profile,overrides}`；`status{phase,components[],history[],lastOperation}` |
| 契约 | Secret `dts-<consumer>-<capability>` | pg/kafka/oidc/s3/redis/opensearch/registry 键见设计 §3.3 |
| 数据 | Helm release（各组件）+ ConfigMap `dts-bom-<release>` | 回滚点 = `history[].revisions` + `backupRef` |
| 审计 | Kafka `dts.audit.v1`，`type=dts.infra.*` | 字段同主竖线审计层；`tenantid=system`；本地 journal 补发 |
| 迁移 | CRD 版本 `v1alpha1`；BOM `ReleaseBOM` schema | CRD 升版走 conversion（operator 阶段） |

## 契约定义

| 类型 | 契约 | 定义位置 |
|------|------|----------|
| CRD | `DtsRelease`、`AppPack` | 设计 §3.4、§5.4；T09、T30 |
| 文件 | `dts-release.yaml`（ReleaseBOM）、`manifest.json`（离线包）、`profiles/*.yaml` | 设计 §3.2、§4.2；T09、T14、T11 |
| Secret | 连接契约 | 设计 §3.3；T02 `contract-spec.md` |
| 规范 | `chart-spec.md`（各模块必须遵守） | T02 |
| 事件 | `dts.infra.*` CloudEvents | 设计 §3.7；T15 |
| REST | `/api/ops/*`（BFF） | T28，纳入 console 契约 |

## UI/UX 规格（运维控制台，T28）
- **入口**：DTS Console 侧栏“运维”分组（仅 `dts-ops` 角色可见），路由 `/ops/release`、`/ops/components`、`/ops/upgrade`、`/ops/backup`、`/ops/alerts`、`/ops/audit`、`/ops/support`；纳入 F6/T02 路由表。
- **布局**：沿用 F6 外壳与 T03 交互模式；`/ops/release` 顶部为版本卡片（当前 BOM、profile、phase），下方组件表（名称、版本、phase、健康、最近操作）。
- **四态**：空（未安装/无告警）、加载（骨架屏）、错误（显示 apiserver/RBAC 原因与重试）、成功。
- **关键交互**：升级为三步向导（上传/选择离线包 → 差异预览：变化组件、forward-only 标记与备份提示 → 确认执行，SSE 显示逐组件进度）；危险操作（回滚、恢复）二次确认并显示影响组件。
- **操作走查**：1. 以 `dts-ops` 登录 → 2. 进入 `/ops/upgrade` → 3. 选择已上传增量包 → 4. 查看差异与备份提示 → 5. 确认执行 → 6. 看到各组件变为 Ready、版本卡片更新 → 7. 在 `/ops/audit` 看到本次操作记录（操作者为本人）。
- **约束**：控制台只是 CRD 客户端，停用不影响 CLI（铁律 1）；浏览器下限同 Console（F6/T01）。

## Task 列表

| ID | Task | 工作包 | 优先级 | 状态 | 估算（人天） | 依赖 |
|----|------|--------|--------|------|--------------|------|
| [T01](T01-ADR014-dts-infra定位与K8s交付底座.md) | ADR-014 dts-infra 定位与 K8s 交付底座定稿 | P0 | P0 | READY | 3–5 | 无 |
| [T02](T02-chart规范与连接契约规范.md) | chart 规范与连接契约规范（chart-spec / contract-spec） | P0 | P0 | READY | 4–6 | T01 |
| [T03](T03-总部制品中心与构建验证环境.md) | 总部制品中心与构建/验证环境 | P0 | P0 | READY | 8–12 | T01 |
| [T04](T04-估算收敛spike.md) | 估算收敛 spike：stack 离线化、昇腾推理、国产 OS SELinux | P0 | P0 | READY | 另计 6–10 | T03（环境） |
| [T05](T05-RKE2源码构建流水线.md) | RKE2 与系统镜像源码构建流水线（多架构） | P1 | P1 | DRAFT | 20–30 | T03 |
| [T06](T06-用户可见层品牌补丁队列.md) | RKE2 用户可见层品牌补丁队列 | P1 | P1 | DRAFT | 8–12 | T05 |
| [T07](T07-OS依赖源与SELinux策略.md) | 国产 OS 依赖本地源与 SELinux 策略 | P1 | P1 | DRAFT | 15–25 | T05、T04（SELinux spike 结论） |
| [T08](T08-OS与架构适配测试矩阵.md) | OS × 架构适配测试矩阵 | P1 | P1 | DRAFT | 20–30 | T06、T07、T13 |
| [T09](T09-dtsctl骨架-DtsRelease-CRD与BOM.md) | dtsctl 骨架、DtsRelease CRD 与 BOM | P2 | P0 | IN_PROGRESS | 8–12 | T01、T02 |
| [T10](T10-编排器-依赖图与组件状态机.md) | 编排器：依赖图、组件状态机、resume、Lease、Helm v4 | P2 | P0 | IN_PROGRESS | 20–30 | T09 |
| [T11](T11-连接契约与profile.md) | 连接契约与 profile（rke2-box / rke2-cluster / ack） | P2 | P0 | DRAFT | 15–23 | T02、T09 |
| [T12](T12-预检.md) | 预检（主机级 + 集群级） | P2 | P0 | IN_PROGRESS | 12–18 | T09 |
| [T13](T13-RKE2-airgap安装与节点管理.md) | RKE2 airgap 安装、节点加入与升级 | P2 | P0 | DRAFT | 12–18 | T05、T12 |
| [T14](T14-离线包构建与校验.md) | 离线包：build / verify / diff / split / mirror | P2 | P0 | DRAFT | 15–20 | T03、T09 |
| [T15](T15-升级回滚-审计与诊断包.md) | 升级/回滚/升级前备份、审计事件与诊断包 | P2 | P0 | DRAFT | 20–31 | T10、T14、T21（Kafka 就绪） |
| [T16](T16-dtsctl测试框架与e2e.md) | dtsctl 测试框架与端到端测试工具 | P2 | P0 | IN_PROGRESS | 15–20 | T09 |
| [T17](T17-PostgreSQL-CNPG与自建镜像.md) | PostgreSQL：CNPG 与自建 operand 镜像 | P3 | P0 | DRAFT | 8–12 | T02、T03 |
| [T18](T18-Kafka-SeaweedFS-Valkey-OpenSearch.md) | Kafka、SeaweedFS、Valkey、OpenSearch | P3 | P0 | DRAFT | 16–26 | T02、T03 |
| [T19](T19-Keycloak与realm代码化.md) | Keycloak Operator 与 realm 代码化 | P3 | P0 | DRAFT | 10–15 | T17 |
| [T20](T20-网关公共件与证书.md) | 网关公共件：Traefik、forwardAuth、cert-manager | P3 | P0 | DRAFT | 6–10 | T19 |
| [T21](T21-可观测性与健康模型.md) | 可观测性与三级健康模型 | P4 | P1 | DRAFT | 22–35 | T18 |
| [T22](T22-备份恢复与灾备演练.md) | 备份恢复与灾备演练 | P4 | P1 | DRAFT | 20–30 | T13、T17、T18 |
| [T23](T23-Kyverno准入与镜像签名校验.md) | Kyverno 准入与镜像签名校验 | P4 | P1 | DRAFT | 8–12 | T14 |
| [T24](T24-dts-stack-chart化与离线改造.md) | dts-stack chart 化与离线改造 | P5 | P0 | DRAFT | 60–90 | T02、T04、T17–T20 |
| [T25](T25-dts-studio-chart化与推理.md) | dts-studio chart 化、推理服务与模型包 | P5 | P0 | DRAFT | 20–30 | T02、T04、T17–T20 |
| [T26](T26-prs-stack-chart化.md) | prs-stack chart 化 | P5 | P0 | DRAFT | 10–15 | T02、T17–T20 |
| [T27](T27-dts-wiki-chart化.md) | dts-wiki chart 化与附件迁移 S3 | P5 | P1 | DRAFT | 6–10 | T02、T17、T18、T20 |
| [T28](T28-运维控制台.md) | 运维控制台（DTS Console 运维域 + BFF） | P6 | P1 | DRAFT | 30–45 | T09、T15、T21、T22、F6/T02（路由与角色） |
| [T29](T29-dts-operator常驻对账.md) | dts-operator 常驻对账 | P7 | P1 | DRAFT | 15–25 | T10、T15 |
| [T30](T30-AppPack-CRD与生命周期.md) | AppPack CRD 与生命周期（对接 PackRegistry） | P7 | P1 | DRAFT | 20–30 | T23、T29、BL-A/T01（PackRegistry 契约） |
| [T31](T31-离线license.md) | 离线 license | P7 | P2 | DRAFT | 8–12 | T14 |
| [T32](T32-ACK-profile与端到端.md) | ACK profile 与端到端验收 | P8 | P0 | DRAFT | 15–25 | T11、T12、T24–T27 |
| [T33](T33-端到端验收与runbook.md) | 端到端验收、演练与 runbook | P9 | P0 | DRAFT | 20–30 | T13–T32 |
| [T34](T34-下线dts-stack运维体系.md) | 下线 dts-stack 运维体系与现网迁移 | P9 | P1 | DRAFT | 3–5 | T33 |
| [T35](T35-InfraAgent可选.md) | Infra Agent（可选） | 可选 | P2 | DRAFT | 15–25 | T15、T21、T29；studio 智能体能力 |

> 核心合计约 505–770 人天（T35 可选与 T04 spike 另计），持续维护约 6–9 人天/月，见设计 §8。新需求或 review 问题在本表追加 Task，不新建 Feature。

## 对既有计划的影响（由相应 Task 或规划评审处理，本 Feature 不直接改写）

| 既有项 | 影响 | 处理 |
|--------|------|------|
| Sprint-5 非目标“不引入 k8s、dts-infra（Go）实现” | 被 ADR-014 推翻 | 已在 Sprint README 修订 |
| BL-E/T02（发布与回退）、T03（runbook） | 发布与回退从 Compose 改为 K8s；**不保留 Compose 回退**（D6） | 11 月转入时按 F7/T33 与设计 §4.3 改写 |
| BL-S/T04 统一 Traefik 网关路由（位置待 ADR-008） | 网关部署编排归 dts-infra | 由 F7/T20 承接部署部分，BL-S/T04 保留路由规则 |
| F0/T03 三系统交付基线 | 本月基线仍在现有环境验证；K8s 基线由 F7/T33 另立 | 不变 |
| F0/T18 非功能预算 | 增加设计 §9 的安装/升级/审计指标与 RPO/RTO | T18 吸收 |
| F6/T02 路由表 | 新增 `/ops/*` 运维域 | F6/T02 追加 |
| W-ADR-9、F5/T08 wiki 部署与运维 | wiki 最终由 K8s 承载，附件走 S3 | 本月 wiki 仍按 .50 上线；迁移时点见 T34 / O7 |
| `dts-studio/.rules/10-architecture/infra-iron-laws.rules` | 3 月 Go/commander 条款过时 | T01 登记到 BL-A/T20 |
| `CLAUDE.md` Architecture 中 dts-infra 与 Compose 描述 | 与 ADR-014 冲突 | T01 起草修订，用户确认后修改 |

## Definition of Ready
- [x] 架构与边界已定（设计 §0 D1–D16，用户逐段确认）
- [x] 核心契约已钉（CRD、BOM、连接契约、审计事件、离线包结构）
- [ ] 模块 chart 字段级契约随 T02 产出
- [x] UI 落点已命名（`/ops/*`）
- [x] 验收可验证（断网 VM、ACK、主竖线、预算实测）

## 完成标准
- [ ] 断网 RKE2（单节点、三节点）与 ACK 上全新安装、主竖线、增量升级、回滚、灾备演练全部通过，证据在 `it/infra/`（T33）
- [ ] 设计 §9 非功能预算均有实测值
- [ ] 各模块 chart 通过 `ci/chart-check`；离线安装零外连
- [ ] 控制台运维走查通过，apiserver 审计显示真实操作者（T28）
- [ ] dts-stack 旧运维体系已下线（T34）
