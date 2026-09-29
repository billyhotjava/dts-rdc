# 01 dtsctl 编码设计与首批工作包

**日期**：2026-09-29
**状态**：编码依据。与 `00-dts-infra-K8s交付底座设计.md` 配套：00 讲“做什么、为什么”，本文讲“代码怎么写”。
**覆盖 Task**：T09（骨架、CRD、BOM）、T12（预检，主机级先行）、T16（测试框架的单测与 envtest 层）；T10（编排器）只给到 W4 的计划阶段，执行阶段待 T03 构建验证环境就绪后另补本文 §9。
**上位决定**：
- 用户 2026-09-29 确定 Go 模块路径为 `yuzhi.com/dts/infra`，对应 Java 包 `com.yuzhi.dts`；
- CRD API group 保持 `infra.dts.yuzhicloud.com`（必须用我方持有的域名）。

---

## 1. 工程约定

| 项 | 约定 |
|----|------|
| 模块路径 | `module yuzhi.com/dts/infra`；import 形如 `yuzhi.com/dts/infra/pkg/bom` |
| 包名 | Go 规则：单个小写单词，与目录名相同（`bom`、`orchestrator`、`preflight`），不用下划线和驼峰；层级靠目录体现，不能写成 `com.yuzhi.dts.bom` 这种形式 |
| 跨仓库引用 | 目前只有本仓库使用，无需额外配置。日后其他 Go 仓库需要 import 时，二选一：`GOPRIVATE=yuzhi.com` 加 `replace yuzhi.com/dts/infra => <路径或 git>`，或在 `yuzhi.com/dts/infra?go-get=1` 提供 go-import 元数据（需确认对 `yuzhi.com` 域名的控制权）。**不要**把模块路径改回 github 路径 |
| Go 版本 | 按 R-012 取发布满 30 天的最新稳定 minor（2026-10 应为 1.27.x，安装时核实）；`go.mod` 写 `go 1.27` 与 `toolchain go1.27.x` |
| 依赖（版本在 W1 按 R-012 选定，记入 `docs/go-bom.md`） | CLI `github.com/spf13/cobra`；K8s `k8s.io/client-go`、`k8s.io/apimachinery`、`sigs.k8s.io/controller-runtime`（与目标 K8s 1.34/1.35 对齐）；代码生成 `sigs.k8s.io/controller-tools`（controller-gen）；测试 `sigs.k8s.io/controller-runtime/pkg/envtest`、`github.com/google/go-cmp`；YAML `sigs.k8s.io/yaml`；JSON Schema `github.com/santhosh-tekuri/jsonschema/v6`；semver 约束 `github.com/Masterminds/semver/v3`；Helm `helm.sh/helm/v4`（W5 起）；CloudEvents `github.com/cloudevents/sdk-go/v2`（T15）。新增依赖须核对许可证（Apache/MIT/BSD/MPL），写入 `docs/go-bom.md` |
| 日志 | 标准库 `log/slog`；CLI 默认可读文本，`--log-format json` 切换；日志不得输出 Secret 值（统一经 `pkg/redact`） |
| 错误 | `fmt.Errorf("...: %w", err)` 包装；领域错误用带稳定 ID 的类型 `type Issue struct{ID, Level, Component, Message, Remediation string}`；不用 panic 处理可预期错误 |
| 上下文 | 所有 I/O 函数首参 `ctx context.Context`；CLI 顶层按 `--timeout` 建上下文，响应 SIGINT 后优雅退出，并在状态中留下可 resume 的点 |
| 全局状态 | 禁止包级可变变量（生成代码除外）；依赖通过构造函数注入（便于 fake） |
| 输出 | 所有命令支持 `--output text|json`；json 输出为稳定 schema，供控制台 BFF 与 CI 使用 |
| 风格与检查 | `gofmt` + `golangci-lint`（配置入库，启用 govet、staticcheck、errcheck、gosec、revive）；CI 必须通过 |
| 测试 | 表驱动；夹具放 `testdata/`；golden 文件用 `-update` 标志更新；`pkg/` 覆盖率 ≥ 80%（T16） |
| 许可证头 | 每个源文件首行 `// Copyright 2026 Yuzhi. All rights reserved.`（自研代码的对外许可由 T01 的 license review 决定；RKE2 补丁等上游 Apache 代码保留原 LICENSE/NOTICE） |
| 提交 | 分支 `feat/W<n>-<topic>`；提交信息 `feat(F7/T09): <描述>`；PR 需 CI 绿 |

## 2. 仓库结构（W1–W4 需要建的部分）

```
dts-infra/
  go.mod  go.sum  Makefile  .golangci.yml  .github/workflows/ci.yml（或自托管 runner 的等价配置）
  cmd/dtsctl/main.go                 只做装配：构建根命令、执行、映射退出码
  internal/cli/                      cobra 命令实现（root、version、bom、preflight、plan）
  api/v1alpha1/                      DtsRelease 类型 + groupversion_info.go + zz_generated.deepcopy.go
  config/crd/                        controller-gen 生成的 CRD YAML（入库，CI 校验与生成结果一致）
  pkg/bom/                           ReleaseBOM 类型、加载、Schema 校验、依赖图、diff
  pkg/profile/                       Profile 类型与加载（本批只需 external 能力列表）
  pkg/preflight/                     检查框架 + 主机级检查
  pkg/orchestrator/                  W4：Plan（不执行）
  pkg/issue/                         Issue 类型与 ID 常量、退出码映射
  pkg/redact/                        敏感字段遮蔽
  schemas/releasebom.v1alpha1.json   BOM 的 JSON Schema（嵌入二进制：go:embed）
  testdata/                          BOM/profile 夹具、预检的模拟主机文件系统
  docs/go-bom.md                     Go 依赖清单与许可证
```

`internal/` 与 `pkg/` 的界限：`pkg/` 是编排库，将来会被 dts-operator 复用，必须能脱离 CLI 独立使用（不读 flag、不直接打印）；`internal/cli` 只做参数解析和渲染。

## 3. 退出码（`pkg/issue`）

| 码 | 含义 |
|----|------|
| 0 | 成功 |
| 1 | 未分类错误 |
| 2 | 用法错误（参数、flag） |
| 10 | BOM/profile 校验失败 |
| 11 | 预检存在 error 级失败 |
| 12 | 操作锁被占用（Lease `dts-operation`） |
| 13 | 组件执行失败（编排） |
| 14 | 离线模式下检测到外连（`--offline`） |
| 15 | 签名或 digest 校验失败 |

## 4. `ReleaseBOM` 文件（`pkg/bom`，对应 00 §3.2）

```go
// ReleaseBOM is the on-disk release manifest (dts-release.yaml). It is a file format, not a CRD.
type ReleaseBOM struct {
    APIVersion string      `json:"apiVersion"` // must be "infra.dts.yuzhicloud.com/v1alpha1"
    Kind       string      `json:"kind"`       // must be "ReleaseBOM"
    Release    string      `json:"release"`    // ^dts-\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$
    Kubernetes string      `json:"kubernetes"` // semver constraint, e.g. ">=1.33 <1.36"
    Distro     Distro      `json:"distro"`
    Components []Component `json:"components"` // 1..n, unique by Name
}

type Distro struct {
    Name    string `json:"name"`    // "rke2"
    Version string `json:"version"` // e.g. "v1.34.2+dts.1"
}

type Component struct {
    Name       string        `json:"name"`                 // DNS-1123 label, unique
    Chart      ChartRef      `json:"chart"`
    Provides   []string      `json:"provides,omitempty"`   // capabilities, see Capability*
    Requires   []string      `json:"requires,omitempty"`
    Migrations MigrationMode `json:"migrations,omitempty"` // "" | "reversible" | "forward-only"
    Images     []string      `json:"images"`               // each "sha256:<64 hex>" or "<ref>@sha256:<64 hex>"
}

type ChartRef struct {
    Ref     string `json:"ref"`     // oci://host/path/name
    Version string `json:"version"` // semver
    Digest  string `json:"digest"`  // sha256:<64 hex>, required
}
```

- 能力常量：`pg`、`kafka`、`oidc`、`s3`、`redis`、`opensearch`、`registry`、`gateway`（与 00 §3.3 一致，另加 `gateway`）；未知能力按 `BOM006` 报错，新增能力须同时改 contract-spec（T02）。
- JSON Schema 放 `schemas/releasebom.v1alpha1.json`（draft 2020-12），由根目录 `schemas` 包 `go:embed` 打包；加载时先做 Schema 校验，再做语义校验。**Schema 只管结构**：digest、命名、能力名、版本号等有专属 ID 的规则不写进 Schema，以免被 BOM010 吞掉（W2 实现时确定，2026-09-29）。

### 4.1 校验 Issue ID

| ID | 级别 | 触发条件 |
|----|------|----------|
| BOM001 | error | chart 或 image 缺少 digest，或 digest 格式非法 |
| BOM002 | error | 依赖成环；Message 列出环上组件，例如 `a → b → a` |
| BOM003 | error | 某个 `requires` 在 BOM 中无人 provides，且 profile 没有声明它为 external |
| BOM004 | error | 同一能力被多个组件 provides（v1alpha1 不支持多实现） |
| BOM005 | error | `kubernetes` 约束或 chart version 无法解析 |
| BOM006 | error | 未知能力名 |
| BOM007 | error | 组件名重复或不是 DNS-1123 label |
| BOM008 | warn | 组件被 profile 标为 external 后没有其他组件依赖它（安装时会被跳过，提示确认） |
| BOM009 | error | apiVersion/kind 不符 |
| BOM010 | error | 文件结构不符合 JSON Schema（未知字段、缺必填字段、类型错误）；此时不做语义校验，BOM 返回 nil |

### 4.2 公共 API

```go
func Load(ctx context.Context, path string) (*ReleaseBOM, []issue.Issue, error) // 解析 + Schema + 语义校验；error 仅表示 I/O/解析失败
func Validate(b *ReleaseBOM, p *profile.Profile) []issue.Issue
func BuildGraph(b *ReleaseBOM, p *profile.Profile) (*Graph, []issue.Issue)
func (g *Graph) Layers() [][]string          // 拓扑分层：同层无相互依赖，可并行；层内按名称排序（输出稳定）
func (g *Graph) Skipped() []string           // 被 external 替代而不安装的组件
func Diff(old, new *ReleaseBOM) *BOMDiff      // Added/Removed/Changed（chart version、digest、images），用于 upgrade 与 bundle diff
```

依赖图规则：组件 X requires 能力 c，c 由组件 Y provides → 边 Y→X；c 为 external → 无边，X 的契约 Secret 由外部连接信息生成（T11）；提供 c 的组件整体跳过（若它只提供 external 能力）。

## 5. `Profile`（`pkg/profile`，本批最小集）

```go
type Profile struct {
    Name     string            `json:"name"`     // rke2-box | rke2-cluster | ack
    External []string          `json:"external"` // capabilities provided outside the cluster
    Overrides map[string]any   `json:"overrides,omitempty"` // per-component values, used from W5
}
```

内置 profile 放 `pkg/profile/builtin/*.yaml` 并用 `go:embed` 打包（rke2-box、rke2-cluster 无 external；ack 的 external 为 pg、kafka、s3、redis、opensearch，oidc 与 gateway 留在集群内）；`--profile-file` 可加载自定义 profile。连接信息与 sizing 字段由 T11 扩展，本批不实现。

## 6. `DtsRelease` CRD（`api/v1alpha1`，对应 00 §3.4）

```go
// +kubebuilder:object:root=true
// +kubebuilder:resource:scope=Cluster,shortName=dtsrel
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="BOM",type=string,JSONPath=`.status.observedBom`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
// +kubebuilder:validation:XValidation:rule="self.metadata.name == 'dts'",message="DtsRelease is a singleton named dts"
type DtsRelease struct {
    metav1.TypeMeta   `json:",inline"`
    metav1.ObjectMeta `json:"metadata,omitempty"`
    Spec   DtsReleaseSpec   `json:"spec"`
    Status DtsReleaseStatus `json:"status,omitempty"`
}

type DtsReleaseSpec struct {
    BOMRef    string               `json:"bomRef"`              // ConfigMap dts-bom-<release> in namespace dts-system
    Profile   string               `json:"profile"`             // +kubebuilder:validation:Enum=rke2-box;rke2-cluster;ack
    Overrides *apiextensionsv1.JSON `json:"overrides,omitempty"`
}

type DtsReleaseStatus struct {
    Phase         ReleasePhase      `json:"phase,omitempty"` // Installing|Ready|Upgrading|Failed|RollingBack
    ObservedBOM   string            `json:"observedBom,omitempty"`
    Components    []ComponentStatus `json:"components,omitempty"` // +listType=map +listMapKey=name
    History       []HistoryEntry    `json:"history,omitempty"`    // newest first, max 20
    LastOperation *Operation        `json:"lastOperation,omitempty"`
    Conditions    []metav1.Condition `json:"conditions,omitempty"` // +listType=map +listMapKey=type
}

type ComponentStatus struct {
    Name         string         `json:"name"`
    Phase        ComponentPhase `json:"phase"` // Pending|Contracting|Installing|Verifying|Ready|Failed|Skipped
    ChartVersion string         `json:"chartVersion,omitempty"`
    HelmRevision int            `json:"helmRevision,omitempty"`
    Message      string         `json:"message,omitempty"`
    UpdatedAt    metav1.Time    `json:"updatedAt,omitempty"`
}

type HistoryEntry struct {
    BOM       string         `json:"bom"`
    Revisions map[string]int `json:"revisions"`
    BackupRef string         `json:"backupRef,omitempty"`
}

type Operation struct {
    ID         string       `json:"id"`   // ULID
    Type       string       `json:"type"` // install|deploy|upgrade|rollback|resume|uninstall
    Actor      string       `json:"actor"`
    StartedAt  metav1.Time  `json:"startedAt"`
    FinishedAt *metav1.Time `json:"finishedAt,omitempty"`
    Result     string       `json:"result,omitempty"` // Succeeded|Failed|Aborted
}
```

- 相比 00 §3.4 的补充：组件 phase 增加 `Skipped`（external 替代），增加标准 `Conditions`（`Ready`、`Progressing`、`Degraded`）。
- 固定命名空间 `dts-system`（BOM ConfigMap、Lease、journal 同步 Job 都在这里）。
- `make generate` 执行 controller-gen 生成 deepcopy 与 `config/crd/infra.dts.yuzhicloud.com_dtsreleases.yaml`；CI 检查生成物与源码一致。

## 7. 预检框架（`pkg/preflight`，本批做主机级）

```go
type Level string // "error" | "warn"

type Check interface {
    ID() string          // e.g. HOST-KERNEL-001
    Level() Level
    Run(ctx context.Context, env Env) Result
}

type Result struct {
    ID          string `json:"id"`
    Level       Level  `json:"level"`
    Passed      bool   `json:"passed"`
    Message     string `json:"message"`
    Remediation string `json:"remediation,omitempty"`
}

type Env interface { // 主机环境抽象，测试用 fake 实现（W4 实现为 Go 内的 fakeEnv 结构，不再使用 testdata/hosts）
    ReadFile(path string) ([]byte, error)
    Exec(ctx context.Context, name string, args ...string) (stdout []byte, err error)
    ListenPort(port int) error
    StatFS(path string) (freeBytes uint64, err error)
    WriteProbe(dir string) error                              // W4 增补：备份目标可写性
    Hostname() (string, error)                                // W4 增补：DNS 检查
    LookupHost(ctx context.Context, host string) ([]string, error)
    Now() time.Time
}

func Run(ctx context.Context, env Env, checks []Check, ignore []string) Report // 报告按 ID 排序；ignore 的项标 Ignored 并写入审计（T15 接线前先写本地 journal）
```

被 ignore 的失败项由 CLI 写入 `pkg/audit` 本地 journal（`/var/lib/dts/audit/journal.ndjson`，NDJSON，CloudEvents 1.0，`type=dts.infra.preflight.ignored`）；journal 写入失败时命令失败，不允许在没有审计痕迹的情况下忽略检查（W4 实现，2026-09-29）。

主机级检查（00 §3.6）首批 ID：

| ID | 级别 | 内容 |
|----|------|------|
| HOST-OS-001 | error | OS 与版本在支持矩阵内（`/etc/os-release`：RHEL/Rocky 8/9、openEuler 22.03/24.03、麒麟 V10、统信 UOS 20） |
| HOST-ARCH-001 | error | 架构为 x86_64 或 aarch64 |
| HOST-KERNEL-001 | error | 内核模块 `br_netfilter`、`overlay` 可加载 |
| HOST-SYSCTL-001 | error | `net.ipv4.ip_forward=1`、`net.bridge.bridge-nf-call-iptables=1` |
| HOST-SWAP-001 | error | swap 关闭 |
| HOST-SELINUX-001 | warn | SELinux 为 enforcing 时需要 RKE2 SELinux 策略包（T07 提供），否则提示 |
| HOST-FW-001 | warn | firewalld 运行时列出需要放行的端口 |
| HOST-PORT-001 | error | 6443、9345、10250、2379、2380 未被占用 |
| HOST-DISK-001 | error | `/var/lib/rancher` 可用空间 ≥ profile 规定值（Box 默认 200 GiB，按 SKU 调整） |
| HOST-TIME-001 | error | 时钟偏差 ≤ 500 ms（chrony/ntpd 状态），离线模式下需指定内部时间源 |
| HOST-DNS-001 | error | 主机名可解析且非 localhost |
| HOST-BACKUP-001 | error | 外部备份目标已配置且可写（00 §5.2 强制） |

集群级检查（`deploy` 模式）在 W5 以后补充，编号前缀为 `CLUSTER-`。

## 8. 首批工作包

| 包 | 内容 | 对应 Task | 完成定义 |
|----|------|-----------|----------|
| W1 工程骨架 | go.mod（`yuzhi.com/dts/infra`）、Makefile（`build`、`test`、`lint`、`generate`、`cross` 出 amd64/arm64 静态二进制 `CGO_ENABLED=0`）、golangci 配置、CI、`dtsctl version`（版本、提交、构建时间，通过 `-ldflags` 注入）、`docs/go-bom.md` | T09、T16 | CI 绿；两种架构的二进制均能运行 `dtsctl version --output json` |
| W2 BOM | `pkg/bom` 全部 API、Schema、`dtsctl bom validate|graph|diff`；`testdata/bom/` 下为每个 Issue ID 准备至少 1 个触发夹具，另备 1 个包含 stack/studio/wiki/prs 与 L2 组件的完整合法样例 | T09 | 表 4.1 中每个 ID 都有 RED 用例；`bom graph` 对完整样例输出稳定的分层（golden） |
| W3 CRD | `api/v1alpha1` 类型、生成物、envtest：创建单例 `dts`、拒绝其他名称、更新 status 子资源、Enum 校验 | T09、T16 | envtest 全绿；CRD YAML 与生成结果一致 |
| W4 预检（主机）+ 计划 | `pkg/preflight` 框架与表 7 全部检查、`dtsctl preflight --output json|text [--ignore id]`；`pkg/orchestrator.Plan(bom, profile, currentStatus) -> Plan`（只计算步骤：安装/升级/跳过/不变，不执行）、`dtsctl plan` | T12、T10（计划部分） | 每个检查都有 fake Env 的通过和失败用例；在 .50 的 x86 VM 上实跑一次，报告存 `it/infra/preflight-host-<date>.json`；plan 对“全新安装”和“单组件升级”两个场景输出 golden |

W1→W2→W3 顺序执行；W4 可在 W2 完成后与 W3 并行。

**进度（2026-09-29）**：W5–W6（§9）也已完成，分支 `feat/W5-helm-executor`，证据 `it/infra/W5-W6-executor.md`。W1–W4 已完成并推送（分支 `feat/W1-skeleton` … `feat/W4-preflight-plan`），证据见 `it/infra/W1-W4-dtsctl.md`；尚未合入 main（缺 gh 与自托管 runner）。W5 起（Helm v4 执行、Lease、resume、契约 Secret 生成）依赖 T03 构建验证环境（单节点 RKE2 或 kind + 断网 VM），在 T03 就绪后由规划会话补本文 §9。

## 9. W5–W6：执行器、互斥锁与断点续做（2026-09-29 补齐）

依据 Helm v4.2.4 源码核对：`action.NewConfiguration` + `Init(RESTClientGetter, namespace, "secret")`；`Install`/`Upgrade` 提供 `RunWithContext`；等待策略 `kube.StatusWatcherStrategy`；release 的具体类型是 `pkg/release/v1.Release`（`Releaser` 是 `any`）；OCI 拉取使用 `registry.Client.Pull`，返回的 manifest digest 与 BOM 中的 chart digest 比对。

### 9.1 执行接口（`pkg/orchestrator`，全部可替换为 fake）

```go
type ChartSource interface { // 按 BOM 组件取 chart
    Load(ctx context.Context, c bom.Component) (chart.Charter, error)
}
// OCISource：registry.Client.Pull(ref:version)，manifest digest ≠ BOM digest → ErrDigestMismatch（退出码 15）
// DirSource：<root>/<component> 目录（测试；离线包布局由 T14 复用）

type Releases interface { // Helm 抽象
    Get(ctx context.Context, namespace, name string) (*Deployed, error) // 不存在返回 nil, nil
    Apply(ctx context.Context, req ApplyRequest) (revision int, err error) // 不存在则 install，否则 upgrade
    Uninstall(ctx context.Context, namespace, name string) error
}
type Deployed struct { Revision int; ChartVersion, SpecHash string; Status string } // Status 取 Helm release 状态
type ApplyRequest struct { Namespace, Name string; Chart chart.Charter; Values map[string]any; Labels map[string]string; Timeout time.Duration }

type StatusStore interface { // DtsRelease 单例
    Load(ctx context.Context) (*v1alpha1.DtsRelease, error)
    Update(ctx context.Context, mutate func(*v1alpha1.DtsReleaseStatus)) error // 冲突自动重试
}

type Verifier interface { // Verifying 阶段；T11 接入契约探测，此前为 no-op
    Verify(ctx context.Context, component, namespace string) error
}
```

### 9.2 执行规则

| 项 | 规则 |
|----|------|
| 命名 | Helm release 名 = 组件名；命名空间 = `dts-<组件名>`（组件名已以 `dts-` 开头则直接用）；Helm 存储为该命名空间内的 Secret；`CreateNamespace=true` |
| 幂等键 | release 标签 `infra.dts.yuzhicloud.com/spec-hash` = sha256(chart digest + 最终 values 的规范 JSON + 排序后的镜像列表)，取 hex 前 63 位（标签值上限 63 字符）；另写 `infra.dts.yuzhicloud.com/chart-digest` 仅供查看。**已部署且 spec-hash 相同 → 视为完成，直接 Ready**，不再调用 Helm。这条规则同时覆盖 unchanged 与断点续做；只换镜像或只改现场 values 也会触发升级（W5 单测发现只比较 chart digest 会漏掉这两种情况，2026-09-29 修正） |
| 值 | `profile.overrides[组件]` 深合并 `spec.overrides[组件]`（后者优先），作为 Helm values |
| 并行 | 层与层之间串行；层内并行，上限 `--parallel`（默认 4） |
| 状态 | 每个组件依次经过 Pending → Contracting（T11 前直接通过）→ Installing → Verifying → Ready，每次转换都写回 status；external 组件为 Skipped |
| 失败 | 组件失败 → 该组件标 Failed 并写入原因；同层正在执行的其他组件继续做完；后续层不再开始；上游不回滚；Release 的 phase 为 Failed，命令退出码 13 |
| 删除 | 所有安装层成功后，按计划的删除顺序执行 `helm uninstall` |
| 成功 | Release 的 phase 为 Ready，`observedBom` 为目标 BOM；`history` 头部插入 `{bom, revisions}`，保留 20 条；`lastOperation` 的 result 为 Succeeded |
| Helm 中间态 | release 处于 `pending-install/upgrade/rollback` 状态时组件直接失败，提示 `helm rollback` 或 `dtsctl resume --force-unlock-release`（后者在 W6 之后实现），不自动覆盖 |

### 9.3 W6：操作锁与 resume

- **Lease**：`coordination.k8s.io/v1` Lease `dts-operation`，命名空间 `dts-system`；holderIdentity 为 `<user>@<host>/<operationID>`；时长 60 s，每 20 s 续约。获取时如果 Lease 被他人持有且未过期，返回 `ErrLeaseHeld{Holder, RenewedAt}`，退出码 12；Lease 已过期则接管，并在审计中记录 `dts.infra.lease.takenover`。操作结束时释放（清空 holder）。
- **resume**：`dtsctl resume` 读取 DtsRelease 的 `spec.bomRef` 与 ConfigMap `dts-bom-<release>`，用与原操作相同的计划再执行一次。依赖 9.2 的幂等键，已完成的组件不会被重复安装。验收：执行中途取消（context cancel 或杀进程），resume 之后各组件的 Helm 修订号与一次成功执行的结果一致。
- **BOM 入库**：`dtsctl deploy` 先把 BOM 写入 ConfigMap `dts-bom-<release>`（`data.dts-release.yaml`），再创建或更新 DtsRelease 的 spec（bomRef、profile），然后执行。

### 9.4 命令

- `dtsctl deploy FILE --profile P [--kubeconfig K] [--charts-dir D] [--parallel N] [--timeout T]`：已有集群模式（D8）。不指定 `--charts-dir` 时从 BOM 的 OCI 地址拉取 chart，凭据读 `~/.config/helm/registry/config.json`。
- `dtsctl resume [--kubeconfig K] [--charts-dir D]`
- `dtsctl status [--kubeconfig K]`：输出 DtsRelease 的 status。

### 9.5 验证

| 场景 | 环境 |
|------|------|
| 全新部署、升级、unchanged 不调用 Helm、失败时下游暂停、删除顺序、values 合并 | 单测（fake Releases/StatusStore） |
| 真实 Helm v4 安装/升级只含 ConfigMap 的测试 chart，读回标签与修订号，DtsRelease status 实际写入 | envtest（kube-apiserver 1.34，无节点） |
| Lease 互斥（两个执行器并发，后者得到 ErrLeaseHeld）与过期接管 | envtest |
| 中断后 resume 的结果与一次成功一致 | envtest |
| 从 Harbor `10.20.0.50:18443/dts` 拉 chart 并校验 digest | 集成测试，设置 `DTS_IT_HARBOR=1` 才运行 |
| 真实工作负载（Deployment 就绪等待）、断网 | T03 虚拟机集群 |

## 10. 开发环境（编码会话自备）

- 开发机当前**没有安装 Go**：按 §1 版本安装官方 tarball 到 `/usr/local/go`，不要用发行版包管理器里的旧版本。
- envtest 需要 kube-apiserver/etcd 二进制：用 `setup-envtest` 下载到仓库外缓存目录，并在 `docs/go-bom.md` 记录版本。
- .50 上**禁止 `docker pull`，禁止重启 dockerd**（见 reference_infra_topology）。W4 的实机预检只读主机信息，不做任何修改，也不要在 .50 上安装 RKE2。
