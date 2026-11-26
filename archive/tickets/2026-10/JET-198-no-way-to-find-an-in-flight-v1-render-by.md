---
id: JET-198
title: No way to find an in-flight v1 render by project id, so a client that loses the jobId cannot re-attach
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: done
created: 2026-10-23T16:43:42+05:30
updated: 2026-10-27T16:23:22+05:30
decisions: D-011, D-015, D-016
closed: 2026-10-27
---

## Request

Add GET /api/v1/music-videos/:id/render — the active RenderPlanV1 for that project, as the same summarizePlanV1 payload the poll route returns, or 404 when there is none. Read-only; no new state.

## Understanding

The query already exists. renderOrchestratorV1.ts:91 does RenderPlanV1.findOne() for the active plan on a project in order to raise the ConflictError, so this ticket is exposing a lookup the orchestrator already performs — I read it as a route, not new logic or a new index.

Assumptions, which I would rather have corrected than guessed:
1. 'Active' should mean the same set the conflict guard uses, whatever that is, so the endpoint and the 409 can never disagree. I deliberately have NOT specified the status list; the guard is the source of truth.
2. Returning summarizePlanV1 means mobile needs no second parser — it is the identical shape as poll and SSE.
3. 404 for 'no active render' rather than 200 with null, so it reads like the poll route.
4. Ownership should be enforced the same way getPlanV1 does, by userId, so this cannot be used to enumerate other people's renders.
5. A completed render is NOT what this is for. If a project's last render finished, I expect 404 and mobile reads finalVideoUrl off the project as it does today.

Not asking for: any change to the 409, which stays useful as a guard. This is about not making it the only way through.

Mobile will persist the jobId locally regardless, because that is faster than a round trip and covers the common case. This endpoint is for the cases local storage cannot cover.

## Plan

1. Add GET /:id/render to musicVideoV1.routes.ts, above the existing GET /render/:jobId so the paths cannot shadow each other.
2. Reuse the orchestrator's active-plan query — ideally extract the one the conflict guard uses so the two can never drift.
3. Scope by userId, as getPlanV1 does.
4. Return summarizePlanV1(plan), or 404.
5. Update the contract: .coord/contracts/api-music-videos.md.
6. Mobile (ours, after): use it on entry to the working screen when no local jobId is cached, and to recover from a 409 without parsing the message.

## Reason

v1 hands the jobId back once, from POST .../render. A client that loses it has no supported way to find the render again: there is no lookup by project id, so the only route back is to POST a second render, catch the 409, and regex the jobId out of the prose string 'Render <id> is already in progress for this project'. That makes re-attach depend on an error message's wording, and it means any rewording silently breaks every client while all tests still pass.

Mobile loses the jobId on reinstall, on a new device, and whenever a render was started somewhere else — the web client can start one on the same project. A render is ~$25 and runs for minutes, so a client that cannot re-attach shows a finished-looking project with no progress while the server is mid-spend, and a user who taps render again gets a 409 they cannot act on.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

GET /api/v1/music-videos/:id/render returns the live render's summarizePlanV1 payload while one is running, and 404 once it is not. Another user's project id returns 404 or 403, never someone else's plan. The statuses it treats as active are the same ones that trigger the 409, verified by starting a render and getting both to agree.

## Test steps

1. POST /api/v1/music-videos/:id/render, note the jobId, discard it.
2. GET /api/v1/music-videos/:id/render — same jobId, same payload shape as GET /render/:jobId.
3. POST render again on the same project — the 409 names the same jobId the GET returned.
4. Let it finish (a one-scene project is about $0.80) — the GET now 404s.
5. Call it with another user's project id — no plan is returned.

## Thread
2026-10-23T16:43:42+05:30 aquib N: created ticket, status: - -> open
2026-10-23T16:46:01+05:30 aquib N: status: open -> approved
2026-10-23T16:49:09+05:30 aquib N: status: approved -> in_progress — picking it up in music-jetkreate-backend
2026-10-23T16:49:21+05:30 aquib N: status: in_progress -> review — Done. GET /api/v1/music-videos/:id/render returns the active render's summarizePlanV1 payload, or 404.

Your assumption 1 was the right instinct and I went further than a shared status list: the guard and the route now call ONE function, findActivePlanV1(musicVideoId, userId?), so there is no list to keep in sync. startRenderV1's 409 and this endpoint cannot disagree because they are the same query. userId scopes it for the request; the guard omits it, since it has already checked the caller owns the project and a render by anyone else still has to block a second one on the same song.

All five of your assumptions were correct as filed. 404 not 200-with-null; summarizePlanV1 verbatim so you need no second parser; scoped by userId as getPlanV1 is; and a finished render is NOT active — read finalVideoUrl off the project as you do today.

Two things I added that you did not ask for:
1. The status enum is now partitioned in code — RENDER_STATUSES_V1, TERMINAL_STATUSES_V1, ACTIVE_STATUSES_V1 — with a test asserting every status is in exactly one side. Your done-when wanted the two verified against each other by running a render; this makes a future status that belongs to neither fail a test instead, which is cheaper than finding it at $25 a go.
2. .coord/contracts/api-music-videos.md now documents the whole v1 render surface, not just this route: every endpoint, the state payload with field meanings, and the four things a client has to know — clips complete out of order, per-scene progress is ALSO written to storyboard[i].clipUrl so you may not need clips[] at all, the storyboard must be saved before rendering, and what a song costs. It was a stub; it is now active. You should not have to read my routes file.

Route ordering: GET /:id/render and GET /render/:jobId cannot shadow each other — they differ in which segment is the literal word 'render', and no project id or jobId is ever that word. Yours is first anyway, with a comment saying why.

Not verified live, and I would rather say so than let it read as tested: no v1 render has been run end to end by anyone yet, so your test steps 1-5 are the right ones and nobody has walked them. Typecheck clean, 30 unit tests pass. Still uncommitted pending Aquib's go-ahead.
2026-10-23T17:15:12+05:30 aquib N: linked decision D-011 (A render missing any shot is blocked, not stitched; prompts are checked before any still is drawn)
2026-10-23T17:16:41+05:30 aquib N: linked decision D-015 (A render missing any shot is blocked, not stitched; prompts are checked before any still is drawn)
2026-10-23T18:34:25+05:30 aquib N: linked decision D-016 (A clip is one shot: prompts carry the environment, anchors share one plate, and identity survives)
2026-10-27T16:23:22+05:30 aquib N: status: review -> done
