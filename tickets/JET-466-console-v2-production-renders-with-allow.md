---
id: JET-466
title: Console v2: Production (renders with allowedActions and stuck/restart, content and one moderation queue)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:56+05:30
updated: 2026-11-27T15:51:30+05:30
decisions: 
---

## Request

Renders and content pages using allowedActions, restart and userEmail (.coord/contracts/api-admin.md Renders, Content; JET-451, JET-458).
Size: M. Builds on: JET-462, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Renders: status tabs from /meta renderStatuses in pipeline order; userEmail column; stuck light and Restart where allowedActions has restart; detail page offers only allowedActions (cancel, resume, stitch, restart), measured vs estimated cost bar. Content: one moderation queue merging low-rated feedback, pending public assets and visible music videos/podcasts, with previews and Hide/Unhide (reason) and asset approve/reject; elements edit through a form, JSON as Advanced. Handle 409 (wrong status) and 400 (nothing left).

## Plan

1. Renders list and detail on new components.
2. Stuck badge and Restart.
3. Moderation queue page; keep per-kind lists as tabs.
4. Element/asset forms.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/renders/**, apps/admin/app/(console)/content/**, apps/admin/components/render-rows.tsx

## Acceptance criteria

A completed render shows no action buttons; a render stuck > 10 minutes shows Restart and it runs; Hide on a video takes two clicks plus a reason.

## Test steps

—

## Thread
2026-11-26T15:48:56+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:30+05:30 aquib N: status: open -> approved
