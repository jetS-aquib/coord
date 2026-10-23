---
id: JET-198
title: No way to find an in-flight v1 render by project id, so a client that loses the jobId cannot re-attach
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-23T16:43:42+05:30
updated: 2026-10-23T16:43:42+05:30
decisions: 
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
