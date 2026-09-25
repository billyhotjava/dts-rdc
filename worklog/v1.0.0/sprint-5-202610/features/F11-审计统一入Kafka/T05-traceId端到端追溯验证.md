# T05: traceId 端到端追溯验证

**优先级**: P1
**状态**: DRAFT
**依赖**: T02–T04、F9/T02

## 目标
证明从网关生成的 traceId 贯穿 dts-auth → engine-ai → QueryGateway → 审计事件 → stack 存储，并能与 OpenTelemetry 的 trace 关联（prs R-011 规定一开始就接入 OTel）。

## 技术设计
- engine-ai：MDC 与 OTel context 中写入 `X-DTS-Trace-Id`；审计事件的 `traceid` 从上下文读取；
- 走查：alice 提问一次 → 在审计查询 API 中按 traceId 查到 asked / query.executed / answered 三条（如果触发了动作，还应该有 action 相关事件）；
- 如果 OTel collector 已经部署（stack 或 prs 的 compose），附上 Tempo/Jaeger 中同一 trace 的截图；未部署则记为 GAP，并登记后续 task。

## Definition of Done
- [ ] 证据进入 `it/IT-09-audit.md`
