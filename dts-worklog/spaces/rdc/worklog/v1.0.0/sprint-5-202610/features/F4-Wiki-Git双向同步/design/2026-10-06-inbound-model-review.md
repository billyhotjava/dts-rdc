# Current inbound synchronization model

## Superseded assumptions

This review applies the current2026-10-05 handoff and D18-D23 to the archived
F4/T01 model and archived deployment/synchronization designs. It closes model
review for the inbound-only D10 A-prime delivery shape. Archived outbound and
conflict implementation remains dormant; F4/T04 and T06 remain DRAFT.

## Ownership and immutable inputs

PostgreSQL holds Wiki pages, immutable versions, search/metadata projections and
Wiki-only collaboration. Git is the content input, never a second writable Wiki
store in this delivery. All space configuration comes from the complete validated
space-manifest.v1 in the pinned content commit, via Common Pack1.1.0 release.
The configured repository, branch, manifest path and readonly credential are
external. No space slug or per-space content directory is compiled into Wiki.

A cycle validates the full inventory and allowed roots before applying space/root
configuration. Files are read against the captured commit. Paths outside roots,
symlinks, submodule gitlinks and checksum/archive sidecars are excluded. Root
validation failure stops the cycle; no partial inventory reconcile is accepted.
The bare-repository tests exercise invalid inventory/root cases, first import,
incremental changes and an unchanged second cycle. Removed manifest entries stop
syncing while existing pages, versions and blobs remain in PostgreSQL/storage.

## Writes and derived data

Git-owned pages and their covered tree/attachment mutations return409, including
mutation through an ancestor. Outbound defaults false and cannot be enabled for
manifest-managed spaces. Native pages keep optimistic writes and immutable
versions; identical Markdown creates no extra version. Comments, favorites,
private drafts and watches are Wiki-owned data and never produce Git outbox rows.
Private drafts and editing presence additionally require native-page write access.

The existing page sync-status enum is retained for database/backward compatibility.
This release does not activate historical outbound state transitions. A failed
cycle retains its prior synchronization checkpoint for retry and records the
failure; only successful root completion advances its captured checkpoint.
Frontmatter is imported leniently, preserving Markdown while marking invalid
metadata for display; native publishing validates strictly. Metadata/search are
projections of versioned content, not independently editable content sources.

## Diagrams

Initial and incremental import share the supported attachment policy. The
approved diagrams directory admits JSON source/HTML delivery plus PNG fallback,
limits imported JSON/HTML and rejects active SVG. HTML is served as an opaque
script sandbox; both current space authorization and owning-page deletion are
checked. Removing HTML retains the readable PNG for fallback. These behaviors
are covered by ManifestInboundIT and WikiMcpIT with disposable fixtures.

## Verification boundary

Local source proof is in WP2, WP10 and WP11. S4a-sync.md tracks target acceptance:
readonly repository authentication, three manifest spaces, first history import,
unchanged cycle,1min visibility and allowed/denied personal accounts. Current
SSH failure and approval gates prevent a runtime completion claim.
