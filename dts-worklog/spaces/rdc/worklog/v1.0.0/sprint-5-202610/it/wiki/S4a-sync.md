---
type: evidence
id: S5/Wiki/S4a-sync
covers: [S5/F4/T03, S5/F4/T05]
result: PARTIAL
title: Prepared inbound delivery and pending target acceptance
date: 2026-10-06
status: IN_PROGRESS
---
# Prepared inbound delivery and pending target acceptance

The reviewed manifest/reconcile/import/read-only implementation passed disposable
bare-Git/PostgreSQL tests in WP2 and subsequent diagram import regression inWP11.
The final release is being prepared fromWiki688d6b9. Runtime approval/access/key
requirements remain as listed in [the final register](final-acceptance.md).

The2026-10-06 read-only SSH probe still failed authentication. No v2 inspection,
backup/reset, image load, real manifest import or permission check ran on.50.
Runtime expectations below are pending; local fixtures do not satisfy them:

- Manifest spaces establish automatically and first history import completes.
- An authorized push becomes visible within one minute, then an unchanged cycle
  adds no duplicate versions or attachments.
- Git page writes/attachments/tree operations remain409; native content is editable.
- Allowed and denied personal accounts exercise every declared space; denied reads404.
- Current recipient identity revocation is effective for notices and mention lookup.
- Login, personal MCP, search/history/restore, diagram rendering and optional mail work.
- Existing18090 remains healthy during v2 operation and rollback rehearsal.

Record timestamps, content/source commits, image IDs, measured counts and approved
browser screenshots here after target execution. Never include credentials.

Final source688d6b9 and its r2 offline release gate passed80 frontend/121 unit/115
integration cases. Bundle checksums were revalidated. Wiki/Infra main are pushed;
no target deployment or authenticated Git fetch/import was performed.
