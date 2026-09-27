# W4 pages evidence (F3/T01–T05)

Date: 2026-09-27 · Branch: `feat/W1-scaffold` · Image: `dts-wiki-app:w6a3` on .50:18091

## Backend (all `// DTS-WIKI: customized` marked where generated files were touched)
- `service/wiki/PageService` (new): spaces list/detail, tree assembly (in-memory, position-ordered),
  resolve (incl. README↔FOLDER), create (kind inference GIT-under-syncroot/NATIVE, 03 §7 filename rule,
  position step 1000), saveContent (FOR UPDATE lock, 409 on stale base, I9 no-op), rename/move (I5/I6 + GIT repath),
  deep copy, soft-delete subtree, restore subtree, trash list; GIT mutations write `SyncOutbox` (F4 consumes).
- `web/rest/wiki/WikiSpaceResource` (new): 12 endpoints per 03 §4 (spaces/tree/resolve/trash/pages CRUD/copy/restore).
- `web/rest/wiki/WikiExceptionHandler` (new, HIGHEST_PRECEDENCE over JHipster's global translator):
  SPACE_NOT_VISIBLE→404, PAGE_VERSION_CONFLICT→409+currentVersionNo, PAGE_SYNC_CONFLICT→409, BAD_REQUEST→400,
  all with `errorKey` envelope.
- Repository additions: `PageRepository.findLiveBySpace/findLive/findForUpdate/maxSiblingPosition`,
  `SpaceRepository.findOneBySlug`, `PageWatchRepository.existsByPageIdAndUserLogin`.
- `PageServiceIT` (7), `WikiPageResourceIT` (5): CRUD/version/409/I5/I6/copy/delete/restore/trash/404/403 matrix.
- Deferred to W8: draft/editing/labels/watch endpoints, search-index + activity writes in saveContent,
  comment APIs. Templates → W5 (F3). Attachment tab + history tab are placeholders.

## Frontend
- `api/hooks.ts` (spaces/tree/page + create/rename-move/copy/delete/restore/trash mutations),
  `components/AsyncState` (four states), `components/MarkdownView` (markdown-it minimal; full 05 §6 in W5),
  `features/tree/PageTree` (virtual, drag-move, right-click menu, rename/create/copy modal, delete confirm),
  `features/page/PageView` (breadcrumb/meta/tabs/actions), `features/home/TrashPage`,
  `layout/AppLayout` (space switcher + sider), routes `/ /s/:slug /s/:slug/p/:pageId /s/:slug/trash`.
- `tsc` clean, `pnpm test` green, `pnpm build` ok.

## Tests
- `./mvnw -Pprod verify`: unit **140/140**, integration **396/396**, BUILD SUCCESS.

## .50 deployment
- Image `w6a3` shipped, `.env` APP_TAG=w6a3, stack restarted, `Started DtsWikiApp` confirmed.
- Seeded via SQL (documented bootstrap until W6 import): spaces `dts` (id 1050), `prs` (1100) + root FOLDER pages (1150/1200).
- Smoke: `/api/wiki/spaces` and `/tree` → 401 anonymous (wiring ok); full flows covered by ITs + user acceptance below.

## User acceptance (pending)
- [ ] open `:18091/`, spaces dts/prs visible; tree shows roots; 新建/改名/拖拽移动/复制/删除/回收站恢复 each once
