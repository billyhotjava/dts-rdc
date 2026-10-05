# F4: Commander 部署与交接

**优先级**: P0
**状态**: READY

## 目标
实现 bootstrap 部署 commander 并完成交接：commander 启动、连接 global-pg、gRPC health 就绪

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | Commander 最小可运行版本 | P0 | READY | F1/T01, F1/T02 |
| T02 | Commander Helm Chart + Dockerfile | P0 | READY | T01 |
| T03 | Bootstrap 部署 Commander 与交接验证 | P0 | READY | T02, F3/T02 |

## 完成标准
- [ ] commander 二进制可启动，连接 PG，暴露 gRPC health endpoint
- [ ] Helm chart 可部署 commander Deployment 到 dts-system
- [ ] bootstrap 部署 commander 后等待 health 通过，输出"交接完成"并退出
- [ ] 全流程端到端: precheck → pg → commander → done
