---
id: JET-301
title: Let the creator type a shot's prompt before approving, and re-render one finished shot with new words
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T21:05:23+05:30
updated: 2026-11-10T21:05:23+05:30
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

—

## Thread
2026-11-10T21:05:23+05:30 aquib N: created ticket, status: - -> open
