# PRS 工作记录入口

当前跨模块承接依据：[2026-09-26 承接说明](v1.0.0/integration-20260926/README.md)。

`v1.0.0/sprint-queue.md` 与 `sprint-1-202609/` 是从原 `dts-prs` 原样导入的历史工作快照，包含当时的决策、未决项及执行记录；不能把其中的 DONE、旧 BOM PASS 或旧绝对路径直接当成迁入后验收结论。保留正文便于追溯，当前差异与承接状态集中在上述说明中。

| 内容 | 入口 |
|---|---|
| 原重写决策 R-001～R-012 | [原队列](v1.0.0/sprint-queue.md) |
| 业务能力、财务口径与迁移待确认项 | [迁移清单](v1.0.0/sprint-1-202609/assets/迁移清单-v0.1.md) |
| 本次导入的 93 个文件及 SHA256 | [导入清单](v1.0.0/integration-20260926/source-manifest.json) |
| 原型与页面承接 | [能力对照](v1.0.0/integration-20260926/prototype-capability-map.md) |
| 版本、镜像与验证边界 | [版本承接](v1.0.0/integration-20260926/version-handoff.md) |

后续修改由该仓库维护；旧路径本轮未删除、未设只读。正式开发入口切换、增量同步及三层提交（prs-stack → app-stack → rdc）由 RDC Sprint-5 F1/T01、T02、T06 关闭，期间禁止把两份工作副本当作可独立演进的主线。
