# music-jetkreate-backend — aquib N

- **Current task:** v1 render cohesion — JET-199/200 verified on a real render; four causes of character/lighting drift identified; inline seam verification and per-clip state built
- **Status:** waiting on human
- **Blockers:** JET-202 unverified (logs lost); JET-203 and JET-201 still need their own renders
- **Last updated:** 2026-10-26T18:38:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-10-29T11:53:49+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:51:41+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:49:10+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:37:09+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T11:18:50+05:30

Session ended while on JET-214. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-27T16:33:44+05:30

Session ended while on JET-202. Touched: artifact-832053e4-1793088363-0546.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T18:38:00+05:30

First real render on the new code, and the diagnosis that came out of watching it.

**mvr_1793003811615, 26 Oct, RENDER_PLATE_SPRITE=0, lyrics off.** 430s wall against
713/770/765/739s for the four comparable renders before it — about 4.7 minutes saved.
3 clips re-rendered against 31/31/31/29. Seam median 5.86, max 10.95, one clip over
the 9.0 threshold; the old 4.0 would have re-rendered 30 of 31 again. JET-199 and
JET-200 both work.

**But the song is visibly incoherent** — characters change between shots, lighting
flips bright to dark. That is NOT in conflict with the good scores, and the reason
matters: the seam check measures a clip against ITS OWN anchors and never compares
anchor N to anchor N+1. Anchors that disagree with each other produce low seam scores
and an incoherent song. The check is structurally blind to it.

Four causes, all confirmed in the plan data (D-023 has the detail):
1. selectedCharacters and characterImageUrls are both EMPTY. Three characters held
   together by text description alone, redrawn 32 times. Text cannot pin a face.
2. The plate was anchor 0 — "low angle on wet asphalt as a dark car pulls in". A car.
   No cast information at all. This is what JET-203's sprite exists to fix and it was
   switched off for this render.
3. DEFAULT_IMAGE_MODEL is nano-banana-2-lite, the cheapest tier, drawing the 32 images
   that carry continuity for the entire song.
4. Each anchor prompt is ~1100 chars of which ~800 is cast description REPEATED TWICE
   — once inlined by substituteImageTagsV1 into the shot line, once again by
   castBlockV1. The shot and the location are buried. This one is a plain bug.

The storyboard itself is fine: all 31 environments say night/neon/fluorescent, so the
model is inventing daylight against the text.

**Dev's call on the model tier: leave lite wired, record the ceiling.** D-023. Not
gemini-2.5-flash-image — it retires 2027-03-15, so the successor should be chosen
fresh. Also noted as a ponytail comment next to IMAGE_CONCURRENCY_V1.

**Built this sitting (D-024):**
- Seams are measured as each clip lands, not in a phase afterwards. verifyClipV1 is
  the single place a seam is measured and acted on, called inline and again by a
  sweep. verifySeamsV1 is KEPT as that sweep — a resumed render holds clips that are
  already done and were never scored, and the clip loop skips them precisely because
  they are done. Deleting it would be the quiet kind of bug.
- One shared mutable RerenderBudgetV1 across both paths, spent first-come instead of
  worst-N. That is the one property given up; the worst N cannot be known without the
  barrier that is being removed, and on a 31-clip song the budget of 7 rarely binds.
- clip.seamScores keeps EVERY measurement including discarded takes, so "does
  re-rendering actually help" is answerable from data next time. Twice now the answer
  has been no.
- Clip statuses gained 'generating' and 'regenerating', checkpointed BEFORE the
  generation so a watcher sees which shot is being worked on.
- clipStateV1 derives one label for clients: queued/generating/regenerating/checking/
  finalized/failed/refused. Derived in one place on purpose — 'done' is not finished,
  a done clip can still be re-rendered when its seam is measured.
- summarizePlanV1 now sends sceneIndex, state, seamScores and attempts per clip.

**JET-204 filed to music-jetkreate-mobile** for the corner icons. Needs approving.

**Still to do:**
- JET-203 sprite comparison — same storyboard, RENDER_PLATE_SPRITE unset. Cause 2.
- The prompt duplication in cause 4. Not ticketed yet; it is our own bug, in
  renderPromptsV1 (substituteImageTagsV1 + castBlockV1 both spending the cast).
- Reference images for the cast — a product question, not a code one.
- JET-201 untested; needs a song with showLyrics on.
- JET-202 still unverified: the terminal scrollback was lost before anyone could see
  whether it posted segments or fell back to the single call. Watch for "stitching N
  segments of ..." on the next render.

Uncommitted. Nothing has been committed or pushed.

### 2026-10-26T14:01:47+05:30

Took JET-199 to JET-203 in one sitting. All five are implemented and uncommitted.
video-processing-backend shipped the JET-201/202 endpoints mid-session and wrote the
contracts (video-transcription.md, video-segments.md, D-021, D-022), so the two I had
parked got built too.

**JET-199 — anchors fan out.** renderAnchorsV1 was a for-loop with an await in it, left
serial when the topology became a star. Only the plate is serial now; the rest go
through runCappedV1 at IMAGE_CONCURRENCY_V1 — its own env knob
(RENDER_IMAGE_CONCURRENCY), NOT plan.concurrency, which is the video provider's cap on
a different quota. Progress counts settled anchors instead of a loop index. The case
the old loop handled implicitly and the new one handles explicitly: if the first still
fails it keeps drawing serially until one succeeds, rather than fanning out with no
plate and drawing 32 unrelated places.

**JET-200 — the threshold was below the entire distribution.** Read the seamScores off
the five scored RenderPlanV1 documents: 132 clips, all post-re-render best-of-two,
nothing below 3.89, bodies 4.6-8.9, tails 9.8-67.9. The 2.1-3.3 band that 4.0 was set
against has never once been reached by a real clip, so every clip tripped it and five
consecutive renders each paid for a second full generation pass. SEAM_THRESHOLD_V1 =
9.0 (above every body's 8.93, below every tail's 9.81) plus rerenderBudgetV1 =
ceil(clips/5), worst first, warning loudly when it bites. D-018. The 132 scores are
now the test fixture, so the next person to move the constant has to move it against
data.

**JET-203 — plate is a drawn six-panel sheet.** platePromptV1 + renderPlateSpriteV1,
stored as plan.plateUrl so a resume keeps the same one, falling back to the old
first-anchor plate on any failure. thumbnails.ts untouched: its no-grids rule only
applies on the '## SCENE DESCRIPTION' branch, which the plate prompt does not take.
On by default, RENDER_PLATE_SPRITE=0 disables — deliberate, D-019, because the
acceptance test is a side-by-side and a flag defaulted off never gets rendered.

**JET-201 — transcription starts with the run.** prefetchTranscriptV1 fires at the top
of runPlanV1 behind showLyrics && audioUrl, unawaited, catch attached at creation so
the map entry cannot reject; awaited immediately before stitchPlanV1, where a missing
entry is a no-op. A resume in another process has no entry and the stitch transcribes
inline, as before. The non-obvious bug this closed: `language` must be the same value
on the prefetch and the stitch or Whisper runs twice, with the second on the critical
path. It was a literal 'auto' in stitchPlanV1; it is now LYRIC_LANGUAGE_V1 used by all
three call sites.

**JET-202 — scene-aligned segments.** segmentClipsV1 (pure, tested) groups consecutive
clips by sceneIndex: never splits a scene, never emits a one-clip segment, always
returns every clip in order. stitchInSegmentsV1 posts them in parallel, polls each,
then posts segment-concat with the job ids. Any failure falls back to the single call.
Narrowed on purpose and said so on the ticket: segments close AFTER verifySeamsV1, not
as each is verified, so they go out all at once. That buys the parallel encodes and the
free remux without touching the rendering or verifying loops; it does not buy the
overlap with generation. Interleaving means merging phases 2 and 3, worth maybe another
15s, marked in the code as the upgrade path.

**One open question on the board (JET-202).** segment-concat is extra="forbid" and its
contract says "the lyrics stitch request you send today" while showing camelCase
examples; the lyrics stitch itself is snake_case. I send
segments / audioUrl / showLyrics / language / lyricsDisplay / ...captionSettings.
If language or lyricsDisplay are wrong or absent there, every render quietly falls back
to the single call and we lose the feature with no error anyone would notice. Asked
them to name the accepted fields in the contract.

**What is next: one render, and it verifies all five.** Nothing here has run against a
live service. The order that keeps the measurements clean:

1. RENDER_PLATE_SPRITE=0, lyrics off — times JET-199's anchoring in isolation.
2. Same storyboard, sprite on — JET-203's side-by-side, and the seam scores move or
   they do not.
3. Either run: count re-rendered clips for JET-200, and watch the boundaries of clips
   scoring 4.6-8.9. If any of those is a visible jump cut, 9.0 is too high. That one is
   a judgement only a person can make, and the sheet for it is below.
4. Watch the log for "stitching N segments of ...". If every render says "segment
   stitching failed", that is the 422 above, not a real failure.
5. A song with showLyrics ON — none of the recent renders had it, so JET-201 is
   otherwise untested entirely.

Calibration sheet for step 3, from the 26 Oct render (mvr_1792997658858_74e370ce,
final at .../f0b56c3c39d04a1c9411e5042448a3fa/final.mp4): clips are 8s, so joins land
on every 8s mark. Scoring over 9.0 and therefore flagged: 01:20 (40.72) and 03:44
(11.28). The top of the accepted band is 00:08 (8.93), 00:48 (8.91) and 03:20 (8.51) —
if any of those three looks like a jump cut, 9.0 comes down to about 8.

Uncommitted. Nothing has been committed or pushed.

### 2026-10-26T13:05:08+05:30

**Everything is committed. Four commits on `features`, nothing left in the working tree.**

  4fe9af9  no-ticket: keep tests out of the build
  1f8118c  no-ticket: extract the last video frame losslessly
  df0cd41  JET-197: call video-processing-backend for frames
  cbab697  JET-198: anchors + parallel, refusals, consistency, recovery

The last one is a lump, deliberately and with a reason: Batch 3, the refusal work
(D-015), the consistency fixes (D-016) and render recovery all edit
`renderOrchestratorV1.ts`, and splitting one file across commits needs interactive
staging, which is not available here. The commit body enumerates each piece with its
decision id, and the decisions are the durable account.

Not pushed. Nobody asked.

THE ONE THING NOBODY HAS DONE YET: a render on this code. Every number that matters is
still unobserved — whether pins hold (seam scores should fall from 4.1-67.8 into 2-3),
whether a song finishes under ten minutes, whether the prompt check stops the refusals.
A one-scene project costs ~$0.80 and exercises every phase. Do that before trusting any
of it, and before mobile builds against `blocked`, `warnings` or `resumable`.

Mobile is behind the API in three places now: `blocked` (its copy still says declined
shots "will be skipped", which is no longer true), `warnings`, and `resumable`. The
hand-off prompt written earlier covers the first two and predates the third.

### 2026-10-24T15:24:53+05:30

**"Resume is not working" — diagnosed and fixed. The render had been CANCELLED, not
interrupted, and cancel was a dead end.**

What the logs showed: `GET /api/v1/music-videos/mv_1792759986023_8p6uo1/render` 404ing
on every poll. That was correct behaviour, and that was the bug. The plan
(`mvr_1792759993278_5cc95fbe`) was `status=cancelled` with **30 of 32 anchors and 8 of
31 clips already rendered**. `cancelled` is terminal, `findActivePlanV1` excludes
terminal, so the lookup returned 404 forever and every bit of that work was stranded.

I had given `blocked` three ways out and left `cancelled` and `failed` with none.

Fixed:
- `RESUMABLE_STATUSES_V1` = cancelled, failed, blocked. `isResumableV1(plan)` is true
  when one of those still has unfinished clips AND never produced a video.
- `POST /render/:jobId/resume` continues from the checkpoints. Clips marked `failed`
  get their attempts cleared so a resume is a fresh go, not an instant give-up.
- `GET /:id/render` now returns the running render OR the most recent resumable one,
  with `resumable` on the payload saying which. Running always wins.
- Starting a NEW render is still never refused because of a cancelled or failed one —
  somebody who stopped a render must not be trapped by it. Only in-progress and
  `blocked` refuse.

Verified against the real stranded plan: resumable=true, a resume renders 2 anchors +
23 clips for ~$18.40 against ~$24.80 to restart.

STILL OPEN, not fixed, worth knowing:
- `MusicVideo.status` stays `in_production` after a cancel, so the project reads as
  mid-render in any list view. Cosmetic but confusing; left alone because it is
  arguably correct while the render is resumable.
- Mobile has no resume affordance yet. It polls `GET /:id/render`, which now returns
  the stopped render instead of 404 — the app needs to read `resumable` and offer it.
  That is a mobile-side change; JET-198's hand-off prompt predates this field.

STILL NOT COMMITTED: everything since 6785ba5 — Batch 3, JET-197, JET-198, the refusal
work, the consistency fixes (D-016), and this.

### 2026-10-23T18:34:48+05:30

**Investigated why the first complete render looked inconsistent, found the cause, fixed
all five contributors. D-016. Verified by dry run against the real storyboard, no spend.**

THE FINDING, from the plan in Mongo plus the actual frames: every pin was ignored.
All 28 measurable clips scored above the 4.0 threshold — min 4.118, max 67.8, nothing
near the 2.1-3.3 band a held pin measures. Clip 1 was pinned to a blue classic car on
a lit forecourt and OPENED ON a black modern sedan in a dark car park. Confirmed by
eye, not inferred.

Cause: the clip prompt gave three orders at once — the storyboard said cut twice
("[Shot 1] -> [Shot 2] -> [Shot 3]"), my continuity line said never cut, and the pin
instruction said begin and end on exact frames. The model followed the longest and most
specific and treated the stills as references. Batch 1's 6/6 pin measurement was taken
with a SHORT prompt; it never tested one carrying a shot progression.

Fixed, in the order they matter:
1. A CLIP IS ONE SHOT. The progression collapses to the shot the clip opens on, and
   when both ends are pinned the prompt keeps only what MOVES — the stills already
   show the people, the place and the grade, so repeating them only competes with the
   pins. 99 words -> 48. The pin went from a third of the text to the majority.
2. `environment` is carried onto every clip and into every anchor. v1 read only
   `scene.prompt`, so environment/mood/style were dropped and 13 of 32 anchors had no
   place word at all while every scene carried one.
3. Anchors are a STAR on one establishing plate, not a 32-link chain. A chain copies
   its predecessor's errors and adds its own.
4. Identity survives: @imageN becomes a per-character description, from
   selectedCharacters or from `autoGenerateCast` — which already exists in v0's
   videoService and is IMPORTED, not modified. Three characters stay three.
5. A seam re-render now strips the prompt to the movement alone and KEEPS WHICHEVER
   TAKE LANDED CLOSER. The last render re-rendered 29 of 31 clips with identical
   inputs and failed every one — 60 generations for 31 clips, double the money, no
   change. Same lesson as refusals, finally applied to seams.

Dry run against the storyboard that failed: no-place anchors 13 -> 3, garbled
"the subjects, and the subject" 9 -> 0, stray style tails 0, three characters preserved.

Also fixed, unrelated and found while doing this: `npm run build` emitted test files
into dist/, and `npm test` then picked up the compiled copies and failed them for being
CommonJS. New `tsconfig.build.json` keeps tests out of the build; `tsconfig.json` still
includes them so `tsc --noEmit` keeps typechecking them. Do not "simplify" that back
into one file — excluding tests from tsconfig.json silently stops typechecking them.

WHAT IS STILL UNPROVEN: whether the pins now hold. Everything above is measured on
prompts and data, not on a render. The number to watch is the seam score — if the fix
worked, scores drop from 4.1-67.8 into the 2-3 range. One cheap render answers it.

A render was in flight during the investigation (mvr_1792759993278) on the OLD code.
Its output will still be wrong; ignore it.

STILL NOT COMMITTED: Batch 3, JET-197, JET-198, the refusal work, and all of this.

### 2026-10-23T17:17:23+05:30

**FIRST LIVE RENDER RAN. It failed, usefully. Everything below is measured, not theory.**

What happened: 20 of 31 clips came back `400 Input blocked: we can't create videos
with real people's names or likenesses`. The 11 that rendered were stitched anyway,
and the output holds a frozen frame for minutes against the full-length track.

THE MEASUREMENT THAT MATTERS, and the reason not to guess at this again: the refusal
fallback re-asked each clip with a prompt containing NO names — "continuous cinematic
motion between the provided frames" — and was refused with the IDENTICAL message, 20
times out of 20. Two calls, one carrying the original wording and one not, same
refusal. The only thing they shared was the two anchor stills. **The refusal is
image-side, not text-side.** The old fallback tested the wrong variable 20 times.

But anchors are generated FROM the storyboard prompts, so the likeness got into the
images through the text. That makes the prompt the root cause and the ONLY point where
it can be fixed — cleaning the text before any still is drawn prevents both; cleaning
it afterwards prevents neither.

Fixed (D-015):
- `src/services/render/promptSafetyV1.ts` (new) — one text-model call over the whole
  storyboard at PLAN time, before anchoring. Rewrites only provider-refusal causes,
  never mood, camera or structure. Discards a rewrite that drops >60% of a prompt.
  If the check itself fails, the render proceeds unchanged.
- A render finishing with ANY shot missing is now `blocked` and NOT stitched. A song
  with holes is not a shorter song; the old guard only checked "at least one clip".
- `blocked` is terminal for the workers but NOT finished: the project lookup still
  returns it and a new render on that project is refused, so a second render cannot
  quietly abandon the first one's spend. Nothing auto-resumes it.
- Three ways out, all explicit: rerender a clip WITH AN EDITED PROMPT (new `prompt`
  body field — without it a refused clip can never succeed), `POST .../stitch` to
  assemble the incomplete cut on purpose, or cancel.
- The fallback now drops the anchors and keeps the text — the variable the measurement
  points at. Unpinned, so cuts show; the seam check reports it.
- `warnings` in the payload lists what was rewritten. SHOW IT: a storyboard silently
  rewritten on someone's behalf is worse than the refusal it prevented.

MESS I MADE AND CLEANED UP: `coord decide` has no `--body` flag — it takes
`--context --options --decision --reason --consequences`. It ignored `--body` silently,
so D-007, D-008, D-009 and D-011 were recorded as EMPTY SHELLS with only titles. All
four re-recorded with content as D-012, D-013, D-014, D-015 and the empty ones
superseded; code comments repointed. D-006 was written by an earlier session and is
fine. If you record a decision, use the five flags, and check the file afterwards.

Also seen in the screenshots and NOT mine to fix: "Could not reach the media host" on
mobile — that is JET-194, already filed and still waiting.

STILL NOT COMMITTED: Batch 3, JET-197 integration, JET-198, and all of the above.

### 2026-10-23T16:49:39+05:30

**JET-198 done and handed back (`review`). Mobile asked for a way to find an in-flight
render by project id; it exists now.**

`GET /api/v1/music-videos/:id/render` -> the active plan's summarizePlanV1 payload, or
404. Without it a client that lost its jobId had to POST a second render and regex it
out of the 409's prose, which made re-attaching depend on an error message's wording.

The part worth remembering: the guard and the route share ONE query,
`findActivePlanV1(musicVideoId, userId?)`, so the 409 and the 404 cannot disagree.
There is no status list kept in two places. `userId` scopes it per request; the guard
omits it deliberately — it has already checked project ownership, and a render by
anyone else still has to block a second one on the same song.

Also done here, beyond what was asked:
- Statuses are now partitioned in code: `RENDER_STATUSES_V1` (the schema enum is built
  from it), `TERMINAL_STATUSES_V1`, `ACTIVE_STATUSES_V1`, with a test asserting every
  status is in exactly one side. A future status belonging to neither now fails a test
  rather than being found during a $25 render.
- `.coord/contracts/api-music-videos.md` went from stub to active and now documents
  the WHOLE v1 render surface: every endpoint, the state payload field by field, and
  the four things a client has to know. Other repos should not need to read our routes.

STILL TRUE AND STILL THE BIGGEST OPEN ITEM: no v1 render has been run end to end by
anyone. Everything across Batches 2 and 3, the JET-197 integration and this route is
typechecked and unit-tested (30 checks) and NOT ONE of the claims that matter —
resume, under-10-minute wall clock, seams in the 2.1-3.3 band, a song that actually
renders — has been observed. A one-scene project costs ~$0.80 and exercises every
phase; that is the cheapest way to turn all of it from "should" into "does".

NOT COMMITTED: Batch 3, the JET-197 integration, and JET-198. Three commits' worth
sitting in the working tree. Aquib has not given the word since `6785ba5`.

### 2026-10-23T15:09:28+05:30

**JET-197 landed and is integrated. No ffmpeg and no image processing left in this
repo's v1 path. Still uncommitted, still unverified by a live render.**

Their shapes are in `.coord/contracts/video-frames.md`; the choices are D-010.
Synchronous, not 202+poll. Frame comes back inline as `image_base64` + `mime_type`,
nothing stored — which maps straight onto our `{ data, mimeType }`.

Their one deviation was better than what we asked for: `frame-comparison` takes
`{ video_url, position, image_url }`, not two image URLs. Because extraction stores
nothing there is no URL for the side that came out of a video — and that shape is
exactly `seamScoreV1(videoUrl, position, anchorUrl)`, so scoring is ONE call and the
extract-upload-compare round trip never existed. Signature unchanged on our side.

What moved:
- `seamCheckV1.ts` lost its ffmpeg (`extractFrameV1`), its sharp (`toComparableFrameV1`)
  and `meanAbsoluteDifferenceV1`. The metric is theirs now — one definition of the
  number, on the side that owns media. We kept `SEAM_THRESHOLD_V1` (policy, not
  metric) and a test asserting it still sits in the measured band.
- The orchestrator's carry-forward fallback no longer calls `extractLastFrameOfVideo`.
- Two methods added to the EXISTING `src/modules/video/video-api.service.ts` rather
  than a new client, so the service assertion is minted in one place as it is for
  stitching. Nothing in v0 changed.
- Their greyscale is Rec.709 to match sharp, not OpenCV's Rec.601. Measured: that
  choice moves a real score by 0.16, the resampling kernel by 0.003. So our 4.0
  carries over unchanged — that is why it carries over, not luck.

Two known ceilings, neither blocking:
- The 2.1-3.3 MIDDLE of the seam band is still unconfirmed on real material. They
  verified 0 and 10+ synthetically and said so. Confirming it is OURS and needs the
  live render. Nobody should trust 4.0 blind until then.
- Anchor stills are written by `generateSceneImage` as WebP q82, so the image_url side
  of every comparison carries compression artefacts. The measurement stays fair (the
  model is pinned to the same compressed still it is scored against) but the pin is
  worse than it needs to be. If scores cluster near 4.0 instead of near 2-3, suspect
  this first. Marked with a `ponytail:` comment at `anchorFrameV1`. The fix means
  changing what `generateSceneImage` writes, which is shared with v0.

Also still true from earlier: `-lossless 1` in `services/ai/thumbnails.ts` is now
unrelated to v1 (nothing in v1 calls that extractor any more). It is kept because v0
feeds the same frames back to a model as start frames, so it fixes the same bug there.
One flag; revert it if touching that file is unwanted.

NOT COMMITTED: Batch 3 plus this integration. Aquib has not given the word.

### 2026-10-23T14:51:57+05:30

**Filed JET-197 to video-processing-backend. Nothing in this repo changes until it lands.**

Aquib's call: no ffmpeg in the Node backend. It belongs in video-processing-backend,
which already owns stitching, audio and captions and already has the binary. Recorded
as D-009, linked to JET-197.

What JET-197 asks for:
  1. frame extraction — video URL + 'first'|'last' -> lossless PNG. We need the BYTES,
     because that frame is handed to the video model as the still the next clip opens on.
  2. frame comparison (optional for them) — two image URLs -> mean absolute difference,
     320x180 greyscale. If they decline it we keep that part in Node with sharp, which
     is not ffmpeg.
  Open question left to them: their endpoints are 202+poll, and we call this ~66 times
  per song, six at a time. We asked for synchronous but it is their shape to choose.

Until it is approved, implemented and the shapes are published, the ffmpeg in
`src/services/render/seamCheckV1.ts` STAYS AS IT IS and keeps working. Aquib will say
when video-processing-backend is done. Do not start the swap before then.

When it does land, the change here is small and already scoped:
  - seamCheckV1.ts loses extractFrameV1, toComparableFrameV1 and the sharp import and
    becomes two HTTP calls. meanAbsoluteDifferenceV1 and its tests go too IF they take
    endpoint 2; keep both if they don't.
  - renderOrchestratorV1.ts's carry-forward fallback stops calling
    extractLastFrameOfVideo from services/ai/thumbnails.ts.
  - v0 is untouched either way: thumbnails.ts keeps its own extractor for the existing
    endpoints, and that file is on the do-not-touch list regardless.

Batch 3 is still uncommitted and still unverified by a live render. Both of those are
unchanged by this.

### 2026-10-23T14:46:25+05:30

**Batch 2 committed as `6785ba5`. Batch 3 is written, typechecked and unit-tested (31
checks across 3 files). NOT committed — waiting for the go-ahead.**

Batch 3 turns the sequential renderer into anchors + parallel. Four phases now, all
checkpointed, so a restart resumes at the first unfinished unit of whichever phase it
died in:

  anchoring   one still per clip boundary (clips + 1), each generated with the
              PREVIOUS still as generateSceneImage's `referenceImageUrl`. Sequential,
              because that conditioning IS the continuity. v0 passes undefined there,
              which is why it drifts; v0's caller is untouched.
  rendering   every clip at once behind the model's verified cap of 6, each pinned
              between its two stills. Clips no longer wait for each other.
  verifying   seam score per clip (MAD on 320x180 grey, threshold 4.0); one
              re-render for anything over.
  stitching   unchanged, still the existing synthesis service.

New files: `src/services/render/renderPromptsV1.ts` (pure prompt text),
`src/services/render/seamCheckV1.ts` (MAD + frame extraction),
`src/services/render/renderV1.test.ts` (20 checks).
Touched: `renderOrchestratorV1.ts` (rewritten loop), `models/RenderPlanV1.ts`
(anchors, seamScore, attempts, `deriveAnchorsV1`), `services/ai/omniVideoService.ts`
(seed passthrough + policy-rejection class), `services/ai/thumbnails.ts` (one flag).

Expensive things learned or decided this sitting:
- Six parallel clips each checkpointing meant six concurrent `plan.save()` calls on
  ONE mongoose document — overlapping writes of the same doc. Saves are now queued per
  plan. The checkpoint is the one thing here that must not be approximate.
- Frame extraction was lossy WebP. That frame is BOTH the pin handed back to the model
  AND the yardstick it is then measured against, so compression error was being scored
  as model error. `-lossless 1`. Also improves the v0 path.
- A content refusal is now re-asked as pure motion between the clip's two anchors.
  About one generation in five is refused, and a refusal is deterministic, so the
  fallback is what keeps one refusal from costing the song.
- `seed` is plumbed but sent ONLY when set: it is the one field never verified against
  the live Interactions API. Default behaviour is exactly what was measured. One cheap
  clip with a seed confirms or disproves it.
- 3.8 (@imageN stripping) and 3.5 (policy classification) are done for v1 only. The v0
  homes for both — `videoService.ts` and `providers/circuitBreaker.ts` — are on the
  do-not-touch list, so v0 still has both bugs.

NOT MEASURED, and both batches claim numbers that only a live render settles: resume,
under-10-minutes wall clock, every seam below 4.0. ~$25 for a full song; a one-scene
project exercises all four phases for ~$0.80.

Plan artifact updated with per-task status: https://claude.ai/artifact/HC8zmKZb7zFjjtTmvR3h1P

### 2026-10-23T14:25:01+05:30

**Batch 2 of the v1 render pipeline is written, typechecked and unit-tested. NOT committed.**

New files (additive; no shared v0 file touched — D-006):
- `src/models/RenderPlanV1.ts` — the plan document. Ordered clips derived from the
  storyboard by the pure `deriveClipsV1(storyboard, modelKey, trim)`, plus model,
  aspect, seed and optional trim. Each clip's `videoUrl` IS the checkpoint.
- `src/services/render/renderOrchestratorV1.ts` — start / run / cancel / rerender /
  resume-on-startup, sequential, one clip at a time, carrying the previous clip's last
  frame forward as the next clip's `startFrame`.
- `src/modules/musicVideo/musicVideoV1.routes.ts` — POST /:id/render,
  GET /render/:jobId, GET /render/:jobId/events (SSE), POST /render/:jobId/cancel,
  POST /render/:jobId/clips/:idx/rerender. Mounted BEFORE musicVideo.routes so
  `/render/...` is not swallowed by its `GET /:id`.
- `src/models/RenderPlanV1.test.ts` — 5 tests over the plan derivation. 11/11 pass.

Two-line edits: `src/routes/index.ts` (mount) and `src/index.ts` (startup resume).

Decisions taken, both recorded as D-007:
- Standalone orchestrator, NOT jobService's declared-but-unhandled `music_video` type.
- Resume ignores age. jobService's recoverJobsOnStartup fails anything older than 25
  minutes; a song outlives that, so copying it would destroy the render and the spend.

Things worth knowing before the next sitting:
- Re-render of one clip is just "mark it pending and run the loop again" — the loop
  skips `done` clips, renders the one, then re-stitches. Same path, no second code path.
- Cancel is read from the DB between clips, so it works across processes. The clip
  already in flight finishes and is kept; it is paid for either way.
- A clip is retried once. A failed frame extraction degrades to an unpinned clip
  rather than failing the song.
- Only `omni` is renderable: generateClipV1 speaks the Interactions API only. BytePlus
  keys in the registry are rejected at plan time with a clear message.
- Clip count is 33 for a 4:08 song, not 31: clips never straddle a scene boundary, so
  each scene rounds up on its own. Same seconds, same $24.80.
- NO MIGRATION is needed for web or mobile to adopt v1, and that is now enforced by
  code rather than by hope. v0 has no render collection: per-scene state is
  `MusicVideo.storyboard[i].clipUrl` / `.status`, which both clients read directly.
  The orchestrator mirrors each finished scene back to those fields (plus a new
  `clipUrls` array for a scene that needed several clips), so RenderPlanV1 stays
  derived and disposable and old projects need no backfill. D-008, and the field map
  is in `coord ctx`.
- A v1 render deliberately does NOT adopt existing v0 clipUrls on a part-finished
  project: different model, no frame pinning, so reusing them reproduces the exact
  jumping-scenes bug v1 exists to fix. It re-renders from clip 0.
- NOT DONE and not asked for: 2.8, mobile switching to the v1 call. Cross-repo.
- NOT RUN: a live end-to-end render. It is ~$25 of real spend against a live DB and
  key. Unit tests and typecheck only. A one-scene project renders for ~$0.80 if a
  cheap smoke test is wanted first.

### 2026-10-23T14:16:24+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js, implementation-plan.html, src/config/aiModels.ts, src/services/ai/videoService.ts, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T14:15:58+05:30

**Batch 1 of the v1 render pipeline is done and committed. Next session starts Batch 2.**

Committed on `features`: `a762d65` (v1 model registry + Gemini Omni clip generation),
`762ac7e` (availability probe + the repo's first test file, 6/6 passing).

THE RULE FOR THIS WORK: additive only. New files, `V1` suffix on anything that mirrors
an existing concept. Do not edit `config/aiModels.ts`, `services/ai/videoService.ts`,
`modules/video/synthesis.service.ts` or `modules/video/video.controller.ts` — several
devs push to those concurrently and v0 must keep working untouched. Recorded as D-006.

Context that is expensive to re-derive:
- Google shut down all three Veo 3.1 previews on 2026-10-22. v0's Google path is dead
  and is being repaired by the maintainers of the current system, not by this work.
- Google video is now `gemini-omni-1.1-flash` on the Interactions API — a different
  method, `Step`/`Content` input, snake_case, and video returned inline as base64.
  `services/ai/omniVideoService.ts` already wraps it as `generateClipV1(...)`.
- Omni pins BOTH ends of a clip. Give consecutive clips a shared still and the seam
  disappears, which is what lets every clip render in parallel.
- The pin only holds if the prompt explicitly demands it: 6/6 with
  `PIN_FRAMES_INSTRUCTION`, 1/6 without. `generateClipV1` applies it automatically.
- Seam check: mean absolute difference on 320x180 grayscale frames. Threshold 4.0.
  Two different stills score 10.3; identical score 0. Observed good runs: 2.1-3.3.
- 6-way concurrency verified on Omni and BytePlus. ~41s per 8s clip.

Batch 2 (next): server-side orchestration, still sequential — RenderPlan model, a v1
orchestrator, v1 routes, per-clip checkpoints. Open question to settle first: whether
to use `jobService`'s declared-but-unhandled `music_video` job type (means editing
`jobService.ts`) or build a standalone v1 orchestrator. Default to standalone.

Plan artifact: https://claude.ai/artifact/HC8zmKZb7zFjjtTmvR3h1P
Architecture: https://claude.ai/artifact/7f9ctxj84HmMBpCu3oKy7k

### 2026-10-23T13:05:27+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js, implementation-plan.html, src/config/aiModels.ts, src/services/ai/videoService.ts, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T13:01:35+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js, implementation-plan.html, src/config/aiModels.ts, src/services/ai/videoService.ts, +2 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:54:52+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js, implementation-plan.html, src/config/aiModels.ts, src/services/ai/videoService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:44:56+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js, implementation-plan.html, src/config/aiModels.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:35:06+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js, implementation-plan.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:29:13+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:26:36+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:24:58+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:22:04+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:20:36+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:18:43+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:16:56+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:16:09+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html, interp.js. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:15:10+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:04:04+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T12:02:37+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T11:56:59+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T11:48:23+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts, render-pipeline.html. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T19:19:49+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T19:13:36+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T19:06:08+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T19:04:30+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T19:02:54+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T19:01:31+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:57:09+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:37:23+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:31:01+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:27:50+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:25:13+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:21:22+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T18:14:56+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T17:56:02+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T14:05:27+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T14:03:18+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts, src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T13:55:39+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts, src/config/env.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T13:09:55+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T12:55:34+05:30

Session ended while on JET-193. Touched: src/middleware/generationLimiter.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-20T20:59:01+05:30

Session ended while on JET-193. Touched: src/shared/services/captchaService.ts. Nothing committed. (written automatically — no one said what is next)
