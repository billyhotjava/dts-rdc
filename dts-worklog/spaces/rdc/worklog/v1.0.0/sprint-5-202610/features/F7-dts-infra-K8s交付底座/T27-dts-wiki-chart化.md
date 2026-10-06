---
type: task
id: S5/F7/T27
feature: S5/F7
title: "dts-wiki chart 化与附件迁移 S3"
status: IN_PROGRESS
priority: P1
depends: [S5/F7/T02, S5/F7/T17, S5/F7/T18, S5/F7/T20]
---
# T27: dts-wiki chart 化与附件迁移 S3

原文（2026-10-05 归档，只读）：[T27-dts-wiki-chart化.md](../../../../../archive/dts-rdc-worklog/v1.0.0/sprint-5-202610/features/F7-dts-infra-K8s交付底座/T27-dts-wiki-chart化.md)

状态以本卡片的 frontmatter 为准；变更时修改 `status`，并在下表追加一行。

## 状态变更

| 日期 | 状态 | 说明 |
|---|---|---|
| 2026-10-05 | DRAFT | 由归档状态初始化（F0/T20 M8c，未复核） |
| 2026-10-07 | IN_PROGRESS | WP15 adds the single-replica Wiki Helm chart, external PG/OIDC contracts, ordered migration and persistent attachments. S3 migration, signed multi-architecture publication and site acceptance remain open. See [WP15](../../it/wiki/WP15-kubernetes-reading.md). |
| 2026-10-07 | IN_PROGRESS | Final chart 0.1.1 derives the configured public key for read-only staging. All eleven kind groups pass, including the administrator public-key endpoint. External key grants, S3 and site release gates remain open. See [WP15](../../it/wiki/WP15-kubernetes-reading.md). |
