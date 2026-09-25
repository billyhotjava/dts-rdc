# T01: 审计事件 schema 与 topic 规划

**优先级**: P0
**状态**: DRAFT
**依赖**: F2/T06

## 目标
在 DAP Audit 层（`dts-agent-protocol.md:349`，账本#29）的基础上，钉死 `dts.audit.v1` 的 CloudEvents 外壳与各 type 的 data schema。

## 技术设计
- **文件**：`dts-studio/protocol/audit/envelope.v1.schema.json`，以及每个 type 一个 `data` schema；
- **字段原则**：
  - 不放原始敏感数据：SQL 只放 `sql_hash` 与 `sql_redacted`（字面量替换为 `?`）；原文如确有需要，只写入受控存储（本期不做）；
  - 结果只放行数与列名，不放数据；
  - 用户输入的问题原文：允许记录（产品需要），但要标记 `pii_possible=true`，下游按策略保存；
- **topic**：`dts.audit.v1`（集群沿用 stack 的 Kafka，账本#24；prs R-002 规定复用 stack 集群）；分区数按每天事件量估算（记录在 nfr-budget 中）；
- **兼容**：新增 type 属于非破坏性变更；修改 data 字段语义需要升级到 `v2` topic。
- 为各服务提供一个共享的轻量 Java 库还是只提供 schema？**只提供 schema**（遵循 ADR-010 的互操作约定，不共享 jar），各服务自己实现序列化，CI 中用 schema 校验样例。

## Definition of Done
- [ ] schema 合入；每个 type 至少有一个样例通过校验
