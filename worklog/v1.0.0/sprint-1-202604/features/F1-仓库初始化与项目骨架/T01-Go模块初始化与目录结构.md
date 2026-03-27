# T01: Go 模块初始化与目录结构

**优先级**: P0
**状态**: READY
**依赖**: 无

## 目标
创建 dts-infra Go 项目骨架，包含 bootstrap 和 commander 两个二进制入口及完整目录布局

## 技术设计

初始化 `github.com/billyhotjava/dts-infra` 仓库，Go 1.22+：

```
dts-infra/
├── cmd/
│   ├── commander/main.go        # placeholder, 输出 version
│   └── bootstrap/main.go        # Cobra CLI 骨架（precheck/install/status/reset/repair）
├── internal/
│   ├── bootstrap/
│   │   ├── precheck/            # 空包
│   │   ├── installer/           # 空包
│   │   └── store/               # 空包
│   ├── controller/
│   │   ├── middleware/           # 空包
│   │   ├── platform/            # 空包
│   │   └── apppack/             # 空包
│   ├── registry/                # 空包
│   ├── health/                  # 空包
│   ├── upgrade/                 # 空包
│   ├── pack/                    # 空包
│   ├── agent/                   # 空包
│   ├── skills/                  # 空包
│   ├── llm/                     # 空包
│   ├── pipeline/                # 空包
│   ├── bundle/                  # 空包
│   └── store/                   # 空包
├── api/v1alpha1/                # CRD types placeholder
├── .skills/                     # 运维 AI 技能定义目录
├── deploy/helm/                 # Helm charts 目录
├── builds/                      # Dockerfile 目录
├── proto/infra/v1/              # gRPC proto 目录
├── go.mod
├── go.sum
├── README.md
├── .gitignore
└── Makefile                     # build/test/lint/proto-gen
```

核心依赖：
- `github.com/spf13/cobra` — CLI 框架
- `google.golang.org/grpc` — gRPC
- `go.etcd.io/bbolt` — bootstrap 本地存储
- `k8s.io/client-go` — K8s API（commander 用，此 Task 只声明不实现）

## 影响范围
- 新建 dts-infra 仓库全部目录和文件
- 从 dts-stack/infra/ 迁移可复用代码（version.go 等）

## 验证
- [ ] `go build ./cmd/bootstrap/` 成功
- [ ] `go build ./cmd/commander/` 成功
- [ ] `./bootstrap --version` 输出版本号
- [ ] `go test ./...` 通过（至少 version_test）
- [ ] 目录结构符合设计文档 Section 12

## 铁律合规

| Iron Law | Constraint | Detail |
|----------|-----------|--------|
| Law 4 (Audit Trail) | `internal/store/` must enforce append-only for audit tables | No DELETE/UPDATE operations on audit-related buckets/tables; store interface must reject mutation of existing audit records |
| Law 5 (Capability First) | Makefile must include `proto-gen` target for `infra/v1` protos | Ensure `make proto-gen` generates Go code from `proto/infra/v1/*.proto` via buf |
| Ontology Prep | `.skills/` directory must include infra ontology seed data path | Add `.skills/ontology/` with placeholder for `infra/*` namespace ontology types (Component, Cluster, DataBinding to K8s/Prometheus/Loki) |

## 完成标准
- [ ] go.mod 包含所有声明依赖
- [ ] 两个 main.go 可编译
- [ ] Makefile 包含 build/test/lint target
- [ ] Makefile 包含 proto-gen target (铁律 5)
- [ ] internal/store/ 接口设计为 append-only audit (铁律 4)
- [ ] .skills/ontology/ 目录包含 infra 命名空间种子数据占位
