# dts-worklog

Development and App content for DTS Wiki. This directory is part of the dts-rdc
repository (not a submodule) and holds **documents only**, never product code.

DTS Wiki (`dts-wiki`) is a standalone, product-neutral wiki. A wiki deployment points
at a git repository and a space manifest; for the DTS development center that is
the dts-rdc repository with `dts-worklog/spaces.yml`. The manifest decides which
spaces exist; the wiki itself knows no space names.

| Deployment | Spaces |
|---|---|
| DTS development center (10.20.0.50) | `dts` (product capability docs, from `../dts-docs/`), `rdc` (DTS research & development), one space per App under development (`prs`, ...) |
| Customer site (wiki shipped with DTS) | `dts` (read-only product capability docs shipped with the release), plus the customer's own App spaces; never `rdc` |

## Layout

```
spaces.yml                     # space manifest; roots are relative to the dts-rdc repository root
templates/space/               # empty skeleton of a space
spaces/<slug>/worklog/         # active development records (sprint-workflow format)
spaces/<slug>/docs/            # optional formal documents of an App space
spaces/<slug>/archive/<name>/  # frozen records imported as a whole; read-only, never edited
checksums/<slug>/<name>.sha256 # seal of each archive, verified by content-lint
```

Check the layout, frontmatter and archive seals with
`dts-common/tools/content-lint check .` from the dts-rdc root (wiki-content v1 contract
in dts-common; CI workflow `content-lint.yml`). Seal a new archive once with
`dts-common/tools/content-lint seal dts-worklog/spaces/<slug>/archive/<name>`.

DTS product capability documents are not here: they live in `../dts-docs/` and form
the `dts` space.

## Archives

| Archive | Origin | Imported |
|---|---|---|
| `spaces/rdc/archive/dts-rdc-worklog/` | dts-rdc `worklog/` at `d81d89f` (plus the uncommitted 2026-10-04 CI host note and the 2026-10-05 D17 notes) | 2026-10-05, 383 files |
| `spaces/prs/archive/prs-stack-worklog/` | prs-stack `worklog/` at `b06f3a1` | 2026-10-05, 45 files |

Only relative links were rewritten to the new locations; file sets and all other
bytes are unchanged (evidence: F0/T20). The dts-rdc archive keeps its git history
through the rename; the prs-stack history stays in the prs-stack repository.

## Adding a space

1. `cp -r templates/space spaces/<slug>` (`<slug>`: lowercase ASCII, never renamed).
2. Add an entry to `spaces.yml` (slug, display name, roots, access role).
3. Commit to `main`; the wiki creates the space and imports it on the next sync cycle.
