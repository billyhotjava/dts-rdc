---
type: evidence
id: S5/Wiki/WP10-diagram-editor
covers: [S5/F3/T14, S5/F3/T15, S5/F3/T16]
result: PASS
title: Diagram reading and editor preservation
date: 2026-10-06
status: DONE
---
# Diagram reading and editor preservation

Wiki commit: `52e2281`. Five focused component tests and all twenty real-editor
roundtrip samples passed. The CLI formatted temporary copies of the same twenty
samples and its second `--check` found zero changes; original fixture bytes were
unchanged. The initial full TypeScript check exposed a nullable page ID, fixed
in WP11; subsequent full TypeScript checking passed. Five MCP integration tests and two
architecture checks passed against disposable PostgreSQL.

Real Archify 2.16.0 validation/delivery completed all nine showcase gates with
zero errors/warnings. The wrapper froze the source digest, reused the delivered
HTML and exported the light 1440x900 PNG from the real visual checker. Containment
checks passed four viewports; the build receipt correctly leaves human visual
review pending. No renderer version was updated. The local reviewer inspected
both standalone captures and the following inline UI screenshots.

Browser fixtures used actual generated HTML/PNG plus mocked authenticated Wiki
API responses. They verified inline SVG rendering, opaque-origin script sandbox,
blocked parent DOM/cookie access, HTML-404 PNG fallback and a non-editable editor
card. The browser reported no console errors or unexpected API requests. Browser
process isolation was disabled in this test harness to inspect frame contexts;
this evidence establishes origin isolation, not process isolation. The iframe
has `allow-scripts` and omits `allow-same-origin`.

Review corrected random PNG naming, duplicate diagram attachment replacement,
code fence metadata loss through the editor's LaTeX schema override, SVG uploads,
and attachment access after owning-page deletion. Soft deletion retains blob
bytes for backup/history. JSON/HTML size budgets are 2 MB/5 MB.

Screenshots: [inline](WP10-inline-diagram.png), [PNG fallback](WP10-png-fallback.png),
[editor card](WP10-editor-card.png). These are local UI evidence, not production
Git inbound or personal SSO acceptance. Formal usage is in Wiki's
`docs/content-tools.md` and `docs/mcp.md`.
