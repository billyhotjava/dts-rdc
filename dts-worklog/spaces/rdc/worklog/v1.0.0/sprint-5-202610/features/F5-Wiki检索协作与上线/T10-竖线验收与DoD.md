---
type: task
id: S5/F5/T10
feature: S5/F5
title: "竖线验收与 DoD"
status: IN_PROGRESS
priority: P0
depends: [S5/F5/T01, S5/F5/T08, S5/F4, S5/F5/T09]
---
# T10: 竖线验收与 DoD

原文（2026-10-05 归档，只读）：[T10-竖线验收与DoD.md](../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F5-Wiki检索协作与上线/T10-竖线验收与DoD.md)

状态以本卡片的 frontmatter 为准；变更时修改 `status`，并在下表追加一行。

## 状态变更

| 日期 | 状态 | 说明 |
|---|---|---|
| 2026-10-05 | DRAFT | 由归档状态初始化（F0/T20 M8c，未复核） |

| 2026-10-06 | IN_PROGRESS | Current source acceptance and deployment gates are tracked in it/wiki/final-acceptance.md; runtime cutover acceptance remains pending. |
| 2026-10-06 | IN_PROGRESS | Actual HTTP probes found healthy/readied older `345083e-dirty`; protected APIs reject anonymous reads. Scoped identity/MCP/commit smoke is now executable, but SSH/real identity acceptance is still pending. See [WP13](../../it/wiki/WP13-runtime-acceptance.md). |
| 2026-10-06 | IN_PROGRESS | Token-free public checks retain identity GAP and reject wrong/dirty builds; 22 Wiki operator and 9 Infra SSH cases pass. Actual v2 commit, identities, deployment and cutover remain unaccepted. See [WP14](../../it/wiki/WP14-runtime-access.md). |
