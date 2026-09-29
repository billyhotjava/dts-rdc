# Studio engine import — implementation checkpoint

Date: 2026-09-29. Scope: F0/T08 and the first F1 implementation slice.

## Baseline and authorization

The user selected Studio as the first refactoring target and authorized implementation.
This checkpoint imports the existing Java backend on an isolated feature branch;
it does not finalize the remaining runtime/BI/data-egress ADRs or promote the branch to main.

- Source: `/opt/prod/prs/source/dts-copilot`, `719c6d3c0aee476aab417e4ae01ae18356dae170`.
- Studio base: `6040d79`; result: `06a6a8c6bc3a9731c6e4951a2904bb38bdf6166c`.
- Branch: `feature/studio/engine-import`; local commit only, not pushed or merged into main.
- Build checkout: `/data/dts-studio`, same result SHA and clean tracked tree.
- Seven pending source files were preserved in a separate import commit. The original
  source HEAD, status, and file hashes remain unchanged; no source work was discarded.
  See [the manifest](copilot-import-manifest-20260929.json).

## Implemented changes

1. Imported 1,744 tracked files using the source's history; 478 paths were excluded.
   The source's 150 commits were processed with a recorded
   [commit map](copilot-commit-map-20260929.txt). Filtered commits containing only
   excluded paths may disappear; this does not promise identical commit IDs/counts.
2. Excluded tracked `.env`, the old webapp, workstation metadata and generated paths
   from imported history. Runtime environment files were not copied to Studio or the build checkout.
3. Created `engine/engine-ai` and transitional `engine/engine-analytics`. Maven module
   paths changed; artifact IDs, Java packages, API paths, dependencies and main source bytes did not.
4. Kept old deployment scripts/configuration under `engine/deploy/legacy` as references.
   The active root/engine `build.sh` verifies and packages only the backend; no legacy
   webapp build or Compose deployment is invoked. F7/T25 owns K8s release integration.
5. Added a disposable PostgreSQL test harness: random loopback port, tmpfs storage,
   explicit test database variables, no implicit image pull, cleanup on success/failure.
   It overrides inherited `PG_*` values and never reads a business `.env`.
6. Fixed two tests' historical worklog paths. Their fixture content/assertions are unchanged.
7. Removed the two empty nested submodule gitlinks and 11 byte-identical evolution files.
   Retained the differing `PRODUCT-SPEC-V1.0.0.md`; see
   [SHA-256 comparisons](studio-evolution-comparison-20260929.json).
8. Updated Studio's entry documentation to distinguish current implementation,
   transitional code, historical plans and pending product acceptance.

## Rehearsal and review

The [import script](scripts/merge-copilot.py) only creates a new disposable clone.
It rejects an existing output directory, stale source HEAD and disallowed overlay paths.
It checks mapped Git blob IDs and modes before preserving the selected worktree delta.
Source tags are restricted to those reachable from the frozen SHA and prefixed `copilot-`.
The actual source has no tags; the fixture test covers annotated-tag preservation.
The filtered Git directory is 8,404,076 bytes and historical worklog files total
8,465,698 bytes. These references are retained for this slice; industry archives
remain subject to F1/T05 and BL-A ownership handoff.

Rehearsals `rehearsal-b` and `rehearsal-c` under `/data/dts-studio-migration-20260929`
produced identical manifests, imported tree/commit IDs, and commit maps. The initial
attempt exposed filter-repo's fresh-clone check; moving branch rename after filtering
fixed it without `--force`. No source history was rewritten. Implementation follows
the [git-filter-repo documentation](https://github.com/newren/git-filter-repo).

One focused review covered the importer, two changed test paths, build scripts,
source preservation and deployment separation. GitNexus's source index was 36 commits
behind; build.sh impact returned LOW, the two test classes were absent, and Studio had
no index. Those results were not treated as complete impact proof: source blob comparisons,
explicit diffs, historical-path search and backend regression supplied the evidence.

Whitespace checks passed for migration edits relative to the frozen import. The old
source's CRLF/whitespace was preserved, rather than reformatting the imported tree.

## Remaining work and limits

- F1/T01: the [2,222-file inventory](copilot-ownership-inventory-20260929.csv) is a
  candidate mapping, not a completed semantic ownership review. Split mixed Finance,
  JDBC and Agent/BI resources with BL-A/BL-D and ADR-006/009 before implementing those changes.
- F1/T02: the history-preserving approach is validated and ADR-011 is accepted for this import.
- F1/T03: feature-branch import is implemented; main/remote/RDC gitlink promotion is pending.
- F1/T04: source build/test paths work; images/chart/CI delivery remains pending with F7/T25.
- F1/T05: source repository remains active; archive/freeze and full history handoff are not done.
- F1/T06: backend regression passed; runtime API/SSE golden baseline comparison is pending F0/T02–T03.
- F0/T08: local removal/entry updates done; remote and RDC gitlink update are pending.
- Pack externalization, Stack data authorization, Console/BFF and PRS business acceptance
  are not delivered by this import. No production service or business database was changed.

See [IT-02](../it/IT-02-studio-build.md) for test results. Import and unit/integration
verification do not establish a deployed or business-accepted AI brain.
