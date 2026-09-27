# T03: Runbook 与可观测性

**原编号**: Sprint-5 F13/T04（2026-09-26 按月度 Sprint 整合重编号）

**优先级**: P1
**状态**: DRAFT
**依赖**: T01

## 目标
运维人员不需要阅读代码就能处理常见故障：新的组件（dts-auth、QueryGateway、Pack 注册表、审计 outbox、证明引擎）都有指标、告警和处置步骤。

## 技术设计
- **runbook 章节**：拓扑与端口 / 启停顺序 / 健康检查 / 配置与密钥清单（只写名称和位置，不写值）/ 告警与处置：
  - dts-auth 5xx 或 JWKS 拉取失败 → 全站 401 的处置；
  - `studio_query_blocked_total` 突增 → 判断是攻击还是 Pack 变更导致的误伤；
  - `studio_audit_outbox_backlog` > 1000 → 检查 Kafka；
  - Pack 激活失败或问答异常 → 回滚 Pack；
  - `studio_indicator_fetch_errors_total` → stack 指标接口；
  - LLM provider 熔断（LlmGatewayService 已有 ProviderState）→ 切换 provider；
- **仪表盘**：如果 Grafana 已经部署，就提供 dashboard JSON；否则列出 Prometheus 查询语句；
- **日志**：结构化 JSON 输出到 stdout，包含 traceId、tenantId（R-011 k8s-ready）；
- **容量**：连接池大小、LLM 并发、Kafka 分区数的初始值与扩容信号。

## Definition of Done
- [ ] `assets/runbook.md` 完成，并且至少实际演练两个故障场景；Gate "可运维性" 置为 PASS
