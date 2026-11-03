---
id: JET-241
title: A square render: the brief now asks the shape, and 1:1 is the one answer the render route refuses
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-03T15:19:35+05:30
updated: 2026-11-03T15:44:07+05:30
decisions: D-062
---

## Request

Accept aspectRatio '1:1' on the v1 render, and draw the stills and the clips square, so the brief can offer the third option Batch 9 names.

## Understanding

9.1 is now built on the mobile side: the brief carries the frame on the draft and sends it on both the project save and POST /api/v1/music-videos/:id/render, instead of the hardcoded ASPECT_RATIO = '9:16' this app has rendered every song with. Two of the plan's three values work end to end today and I verified each: the route validates z.enum(['16:9','9:16']); shotListV1 picks LADDER_9_16 or LADDER_16_9 and adds the middle-third framing note; renderOrchestratorV1 threads plan.aspectRatio into the anchor stills and the plate; omniVideoService passes aspect_ratio to the model. So mobile ships Tall and Wide and nothing is faked. '1:1' is refused by the route's enum, which is why the brief has two segments rather than three. Assumptions, each of which I would rather have corrected on this thread than guessed at: (1) a square ladder is a real third rung, not a fallback to 16:9, because the shot grammar for square is its own thing; (2) thumbnails.ts collapses every aspect that is not '9:16' to '16:9' (safeAspectRatio), so without a change there the stills and the plate come back landscape while the clips are square, which is worse than refusing the option; (3) the provider accepts aspect_ratio 1:1 at all, and that is worth one clip of spend to find out BEFORE any of the rest is written; (4) a square master also depends on JET-232 (explicit output frame on the stitch) and JET-233 (caption preview takes an aspect), both already filed against video-processing-backend, so this can be built and tested on the clips before the master is right. Also D8 and D-026 say the rate card owner confirms first: a 1:1 render reports a resolution string no rate card has seen, and the creator API treats resolution as rate-selecting. That is a person's call, not a code change.

## Plan

1. Spike it first, for about a dollar: one clip at aspect_ratio 1:1 through omniVideoService. If the provider refuses it, say so on this thread and close the ticket; mobile keeps two segments and the plan row gets the honest reason.
2. Widen the render route's zod enum, the plan field and the project field to include '1:1'.
3. A third rung in shotListV1's framing ladder for square, plus its own framing note. Not LADDER_16_9 with a different name.
4. thumbnails.ts: stop collapsing every non-'9:16' aspect to '16:9', so the anchor stills and the plate are drawn in the frame the clips are generated in.
5. Confirm with the rate card owner before the first paid square render (D-026).
6. Tell mobile. Our half is one more entry in the ASPECTS array and nothing else.

## Reason

The brief asks the shape now, and a selector that offers three answers where the server takes two is a control that returns a 400. The plan names 9:16, 1:1 and 16:9; two of them ship today.

## Related files

src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/shotListV1.ts, src/services/ai/thumbnails.ts, src/services/ai/omniVideoService.ts

## Acceptance criteria

A render started with aspectRatio '1:1' is accepted rather than 400ing; its anchor stills, its plate and its clips all come back square; the plan echoes '1:1'; and shotListV1 has a square ladder of its own rather than reusing the landscape one.

## Test steps

—

## Thread
2026-11-03T15:19:35+05:30 aquib N: created ticket, status: - -> open
2026-11-03T15:21:22+05:30 aquib N: linked decision D-062 (The brief offers Tall and Wide, not 1:1, and names the frame by where the video is going)
2026-11-03T15:44:07+05:30 aquib N: status: open -> approved
