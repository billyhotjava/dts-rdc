# T02: 备份恢复与 runbook

**优先级**: P0 · **状态**: DRAFT · **依赖**: T01

## 技术设计
- 复用 `deploy/sso/backup/` 模式：每日 `pg_dump -Fc` + `pg_restore --list` 校验 + 保留 14 份 + systemd timer；附件目录每日 rsync 快照（按 sha256 天然去重）。
- 恢复演练：还原到临时库，页面数/版本数一致。
- 研发文档额外有 git 这一份副本（W-ADR-1），wiki 原生页没有 → Q2：是否每日导出原生页到一个只读 git 仓库作为第二份备份（建议做，成本低）。
- runbook：启停、同步卡住的处理、冲突积压处理、deploy key 失效、磁盘告警。
