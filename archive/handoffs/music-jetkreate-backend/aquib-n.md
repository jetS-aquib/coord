# Archived handoff notes — music-jetkreate-backend/aquib-n

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

### 2026-11-03T23:45

**JET-242: pause is a status, and one stop-check serves both reasons.** `POST
/api/v1/music-videos/render/:jobId/pause` holds a render where it is: nothing new is
dispatched, the clips already in flight land and are kept, the plan stays, and
`…/resume` continues from the per-clip checkpoints for the price of the clips that
never started. Handed back for review; D-067 records the shape.

**The whole mechanism was already there.** Every boundary in the run asked one
question through one function — `cancelledSince`. It is now `stoppedSince` and answers
true for `cancelled` OR `paused`, so all nine checkpoints honour a pause without any
of them being told about it. Patching only the clip loop would have left anchoring and
the verify sweep still dispatching.

**`paused` is deliberately NOT terminal**, which is the part to keep straight: the
project lookup still returns it, a second render against the same song is refused with
"resume it or cancel it" (same posture as `blocked` and `review`), startup resume skips
it, and nothing sweeps it. Three places had to know or it would not be a pause at all —
`runPlanV1`'s early return, `resumeRendersOnStartupV1`'s `$nin`, and the catch block,
which no longer flips a pause to `failed` when an in-flight clip throws after it.

**The SSE stream ends on `paused`**, like the terminal statuses. The alternative was
sending `rendering` events to a client that had just been told `paused` and flipping
the button back under the person who pressed it. The clips still in flight land on the
plan; the poll route is where they are read. If mobile wants to watch them land live,
that is a real follow-up and it belongs on a ticket, not in this file.

**Test steps were written into the ticket by hand.** `coord` only takes `--test` at
filing time, so there is no command that fills them on an existing request — worth a
`--test` on `coord review`.

**`captchaBypass.test.ts` fails on this machine**, and not because of anything here:
`.env` carries `CAPTCHA_BYPASS_CLIENT=mobile` from today's staging work, and the test
reads the real environment. It is JET-244's file and JET-244 is still open — the test
should clear that variable itself rather than depend on whose machine it runs on.

### 2026-11-03T17:35

**JET-244: staging lets a named client past the captcha. Production has nothing for a
header to match.** Built both ends for today's staging release and TestFlight build.
D-065 records the trade; the ticket stays open, because attestation is not done.

`CAPTCHA_BYPASS_CLIENT` on the deployment, `X-Client` on the request, both must be
non-empty to match. Staging sets `mobile`; production sets nothing, and that absence
is the entire enforcement. Mobile sends the header from `lib/api.ts`'s shared builder.

**Say the quiet part when anyone asks:** the header is not a credential. On staging
those two routes have no captcha for anybody who sends it. That is the deliberate
trade for a closed test group on a backend with no real users, and it is why web —
sharing that deployment — keeps its captcha, which is the only reason this is keyed
on a header rather than just the environment.

**Before public launch, delete the flag rather than unsetting it**, so the mechanism
cannot come back with an environment change alone. That is in D-065's consequences and
it is the thing most likely to be forgotten.

**A trap that cost me a test run and will cost the next person one.** Deleting
`process.env.NODE_ENV` does not simulate production in this repo: `env.ts` calls
`dotenv.config()`, `.env` carries `NODE_ENV=development`, and dotenv refills anything
unset — so a re-imported module gets development back and `IS_DEV_MACHINE` short-
circuits before the code under test. `captchaBypass.test.ts` names `production`
explicitly and says why.

### 2026-11-03T17:10

**We ARE on v2, and the stitch was never the slow part.** `STITCH_API_VERSION=v2`
resolves, all five stitching calls route through `stitchPath()`, and the service
serves all five v2 routes — confirmed live by `POST /api/v2/segment-concat 202` in
their log. Measured stitch cost on completed renders: 35s (28 clips), 70s (28), 140s
(38), against 320-490s of rendering in a 440-640s render.

**What looked like a slow stitch was 17 jobs nobody was going to run.** Filed as
JET-246. 16 segment_stitch + 1 segment_concat_lyrics, all `queued` with created_at
equal to updated_at, never written again. A restart did not reclaim them — what
unstuck the render was OUR boot-time resume queueing a fresh set. One row over there
has been queued 25 hours.

**Correct my first read if you find this note before the ticket.** I said "nothing is
running" off a 0.1% CPU reading on the python process. That proves less than I made it
sound: ffmpeg is a child process and would not show there. The real evidence is
created_at == updated_at and the rows still untouched 20 minutes later. Their store has
no in-progress state at all — 452 completed, 95 failed, 0 ever in flight — so `queued`
means "not finished", not "not started". That ambiguity is half of what JET-246 asks for.

**`.env` has `VIDEO_API_BASE_URL` twice** — the deployed URL then `localhost:5005`, and
the last one wins, so everything goes to the local service. Aquib asked for it to be
left alone, so it is deliberate and it stays. Worth knowing before reading any timing
from this machine as if it were production.

Also noted, not filed: segment_stitch is 95 failed against 452 completed all-time, 17%.

### 2026-11-03T16:40

**"Too many regenerations" is real, and it is the threshold, not the prompt.** Filed as
JET-245 rather than fixed, because the fix needs data that does not exist yet.

The working screen's rotate-cw glyph is `regenerating` (shot-strip.tsx MARKS), a
status and not a button, so four of five clips really were being filmed again.

Measured over all 42 scored renders in `renderplanv1`, 1509 clips:

    frame   renders  clips   over 9.0      median seam
    9:16    42       1484    375  (25%)    5.50
    16:9     1         25     19  (76%)   16.36

`SEAM_THRESHOLD_V1 = 9.0` comes from LIVE_SEAM_SCORES, read 2026-10-26, and every one
of those 132 clips is 9:16. On 16:9 the median clip sits at 16.36 and there is no gap
for the threshold to sit in.

**Write this down so nobody re-derives it: the prompt is not the lever for the seam.**
The score is whether the model honoured its pinned frames, not what the text said. A
second take reproduces the first take's band rather than scattering — [29.61, 32.70],
[13.19, 13.00], [28.48, 27.55], [37.02, 36.55]. Of 160 redraws of an over-threshold
clip, 50 landed under 9.0 (31%); above a first take of 30 it is 5 of 39 (13%).

Two things I checked and ruled out, so they do not get re-opened. The 29 clips redrawn
despite passing the seam are the continuity supervisor (wardrobe, people count,
lettering, anatomy) — that path already rewrites the prompt with the failure sentence
and reverts when the retake is no better, and it works. And 25% on 9:16 is by design:
renderV1.test.ts asserts the threshold trips at most a quarter of clips.

**Do not act on 16:9 yet — n=1.** The gap is large but it is one render, and the
existing threshold comment exists precisely because it was once set from hand-picked
pairs. Two or three more 16:9 renders first.

Query scripts are in the session scratchpad and will not survive; they are ~40 lines
of mongoose against `renderplanv1` and JET-245 describes what they measured.

### 2026-11-03T16:05

**JET-241 is a no, and it cost nothing to find out.** D-062 said spike square against
the provider before writing any of it. The spike never billed, because the field is
rejected at validation:

    400 The value '1:1' is not supported for 'response_format.aspect_ratio'.
        Supported values: '16:9', '9:16'.   (gemini-omni-1.1-flash)

`omniVideo.ts:64` was right. I had it down as a likely Veo carry-over — it arrived in
the Veo→Omni migration with no ticket, and Veo genuinely was 16:9/9:16 only — but it
was a measurement nobody wrote down. Worth remembering before dismissing the next one.

**The useful part is why square is not merely missing.** Seedance does take 1:1, and
creater-ai-backend's registry says so. But `omni` is the only model with
`supportsEndFrame`, and pinning both ends is what lets every clip render at once and
what holds the seams at the measured 2.2-2.4. Seedance is start-frame-only, so a
square song would be serially generated with visible cuts — a worse video, not the
same video in a different shape. D-064 records the one condition to revisit: a model
with `supportsEndFrame` that also takes 1:1. Provider release, not work here.

Nothing from JET-241 steps 2-6 was written, which is the point of spiking first: it
would have been a route accepting a value the generator throws on, several dollars of
stills later.

**Two loose threads, deliberately not pulled.** `src/routes/jobs.routes.ts` accepts
`aspectRatio: '1:1'` on both v0 job schemas for every provider including google, so a
square google job is accepted and then throws in generation — the enum is right for
BytePlus, wrong for Google, and nothing pairs model with aspect. And
creater-ai-backend's `MODEL_REGISTRY` declares 1:1 for `omniflash`, which its selector
offers; different model id to ours, so possibly fine and possibly the same 400. Both
in D-064's consequences. The first is a small fix here; the second is a ticket to them.

### 2026-11-03T15:30

**JET-240: the lyric engine is ours to name now.** D-061 moved it off their deployment
and into the request, so `LYRIC_ENGINE=gemini` on our side turns Gemini on for our
renders without turning it on for creater-ai-backend. Flag sits beside
STITCH_API_VERSION, only the exact string switches, unset omits the key — their bodies
are `extra="forbid"` and `null` is a 422, not whisper. All four song calls carry it or
none do: the engine is in their transcript and song-read cache keys, so a mismatch is
not an error, it is the song transcribed twice.

**The part the ticket did not ask for, and the part that would have bitten.** Our own
SongReadV1 is keyed on audioUrl and gated by SONG_READ_CACHE_V1, which knew nothing
about the engine — so the first render after the flip would have planned its cuts off
Whisper sections while the captions burnt from Gemini words. The row stores the engine
now and `songReadIsFreshV1` compares it. Empty for old rows and for an unset flag, so
nothing re-reads on deploy; only the deployment that flips pays, and only per song it
renders. D-063 records why that beat bumping the generation.

**Next:** deploy with it unset and confirm the bodies are unchanged, then set it and
watch one render. 9.2 is still the real gap — generation draws 16:9 clips whatever the
frame says, so a portrait master is padded rather than composed. Three new mobile
requests (JET-241 square render, JET-242 pause, JET-243 budget) are waiting on approve.

**The three tsc errors I wrote off as cosmetic were JET-232 not working.**
`callbackRequested` sits immediately before `outputFrame` in `clipStitching`,
`clipStitchingWithAudio` and `clipStitchingWithLyrics`. `stitchDirectV1` passed
`frame` without it, so the aspect string landed in the boolean slot and those three
calls sent `callback_requested: "9:16"` and no `output_frame` at all. Renders still
came out, because their derivation from the clips is the fallback — which is the
padded-portrait behaviour JET-232 exists to end. The segment paths were correct, so a
song with 2+ segments composed properly and a short one did not. Fixed by passing
`false` explicitly; nothing here wants a callback, v0 polls.

The compiler said so on all three lines for three days. `npm run dev` is
`--transpile-only` and `npm test` was vitest alone, so nothing ever failed on it.
`npm test` now runs `tsc --noEmit` first. That is the lesson worth keeping: a type
error in this repo was decoration, and one of them was a feature silently not
shipping.

### 2026-11-02T17:55

A dead render showed "Stop render" and no way back. Two bugs, one of them mine.

**I caused the symptom.** This morning's isResumableV1 fix made GET /:id/render return
a stranded plan instead of 404ing. Mobile's re-attach maps anything that is not
review or blocked to `running` (working/[id].tsx:137-146), so a failed render reads as
live. It cannot self-correct either: liveJob is null for a terminal status, so the
poll effect never starts and the correct `failed` branch at :294 never fires on a cold
open. Before my change the endpoint 404'd, activeRender returned null, and the screen
fell through to "Render this song". More honest payload, worse screen.

**The second bug is older and costlier.** The failed branch offers "Try again", which
starts a NEW render — 45 clips drawn and paid for a second time. There is no resume
call anywhere in generation.ts; POST /render/:jobId/resume has existed since JET-198
and the client has never called it. JET-239 covers both.

**Fixed at our end: a stitch-stranded render is picked up on boot.**
resumeRendersOnStartupV1 skips failed plans by design — D-051, a deploy must not start
a $25 render nobody looked at. That reasoning is about money and does not reach a
render whose clips are all drawn: what is left is one ffmpeg job that spends nothing.
New isStitchOnlyV1 is deliberately stricter than isResumableV1 — "is any of the
remaining work billable" rather than "is there work left". Collapsing them would let a
deploy spend money.

Verified against real data, not fixtures: both stranded renders (mvr_...810b959c,
mvr_...0d84e7e2) went from failed to stitching on the next reload.

Also: the 404 that killed the 15:20 render was transient — /api/v1 stitch routes were
missing while video-processing-backend was mid-v2-work. Both v1 and v2 answer 401 now.

Next: JET-238 (xfade on ffmpeg 7) decides whether those two stitches actually finish.
JET-239 and JET-235/236/238 all need approve. 9.2 still untouched.


### 2026-11-02T17:40

JET-237: /api/v2 went live. Checked it; our side needed no code change.

All five routes answer 401 not 404. Polling was already pinned to /api/v1/jobs,
clip order was already 1-based, bodies untouched. They confirmed outputFrame still
names the aspect and v2 only changes the resolution it renders at — assumption 4
closed.

**720x1280 confirmed by running their graph, not by trusting it.** Three real clips
from a completed render, their exact filter graph, same flags: v1 shape (scale+pad)
gives 1080x1920, v2 shape (neither) gives 720x1280.

**I was wrong about one thing and retracted it on the thread.** I had concluded v2's
graph has no scale/pad and would break xfade on a mixed-size set — the case their
contract says is handled. video_filter_builder.py:87 makes needs_resize conditional,
so it is correctly absent on an all-720 set and correctly present on a mixed one. I
read one case's output as if it were the rule.

**THE BLOCKER, AND IT IS NOT THEIRS.** No stitch completes on this machine, on either
pipeline. The service (pid 68543) has /opt/homebrew/opt/ffmpeg@7/bin ahead of
/opt/homebrew/bin, so it runs ffmpeg 7.1.5. Their exact command:

  7.1.5 -> xfade: "inputs needs to be a constant frame rate; current rate of 1/0"
           0-byte output
  9.0.2 -> exit 0, correct video, both v1 and v2 shapes

xfade in 7.x wants a constant frame rate and reads 1/0 because settb=AVTB follows
fps=30; 9.x tolerates it. Build-compat in the graph, not a v2 regression. Flagged on
JET-237 because it blocks their Done-when. Note ffmpeg@7 DOES have libass, so the
libass diagnosis on JET-236 came from some third binary — there may be more than two
ffmpegs on this box.

Next: JET-237 cannot be verified end-to-end until a stitch completes. 9.2 is still
the real gap and is blocked by nobody.


### 2026-11-02T14:45

JET-237 (adopt /api/v2 stitching) — our half done, flag off, nothing called.

Their endpoints do not exist yet; the ticket was filed early to get objections while
they are cheap, so the real deliverable was checking their assumptions. Three
confirmed, one flagged, one thing they did not know.

**720x1280 is right, and their premise was understated.** ffprobed two completed
renders: clips 720x1280 at 2.3-3.2 Mbps, masters 1080x1920 at 3.5-4.3 Mbps. We spend
MORE bitrate carrying an upscale than the source was encoded at. Nothing downstream
assumes 1080 — mobile has zero references to it in src, and this repo's only hits are
clip-model resolution tiers and their pricing, which is what we ask the generator for,
not what a master is. posterUrl comes off an anchor still, so it is unaffected.

**Flagged:** output_frame decides SHAPE, native resolution decides SIZE. If v2 takes
the frame from clip dimensions instead of from output_frame, a 16:9 master built from
portrait clips comes out portrait and nobody finds out until they watch it. Asked them
to confirm on the thread.

**Told them something that changes their Done-when:** we send real caption settings
for the first time as of JET-234, so "burn captions in the same pass" has to honour
caption_style/position/font/animation and the kinetic_* fields, not just the default.
A v1-vs-v2 comparison run with default captions would look identical and prove
nothing. Also told them per-clip trims are on the hot path now, not an edge case.

Built: STITCH_API_VERSION, default v1, read once at start. Only the four stitching
calls move — frame-extraction, transcription, song-read, caption lists and health have
no v2 counterpart and stay put. Four tests, including that only the exact string 'v2'
switches anything. Stitch log names the pipeline so a master traces back to its maker.

Declined to bundle JET-202 (segmented stitching): a path string and a different flow
in one move means a bad master cannot be attributed to either.

Next: blocked on them deploying /api/v2 and answering the output_frame question.
9.2 (generation respects aspect) is still the real gap and is not blocked by anyone.


### 2026-11-02T13:55

A render failed at 96% and the three bugs behind it are all different.

**The resume gate asked the wrong question.** `isResumableV1` asked "is a clip
pending?". A render that drew all 45 clips and died on the stitch answers no, so
`GET /:id/render` 404'd and `resumeRenderV1` said "nothing left to render" — about
the one render that had already spent every rupee it was going to. Now it asks
whether a master exists. Verified against the real failed plan: resumable, 45 clips,
goes straight to stitching.

**The 401 was not credentials.** `Service assertion invalid: Signature has expired`
on the stitch. Minted per request, 60s, same host, clocks agree. Their service is
single-process and the stitch arrives behind the seam checks, so the request sits
unread past the TTL. `MAX_TTL_SECONDS = 60` on their side caps us, so we cannot sign
longer — JET-236 asks them to measure the window from arrival. One retry added here
as a stopgap; it re-queues behind the same ffmpeg, so it is a coin flip.

**"Mira is directing" was mobile reading its own draft.** We store the director in
two places and both were right (`directorId: holds-frame`, `plan.director.name:
Kabir`). Their working screen draws from `useCreateDraft()`, which on a cold open is
`DIRECTORS[0]` = Mira. JET-235. The render summary had no director field at all, so
they could not have read it — added `director: {id, name}`, off the plan not the
project, so changing director tomorrow does not rewrite who made yesterday's video.

Portraits now served from GCS (D-060), published by
`scripts/upload-director-avatars.ts`. All three live and public. The route stays as
the no-credentials fallback.

Next: nothing of mine is blocked. 9.2 (generation respects aspect) is still the real
gap — a 9:16 master is padded clips, not composed ones.


<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->

### 2026-11-02T12:25

**The stitch finally names its frame.** `outputFrame` wired through all four
endpoints — lyrics, audio, bare, segment-stitch — plus the finalise. 243 tests (was
241), typecheck clean, four do-not-touch files untouched. Still uncommitted, with
9.8's caption work.

**The v0 wrappers are off the v1 path, deliberately.** `synthesis.service.ts` takes
clip URLs with no room to say which part of a clip is used (D-027) or what shape the
master is (D-026), and it is do-not-touch — so all three single-call stitches now go
direct, the way every trimmed render already did. The wrappers added argument
mapping, two log lines and the same `waitForCompletion`; their quality defaults are
passed explicitly, so the body is what it was plus the frame. `synthesisSvc` is now
unused here and the import is deleted.

**Frame is always named, never inferred — a deliberate break with D-017.** A named
frame short-circuits their `ENABLE_PORTRAIT_OUTPUT` flag in both states. The flag
defaults off and is set on no deployment (checked), and D-026 supersedes D-017 so
that a master's shape stops being a property of where it was rendered. An
unrecognised aspect sends no frame at all, which is today's derivation.

**Verified on the wire, not only in types.** Captured the real request bodies behind
a stubbed fetch: `output_frame` present and correct on all four, **absent entirely
when no frame is given** (the backward-compatible case), caption settings
untouched alongside it, and `outputFrame` camelCase on segment-concat matching its
sibling fields. Probe deleted after.

**Next:** 9.2 — generation still draws every clip 16:9, so a 9:16 master is padded
clips rather than composed ones. That is the remaining half of the aspect story and
nothing external blocks it.


### 2026-11-01T02:50

**Batch 9 planned; 9.8's backend half built, NOT committed.** 241 tests (was 229),
typecheck clean, four do-not-touch files untouched. Five files: two new
(`captionSettingsV1.ts` + test), three touched (`musicVideoV1.routes.ts`,
`video-api.service.ts`, `renderOrchestratorV1.ts`), plus the shared error handler
and its new test.

**THE PREMISE WAS TRUE THIS TIME, AND WORSE THAN FILED.** Lyrics are not "off for
some users" — `showLyrics: false` is hardcoded at `music-jetkreate-mobile
src/lib/generation.ts:105` and sent on every project save. 44 of 47 projects carry
false, the other 3 are unset, and **all 41 v1 render plans ever created carry
`showLyrics: false` with empty caption settings.** Not one render in the history of
this pipeline has had lyrics burnt on it. The ~20 caption styles, the fonts, the
kinetic animation and the word timings we pay Whisper for on every song have been
reached by nobody on this path. One boolean in another repo. Filed as JET-234, and
the one line can ship on its own ahead of any screen work.

**Three artifact claims died to one mongosh query and one grep.** 9.7 (re-attach) is
already DONE, not "already filed" — JET-198 shipped it. 9.9 (crew narration) is
partly in already, written during Batch 8. And `aspectRatio: '9:16'` is on all 41
plans — the phone has been asking for portrait since it shipped and we have never
been able to tell the stitch, because every request model there is `extra="forbid"`
with no frame field. That is JET-232, and it is the real blocker on 9.1-9.4.

**A repo-wide bug found on the way, and fixed at the root.** `errorHandler.ts`
guarded on `Array.isArray(err.errors)`; zod 4 renamed that to `issues`. This repo is
on zod 4.3.6, so the guard has matched nothing since the upgrade and **every
validation failure on every zod route, v0 and v1, has been answered 500 with raw zod
JSON in the message** instead of 400. Found because the new caption validation
worked on the first try and still returned 500. One line in the shared handler plus
a test; D-058 records that it reaches v0 deliberately. Verified live: a bad caption
key is now a 400 naming the field, and `audio_url` smuggled into `captionSettings`
is refused — it would otherwise have been spread last into the stitch body and
changed which file the master is muxed against.

**Verified against the running server, not only in tests.** `GET
/api/v1/music-videos/caption-styles` returns 200 with ~20 real styles and the fonts.
A render POST with valid caption settings gets past validation and stops at the
project lookup, so nothing was spent proving it.

**Next:** approvals on JET-232/233/234, then one render end to end with lyrics on —
which is still the same render that settles D-045, the library and the new cast
sizing. 9.1-9.4 are blocked until JET-232 lands. Nothing of 9.5b/9.6/9.10 started.


### 2026-11-01T02:20

**Committed at `ffd15bf`** — Batch 8's call sheet (8.1-8.8) and JET-231 together, 16
files, +1994/-36. Working tree clean. 229 tests, typecheck clean, four do-not-touch
files untouched.

**Two tickets in one commit, deliberately.** JET-228/JET-229 (the call sheet, the gate,
the overrides) and JET-231 (the cast's name and face) interleave inside
`renderOrchestratorV1.ts`, `callSheetV1.ts` and `RenderPlanV1.ts`, and interactive git
is unavailable in this environment, so a clean two-commit split was not available
without hand-building an intermediate state that might not have compiled. The body
names both, and every non-obvious line cites its decision ID inline — which is the
mechanism CLAUDE.md actually relies on for explaining a line months later. If the
split matters, the right move is `git revert` and redo rather than a rebase.

**The repo's git hooks are not installed in this clone.** `.git/hooks/` holds nothing
but samples and `core.hooksPath` is unset, so `prepare-commit-msg` did not add the
`JET-231:` prefix (typed by hand) and `post-commit` did not tell the board (`coord
log-commit` run by hand). `coord why src/services/render/callSheetV1.ts:60` resolves
correctly, so nothing is lost — but the next commit here will silently miss both
unless somebody runs `coord devsetup --hooks`. Worth doing before the next session.

**Next, unchanged and now four notes old:** `coord done JET-231`, approve JET-228 and
JET-229, and **one render end to end on a library track** — which settles D-045, the
library, the new ladder and the new cast sizing in a single ~$2-3 pass. The test plan
`mvr_1793362298029_891e01ed` is still parked in `review` on
`mv_1793353541497_q7e2a9` and blocks a new render on that project.

### 2026-10-30T17:50

**JET-231 is built and handed back with `coord review`.** 229 tests (was 224), typecheck
clean, four do-not-touch files untouched plus `thumbnails.ts`. Nothing committed.
**Verified on a live gated render, not only in tests** —
`mvr_1793362298029_891e01ed`, still sitting in `review` on `mv_1793353541497_q7e2a9`.
That plan blocks a new render on that project; `coord`-free cleanup is
`POST /render/mvr_1793362298029_891e01ed/cancel`.

**ONE OF THE TICKET'S THREE PREMISES WAS ALREADY FALSE, and the plan behind its own
screenshot proves it.** It said there is no picture of the cast at the gate including
the plate. The plate moved into `applyDirectionV1` with JET-228 — the one call site
that is neither `regenerateCastV1` nor the anchoring path — and
`mvr_1793360749640_e97d6b04`, the device run they filed from, has a populated
`plateUrl`. Item 1 needed no work. **Second time in two sessions that a stated premise
died to one mongosh query.** The habit is cheap and it keeps paying.

**The name cost nothing, which is the part worth remembering.** `autoGenerateCast` has
always returned `{name, role, description}` and `resolveCastV1` threw two of the three
away. The rule it was obeying — a real name is what the provider refuses, 20 of 31
clips on the first live render — is right about PROMPTS and was written so broadly
that the name never reached a screen either. One field, no new call, and it fixes the
card, the beat, the notes and the row at once.

**D-057 — portraits, but only on a render that asked for the gate.** That constraint
is the decision: a web render has no call sheet to show them on, so it draws none and
costs what it costs today. Each portrait is drawn AGAINST THE PLATE, never from the
description. **I downloaded both and looked at them:** same bleached bob, same
oversized pink blazer, same face. A card promising a face the render does not keep is
the pitch problem (D-053) again. No plate therefore means no portraits — three
strangers are not an improvement on a blank slot.

**Tags are resolved at a BOUNDARY, never at write time,** because
`generateShotListV1` reads `section.beatEn` back into a prompt where the tag is what
makes it unambiguous. `forReadersV1` reuses `substituteImageTagsV1` by handing it
names instead of descriptions — the "the subject and the subject" collapse was already
solved in there and did not need solving twice. **That bought something I did not
design and only saw by running a recast:** renaming the person updates the logline,
every beat and every row at once, with nothing rewritten and nothing stale, because
the stored text still says the tag.

**The live run also showed two things working for the first time.** Kabir cast ONE
person where he would have cast three before D-056 — his card says "a single figure"
and now the video agrees. And a row read `holds three bars, because the hook holds`:
8.7's own flagship reason, which could not fire until `bars` and `heldForHook` existed
on the clip.

**A BUG THE TICKET DID NOT ASK ABOUT, found in stored data.**
`mvr_1793357396752_54dbbb09` carries "Watched the middle of 45 takes, 40 of them
wandered" **six times** and "Cutting it together to the beat" four, because
`runPlanV1` runs again on every resume and every single-clip re-render and each run
narrated its phases afresh. 9.9 narrates from these, so the screen would have shown
one sentence six times. Deduped in the `updateOne` filter on the exact line — a phase
whose numbers changed still appends, one with nothing new to say does not. Verified
against mongo directly rather than reasoned about.

**Worth a look separately, not this ticket: 40 of 45 clips failed the clip check on
that render.** That is a distribution, and D-043 said the first render under it
decides whether `CLIP_REDRAW_ON_V1` widens. 40 of 45 is the gate's `hasText` story
again in shape — a check that fails almost everything is not measuring what it thinks.

**Known limit, deliberately not fixed:** a cast member with no name falls back to "the
subject", so a plan stored before today reads "the subject marches through the night
market flanked by the subject". It satisfies the done-when, it is honest, and every
render from here has names. Not worth a migration.

**Next:** `coord done JET-231`. Approve JET-228 and JET-229. Then the thing that has
been next for four notes and still is — **one render end to end on a library track**,
which settles D-045, the library, the new ladder and the new cast sizing all at once.

### 2026-10-30T16:55

**Batch 8's call sheet is built — 8.1 through 8.8.** 224 tests (was 196), typecheck
clean, four do-not-touch files untouched. Nothing committed. Two tickets filed to
mobile BEFORE any code (JET-228 the screen and the gate, JET-229 the overrides) and
both still need `coord approve`.

**TWO THINGS I WAS TOLD WERE TRUE AND MEASURED TO BE FALSE. Both came out of one
mongosh query over 36 stored plans, and that query should have been the first thing.**

1. **The cast was never empty.** The brief for this session said resolveCastV1's
   `if (!tags.size) return []` means almost every render runs with "(one unnamed
   subject)". It does not: **33 of 36 plans carry a real cast of 2 to 4**, the last
   eight renders all have 2 or 3 described members, 40-45 of 45 clips carry castTags,
   and **43 of 43 projects have @imageN in their storyboard** because the v0
   generator writes those tags by default. I had already recorded D-052 on the false
   premise and built the clamp so it only fired when no tags were stated — which is
   zero projects. **D-056 supersedes it.** The real defect is the one underneath:
   nobody decided HOW MANY, so Kabir, whose card says "a single figure", has been
   rendering three. The director's range now sets the size whatever the storyboard
   stated; the stated tags only choose which ordinals. The house profile has NO range
   (absent, not zero) and takes the storyboard's count, which is what keeps D-047
   provable.
2. **The shot-ladder stub is 12% of sections, not a rarity.** 13 of 105 sections
   across those 36 plans are in the family. And the family is not "7 and 33" as
   D-054's own text says — it is **two more than a multiple of the LADDER**, which is
   5 in 16:9 and 4 in 9:16. The 9:16 half had never been considered.

**The ladder fix took three attempts and only the third is right.** First try split
the section into `ceil(count/ladder)` even runs — clean on 16:9, but it created a
new stub on 9:16 at 5 clips, and it had an off-by-one where the run a clip was
assigned to and that run's start were computed differently, so a clip could ask for a
rung off the end of the ladder. **The answer is `floor`, not `ceil`:** a run may be
longer than the ladder and never shorter, so a remainder is absorbed rather than
becoming a run that cannot progress. Measured over every section length 1-200 on both
ladders: no short run, no size repeated more than twice, and the step into a section's
closing shot never more than two rungs against the four-rung `close -> wide -> close`
leap. Sections up to the ladder's length are byte-identical. **This changes rendered
frames, so the next render is the new baseline** for anything compared frame to frame.

**The gate is OPT-IN and there is no timer, and that is the whole of how 8.6 holds.**
`POST /:id/render` takes `review: true`; without it a render goes queued -> planning
-> anchoring and never stops, so the web path and every older client are untouched.
`accept` is idempotent and never 409s. No auto-proceed: what waits costs two text
calls and one image, what a timer would start costs ~$25, and a fuse should fail
toward the cheap side. Two places had to learn about `review` or it would not have
been a gate at all — `resumeRendersOnStartupV1` excludes it like `blocked`, and
`runPlanV1` returns early on it. A deploy must not be what approves a render. D-051.

**THE THING THAT PAID FOR ITSELF: I fetched a real 45-row call sheet over HTTP and
read it.** Two defects, both invisible to every test I had written:
- The director's one-line voice was appended to EVERY section's notes, so the same
  sentence arrived eight times down one screen and buried the notes that were about
  that section. It is `approach`, once, at the top.
- Every row read `verse · medium wide · one of them · Dimly lit high-fashion
  penthouse party overlooking a neon city skyline`. The treatment writes the full
  location because that string goes into an image prompt — so 8.3's entire claim, four
  plain words a novice can read, was gone. The row carries a shortened place now
  ("penthouse party"); the section header still carries the full text.
That is the fourth and fifth defect in a row here that was invisible in tests and
obvious on inspection. **Look at the thing.**

**Crew narration lives ON THE PLAN, not on a stream** (2.6 — SSE drops when the app
backgrounds). `crew[]` is appended with `$push` only, never also onto the in-memory
document, because mongoose records a push on a document array as its own atomic
$push at save time and doing both writes the note twice. Each line carries the
CONTENT of a handoff — "Heard the track: 92 BPM, 8 sections, the biggest one at 0:41",
"Cut it to 43 shots, every one landing on a downbeat", "Checked 46 key frames, sent 9
back" — rather than a phase label. 9.9 should narrate from these rather than invent
stages.

**The pitch is now a contract, not screen copy.** JET-227 added it to POST /brief and
nothing stored it or passed it on, so the director described a plan the treatment had
no obligation to make. Persisted on the project, copied to the plan, and placed in the
treatment prompt as WHAT THE ARTIST WAS ALREADY PROMISED. Empty adds nothing and the
prompt stays byte-identical to the one 7.2 and 8.9 were measured on. **Mobile has to
send it back on the project save** — that is the one new field JET-228 asks of them.
D-053.

**Casting stays before the director and the profile steers it** rather than inverting
the order. Inverting is not one extra call: the treatment is the document that
describes the cast, so writing it first means writing it about people who do not exist
and then either rewriting it or living with the mismatch — and `directed` exists
because a treatment's second answer is not its first, so a resume would need new
semantics for a question a director can already answer.

**Decisions: D-051** (the gate), **D-052 superseded by D-056** (casting), **D-053**
(the pitch), **D-054** (the ladder), **D-055** (overrides).

**One blemish on the board, and it is mine.** D-056's Decision paragraph is missing
the words `DirectorProfileV1.cast` — I put them in backticks inside a shell argument
and the shell ate them, leaving "So  is now OPTIONAL". Decisions cannot be
hand-edited and `coord note` does not take a decision id, so the corrected sentence
lives in the code comment on that field instead. Do not use backticks in `coord
decide` text. D-054 has a factual slip of the same kind — "wrong at 7 clips and at
33"; 33 re-establishes in threes and was never defective — and the corrected rule is
in `shotSizeV1`'s comment.

**Verified over real HTTP, not only in tests:** all six new routes answer 401 without
auth rather than falling through to v0's `GET /:id` (the trap from the 8B session),
and `GET .../call-sheet` returns a full 45-row sheet for a real stored plan with a
signed request.

**STILL NOT VERIFIED, and it is the same two as the last three notes.** D-045 and the
gate downscale. And **no render has been done end to end on a library track** — now
also none under the new ladder, the new cast sizing or the gate. A 30-second trim
across a section boundary is ~$2-3 and exercises every phase. **That is the next
thing**, and nothing in 8.1-8.8 has been seen on a moving picture.

**Next:** approve JET-228 and JET-229. One render on a picked track with `review:
true`, which settles D-045, the library end-to-end, and whether the cast sizing and
the ladder actually read better on screen.

### 2026-10-30T13:05

**Batch 8B is built and verified against the live catalogue.** The Epidemic key
arrived, so the blocker in the 12:35 note below is gone. 191 tests, typecheck clean,
four do-not-touch files untouched. Still nothing committed.

**The reported bug was never the library.** "The library did not answer / Music video
project not found" was `GET /tracks` having no v1 route and falling through to v0's
`GET /:id` with `id="tracks"`. Worth remembering as a shape: the v1 and v0 routers are
mounted on the SAME path, so a missing v1 route does not 404, it gets answered by v0
with a message about something else entirely.

**New: `src/services/music/epidemicV1.ts`** plus three routes. The whole of D-049 is in:
one stable `audioUrl` per track, `previewUrl` the same string, both caches keyed on it,
and `resolveAudioForServiceV1` swapping in a fresh signed Epidemic URL at all five
places something leaves this service (transcript, song read, two stitch paths, segment
concat). **A picked track is an upload from the moment it is picked** — nothing
downstream changed, including the v0 storyboard call, which is what made the originally
filed "trackId everywhere" impossible.

**Measured against 200 live vocal tracks, and three of these changed the code:**
- Genre tail is **77 entries, most holding one track**. So the chip row is the measured
  top six (Beats 41 / Pop 32 / Hip Hop 30 / Rock 9 / Acoustic 6 / House 5), not
  `/v0/genres`, which is the whole Epidemic taxonomy and would give chips returning
  nothing.
- Length: **median 2:58, p25 2:32, shortest 1:58, nothing under a minute.** 8B.5's
  worry was right in direction and the floor is higher than feared.
- **There is no way to look one track up.** `GET /v0/tracks/<id>` is 404 even for a real
  id and `?id=` / `?ids=` / `?trackIds=` are silently ignored — the whole catalogue
  comes back as if nothing was asked. That is why the cover URL carries its release id.
- 200 of 200 are `isPreviewOnly` with lqmp3. 8B.6 confirmed, unchanged.
- 2 of 200 are missing bpm or genres and are dropped, as JET-226 asked.

**TWO MISTAKES I MADE AND CAUGHT, both invisible on a laptop. Worth reading, because
both are the same mistake.**

1. **The cover art was an in-process Map** populated at list time. It worked here and
   would have blanked roughly every other card in production, because the instance that
   serves the list is not the instance that serves the image. Stateless now: the release
   uuid travels in the URL as `?r=` and is validated as a uuid, so the route cannot be
   pointed anywhere but the Epidemic CDN. 100 of 100 cover URLs follow one template,
   measured, which is what makes rebuilding the address sound rather than lucky.
2. **The URLs were minted from `BACKEND_URL`**, which here is `http://localhost:5006` —
   three URLs a phone can never load, which is JET-194's grey box arriving from the
   other end. They are built from the host the DEVICE actually used now, so a LAN
   address, a tunnel and production are all right with nothing configured. The track id
   is therefore parsed out of the PATH and never matched on the host.

**The media routes are public** — outside `requireAuth` and `requireSignature`, same
posture as `/api/video/download` and as an uploaded GCS object. A player cannot sign a
request and an `<Image>` sends no headers, so this is not a weaker version of the
decision, it is the difference between a picker that plays and one that does not.
What is exposed is preview-quality audio from a prototype key to anyone who can guess a
uuid. **That is 8B.6's entitlement question and it is now load-bearing.** D-050.

**A test caught the suite making a live API call.** vitest loads `.env`, so the fallback
test I wrote passed by genuinely resolving a real track. Fixed by unsetting the key
around that assertion. Worth knowing before anyone writes another test here: **this
suite can spend real API calls if you let it.**

**Verified over real HTTP, not just unit tests:** Range returns 206 with a correct
content-range; a full fetch is a real 2.8MB 128kbps MP3; the cover is a real 600x600
JPEG on a cold process; an unknown track is 404 with a code; the list and directors
routes are still 401 without auth.

**Still not verified:** D-045 and the gate downscale, unchanged. And **no render has
been done on a library track end to end** — every piece is checked, the whole is not.
That is the next thing and it is ~$2-3 on a 30-second trim.

**Next:** one render on a picked track. Then 8.1-8.8, the call sheet.

### 2026-10-30T12:35

**Batch 8 rows 8.9 to 8.14 are built. Batch 8B is not, and the reason is a missing
key rather than a missing decision.** 180 tests (was 161), typecheck clean, the four
do-not-touch files untouched. Nothing committed — waiting on a go.

**8.9 is a refactor and it is provably one.** `DirectorProfileV1` in the new
`directorsV1.ts` widens `ShotGrammarOptionsV1` and is threaded through `shotGrammarV1`,
`cutPlanV1`, `treatmentV1` and `briefV1`. The 161 tests that were already here pass
UNTOUCHED, and both text prompts come back byte identical for the house profile —
`${note}` is empty and `${placesText}` spells out "two or three", which is why the
numbers in the prompt are words and not digits.

**Three directors, and they differ in the arithmetic.** On the 4:16 track Batch 6 was
measured on: `stays-close` 4/39 performance and a ladder that never opens wider than
medium, `fills-floor` 24/19 on the full ladder, `holds-frame` 17/26 biased one step
tight. `directorsV1.test.ts` requires any PAIR to differ on at least two of cut count,
lane split and shot sizes, which is D-046 rule 2 as a failing build rather than a
sentence in a decision record.

**THE FINDING, and it is the one to read: the cut-rate lever is inert on a ballad.**
`cutRateV1` derives the range from the bar length and the model's 4-8s window, so at
80 BPM a bar is 3.0s and the widest clip is 2 bars and so is the narrowest — all three
directors cut the identical 43 clips. The dead band is roughly **68-88 BPM**, which is
where a ballad sits, which is the song `stays-close` exists for. Measured, logged at
plan time so it is never a mystery, pinned by a test, and **deliberately not fixed**:
fixing it means letting a fast director take 1-bar clips and trim the surplus, which is
more clips and more spend on every slow song. That is a cost call for a person. D-048.

**D-047** — an unset `directorId` is the HOUSE style, not the default director. Two
different facts: every project saved before today and every web render has no director,
and if those resolved to `stays-close` the baseline render stops being comparable with
anything after it. `HOUSE_DIRECTOR_V1` is today's frozen numbers and is deliberately
not in the catalogue, so nobody can pick it. That one branch is what makes "changes no
rendered frame" provable.

**D-049 — 8B's shape is agreed and 8B.1 has evaporated.** Mobile revised JET-226 on the
thread and was right to: a library track carries a STABLE backend-hosted `audioUrl`
instead of a trackId, so a picked track IS an upload from the moment it is picked and
nothing downstream changes — including `POST /api/video/music-storyboard`, which is on
the do-not-touch list and would have made "trackId everywhere" impossible. Both caches
are keyed on that stable string, so **8B.1 needs no audioKey field and no migration**.
Three corrections went back on the thread: cover and preview art must be STREAMED not
302'd (JET-194 assumption 2 is mobile's own argument and it applies to anything a phone
fetches), the audio is resolved to a fresh Epidemic URL SERVER-SIDE so video-processing
never follows our redirect or has to reach our host, and the audio route is
unauthenticated by construction, which is 8B.6's entitlement question early.

**8B is blocked on a key, not on a decision. There is no Epidemic key in `.env` on this
machine** — the previous note says the prototype key is there and it is not. So not one
real track has been listed, and every route would be shaped against the documented API
and verified against nothing. All four bugs found in Batch 7 and 7B were invisible to
unit tests and visible only on a live run. Put the key in `.env` and 8B is a session.

**8B.5 is done and cutPlanV1 is fine on a short track** — a 2:00 track at 100 BPM is 19
clips over three sections, every boundary on a downbeat, nothing generated unused, and
a test pins it. But the shot progression has a wrinkle short tracks make common: a
section of exactly 7 clips re-establishes for ONE clip and renders `close -> wide ->
close` at the end of the song, which reads as a mistake rather than a re-establish. Not
fixed here, on purpose — this commit's whole claim is that it changes no rendered frame.
**That is the first thing to fix next and it is a two-line change in `shotSizeV1`.**

**No cross-repo ticket was needed, and I looked.** JET-194 is noted and narrowed: every
media URL Batch 8 introduces is on our host by construction, so nothing here waits on
it, but `posterUrl` is still a GCS URL — which means JET-221 and JET-194 cancel each
other out and that Library card is still a grey box on a device. The Bhojpuri ticket
could not be written: it needs a real Bhojpuri track to measure against and there is
none, and a speculative ask about Whisper's confidence would not improve transcript
quality anyway. Say so rather than file a guess.

**Not verified, and still worth a render before anything else:** D-045 and the gate
downscale, unchanged from the last note. Separately, **the three new routes have never
served an HTTP request** — the handlers are straight-line and tsc-clean and the data is
under 180 unit tests, but booting the app to curl them needs a signed request I did not
mint. The curl is in the report.

**Next:** approve JET-194. Put the Epidemic key in `.env`. One render to settle D-045.
Then 8.1-8.8, the call sheet, which is the other half of Batch 8 and is untouched.
### 2026-10-30T12:05

**Planned Batch 8 (the director) and Batch 8B (the song source).** Nothing built.
Artifact at Version 11, decision **D-046**, tickets **JET-223** (director screen) and
**JET-224** (song library) filed to mobile and awaiting approval.

**Start Batch 8 at row 8.9 and nowhere else.** It is a refactor with no behaviour
change: everything a director decides already exists and is frozen at one value
(`DEFAULT_PERFORMANCE_RATIO_V1 = 0.35`, `LADDER_16_9`, the camera-move table, the
lyric-mode policy, the bars-per-clip choice in `cutPlanV1`). Widen
`ShotGrammarOptionsV1` into `DirectorProfileV1`, thread it through `shotGrammarV1`,
`cutPlanV1` and `treatmentV1`, ship today's numbers as one built-in profile.
**After that the batch is data entry.**

**D-046, and the two rules a fresh session must not break:**
1. **A director biases, never dictates.** Every value is a weight or a preference
   order, never an absolute duration or count. The song read decides cuts from real
   bars and real energy — a dance director on a ballad must shift the distribution,
   not override it, or Batch 6 is undone.
2. **If two directors differ only in prompt adjectives, the feature is dead.** What
   a viewer sees is the arithmetic: cut rate, lane split, shot ladder. Same split as
   D-034 — arithmetic in code, judgement to the model.

**R&D, and one finding inverted my assumption.** I assumed Indian music video means
playback performance and therefore a *high* lane ratio. It is the opposite for
contemporary Hindi: songs increasingly sit under the scene and actors are freed from
lip-sync. So the Hindi-leaning director is **0.15**, which is both current practice
and the cheapest thing we can render well while Batch 10 does not exist — every
performance shot is a mouth that does not match (D-009, D-033). Three directors are
in the artifact with their full parameter sets.

**Hindi structure is mukhda/antara, not verse/chorus.** The mukhda is a refrain that
opens the song and returns after every antara. Two consequences: our shot progression
assumes a section that *builds*, which is an antara not a mukhda; and our hook
detector looks for a repeated lyric line, which is exactly what a mukhda is — so it
should work **better** on Hindi than on Western pop. Measure it, don't assume it.
D-044 already removed the label dependency we would otherwise have tripped on.

**Bhojpuri transcription is the open risk** — low-resource, and Whisper will very
likely return Hindi for it. D-039 keeps the screen safe, but transcript *quality*
feeds the hook detector and every shot's lyric lines. **Measure before promising the
language.**

**Batch 8B — I argued it should NOT be part of Batch 8** and the artifact reflects
that: it sits upstream of everything and is independent of 6–10. Two measured facts
drive it:
- **96 of 100 Epidemic tracks have no vocals.** Everything 6 and 7 bought is
  lyric-driven, so the library is `vocalType=LEAD` only — verified working, median
  3:02, 40% Beats / 31% Pop / 28% Hip Hop / 17% Trap. **Not a user-facing toggle.**
- **The download URL is signed and expires** (file path stable, full URL changes
  every call). `TranscriptV1` and `SongReadV1` are both keyed on `audioUrl`, so every
  render of the same track would miss both caches and re-pay Whisper at 169s cold.
  **8B.1 — key on a stable `audioKey` — should land whether or not the library
  ships.** It is also a win: two users picking the same track share one read.

Also worth knowing: Spotify and YouTube cannot do this (no audio files / ToS), and
the library serves **one of the three target languages** — Hindi and Bhojpuri still
come from upload. Every track on the current key is `isPreviewOnly` + `lqmp3`, which
is an entitlement question before it is a product. The prototype key belongs in
`.env` (gitignored, untracked), never in code.

**Next:** approve JET-223/224, then a fresh session per repo. Backend starts at 8.9;
8B.1 can go in parallel and is independent.

**Still unverified from the last session:** D-045 (text verdicts should fall) and the
gate downscale (`gate.vision` should roughly halve). One render settles both, and it
is worth doing before Batch 8 so the baseline is clean.

### 2026-10-30T11:30

**Batch 7 and 7B are closed.** Committed `7e08ac2`. Delivery plan artifact at
Version 10, Part II marked closed through 7B. Four live 45-clip renders behind it.

**Four things this session fixed, all found by running the thing rather than reading
it.** Worth keeping together, because they are one lesson:

1. **Re-render budget leak.** `renderOneClipV1` clears `seamScore` on every
   successful render. A re-render path that reverted `videoUrl` without reverting
   `seamScore` left a measured clip looking *un*measured, so the verifying sweep
   re-measured it and was entitled to re-render it again, off-budget. 17 against a
   budget of 9. Both paths now revert through one `revertTakeV1`. **54 against a cap
   of 54** on the last render, down from 62.
2. **The plate stalled a whole render for 5 minutes.** Optional, with a working
   fallback, but drawn serially with 46 anchors queued behind it — and `shared.ts`
   retries 4 times with exponential backoff. Fail-soft is not fail-fast. 90s deadline
   (`RENDER_PLATE_DEADLINE_MS`), and the last render drew it in 3.7s.
3. **D-044 — the look was keyed on the section label.** The read returns eight
   sections with real boundaries and labels seven of them "verse"; `treatmentV1`
   asked for "ONE location per distinct label", so a four-minute video got two rooms
   and 42 of 45 clips were shot in the same one. Keyed on the index now, with the
   treatment deciding which sections genuinely reprise. **2 locations became 8**, and
   the clip check's location verdict fired for the first time.
4. **D-045 — the gate's loudest verdict was measuring the wrong thing.** `hasText`
   fired on 38 of 45 clips on a treatment whose own look bible said "glowing neon
   skyline". A neon cityscape has signage by definition: the gate was rejecting
   exactly what the treatment ordered, spending 22 redraws and starving 12 anchors of
   any check at all. **The question was wrong, not the list.** Narrowed to lettering
   that does not belong, naming the stated location so a shop sign can be told from
   one hallucinated into a bedroom.

**The lesson under all four:** none was visible in a unit test and all four were
visible in the stored plan. That is the argument for 7B.5 and for `renderTimingV1`
in one sentence.

**`renderTimingV1` — where a render's minutes go, on the plan, not in a terminal.**
Two clocks: wall per phase, and time inside each kind of call summed over every lane.
**The ratio is the diagnostic** — near the lane cap (6) means saturated and only less
work helps; near 1 means one slow serial call and more concurrency buys nothing. It
paid for itself on its first run by showing `gate.vision` at 10.4s a call against
`anchor.image` at 5.7s: the gate was sending full-resolution PNGs to a vision model
while the clip check used 768px frames. Both shrink now.

Read it with the script in the session scratchpad, or
`db.renderplanv1.findOne({jobId}).timings`.

**Where the 14 minutes go** (`mvr_1793338408189_d864708f`, 45 clips):
rendering 543s (64%), anchoring 168s (20%), stitching 66s, planning ~63s. Both big
phases run at **5.7x against a cap of 6 — saturated**. 7B itself is ~4 of the 14
minutes; 9.9 was the pre-7B baseline. **Whether that trade is worth it is a product
call and should be made on the video, not on the clock.**

**Still needs a person** (`coord ok` is refused to agents — it reads a tty):
`coord done` for JET-212, JET-219, JET-222 (video-processing), JET-213, JET-216,
JET-218, JET-220, JET-221 (mobile), and JET-202 (handed back via `coord review`).

**Open, and genuinely theirs — JET-215.** Our half is done (D-044) and I have said so
on the thread so they do not think they still owe us the location collapse. What
remains is real: the same bytes give different boundaries two days apart, so a
re-render of an unchanged song is not reproducible; and no track has ever returned a
bridge, so `disjunctive` has never once fired.

**Not closing:** JET-217 (mobile's `isReady` is `Boolean(draft.audioUrl)`, so an
all-blank brief can still be submitted; the instrumental title-fallback case is not
evidenced) and JET-194 (`posterUrl` is still a `storage.googleapis.com` URL).

**Next:** Batch 8, the call sheet. Before building it, one render on the current code
to confirm D-045 brought the text verdicts down and that `gate.vision` roughly halved
— both are unverified.

161 tests (was 107 at session start), typecheck clean, four do-not-touch files
untouched across the whole batch.

### 2026-10-29T18:50

**Batches 7 and 7B verified on a full 45-clip render** (`mvr_1793277832749_3e886f1a`,
completed, stitched) and **committed at 84f120b**. Delivery plan artifact updated to
Version 9: both batches marked done, the crew chart's script-supervisor chair filled,
D7 and D11 settled.

**The render worked. It also found a cost leak, which is what a first run is for.**
`renderOneClipV1` clears `seamScore` on every successful render ("a new take needs a
new measurement"), so a re-render path that reverts `videoUrl` without reverting
`seamScore` leaves a measured clip looking *un*measured — the `verifySeamsV1` sweep
then re-measures it and is entitled to re-render it again, off-budget. **17
re-renders against a budget of 9**, where the pre-7B baseline on the same song length
did exactly 9. Both paths (the seam one, which had the same latent bug, and my new
clip one) now revert through a single `revertTakeV1`, so the two fields cannot move
apart again. Three tests pin it. **Unverified on a render — the next one confirms it.**

**What the distributions say — this is the part worth reading before touching the
gate.** 46 stills: 10 pass, 35 fail, 1 unchecked (budget fuse fired, as designed).
45 clips: 17 pass, 28 fail. A **76% fail rate is a noisy signal however it is spent.**

The two kinds that dominate are exactly the two D-040 and D-043 refused to pay for:
**continuity 28, anatomy 23** on the stills. The countable ones are rare — people 2,
text 3. So the split is vindicated hard: paying for every verdict would have redrawn
~40 stills on the fuzziest two judgements in the batch, and the budget would have
been gone before anything real was caught.

**My honest reading: the question is too permissive, not the stills that bad.** Before
widening `GATE_REDRAW_ON_V1`, narrow what the model is asked. That is D12 on the
artifact, and it should be decided off the next render, not off a hunch.

**The thing that justifies the batch:** 6 clips failed the clip check whose own
anchor **passed** the gate. Those are clips that drifted rather than stills that were
wrong, and nothing before 7B could see them at all — the seam check scores both ends
and both ends were fine. That is the gap, and it is real and measurable.

**Tickets.** `coord ok` is refused to agents — it reads a tty — so these need a person:

- `coord done JET-212` · `JET-219` · `JET-222` (video-processing; all three verified)
- `coord done JET-213` · `JET-216` · `JET-218` · `JET-220` · `JET-221` (mobile; all
  five verified from this side, evidence on each thread)
- `coord done JET-202` (handed back with `coord review`; 45 clips stitched as 32
  scene-aligned segments on this render)

**Left open deliberately:**
- **JET-215** — still two distinct section labels on every track. The look bible gives
  2 locations for 45 clips, so the gate's location check is near-vacuous, `disjunctive`
  has never fired, and "chorus 2 rhymes with chorus 1" cannot be shown. **More of
  Batch 7 is limited by this than by anything we could build.**
- **JET-217** — mobile's `isReady` is `Boolean(draft.audioUrl)`, so an all-blank brief
  can still be submitted. The suggestions cover songs with a read; the instrumental
  title-fallback case is not evidenced. Not closing it on a guess.
- **JET-194** — `posterUrl` is still a `storage.googleapis.com` URL. Not done.

**Next:** Batch 8, the call sheet. And one more render to confirm the budget fix and
to decide D12.

143 tests (was 107), typecheck clean, four do-not-touch files untouched.

### 2026-10-29T18:15

**Batch 7B is now built end to end.** 7B.1 earlier this session (see the 17:50 note);
this block is 7B.2 and 7B.3, the clip check, after JET-222 landed on their side.

**JET-222 delivered** — `atSeconds` takes a list and `maxWidth` shrinks the frame,
both on extraction only, both additive. They measured the estimate I guessed at: a
detailed 720p frame is 1.63MB PNG / 2.24MB base64, so 135 frames is ~100-300MB a song
rather than my 200-350 — right order, a little high at the top. At maxWidth 768 it is
0.57MB. **Still needs `coord ok 222`.**

Our side of it: `videoApiService.extractFrames(url, times[], ctx, maxWidth?)`, a
separate method rather than an overload, because the response shape is the thing that
differs — only a list answers with an array, and keeping the methods apart is what
preserves that guarantee here too.

**New: `src/services/render/clipCheckV1.ts`.** Samples two frames from the MIDDLE of
every finished clip and judges them. The middle is the point: the frame gate reads
the still before the clip exists, the seam check measures the two ends against the
stills either side, and **neither can see a clip that left its anchor, spent four
seconds elsewhere, and arrived back in time** — that clip scores a perfect seam at
both ends. Samples are taken at a third and two thirds of what SHIPS
(`musicalSeconds`, not `durationSeconds`), so a trimmed clip is judged on frames
someone actually watches — the same defect JET-212 removed from the seam check.

**7B.3 is asked against the plate, not the previous clip.** "Is the person in shot 12
the person on the reference sheet" answers the same question transitively for all 45
clips, needs no ordering between clips that are checked concurrently as they land,
and costs no extra call — the plate is one more image in a call already happening.

**D-043 is the new decision, and it narrows D-040.** D-040 governed the gate, where
acting costs cents. Acting here costs dollars out of the same fifth-of-the-song
budget the seam check uses. So: `verifyClipV1` now calls `verifySeamOfClipV1` then
`checkInsideClipV1`, in that order, on one budget — **the measured check spends
first**. The seam threshold is 9.0 over 132 clips; the clip check is measured over
nothing yet, and an unmeasured check must not starve a measured one. Making the order
structural rather than a comment is the point. `CLIP_REDRAW_ON_V1` is
`['people','location']` — narrower than the gate's three; 'text' is dropped because
the stills feeding every clip already passed the gate's text check, so paying a dollar
for it is paying twice for one defect. Continuity is recorded, never paid for.

Shared rather than copied, deliberately: `frameConstraintsV1`, `gateQuestionV1`,
`gateFailuresV1` and the answer parser all come from `frameGateV1`. Two parsers would
be two sets of rules about what a missing field means, which is the shape of every
threshold mistake here so far. It also makes one fact available that was not before —
**a clip failing the check whose own still passed the gate is a clip that drifted**,
rather than a still that was wrong.

One subtlety worth not re-deriving: a re-render for drift re-measures BOTH checks,
because the new take is pinned to the same stills but is not the same video — fixing
the drift can break the seam, and scoring only what we re-rendered for is how a fix
becomes a regression nobody sees. Also, the correction is APPENDED to the composed
prompt (`renderOneClipV1` gained an additive `correction` option) rather than
replacing it, so the environment, look and cast block survive; a re-render that drops
them is a different shot, not a corrected one.

Verdicts land on `RenderPlanV1.clips[].clipCheck` (passes included), with a
`clip check:` summary line printed from `runPlanV1` — NOT from inside `verifySeamsV1`,
which returns early on a normal render, which is exactly the run whose numbers matter.

`RENDER_CLIP_CHECK=0` turns it off independently of `RENDER_FRAME_GATE=0`.

**Next:** one render with both on. Everything above is a guess until the two
distributions exist — whether either list widens, whether continuity is trustworthy
enough to pay for, whether D10's second vision provider is worth the dependency.

140 tests (was 107), typecheck clean. Four do-not-touch files untouched.
**Nothing committed.**

### 2026-10-29T17:50

**Built 7B.1, the frame gate** — the first thing in this pipeline that looks at its
own output. A vision model reads every anchor still against that shot's stated
constraints before any clip is pinned to it. New file
`src/services/render/frameGateV1.ts`, wired into `renderAnchorsV1` (the worker, not a
request — the direction pass's 65.9s 202 is not repeated). Decision **D-040**.

Checks only what somebody wrote down: people count from the shot list's `castTags`,
location from the look bible's `locations` + `timeOfDay`, wardrobe from
`wardrobe[tag]`, plus lettering and anatomy which need nobody to state them. An
unstated constraint is SKIPPED, never guessed at.

**The decision is the spend/record split (D-040).** `GATE_REDRAW_ON_V1` holds three
kinds — people, location, text — and only those trigger a redraw. Wardrobe and
anatomy are recorded and never paid for: nobody has measured how often a vision model
is wrong about a generated frame, and a confidence threshold there would be the
fourth unmeasured number this codebase has bought after 4.0, 0.70/0.90 and Whisper's
language field. There is no score anywhere in the file — every rule is an integer or
a boolean compared in code.

Measured before building, 28 plans in Mongo: 25-74 anchors a render (typically
32-46); on the baseline `mvr_1793274379080_caa2155d` all 45 clips carry `castTags`
(38 want 1 person, 7 want 2) and an environment, and the bible has locations and
wardrobe per tag. So the gate has something stated on every frame at one vision call
per anchor against a ~$25 render.

Also in: **7B.4** for the still side (the failure sentence goes into the redraw
prompt — re-asking with identical words re-failed 29 of 31 times on the clip side),
**7B.5** (`RenderPlanV1.anchors[].gate` records pass, fail AND unchecked, plus one
summary line per render), **7B.6** (`gateBudgetV1` = one per anchor plus a fifth
again, the same fuse `rerenderBudgetV1` uses).

Fails soft everywhere: no vision model, a timeout or bad JSON records the anchor
`unchecked` and the render proceeds exactly as before. A plan with no shot list and
no bible states nothing, is skipped, costs zero — which is why it is on by default.
`RENDER_FRAME_GATE=0` turns it off.

**Not built: 7B.2 / 7B.3, the clip check.** Deliberate. 7B.2 folds into
`verifySeamsV1` and shares the re-render budget, so it changes the keep-or-re-render
call on clips that cost dollars, and the plan's own warning is that two thresholds
disagreeing is what 4.0 cost. Its open question is "how strict", and the gate's
stored verdicts from one real render answer that for the same vision model. Building
it blind first is the 4.0 mistake again. The reusable half is already there:
`frameConstraintsV1`, `gateQuestionV1`, `gateFailuresV1` and `checkFrameV1` take any
image URL, and `extractFrameV1` already samples a clip.

**Filed JET-222** -> video-processing-backend: several frames from one clip in one
call, plus an optional `maxWidth`. 7B.2 samples 2-3 frames of every finished clip, so
90-135 extractions a song where their contract was written for ~66, each a full 720p
lossless PNG inline. **Not a blocker** — JET-212's `atSeconds` is delivered and
integrated, so 7B.2 can make N full-size calls and pay for it. The ticket says so,
and says we may be wrong about its priority against JET-215.

**JET-212 is delivered and integrated but still open** — needs `coord ok 212`.

**Noted on JET-215**, not a new ticket: both recent renders return only two distinct
section labels, so the bible holds 2 locations for 45 clips and the gate's location
check is near-vacuous. It catches a frame that went somewhere else entirely; it
cannot catch the drift it was built for until boundaries are finer and stable.

**Checked and NOT a ticket:** 6.5's trim half. The delivery plan still says "nothing
sends them yet", but `stitchTrimmedV1` sends `outSeconds` and `seamCheckV1` has
`tailFrameV1`. The artifact is stale there.

**Next, in order:**
1. One render with the gate on. Read the `frame gate:` log line and the stored
   `anchors[].gate`.
2. From that distribution: does the list widen (wardrobe, anatomy)? Is one redraw
   enough? Is the false-pass rate bad enough to want D10's second vision provider?
3. Then 7B.2/7B.3 on top of measured numbers.

Untouched as required: `aiModels.ts`, `videoService.ts`, `synthesis.service.ts`,
`video.controller.ts`. 127 tests (was 107), typecheck clean. **Nothing committed.**

### 2026-10-29T17:42:17+05:30

Session ended while on JET-221. Touched: src/services/render/frameGateV1.ts, src/models/RenderPlanV1.ts, src/services/render/frameGateV1.test.ts, src/services/render/renderOrchestratorV1.ts. Nothing committed. (written automatically — no one said what is next)

### 2026-10-29T12:10:51+05:30

Session ended while on JET-214. Touched: src/services/render/lookBibleV1.ts, src/services/render/treatmentV1.ts, src/services/render/cutPlanV1.ts, src/services/render/shotListV1.ts, src/models/RenderPlanV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/shotListV1.test.ts. Nothing committed. (written automatically — no one said what is next)

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
