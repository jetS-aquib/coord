---
id: JET-301
title: Let the creator type a shot's prompt before approving, and re-render one finished shot with new words
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T21:05:23+05:30
updated: 2026-11-10T21:18:10+05:30
decisions: 
---

## Request

Two routes for JET-293. (1) Before accept, change one call-sheet row's wording with text the creator typed (today PATCH /render/:jobId/clips/:index takes only shotSize, lane, musicalSeconds, and shots/:i/regenerate is an AI rewrite). (2) After a render, re-render ONE finished (done) shot with a new prompt, restitching after (today clips/fix only works on a blocked render and only for missing shots).

## Understanding

The app already has the plan screen (shots, cast stills, price, accept) and ShotOverride, so JET-293's mobile side is only the UI for these two edits, and it cannot be built without the routes. Assumptions: (a) a typed prompt replaces the row's action line the same way a regenerate would, and the server re-validates it for the provider's policy; (b) re-rendering a finished shot is charged like any shot, except that D-xxx on failed shots being free is still to be decided; (c) the 'fix' body shape { clips: [{ index, prompt }] } could be reused with a rule that allows done shots; I did not check how the stitch handles a replaced clip.

## Plan

1. Accept an optional prompt (or action line) on PATCH /render/:jobId/clips/:index, valid from review until accept; run the policy rewrite and return any warning.
2. Allow POST /render/:jobId/clips/fix, or a sibling route, on a completed render for one done shot: redraw its still from the new words, re-render it, restitch.
3. Say in the contract what it costs and what status the render shows meanwhile.
4. Mobile follows: an editable wording box on the plan screen, and a Reword and re-render action on a finished shot.

## Reason

Competitors plan free and storyboard-first. Today a creator can reshape a shot but not say what it should show before paying, and a shot that came out wrong after the render means a whole new render.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

A typed prompt on a reviewed plan shows in the call sheet and is what the shot is filmed with; one finished shot can be re-rendered with new words and the final video is restitched with it; neither touches the other shots.

## Test steps

1. Start a render with the call sheet on. `GET …/render/:jobId/call-sheet`: every row has `action`, e.g. "Mannu steps into the lane while Harleen glances back".
2. `PATCH …/render/:jobId/clips/2` with `{ "action": "Mannu and Harleen dance in the mandi as Gurdeep claps" }`: 200; the call sheet's row 2 now reads that, `overridden: true`. Other rows unchanged.
3. Accept and let it render: shot 2 is filmed with the new line (its still shows the three of them).
4. On the finished render, `POST …/clips/5/rerender` with `{ "action": "Rain on a window at night" }`: 202, status goes queued -> rendering -> stitching -> completed, and the new `finalVideoUrl` has the new shot 5; every other shot is the same as before.
5. PATCH on a render that is already filming answers 409 pointing at rerender.

## Thread
2026-11-10T21:05:23+05:30 aquib N: created ticket, status: - -> open
2026-11-10T21:12:52+05:30 aquib N: status: open -> approved
2026-11-10T21:18:10+05:30 aquib N: status: approved -> in_progress
2026-11-10T21:18:10+05:30 aquib N: Backend done. For mobile: (1) call-sheet rows now carry `action` (the shot's line, in cast names); pre-fill the edit box with it. (2) Before Accept: PATCH …/render/:jobId/clips/:idx { action } — free, 200, row comes back overridden; 409 once filming started. (3) After render: POST …/render/:jobId/clips/:idx/rerender { action } — 202, costs one still + one clip, render goes queued -> … -> completed with a new finalVideoUrl; show it like any running render. Names are fine in the typed text; the server maps them to the cast. A safety rewrite shows up in `warnings` for that shot. Contract updated (api-music-videos.md). Assumption (c) changed: not clips/fix (that stays for blocked renders) but the existing …/rerender, which already re-stitches.
2026-11-10T21:18:10+05:30 aquib N: status: in_progress -> review — Both routes built. Call-sheet edit checked live on a Punjabi plan (names -> tags, size/move/framing kept, still re-queued, override recorded). The finished-shot re-render was not run live because it spends a clip; it reuses the existing rerender path plus the JET-286 still redraw.
