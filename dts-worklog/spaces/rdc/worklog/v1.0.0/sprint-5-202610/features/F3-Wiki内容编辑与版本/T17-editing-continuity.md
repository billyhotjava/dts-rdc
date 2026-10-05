---
type: task
id: S5/F3/T17
feature: S5/F3
title: Editing continuity and draft recovery
status: DONE
priority: P1
depends: [S5/F3/T04, S5/F3/T06]
---
# Editing continuity and draft recovery

Finish the draft and soft-presence UI explicitly left as follow-up by archived
T04/T06. Native pages autosave private server-side drafts without creating
versions. Recovery keeps its base version and optimistic conflict protection;
Git pages reject draft/presence writes. Heartbeats run every thirty seconds and
expire after ninety seconds without hard locking. Validate ownership, deleted
pages, stale versions, draft restoration and cleanup after successful publish.

## Status changes

| Date | Status | Evidence |
| --- | --- | --- |
| 2026-10-06 | IN_PROGRESS | Remaining editor follow-up identified during module review. |

| 2026-10-06 | DONE | Local source688d6b9 and final r2 canonical gate PASS; WP12 evidence records scope. Runtime DoD remainsF5/T10. |
