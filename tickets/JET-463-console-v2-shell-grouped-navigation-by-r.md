---
id: JET-463
title: Console v2: shell, grouped navigation by role (GET /me), ⌘K search (GET /search), glossary, mobile nav
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:51+05:30
updated: 2026-11-27T15:51:18+05:30
decisions: 
---

## Request

New app shell from music-jetkreate-web/planning/ui-ux-audit/03 §1, §3, §6 using GET /me, GET /search and GET /meta (.coord/contracts/api-admin.md, JET-448, JET-450).
Size: M. Builds on: JET-460, JET-462. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Nav groups Home, People, Production, Money, Growth, System, Security; items shown only when the role has the read permission (GET /me permissions; finance pages only for owner and finance, ops pages not for finance, per D-109). Top bar: ⌘K / Ctrl+K palette searching GET /search (types render, ledger, user, music-video, podcast; jump to the record) plus page names; environment badge (Local/Staging/Prod); user menu with theme and density. Replace every hard-coded list (bundles, switches, statuses, ledger types, audit actions) with GET /meta. Apply the glossary (render not job, shot not clip, Hidden, Save draft / Make live / Roll back, Off/On). Mobile <= 768px: sheet nav, no horizontal scroll at 390px (D-110 left the 390px check to web).

## Plan

1. AppShell with grouped, collapsible sidebar, aria-current, breadcrumbs.
2. Role filtering from /me (cached per request).
3. Command palette over /search.
4. Meta loader; delete the hard-coded constants.
5. Glossary rename pass; 390px check in Chrome.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/layout.tsx, apps/admin/components/nav.tsx, new apps/admin/lib/meta.ts, packages/ui command palette

## Acceptance criteria

A viewer account sees no Money group and no write buttons; pasting a jobId in ⌘K opens that render; no constant list of statuses or switches remains in apps/admin; at 390px there is no horizontal scroll.

## Test steps

—

## Thread
2026-11-26T15:48:51+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:18+05:30 aquib N: status: open -> approved
2026-11-27T16:12:48+05:30 aquib N: BUILT (uncommitted). Grouped sidebar from lib/nav.ts filtered by GET /me permissions (Money = finance.read, so viewer sees none); ⌘K over GET /search + page names; env badge (CONSOLE_ENV or guessed from BACKEND_URL); user menu with theme + density; phone sheet nav; billing/ -> money/, control/ -> system/ with redirects; hard-coded lists replaced by GET /meta. TEST: 1) ⌘K, type part of an email, Enter -> user page; paste a jobId -> render. 2) sign in as viewer -> no Money group, no write buttons. 3) 390px wide window -> no sideways scroll (checked 20 pages in Chrome).
2026-11-27T16:28:32+05:30 aquib N: Data source labels added (dev's ask): every data block shows PostHog / Database / Live server via SourceTag; map in apps/admin/lib/sources.ts (+test) until backend JET-476 sends the source per response. TEST: Home tiles: renders/users = PostHog, AI cost = Database; Health: loops = Live server, alerts = PostHog.
