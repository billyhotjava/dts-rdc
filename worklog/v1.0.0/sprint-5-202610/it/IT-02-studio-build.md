# IT-02 — Studio backend import and verification

Date: 2026-09-29. Result: backend build/regression PASS; runtime API/SSE and business acceptance PENDING.

| Item | Evidence / result |
|------|-------------------|
| Source | Copilot `719c6d3c0aee476aab417e4ae01ae18356dae170` plus 7 explicit, hashed pending files |
| Studio / build SHA | `06a6a8c6bc3a9731c6e4951a2904bb38bdf6166c`; clean feature branch and `/data/dts-studio` tree |
| Environment | Java 21.0.10; Maven 3.9.16; local Docker `postgres:18.4` used only for disposable tests |
| Command | `/data/dts-studio/build.sh verify` |
| AI module | 106 suites, 467 tests, 0 failures/errors/skips |
| Transitional analytics | 39 suites, 143 tests, 0 failures/errors/skips |
| Packaging | Both executable backend JARs produced by Maven `verify` |
| Migration test | `python3 -m unittest discover -s worklog/v1.0.0/sprint-5-202610/assets/scripts -p test_merge_copilot.py -v`: PASS |
| Determinism | Two actual-source rehearsals: identical manifest, import tree/commit IDs and commit map |
| Failure cleanup | Child command exit 23 preserved; no test container remains |
| Main source equivalence | Both imported modules' `src/main` bytes unchanged from frozen source |
| History | `git log --follow` on `Nl2SqlService.java` reaches original source changes; full commit map retained |
| Source preservation | Original source HEAD and all 7 pending-file SHA-256 hashes unchanged |

The source contains 146 Java test files; Surefire discovers 145 suites containing
610 test cases. Test-file count is not the executed test-case count.

Initial verification failed on two moved fixture paths and two JSONB tests without
PostgreSQL. Only the fixture paths and test environment were corrected; no assertions
were weakened or tests skipped. The second full reactor verification succeeded.

The build used the working-tree snapshot before its local commit; tested code/build
inputs match the recorded SHA. The completed build directory was then attached to that
exact local Git revision; only documentation changed between testing and commit.

Machine-readable counts, image ID and log hash:
[verification record](../assets/studio-backend-verification-20260929.json).
Full log: `/data/dts-studio-migration-20260929/backend-verify-2.log`.
Surefire XML: `/data/dts-studio/engine/{engine-ai,engine-analytics}/target/surefire-reports/`.

No application image was built or deployed. This test PostgreSQL image does not change
the selected production public-image baseline. Real login, migrated runtime schemas,
production-like data, live API/SSE golden answers, AI shutdown independence and PRS
business acceptance remain unverified; F1/T06 stays IN_PROGRESS.
