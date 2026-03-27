# F2: 环境预检

**优先级**: P0
**状态**: READY

## 目标
实现 `dts-bootstrap precheck` 命令，在目标 K8s 集群上执行全面环境验证

## Task 列表

| ID | Task | 优先级 | 状态 | 依赖 |
|----|------|--------|------|------|
| T01 | 预检引擎实现 | P0 | READY | F1/T01 |
| T02 | bbolt 本地存储 | P0 | READY | F1/T01 |

## 完成标准
- [ ] `dts-bootstrap precheck` 输出结构化检查报告（PASS/WARN/FAIL）
- [ ] 预检结果持久化到 bbolt
- [ ] 在 kind 集群上验证通过
