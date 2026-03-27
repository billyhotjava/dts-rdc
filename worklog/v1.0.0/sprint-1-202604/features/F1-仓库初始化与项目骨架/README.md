# F1: 仓库初始化与项目骨架

**优先级**: P0
**状态**: READY

## 目标
搭建 dts-infra 独立仓库，建立 Go 项目骨架、proto 定义、目录结构，并作为 submodule 引入 rdc

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | Go 模块初始化与目录结构 | P0 | READY | - |
| T02 | Proto 定义（infra/v1） | P0 | READY | T01 |
| T03 | Submodule 注册与 CI 基础 | P1 | READY | T01 |

## 完成标准
- [ ] go.mod 声明正确，依赖可解析（cobra, grpc, bbolt, k8s client-go）
- [ ] cmd/bootstrap/main.go 可编译运行（输出 version）
- [ ] proto/infra/v1/*.proto 可用 buf 编译生成 Go 代码
- [ ] dts-infra 作为 submodule 出现在 rdc 仓库
