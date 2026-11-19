---
id: JET-363
title: Release: cap paid song renders per user — render, re-render and fix have no limit today
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T12:27:08+05:30
updated: 2026-11-19T12:27:08+05:30
decisions: 
---

## Request

Put a per-user limit on the music-video routes that spend money: POST /:id/render, clip rerender (one and many), clips/fix and edits/apply.

## Understanding

generationLimiter (rolling 30 days, UserGenerationQuota) guards the old video/image/ai/jobs routes but none of musicVideoV1.routes.ts. One account can start unlimited renders, each a few dollars. Assumptions: (1) the unit is rendered seconds of video, not render count, because a 30s hook and a 4-minute song cost very different amounts; (2) re-renders and fixes count against the same budget by their clip seconds; (3) dev machines keep the existing bypass; (4) the number lives in flags.ts (no env vars). I am guessing the launch number — you set it.

## Plan

1. Add a 'render' type to generationLimiter, counted in clip seconds, limit in flags.limits.
2. Check it before render/rerender/fix/apply spend; refuse with 429 + code 'render_limit' and the seconds left.
3. Record usage when clips are actually generated, not when a render is requested (a failed render costs nothing).
4. GET the remaining budget on the existing estimate response so the app can show it.
5. Tests: over the cap is refused, failed render refunds, dev bypass.

## Reason

Release blocker: unbounded spend per account.

## Related files

src/middleware/generationLimiter.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/config/flags.ts

## Acceptance criteria

A user past the limit gets 429 render_limit on render/rerender/fix; a failed render does not use budget.

## Test steps

—

## Thread
2026-11-19T12:27:08+05:30 aquib N: created ticket, status: - -> open
2026-11-19T13:31:16+05:30 aquib N: Folded into JET-372 A5: the unit is rendered seconds per rolling 7 days, the default allowance comes from PostHog's launch-limits payload, plus a global daily spend breaker (503 capacity). Build once, under JET-372, if you approve that; otherwise this request stands alone.
