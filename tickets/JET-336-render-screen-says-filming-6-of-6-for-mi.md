---
id: JET-336
title: Render screen says 'filming 6 of 6' for minutes while the takes are only being checked
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-17T17:13:21+05:30
updated: 2026-11-17T17:14:30+05:30
decisions: 
---

## Request

Once every shot has landed, switch the render's stage to 'checking' so the app narrates the quality pass instead of looking frozen on 'filming N of N'.

## Understanding

Seen on mvr_1794914282826_5cab2c68: all 6 shots landed, then ~2 min of seam re-take (shot 6) and middle-of-shot checks ran inside the filming phase, so status stayed rendering/stage filming. setPhase('verifying') -> stage 'checking' only happens in the later sweep, which finds nothing on a normal run. Assumption: the app already words the 'checking' stage (it is in RENDER_STAGES_V1); no counts are needed for it.

## Plan

1. In renderClipsV1, after a shot lands, if no shot is left to generate, set stage 'checking'.
2. Test: stageSummaryV1 for a rendering plan with stage checking returns checking.

## Reason

Looks stuck to the person watching; they asked why it was not stitching.

## Related files

src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

During a render, once N of N shots are in, the poll shows stage 'checking' until stitching starts.

## Test steps

1. Start a standard or hero render and watch the poll (or the render screen).
2. When the last shot lands (N of N), `stage` changes to `checking` (app: checking, not "filming N of N") until status becomes `stitching`.
3. A render with a seam re-take on its last shot still shows `checking` during that re-take.

## Thread
2026-11-17T17:13:21+05:30 aquib N: created ticket, status: - -> open
2026-11-17T17:14:04+05:30 aquib N: status: open -> approved
2026-11-17T17:14:29+05:30 aquib N: status: approved -> in_progress
2026-11-17T17:14:30+05:30 aquib N: status: in_progress -> review — Built (uncommitted). Tests green except the pre-existing captchaBypass failure.
