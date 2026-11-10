---
id: JET-283
title: R&D: time every planning call, so we know why "writing the shot list" takes minutes
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-10T01:57:37+05:30
updated: 2026-11-10T14:55:08+05:30
decisions: 
---

## Request

Measure where planning time goes, call by call, with token counts, so the speed-up is aimed rather than guessed.

## Understanding

Planning-only harness, no video spend. Three fixed songs, one Punjabi. Assumption: usageMetadata (prompt, output, thoughts tokens) is available on each response.

## Plan

1. scripts/rnd/planningTimings.ts runs the planning chain for a song and prints per call: seconds, prompt/output/thinking tokens, attempts.
2. Run each song with thinking default, a low budget and off.
3. Note on this request: a table and what to change (feeds the speed-up request).

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). "Writing the shot list" covers four serial gemini-3.5-flash calls: script (up to 2 attempts x 5 tries), treatment, shot list, safety pass. None sets thinkingConfig or maxOutputTokens, so thinking tokens may dominate. The plate waits for all four though it needs only cast and treatment. Unmeasured: these are guesses until timed.

## Related files

scripts/rnd/planningTimings.ts

## Acceptance criteria

A table for 3 songs x 3 thinking settings with seconds and tokens per call, and a one-line recommendation per call.

## Test steps

1. Pick 1-3 local projects whose song was read before (open their brief once).
2. `npx ts-node --transpile-only scripts/rnd/planningTimings.ts <projectId> … [--levels default,LOW,MINIMAL]`
3. For each song and thinking level you get a table per call (seconds, slowest, waited, retries, prompt/output/thinking tokens) and a summary of seconds from POST render to the call sheet. Each run stops at the call sheet and is cancelled: no stills or clips are paid for.

## Thread
2026-11-10T01:57:37+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:37:39+05:30 aquib N: status: open -> approved
2026-11-10T14:55:07+05:30 aquib N: status: approved -> in_progress
2026-11-10T14:55:07+05:30 aquib N: RESULTS (2026-11-10, local, gemini-3.5-flash, 3 songs: Lutt Putt Gaya hi 223s/35 shots, Oye Hoye hi 145s/44 shots, Timeless en 256s/44 shots).
Seconds per call, default thinking -> LOW -> MINIMAL (thinking tokens at default):
- casting (autoGenerateCast): 7.6-11.8 -> 2.4-3.0 -> 2.6-2.9 (955-1863)
- script: 10.9-19.4 -> 6.0-6.6 -> 6.4-7.0 (804-2782)
- treatment: 13.2-15.2 -> 5.9-9.9 -> 6.3-7.2 (1193-1692)
- shot list: 21.7-32.1 -> 7.7-11.4 -> 8.1-11.7 (2612-5362)
- safety pass: 5.6-6.4 -> 1.6-3.6 -> 1.5-1.7 (837-982)
- planning-time images (plate + cast portraits, serial): ~20s for 4, ~9s for 2, unchanged by thinking.
POST render to call sheet: 84 / 90 / 71* s at default -> 40 / 40 / 42 at LOW -> 42 / 38 / 40 at MINIMAL.
*Timeless measured 233s at default, but 160s of that was a song RE-READ: its stored read was cache generation 2 and we want 3, so render start re-read the whole song synchronously. Planning itself was 71s.
Findings: (1) thinking is ~55-65% of planning time; LOW and MINIMAL are equally fast, output length unchanged. (2) No 429s, no retries, no queueing. (3) The four images at planning run one after another (~5s each). (4) A stale song read costs minutes at render start. (5) Thinking tokens are billed as output but tokenLogger's cost ignores them, so logged text cost is understated by roughly 2-3x at default.
Recommendation for JET-284: LOW for casting, script, treatment and shot list (keeps some reasoning where a call wants it; same speed as MINIMAL here), MINIMAL for the safety pass; accept only after a side-by-side read of the shot lists at default vs LOW on these 3 songs. Then: draw plate and portraits in parallel; start the plate after the treatment. Separately worth a request: count thinking tokens in logged cost; and decide whether a stale song read should block a render (it now returns 202 reading_lyrics through the route, JET-279).
2026-11-10T14:55:08+05:30 aquib N: status: in_progress -> review — Results in the thread; script uncommitted.
