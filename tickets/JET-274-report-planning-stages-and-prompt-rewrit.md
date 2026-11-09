---
id: JET-274
title: Report planning stages and prompt rewrites in the render state, so the app can narrate them
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-09T03:23:57+05:30
updated: 2026-11-09T23:31:16+05:30
decisions: D-077
---

## Request

Add to the render state payload: stage (reading_song|writing_shots|casting|drawing_frames|filming|checking|cutting|lyrics|polishing|uploading), stageCount/stageTotal where meaningful, and warnings (the sanitizePromptsV1 rewrites already stored on the plan) as { sceneIndex, reason, rewritten } on every state, not only on blocked.

## Understanding

Mobile will show one narration line ('Your editor is cutting to the beat', 'Writing the shot list, 38 shots') from a fixed copy deck keyed on stage, and narrate problems with their fix. The planning minute has no stages today, so the screen shows static copy. ASSUMPTIONS: (a) stage names are ours, mobile words them; (b) warnings are already computed (renderOrchestratorV1.ts:1518) and only need sending; (c) additive fields, old clients ignore them.

## Plan

1. Set plan.stage at each step of directV1 and the stitch.
2. Include stage, counts, warnings in summarizePlanV1.
3. Contract update.

## Reason

Users stay in the loop instead of watching static copy; problems are told plainly with their fix.

## Related files

src/services/render/renderOrchestratorV1.ts, contract

## Acceptance criteria

Polling a fresh render shows stage moving reading_song -> writing_shots -> filming -> cutting; a render with a rewritten prompt carries a warning in the state.

## Test steps

—

## Thread
2026-11-09T03:23:57+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
2026-11-09T23:31:16+05:30 aquib N: status: open -> approved
2026-11-10T00:41:56+05:30 aquib N: Mobile half built (uncommitted): features/create/narration.ts is the copy deck keyed on stage (all ten names, counts as 'x of y' or 'n shots'), checked by npm run check:narration. Working screen shows it while running, falls back to the old status wording when stage is absent or '' (older server), and still appends refused-shot counts. Warnings now read as one sentence ('2 shots named things the video model refuses, so we reworded them to keep their feel. Tap to see.') on the progress and blocked screens. The Library row still says 'Rendering': the list endpoint carries no render state.
