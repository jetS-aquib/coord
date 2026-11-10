# music-jetkreate-backend — aquib N

- **Current task:** idle. Committed today: JET-279 b4cabd5, 281 08361a0, 282 d3f8fc7, 283 69734c5, 284 09271d5, 286 088f3e3, 298 de78ab3, 296 0b818c8 (all handed back for review; need `coord done`). Waiting on approval: JET-285 (story writer A/B), 287/295/297 are mobile's, 280 is video-processing's.
- **Status:** waiting on human
- **Blockers:** JET-262 is waiting on you: `coord done` once a flag-on vs flag-off render of the same song has been compared (its Test steps). D-075 was recorded empty by mistake and is superseded by D-076. JET-250 needs `coord done` after a blocked render is fixed through …/clips/fix end to end. JET-251 (mobile fix screen) needs `coord approve`, and is now unblocked. JET-249 needs `coord done` once a pause-then-instant-resume has been watched end to end. THE BOARD IS NOT SYNCING FROM THIS MACHINE — `.coord` push fails with `remote: error: inflate: data stream error (invalid distance too far back)`, 4 times since 23:10 on 2026-11-03. Nothing filed here reaches anyone until it is fixed, and that includes JET-242's review and D-067. `coord sync --resolve`, or the manual push in `coord fix`; it looks like a corrupt object on the remote, so do not force it. JET-242 needs `coord done` once a render is paused and resumed end to end. JET-243 needs `coord done` once demo, standard and hero have each rendered the same song — and read its thread first: the tiers do NOT differ in model, which half of its "done when" asked for. JET-244 stays OPEN after today — attestation is still unbuilt and the flag must be deleted, not just unset, before public launch (D-065). JET-246 needs `coord approve` — it is theirs to fix and the render that found it is still stitching. JET-245 needs `coord approve` — it is the seam threshold, and it should not start until two or three more 16:9 renders exist. JET-241 is mine to report and yours to close — `coord no 241`, the provider refuses 1:1 (D-064). JET-240 needs `coord done` once a gemini render is watched end to end. JET-232 is only now testable end to end: re-check a short portrait render before closing it. Two commits unpushed. JET-241/242/243 from mobile need `coord approve`. JET-232/233 need `coord done` (their halves landed; ours is now built too). JET-234 is mobile's to start — one line unblocks every render. 9.2 is the next real gap: generation still draws 16:9 clips whatever the frame says, so a portrait master is padded rather than composed. JET-225/226/227/231 need `coord done`. JET-228/229 need `coord approve`. Git hooks still not installed — `coord devsetup --hooks`.
- **Last updated:** 2026-11-10T19:00:00+05:30

## Handoff notes

### 2026-11-10T19:00

Worked the audit requests one at a time, each committed after review: JET-279 (one Gemini call gate: lane caps, 429 waits, timeouts; flags moved to src/config/flags.ts, D-078), 281 (render lease, restart reclaim, durable URLs), 282 (no mouthing on performance shots), 283 (planning timing study: thinking was 55-65% of planning), 284 (LOW thinking on planning, 84s to 38s; checks no longer hold video slots), 286 (failure object per missing shot, fix redraws the changed shot's still), 298 (still check LOW, clip check stays default; checks fail 90%/81% of stills/clips on noise kinds), 296 (stills and shots overlap). Filed mobile JET-295, 297 (with notes), 287 (note with field names). Next: JET-285 once approved; possibly a request to stop asking the noise questions in the vision checks. Board still not pushing (owner knows).

### 2026-11-10T02:00

Audit (architect + PM) of v1 orchestration and v2 stitch; plan at ~/.claude/plans/pasted-content-id-8009-i-want-jazzy-dolphin.md. Filed JET-279 (cross-render limiter + timeouts), 280 (stitch lanes, transcript lock; to video-processing), 281 (restart lease), 282 (no mouthing on performance shots), 283 (R&D planning timings), 284 (planning speed-up, after 283), 285 (R&D story-writer A/B, after 283), 286 (failure transparency + fix bugs), 287 (mobile fix screen, after 286), 288 (cultural grounding), 289 (regional directors, after 288), 290 (R&D one-encode stitch, after JET-276 + 280), 291 (overlay captions, after 290), 292 (R&D Omni 1.2 + 15s, before 2026-12-03), 293 (mobile storyboard-first, after 286), 294 (R&D lip sync, last). Note added to JET-275 (Omni reference_to_video, 6 images). Constraints: monolith on 1-2 instances, Google-only models for now, keep fields provider-neutral. Board still not pushing; nothing reaches anyone until fixed.

### 2026-11-09T23:35:15+05:30

Session ended while on JET-262. Touched: src/services/render/renderCostV1.ts, api-music-videos.md. Nothing committed. (written automatically — no one said what is next)

### 2026-11-09T01:10:07+05:30

Session ended while on JET-262. Touched: src/models/LyricsEditV1.ts, src/services/render/lyricsEditV1.ts, src/services/render/lyricsEditV1.test.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-11-06T16:35

**JET-262 built (D-076), uncommitted.** New `scriptV1.ts`: `generateScriptV1` sees every
lyric line with its time and each section's energy, returns premise / turnIndex / scenes
(each hung on a sung `lyricHook`), one retry, finishReason checked. `generateTreatmentV1`
takes `script`; its prompt is byte-identical without one; `withScriptV1` puts the scenes in
`beats`. Shot list beats carry the hook line. Plates: `castSheetPromptV1` (people only) +
`renderLocationPlatesV1` (one per unique `environment`, stored as `locationPlates[]`);
anchors pass the location plate as the scene reference and the cast sheet as a character
reference. Next: render one song flags off, then on, and compare. Watch whether a night
section drifts toward day against its location plate.

### 2026-11-05T13:58:16+05:30

Session ended while on JET-252. Touched: src/modules/video/jobWaiter.test.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-11-05T13:40:41+05:30

Session ended while on JET-252. Touched: theme.ts, ui.tsx, Opening.tsx, Planning.tsx, Rendering.tsx, Stitching.tsx, Explainer.tsx, Root.tsx. Nothing committed. (written automatically — no one said what is next)

### 2026-11-04T13:30

**JET-250 built (D-070).** `refusal { cause, suggestedPrompt }` on each refused clip,
set by `suggestFixesV1` at the blocked gate — one call over every refused shot that
still lacks a suggestion, via `suggestRefusalFixesV1` in promptSafetyV1.ts (its LLM
call is now shared with sanitizePromptsV1 through `askForRewritesV1`). `fixClipsV1` +
`POST …/clips/fix` take many {index, prompt}, validated by the pure `clipFixesProblemV1`.
Known limit: the rewrite sees the clip's prompt, not the look bible/cast it was wrapped
in, so a refusal caused by a cast description will be refused again.

### 2026-11-04T12:40

**Filed JET-250 (backend) and JET-251 (mobile) for refused shots.** Already built: a
content refusal marks the clip `refused` with one of three canned sentences, the render
goes `blocked`, and `…/clips/:idx/rerender` takes a new prompt — one shot at a time,
locking the render and re-stitching after each. Missing: a cause key, a suggested
rewrite (reuse `sanitizePromptsV1` once over all refused prompts at the blocked gate,
fail soft), and `POST …/clips/fix` taking several {index, prompt} at once. Mobile's
screen is built on those; it must not start before 250 is done.

### 2026-11-04T12:10

**JET-249: resume is accepted the moment a render stops, and the run that is still
draining hands over when it exits.** The bug was the order of two questions in
`resumeRenderV1`: "is a run alive?" was asked before "is this a stopped status?", so a
paused render whose in-flight clips were still landing got "this one is paused" against
a payload that had just said resumable. Status is asked first now (`resumeDecisionV1`,
pure and tested), and a live run means "queue it", not "refuse it".

**Status stays `paused` while it drains, and that is the part not to "simplify".**
Setting `queued` immediately makes the old run's next `stoppedSince()` say "not
stopped" with the pending clips already skipped, and it walks on to the completeness
gate and blocks the song. The hand-over is in `runPlanV1`'s `finally`, after `running`
is cleared. `resumeQueued` on the payload is what lets a client show the in-between.

**In-process, like `running` itself.** A restart mid-drain loses the queued resume and
the render stays paused — honest, one more tap. A cancel in the window withdraws it.

### 2026-11-04T00:45

**The cost estimate was the clips and nothing else, and it was quoted as the whole
bill.** `estimateRenderCostV1` is seconds of video times a price per second. It never
counted the 32 anchor frames, the reference plate or the cast portraits — about $1.21 a
song at $0.0336 an image — nor the 3 text calls, nor the 63 vision calls. The clips are
95% of a render, which is exactly why one line passed for the whole thing for months.

**What replaced it.** `renderCostV1(plan)` in services/render/renderCostV1.ts returns
one line per thing a render buys, each stating where its number comes from:
`published` (a provider rate times a count we know — clips and stills, the only lines
in the totals), `metered` (real per-call costs recorded in GenerationLog but priced per
token, so reported as exact call counts with no dollar figure), `ours`
(video-processing-backend does the song read, transcription, seam comparisons and the
stitch — no per-render bill). `estimatedCostUsd` is now the floor of the published
lines, `costCeilingUsd` the same with every re-render and redraw the tier allows, and
the call sheet carries the itemisation. D-069. 31-clip song: demo $26.01 flat, standard
$26.01-31.84, hero $26.01-39.04.

**Why the metered lines are not estimated.** Putting a plausible figure on a per-token
call would be the same mistake one layer down — a treatment call on a long song costs
several times one on a short song. The counts are exact because a count is knowable.

**The gap worth closing next: we cannot reconcile an estimate against an actual.**
`tokenLogger` writes every call's real cost to `GenerationLog` with the fn name and the
userId, but no jobId, so no render's actual spend can be summed. Summing by userId over
the render's own createdAt-to-completedAt window would answer it without touching a
single call site, and it is the only way the metered lines ever get priced. Not filed —
tell me and I will.

**`renderCostCeilingV1` is deleted.** It priced clips only, and two ways to compute
money is how two screens come to disagree.

### 2026-11-04T00:05

**JET-243: a tier buys checking and re-shooting. It cannot buy a cheaper model, and
that is the half to read before closing it.** `tier: demo | standard | hero` on the
render body, resolved in `RENDER_TIERS_V1` (config/videoModelsV1.ts) to a model, a
re-render budget and whether the frame gate and the clip check run at all. Stored on
the plan, echoed on the state payload and the call sheet. D-068.

**Why the model does not change.** `omni` is the only model the v1 pipeline can
render — `generateClipV1` speaks the Interactions API and `startRenderV1` refuses every
BytePlus row with a ValidationError — so a tier pointed at `seedance-1-5-pro` would 400
every render on that tier. That is also where the real money is: $0.052/s against
$0.10/s is half the price of the same song. The tier's `modelKey` is wired and read,
and a test asserts all three resolve a `google-omni` model, so the day a second
provider is renderable this is one row. Worth its own request; I noted it on JET-243
rather than filing it.

**The base cost of a song is not a choice.** Length times price per second, and the
length is the song's. So the only honest dial is what is spent checking the work and
doing it again — demo 0 re-renders and no checks, standard the fifth-of-the-song fuse
the pipeline already used, hero half. Reported as `estimatedCostUsd` (floor, nothing
re-shot) and `costCeilingUsd` (the most the budget can add): 31 clips of 8s is $24.80
flat on demo, $24.80-30.40 on standard, $24.80-37.60 on hero. Both are arithmetic over
a plan that already exists, which is why they are allowed on the call sheet at the
review gate.

**Two compatibility rules, both deliberate.** An absent `tier` takes standard's spend
caps but still takes its MODEL from the project record — otherwise a project storing a
BytePlus model would quietly start rendering on omni instead of erroring as it does
today. And `RENDER_FRAME_GATE` / `RENDER_CLIP_CHECK` stay the deployment's kill switch:
a check runs only when the deployment and the tier both allow it, which is why all four
call sites now go through `gateOnV1` / `clipCheckOnV1` rather than reading the env.

