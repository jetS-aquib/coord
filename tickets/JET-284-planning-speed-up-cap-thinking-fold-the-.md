---
id: JET-284
title: Planning speed-up: cap thinking, fold the safety pass, start stills and clips as soon as their inputs exist
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T01:57:38+05:30
updated: 2026-11-10T15:02:11+05:30
decisions: 
---

## Request

Cut the planning and anchoring wait using what the timing study found.

## Understanding

Scope is decided by the timing study; the list in the plan is the candidate set. Quality must not drop: a planning-only diff of the shot lists on the same 3 songs.

## Plan

Depends on: JET-283.
1. thinkingConfig budget per call from the study.
2. Fold the safety pass into the shot-list call, or run it chunked in parallel.
3. Start the plate right after the treatment.
4. Start clip i as soon as stills i and i+1 exist.
5. Run vision checks outside the video lanes.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Serial: script, treatment, shot list, safety pass; plate after all four; every clip waits for every still (renderOrchestratorV1.ts:1794-1795) though clip i needs only stills i and i+1; vision checks and drift re-renders sit inside the 6 video lanes (:2359-2362).

## Related files

src/services/render/renderOrchestratorV1.ts, scriptV1.ts, treatmentV1.ts, shotListV1.ts, promptSafetyV1.ts

## Acceptance criteria

On the study's 3 songs, time from POST render to first clip started drops by the amount the study predicted, and the shot lists read as well as before.

## Test steps

1. `npx ts-node --transpile-only scripts/rnd/planningTimings.ts <projectId> --levels default` on a song already read: about 40s to the call sheet (it was 84-90s), every planning call shows 0 thinking tokens except the occasional few hundred.
2. Read the call sheet of that render: the story, cast and shots should read as well as before.
3. Full render (demo tier): the log's timing line at the end shows `concurrencyAchieved` above the old ~4.3, and the rendering phase is shorter than the 6-12 minutes recent renders took for a similar clip count. No more than 6 clips are ever "generating" at once in the app.
4. `npx vitest run src/services/render/renderV1.test.ts`: passes, including "slotsV1".

## Thread
2026-11-10T01:57:38+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:37:43+05:30 aquib N: status: open -> approved
2026-11-10T14:58:03+05:30 aquib N: status: approved -> in_progress
2026-11-10T15:02:11+05:30 aquib N: Built.
(1) Thinking per planning call (flags.render.thinking): LOW for casting, script, treatment, shot list; MINIMAL for the safety pass. Shot lists at default vs LOW read side by side on the Punjabi song: same story progression, same lane and lyric-mode obedience, no mouthing; LOW slightly more varied in light. Re-measured: 38s to the call sheet (was 84s).
(2) Video slots split from clip lanes: only generation holds one of the render's 6 video slots; lanes = 2 x slots (flags.render.clipLanesPerVideoSlot), so a finished clip's seam score (~6s) and clip check (~19s) overlap the next clip's generation. Measured cost of the old way on 5 recent renders: clipcheck 500-690s + seam 87-211s of work held inside the 6 lanes per render.
Not done, with reasons: folding the safety pass into the shot list (it is 1.8s at MINIMAL now, not worth the risk); drawing the plate during the shot list (~5s); overlapping anchoring with rendering (up to ~2 min per render, but the app shows anchoring and rendering as separate stages, so it needs an app change: worth its own request); thinking on the vision checks (gate.vision ~12s per still, clipcheck ~19s per clip at default thinking: the next biggest lever, but they are quality gates and need their own judged comparison).
2026-11-10T15:02:11+05:30 aquib N: status: in_progress -> review — Ready to review; uncommitted.
