---
id: JET-250
title: A refused shot says what was wrong but not what to write instead, and fixing five of them is five renders
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-04T13:20:50+05:30
updated: 2026-11-04T13:20:50+05:30
decisions: 
---

## Request

When the video provider refuses a shot for a reason a prompt change can fix, tell the person what caused it and suggest a rewrite they can accept or edit. Then let them fix all the refused shots in one go, re-render only those, and carry on to the stitch as usual.

## Understanding

1. 'Fixable' means the provider refused on content grounds (isPolicyRejectionV1) and the no-anchor salvage also failed — status 'refused'. A plain 'failed' (timeouts, 5xx) is NOT in scope; resume already retries those.
2. The suggested rewrite reuses the existing prompt-safety pass (sanitizePromptsV1, one text call), run once over ALL refused prompts when the render goes blocked, not once per shot. Assumption: if that call fails or returns nothing for a shot, the shot still shows its cause with suggestedPrompt null — the suggestion is help, never a gate.
3. The cause is a short machine key (real-person | copyright | content) alongside the existing human sentence in error, so mobile can pick an icon/copy without parsing English.
4. Batch fix: one call carries {index, prompt} for each shot being changed. It sets those prompts, marks them pending and resumes the render. Only those shots render, then the usual seam checks and stitch run. Shots not in the list stay refused, and the render goes blocked again if any remain.
5. Assumption: a shot the person resubmits with the SAME prompt is allowed (they may want to retry), but costs a clip like any other.
6. Cost: each re-rendered shot is one clip at the model's per-second price; the suggestion is one metered text call per blocked render.

## Plan

1. RenderClipV1 gains refusal: { cause, suggestedPrompt | null } (schema + type).
2. In gateOnCompletenessV1, before going blocked, run sanitizePromptsV1 over the refused prompts and store each suggestion; fail soft.
3. refusalReasonV1 also returns the cause key; set it where the clip is marked refused.
4. New POST /render/:jobId/clips/fix { clips: [{ index, prompt }] } → fixRefusedClipsV1: 409 unless blocked and not running; validate indexes are refused/failed; set prompts, mark pending, clear refusal; status queued; kick. Runs through the normal pipeline so stitch follows.
5. Summary + clip payload expose refusal; contract api-music-videos.md documents both.
6. Pure tests: cause classification, fix-input validation (unknown index, non-refused index, empty list).

## Reason

Today a refused shot gets one of three canned sentences (real person / copyright / content) and no suggestion, so the person has to guess what to change. And POST …/clips/:idx/rerender takes one shot and locks the render while it runs, so a render with 5 refused shots needs 5 sequential round trips and re-stitches the song after each one. Mobile wants an error screen that lists the refused shots with cause and suggested fix (filed alongside as the mobile half).

## Related files

src/models/RenderPlanV1.ts, src/services/render/renderOrchestratorV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/services/render/renderV1.test.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

A blocked render's poll lists each refused shot with a cause key, the human sentence and a suggested prompt (or null). One POST to …/clips/fix with two edited prompts re-renders exactly those two shots, then stitches, without touching any done shot. Fixing on a render that is not blocked is a 409.

## Test steps

1. Start a render with a scene that names a real celebrity (e.g. 'Taylor Swift singing on stage') and let it run.
2. When it ends blocked, GET the render: that shot shows state refused, refusal.cause 'real-person', and a refusal.suggestedPrompt describing a kind of person instead.
3. POST /api/v1/music-videos/render/<jobId>/clips/fix with {clips:[{index:<n>, prompt:<the suggestion>}]} — expect 202.
4. Poll: only shot n goes generating; every other shot keeps its videoUrl; the render reaches completed with a finalVideoUrl.
5. POST the same fix call on a completed render — expect 409.

## Thread
2026-11-04T13:20:50+05:30 aquib N: created ticket, status: - -> open
