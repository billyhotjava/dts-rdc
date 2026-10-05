# Rules for dts-worklog

- Documents only; code belongs to the code repositories. Link code by repository URL.
- Development records go to `spaces/<slug>/worklog/v{x.y.z}/` using the sprint-workflow
  skill: one sprint per calendar month (`sprint-<N>-<YYYYMM>`); new requirements become
  tasks of an existing feature; work beyond monthly capacity goes to `backlog/`.
- `spaces/<slug>/archive/` is frozen. Do not edit, move or delete archived files; refer
  to them by link and record new decisions or status changes in the active worklog.
- DTS product capability documents belong to `../dts-docs/`, not here.
- Keep `spaces.yml` in sync with `spaces/`; a directory without a manifest entry is not
  imported by the wiki.
- No credentials, tokens, private keys or `.env` content.
