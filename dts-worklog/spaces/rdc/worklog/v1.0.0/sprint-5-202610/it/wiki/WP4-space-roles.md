---
type: evidence
id: S5/Wiki/WP4-space-roles
covers: [S5/F2/T10, S5/F2/T11]
result: PARTIAL
title: Manifest-driven space roles
date: 2026-10-05
status: IN_PROGRESS
---
# Manifest-driven space roles

Infra commit: `bc65ebd`.

The administration script consumes the pinned Pack CLI artifact 1.1.0, validates
all entries before SSO calls, uses each declared role, and reconciles stable
`wiki-space-<slug>` groups. Explicit JSON group overrides can reuse approved
existing groups. It uses an external authenticated kcadm configuration; no
credentials are copied into source, logs or evidence.

4 local tests PASS: invalid inventory produces no SSO call; offline preview;
stateful reconciliation repeated with no mutations; SSO failure stops before
creation. The real content manifest passed offline preview. No SSO service or
membership was changed. Real allowed/denied accounts for each space remain
pending G0 and G2. The user was asked to confirm the member groups.

Final source repeat: all four manifest/role adapter tests passed with the stateful
kcadm fixture. Main now containsbc65ebd and9cda723 and was pushed. Only this
session's two Infra branches were removed; the separateS2 worktree and unrelated
untracked development-ci-host.md are preserved. No real group/role assignment ran.
