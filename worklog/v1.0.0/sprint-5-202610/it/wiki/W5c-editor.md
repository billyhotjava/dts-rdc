# W5c editor evidence (F3/T06-T09 + F1 minimalDiff)

Date: 2026-09-28 · Branch `feat/W1-scaffold` · Image `w6a6` on .50:18091

## F1 minimalDiff (`features/edit/minimalDiff.ts`)
- Unified remark parse (gfm + directive + math, positions kept) → fingerprint (structure +
  normalized text, cyrb53) → LCS ops → equal blocks keep ORIGINAL bytes, inserts take
  editor bytes, deletes vanish; gaps use original whitespace; render-equivalent second
  chance for uneven tables (empty-cell fill) and list markers.
- Tests: 26 unit (`tests/minimal-diff.test.ts`: 20 fixtures byte-identical no-change +
  one-word/one-cell/add-delete-reorder/idempotent + uneven-table + marker cases).
- End-to-end T01: real Milkdown (headless Chrome) 20/20 idempotent AND
  `minimalDiff(input, editorOut) === input` (incl. all fenced samples).
- Wired into `PageEditorPage` save (WYSIWYG only; source mode stores verbatim).
- Deviations from 10 §4.1: cyrb53 instead of sha1 (same role); `~`/`_`/`*` escaping needs
  no handling (confined to replaced blocks by construction).

## F2 dialect (E2/E9/source; NodeView polish deferred)
- E2 callouts: Crepe escapes `[!NOTE]` → post-process `restoreCallouts` unescapes at
  blockquote starts (unit-tested); full Alert NodeView + `/` menu = follow-up (content
  integrity, the contracted part, holds; wiki/GitHub render alerts correctly).
- §2.4 unknown blocks: probed — `:::details`/`:::columns`/math pass through byte-identical
  in Crepe; no custom rawBlock node needed for preservation (read-only cards deferred).
- Mermaid in-editor preview: deferred (fences edit + round-trip safely; preview is polish).
- E9 mentions: `/users/mention` backend (space-read guard) + `MentionPicker` modal +
  cursor insertion via `editorViewCtx`; E9 rendering as user cards is W8.
- Source mode: CodeMirror 6 markdown toggle; saves bypass minimalDiff; YAML frontmatter
  stays editable as raw text (PropertiesForm hidden in source mode to avoid two writers).

## Attachments tab + templates
- `AttachmentsTab` in the edit page (list/upload/copy-markdown); upload auto-creates
  unsaved new pages first (documented behavior).
- Templates: backend + new-page dropdown already in W5; verified working.

## Deferred with reasons
- Callout Alert NodeView + `/` menu (polish; integrity proven), mermaid editor preview
  (polish), YAML-source CodeMirror (Textarea suffices), new-page type inference (covered
  by template picker), archify (W6.5 per §5).
