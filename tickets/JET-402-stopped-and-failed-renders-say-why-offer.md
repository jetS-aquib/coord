---
id: JET-402
title: Stopped and failed renders say why, offer only useful actions, and can be deleted; limits shown before spending
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:49:58+05:30
updated: 2026-11-23T17:50:53+05:30
decisions: 
---

## Request

Depends on: JET-390, JET-388, JET-394, JET-398.

V1 UX-005/006: the stopped screen says only 'That did not finish.'; unfinished projects cannot be deleted from the app; render_limit is not treated as final (lib/retry.ts SPENT regex misses its wording) and the weekly allowance from /estimate is discarded (lib/generation.ts:1185).

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Read plan failure {cause, refusalCause, clipsAffected, retryable}; show plain copy per cause; Try again only when retryable; Delete uses the cascade delete so a running render stops. Limit refusals are matched on code, not message text. Ready shows the allowance in the action bar context and blocks Film now when the video will not fit.

## Plan

1. Failure copy per cause + actions.
2. Delete on the stopped screen (ConfirmSheet).
3. retry.ts: final on codes render_limit/capacity/renders_off.
4. Keep allowance from /estimate; show it on Ready; pre-check fit.

## Reason

Users currently retry renders that cannot succeed and pile up dead projects.

## Related files

src/app/(create)/working/[id].tsx, src/lib/retry.ts, src/lib/generation.ts, src/app/(create)/ready.tsx, src/lib/music-videos.ts

## Acceptance criteria

A refused-shot render shows '2 shots couldn't be filmed…' with re-film / use without / delete; an exhausted allowance shows on Ready and Film now never sends a request; deleting a running project stops it.

## Test steps

1. Force a refused shot (e.g. a real person's name) and let it fail: the stopped screen says 'N shots couldn't be filmed', the server's reason under it, with 'Film those shots again' and 'Delete project'.
2. Delete project -> confirm: back on Home, the project is gone, and the render poll shows cancelled.
3. With the weekly limit nearly used on staging, open Ready on a longer song: the summary line shows 'M:SS left this week', Film now and Preview stills are disabled, and the note says why.
4. Exhaust the limit and start from a saved project: 'Out of video time' with no Try again.
5. npm run check:retry passes.

## Thread
2026-11-23T15:49:58+05:30 aquib N: created ticket, status: - -> open
2026-11-23T17:38:24+05:30 aquib N: status: open -> approved
2026-11-23T17:50:53+05:30 aquib N: status: approved -> in_progress — Working on it
2026-11-23T17:50:53+05:30 aquib N: Built, not committed. Stopped screen reads failure {cause, clipsAffected, retryable, message}: headline per cause ('2 shots couldn't be filmed', 'Out of video time'...), server's sentence under it, retry only when retryable (refused -> 'Film those shots again'), Delete project with a confirm (server stops the render, JET-388). retry.ts: render_limit/capacity/renders_off final on code (check:retry). Ready keeps the allowance from /estimate: summary '27s · up to $3.80 · 2:10 left this week', typical price per tier, Film now and Preview disabled with a note when the video is longer than what is left.
