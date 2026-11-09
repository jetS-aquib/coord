---
id: JET-278
title: DELETE /api/music-videos/:id deletes any user's project: it checks no owner
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:30:15+05:30
updated: 2026-11-10T01:09:31+05:30
decisions: 
---

## Request

Scope deleteMusicVideo to the caller: MusicVideo.deleteOne({ id, userId: <caller> }), 404 when nothing matched. Check the sibling routes in musicVideo.routes.ts (GET /:id, POST save, share) for the same gap.

## Understanding

musicVideo.controller.ts:101 runs MusicVideo.deleteOne({ id }) with no userId, so any signed-in user who learns or guesses an mv_ id can delete someone else's video. Mobile wanted a delete button on the video screen (Nav Read promised one) and is holding it until this is fixed. ASSUMPTIONS: (a) the caller's id is on req.user as other routes read it; (b) a 404 for not-yours is better than 403, so ids cannot be probed; (c) this is the legacy /api/music-videos router, not the v1 one.

## Plan

1. Add the owner filter to delete.
2. Audit GET /:id, save and share for the same.
3. Test: user B cannot delete user A's project.

## Reason

Security: deletion without an ownership check.

## Related files

src/modules/musicVideo/musicVideo.controller.ts, musicVideo.routes.ts

## Acceptance criteria

DELETE of another user's id returns 404 and deletes nothing; deleting your own still works.

## Test steps

—

## Thread
2026-11-09T03:30:15+05:30 aquib N: created ticket, status: - -> open
2026-11-10T01:09:31+05:30 aquib N: status: open -> approved
2026-11-10T01:12:38+05:30 aquib N: Mobile side built (uncommitted): trash glyph on the video screen, destructive Alert confirmation, DELETE /api/music-videos/:id, 404 treated as already gone, inline error otherwise, then back to your videos (reloads on focus).
