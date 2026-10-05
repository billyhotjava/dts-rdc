# Repository boundaries

Communicate with the user in Chinese. Write new code comments and documentation
in English. Follow the active Sprint 5 worklog (`dts-worklog/spaces/rdc/worklog/`) and module-local conventions;
March decomposition plans and imported deployment instructions are historical.

## Editing and ownership

- Preserve Git/submodule history and existing user changes. Do not reset or update
  submodules just to make their branches match the coordination repository.
- Keep Studio AI orchestration, Stack data/BI, App domain behavior, Infra deployment
  and Wiki content in their owning modules.
- Keep `dts-common` limited to versioned wire contracts and pure offline Pack tools.
  Do not add Spring/JPA entities, repositories, business services, credentials,
  database connections or deployment configuration there.
- Shared library use is optional. Consume pinned release artifacts, not sibling
  source paths. PRS's framework-specific `prs-common` is not global Common.
- Cross-service access uses authenticated API adapters. Never add cross-database
  fallbacks, including when a dependency is unavailable.
- Preserve already-applied migration bodies/checksums. Retired cross-service seed
  files are kept as historical migration evidence and excluded from new Stack boots.
- Keep industry assets in App/Studio transition ownership until their consumer
  migration is verified; do not delete them simply because their names are old.

## Verification and documents

Run `python3 scripts/check-boundaries.py` after structural changes. For Pack changes,
run `dts-common/build.sh clean install`, the Studio backend tests and a PRS CLI build.
For Stack changes, run `dts-stack/build.sh verify`, including the PostgreSQL schema
isolation test. Test wrappers require a preloaded image, never a business database.
Runtime deployments are separate from local source/build verification.

DTS product capability documents belong in `dts-docs/`; module runbooks in module
READMEs/docs. Design, review findings and verification evidence belong in the active
Sprint under `dts-worklog/spaces/<slug>/worklog/`. Never recreate a root or module
`worklog/`, and never edit `dts-worklog/spaces/*/archive/`. dts-wiki holds no content
and no hard-coded space names; spaces come from `dts-worklog/spaces.yml`. Keep
credentials in external configuration; never copy `.env` into Common or docs.
