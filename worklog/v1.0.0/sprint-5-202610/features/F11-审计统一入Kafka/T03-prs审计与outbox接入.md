# T03: prs 审计与 outbox 接入

**优先级**: P1
**状态**: DRAFT
**依赖**: T01、F1/T01

## 目标
prs-platform 已有的 audit/outbox 基线表（账本#27）发布到同一个 `dts.audit.v1` topic，业务事件使用 `prs.biz.*` 命名空间。

## 技术设计
- 核对 prs-platform 中 audit 与 outbox 表的结构（Liquibase 基线），与 T01 的外壳进行映射；缺少的字段（traceid、actortype）通过新增 changeset 补上；
- 发布器实现方式与 T02 相同（各自实现，不共享 jar）；
- 与 prs F5（消息协议骨架，已调出）以及 Kafka 定标准（R-002 规定延后）的关系：本 task 只处理审计类事件，业务领域事件的标准仍然由 prs 自己的规划负责，避免抢占其范围；需要在 prs 的 sprint-queue 中登记。

## Definition of Done
- [ ] prs 在测试环境发出的 `prs.biz.project.synced`（F7/T02 同步任务）事件可以在 Kafka 中看到
