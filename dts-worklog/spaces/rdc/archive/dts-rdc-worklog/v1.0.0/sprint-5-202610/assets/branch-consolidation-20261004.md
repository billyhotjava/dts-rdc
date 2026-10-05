# Branch consolidation, 2026-10-04

The coordination repository and all initialized submodules now have their local
work on `main`. Their `origin/main` branches were updated after verification.

| Repository | Resulting `main` | Merge method |
| --- | --- | --- |
| dts-rdc | `4ea35ca` before this evidence commit | Fast-forward feature branch, then update the Stack gitlink |
| dts-app-stack | `0a7897b` | Fast-forward |
| prs-stack | `b06f3a1` | Fast-forward |
| dts-infra | `bbc9d3a` | Fast-forward; the W1-W5 branches are ancestors |
| dts-stack | `06e28c654` | Merge unrelated historical roots |
| dts-studio | `6dfe0ac` | Fast-forward |
| dts-wiki | `1d5f7fe` | Fast-forward |

The Stack modular baseline descended from the old one-file root, while the
canonical `origin/main` had an unrelated history. Merge commit `06e28c654`
retains both histories and both trees. The only content conflict was
`.gitignore`; both rule sets were retained. The canonical legacy tree is still
present, so this merge is a history reconciliation, not a completed removal of
legacy Stack content.

Verification passed:

- `python3 scripts/check-boundaries.py`: 3,180 files and 67 active Stack changelogs checked.
- `dts-common/build.sh clean install`: 13 tests passed.
- `dts-studio/build.sh verify`: build and backend tests passed.
- `prs-stack/tools/build-studio-pack /tmp/merge-prs.dtspack`: 31 assets, no warnings, using the installed Common 1.0.0 CLI artifact.
- `dts-stack/build.sh verify`: build and tests passed, including the isolated PostgreSQL schema check.

The disposable test databases used the preloaded `postgres:18.4` image. The
temporary Docker socket ACL granted for local verification was removed afterward.
Untracked `dts-infra/docs/development-ci-host.md` and the coordination
repository's `development-ci-host-20261004.md` were left untouched.
