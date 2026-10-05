# F7 dtsctl W1–W4 证据（2026-09-29）

**代码**：`billyhotjava/dts-infra`，模块 `yuzhi.com/dts/infra`。四个工作包的分支线性叠加，均已推送：

| 包 | 分支 | 提交 |
|----|------|------|
| W1 工程骨架 | `feat/W1-skeleton` | `1bbd467` |
| W2 BOM | `feat/W2-bom` | `0abad54` |
| W3 CRD | `feat/W3-crd` | `75cf5f5`、`7bee8dc`（API 包去掉对 controller-runtime 的依赖） |
| W4 预检与计划 | `feat/W4-preflight-plan` | `18e9298` |

尚未合入 `main`：设计要求走 PR 并在 CI 通过后合入，但本机没有 `gh`，自托管 runner 也还没有（T03）。

## 工具链（R-012：发布满 30 天的最新稳定线）

Go 1.27.1；controller-gen v0.21.0；setup-envtest release-0.24（kube-apiserver/etcd 1.34.x）；golangci-lint v2.13.2。
K8s 库以 Helm v4.2.4 为锚：client-go/apimachinery/api/apiextensions v0.36.5、controller-runtime v0.24.1。
Helm v4.3.0 当时发布仅 20 天，暂不采用。明细见仓库 `docs/go-bom.md`。

## 本地验证（开发机 x86_64，2026-09-29）

```
$ make lint            -> 0 issues.
$ make test            -> ok api/v1alpha1 (envtest) · internal/cli · pkg/audit · pkg/bom · pkg/issue · pkg/orchestrator · pkg/preflight · pkg/profile
$ make test-race       -> ok（W1 时执行；-race 需 cgo）
$ make cover           -> pkg/ total 93.5%（目标 ≥ 80%）
$ make cross           -> bin/dtsctl-linux-amd64（x86-64, statically linked）、bin/dtsctl-linux-arm64（ARM aarch64, statically linked）
```

### W2 BOM

- `testdata/bom/` 中 BOM001–BOM010（BOM008 为 warn，用 profile 夹具触发）每个 ID 至少有一个 RED 夹具，测试 `TestFixturesTriggerTheirIssueID` 全部命中。
- 完整样例 `full-valid.yaml` 在 rke2-box、rke2-cluster、ack 三个 profile 下均无 issue。

`dtsctl bom graph testdata/bom/full-valid.yaml --profile ack`：

```
release dts-1.0.0, profile ack
layer 1: cert-manager, keycloak
layer 2: gateway
layer 3: dts-stack, dts-studio, dts-wiki, prs-stack
skipped (external): kafka, opensearch, pg-main, seaweedfs, valkey
```

rke2-box 为 4 层（中间件 → keycloak → gateway → 四个业务模块）。golden 文件在 `testdata/golden/`。

### W3 CRD（envtest，kube-apiserver 1.34）

`TestDtsReleaseCRD` 的 7 个子用例全部通过：单例名 `dts` 可创建；其他名称被 CEL 规则拒绝；profile 枚举与 bomRef 格式校验生效；status 子资源可写且不改 spec；未知组件 phase 被拒；history 上限 20 条。

### W4 计划

`dtsctl plan testdata/bom/full-valid-v2.yaml --from testdata/bom/full-valid.yaml`：

```
upgrade dts-1.0.0 -> dts-1.1.0 (profile rke2-box)
backup required before upgrade: forward-only dts-studio (rollback = restore)
L1  install   kyverno        1.0.0
L3  upgrade   gateway        1.0.0 -> 1.0.0 [images]
L4  upgrade   dts-studio     1.0.0 -> 1.1.0 [chart.version, chart.digest, images]
L5  remove    cert-manager   1.0.0
（其余组件为 unchanged，略）
```

## W4 主机预检实跑：10.20.0.50（RHEL 8.10，只读）

完整 JSON：[`preflight-host-10.20.0.50-20260929.json`](preflight-host-10.20.0.50-20260929.json)。退出码 11，9 项通过，3 项失败：

| 检查 | 结果 | 说明 |
|------|------|------|
| HOST-DNS-001 | FAIL | 主机名 `jira` 无法解析 |
| HOST-SWAP-001 | FAIL | 1 个 swap 设备处于启用状态 |
| HOST-TIME-001 | FAIL | 系统时钟未做 NTP 同步；与 Harbor 安装时发现的“该机时钟快 8 小时”一致 |

.50 当前是运行 Jira、Keycloak、wiki 的共享服务器，不会在它上面安装 RKE2。这 3 项结果说明检查在真实主机上有效，不代表要在 .50 上修复。

## 未完成（留在各 Task）

- 合入 main 与 CI：依赖自托管 runner（T03）；
- 集群级预检 `CLUSTER-*`：W5 之后；
- 执行阶段（Helm v4、Lease、resume、契约 Secret）：design/01 §9；
- 真实集群 e2e、断网 VM：T16 / T03。
