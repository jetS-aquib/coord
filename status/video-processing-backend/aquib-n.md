# video-processing-backend — aquib N

- **Current task:** JET-211 built and handed back; JET-206/207 also in review
- **Status:** waiting on human
- **Blockers:** none. JET-206/207 are waiting on the requester to verify and close; JET-208/209/210 are out to the Node and mobile repos
- **Last updated:** 2026-10-27T16:01:12+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->

### 2026-10-27T16:01:12+05:30

**JET-211 — the transcript text comes back.** `text` on the
`/api/v1/lyric-transcription` response: the lyrics, one line per segment,
newline separated. Not opt-in — the requester offered a request flag and we
declined it, because it would be a field every caller sets to the same value
forever to guard against three kilobytes.

The corrected text, not `raw_text`, so the storyboard is written against the
same string the captions are burnt from. Word timings still stay here; that
half of the original rule was right and is unchanged.

Worth knowing: the ticket asked for per-line times as a nice-to-have. They
already exist — `/api/v1/song-read` returns `lines` with `start`/`end`/`text`
inside each section, already snapped to the bar grid (JET-206). Better than
timed lines from the transcription endpoint would have been, and it is now
written into `contracts/video-transcription.md` pointing at the other contract
by name, so the split is explicit: words here, timed lines there, word timings
nowhere.

**Unrelated, and it cost a real debugging session:** transcription was failing
in the local venv with
`TypeError: open() got an unexpected keyword argument 'metadata_errors'`,
*after* Demucs and the large-v3 load had already run — about two minutes before
it told you anything. `faster-whisper 1.2.1` calls
`av.open(..., metadata_errors="ignore")`, a keyword **PyAV removed in 19**,
while declaring only `av>=11`. A fresh resolve installs av 19 and every
transcription dies. The image had escaped it purely because it was built while
18 was still current — a rebuild would have broken it too.

Pinned `av>=14,<19` in requirements.txt with the reason in a comment. Not an
added dependency: it constrains one that already arrives transitively, and the
image already satisfies it, so nothing changes on a rebuild except that it
stays working.

Also checked and NOT a bug, since the logs make it look like one: the startup
banner says `Configured language: hi` while extraction says `auto`.
`LyricsOptions.language` defaults to `"auto"`, so both the warm call and the
stitch send `auto` and share a cache key. The `.env` value only applies when a
caller passes nothing, which the API never does.

428 tests pass. Nothing committed.

Next: JET-206, JET-207 and JET-211 are all in review, waiting on the requester
to verify and close. Still unticketed: `contracts/video-segments.md` should say
segments do not encode in parallel here (`MAX_CONCURRENT_JOBS=1`).

### 2026-10-27T15:23:55+05:30

Both requests addressed to this repo are built and back with the requester.

**JET-207 — per-clip in/out points.** `inSeconds`/`outSeconds` on `ClipInput`,
so one change reached clip-stitching, -with-audio, -with-lyrics and
segment-stitch together. The trim runs right after download, before analysis:
the xfade offsets come from the durations analysis finds on disk, so
transitions, captions, the master-audio mux and segment joins all work on the
surviving frames without touching the transition graph — which is the most
delicate arithmetic in the service and was worth routing around. An untrimmed
clip is never decoded, so today's output is unchanged.

Two divergences flagged on the ticket: the requester asked for a 422 when an
out point runs past the end of a clip, and that half is impossible — these
endpoints answer with a job id before any clip is fetched, so the duration is
not known yet. It fails the job instead, naming the real duration. And there
is a 0.05s tolerance, a little over one frame at 24fps, because the caller
computes out points from bar lengths in floating point.

**JET-206 — song read.** `POST /api/v1/song-read`: sections, downbeats, BPM,
per-bar energy, language. New contract `contracts/video-song-read.md`.

No new dependency — **D-028**. librosa would have pulled scipy, numba and
llvmlite into an image already carrying a 2.9 GB Whisper model, for one job on
material the requester scoped to steady 4/4 pop. numpy and the ffmpeg already
here get within 0.05 BPM across 74–165 BPM. `requirements.txt` is untouched,
so this deploys with no `--build`.

The one thing worth not re-deriving, and it is in D-028: autocorrelation can
only report a whole number of frames, and at a 512 hop lag 21 is 123.1 BPM
while lag 22 is 117.5 — a real 120 BPM track can only come back as one or the
other, both wrong by over 2 BPM, which walks the grid a full bar off the song
over four minutes. Parabolic interpolation of the peak does *not* fix it
either; a click-train peak is one or two frames wide so the parabola fits the
peak's shape, not the period. What works is a fine search over real-valued
periods for the pulse train that best fits the onsets.

Ceilings, both marked in code: one tempo per song, no drift or time-signature
detection (song_read.py); and a trimmed clip is encoded here and again by the
xfade pass, which folding the trim into that pass's input args would avoid at
the cost of hand-feeding trimmed durations into the xfade offset arithmetic
(clip_trim.py).

422 tests pass in the container. Nothing committed.

Still open from earlier today and not done: `contracts/video-segments.md`
should say that segments do **not** encode in parallel here
(`MAX_CONCURRENT_JOBS=1`) — the Node side's code comment assumes they do, and
that assumption is most of why JET-202 measured slower than the single call it
replaced. Noted on JET-202; wants its own ticket since JET-202 does not
authorise a contract edit on this side.

Next: nothing until JET-206/207 are verified and closed. 6.4's cut plan is the
Node repo's work and now has both of its inputs.

### 2026-10-27T13:57:49+05:30

Batch 6 is a music-jetkreate-backend/mobile batch with two pieces that land here.
Those two are filed and waiting:

- **JET-206** song structure and beat map — sections, BPM, downbeats, per-bar energy,
  language. The long pole: everything in Batch 6 and most of 7 and 8 reads sections
  and bars as input. Needs a beat-tracking dependency this service does not have
  (numpy is here, librosa is not) — flagged in the ticket rather than decided.
- **JET-207** per-clip in/out points on the stitch request (D-027). Right place for it
  is ClipInput in app/schemas/jobs.py, so one change reaches clip-stitching,
  -with-audio, -with-lyrics and segment-stitch together.

Filed outward for the rest of the batch rather than writing it here — 6.1, 6.3, 6.4
and 6.6 are all in other repos:

- **JET-208** / **JET-209** warm the transcript at upload (6.1), server and mobile halves.
- **JET-210** invert the seam rule at scene changes (6.6). The find worth keeping: at a
  scene boundary the previous clip is currently *pinned* to the next scene's opening
  still and then re-rendered for failing to arrive there, so the pipeline pays
  generation money to produce the jump cut the check exists to prevent.
- 6.3 (SongReadV1) and 6.4 (cut plan) deliberately not filed — both are written
  against JET-206's response shape, and filing them against an unapproved contract
  would just mean rewriting them.

Noted on **JET-202**: segment stitching is measurably slower than the single call it
replaced. All 15 segments are posted in the same 0.3s at the end of a render and then
serialise to 69s here because MAX_CONCURRENT_JOBS=1. Their side should post each
segment as its scene closes; our side should say in contracts/video-segments.md that
segments do not encode in parallel, which that contract currently implies they do.
That contract line still needs doing and wants its own ticket.

Changed here: a CREATOR_CALLBACK_URL naming no path is now read as unset, with one
warning at boot, instead of a 404 and five backed-off retries per job. Worth being
precise about, because the brief had it the other way round — **no measurement was
ever being lost**. Job state is authoritative and the creator API settles by polling
GET /api/v1/jobs/{job_id}; this callback is a latency optimisation the contract
allows to be lost. The cost was threads and log noise, not money.

Next: nothing here until JET-206/207 are approved. Then JET-207 first — it is the
smaller of the two and 6.4 cannot be judged on a live render without it.
### 2026-10-27T12:25:45+05:30

Job state can now live in Mongo instead of JSON files under STORAGE_ROOT (D-025).

Why it mattered: STORAGE_ROOT is /tmp inside the image, so every job record went with
the container on a deploy — a client holding a job id got a 404 — and the JET-155
attempt deduplication being a file on one machine's disk is one of the three things
stopping this service running as more than one instance. That started to matter when
15 segment jobs were measured running one at a time for 69s under MAX_CONCURRENT_JOBS=1.

Rejected: routing job state through music-jetkreate-backend's API. Every stage change
would become a network call, this service would stop accepting work when Node is down,
and /api/v1/jobs is our contract with two readers. Direct connection instead, with the
MONGO_URI they already have — one database server on this platform.

Persistence now sits behind a small store interface: FileJobStore (unchanged behaviour,
still the default and what the offline suite uses) and MongoJobStore. Collection
video_jobs, partial unique index on attempt_id — partial because segment jobs have no
attempt — and a TTL index on expires_at. With MONGO_URI set the service refuses to
start if Mongo is unreachable.

Verified against the real Mongo on this machine, not just a fake: both indexes created
as intended, six attempt-less jobs coexisting, one attempt producing exactly one
document on the second submission, and a missing job still raising KeyError. 379 tests
pass, ruff clean. Local gotcha worth knowing: a local replica set advertises 127.0.0.1,
so from a container the URI needs ?directConnection=true.

Next: nothing is committed for this. Still open from before — the settlement callback is
misconfigured (CREATOR_CALLBACK_URL has no path, every job logs 404 Cannot POST /), and
mirroring our `stage` into the Node plan document is the cheap half of live progress.
### 2026-10-26T13:52:00+05:30

The requester answered both parked questions on the board, so both endpoints are built.

JET-201 — POST /api/v1/lyric-transcription. Transcribes now, keeps the transcript, and
clip-stitching-with-lyrics finds it instead of running Whisper. Keyed on the audio's
BYTES rather than audioUrl: their URLs are signed, so a URL key would miss every time,
and bytes give exactly the invalidation rule they asked for. They pass nothing extra.
The endpoint runs the pipeline's own transcription phase so a cached transcript is
identical to one the stitch would have made itself. D-021, contract
video-transcription.md.

JET-202 — POST /api/v1/segment-stitch and /api/v1/segment-concat. Scene-aligned, as
they confirmed. The finalise takes segment JOB IDS, not URLs: no expiry, and ownership
is checked before this service signs anything in its own bucket. A segment is not an
attempt — not deduplicated, reports nothing to the creator API; the finalise is
attempt-scoped and settles, so one attempt still settles once and billing is unchanged.
Segments must share a frame: ffmpeg stream-copies a mismatch without an error and
produces a broken master, so it is checked here. D-022, contract video-segments.md.

Nothing existing changed. The three stitch endpoints, their schemas and their defaults
are byte-identical; everything new is additive. 357 tests pass (was 323), ruff clean on
everything new. Smoke-tested end to end in the container: two segments rendered, joined
with -c copy in 0.08s, audio muxed by stream copy, and a captioned finalise that took
the cache hit and never loaded Whisper.

Still not done, deliberately: render at the clips' native size. It is worth 1.8x on the
encode, but it changes the resolution every existing caller receives, which is the one
thing this sitting was told not to do. It needs its own flag and its own decision
superseding D-017 — about ten lines once somebody says yes.

Loose ends unchanged: D-005's superseded_by still points at D-011 and needs a human
with board access (noted on JET-196). The caption preview is still landscape-only.
And D-020 is an empty decision I created by running `coord decide` without the body
flags; I superseded it with D-021 rather than hand-editing decisions/.

Next: nothing is committed. Three separate commits are staged up in the working tree —
JET-196's portrait flag, JET-197's frame endpoints, the no-ticket performance work — and
now a fourth for this. Run `coord on JET-196` before the first one.
### 2026-10-26T13:13:29+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T13:30:00+05:30

Profiled a real 31-clip render end to end from the container logs. The finding that
matters: of 318s elapsed, this service was busy 94s. 224s was idle while Node
re-rendered clips. Stitching is 59s and fine. Filed JET-199..203 against
music-jetkreate-backend for the Node-side half; they are being worked on now.

Measured, so nobody re-derives it: assembly 0.23x realtime and linear in clip count;
caption burn 0.08x; Whisper large-v3 cold start 99s / 2.9 GB, 6.2s with the cache
volume; MoviePy 4x SLOWER than the current filter graph (rejected); encode at native
720x1280@24 is 13.6s vs 24.4s at today's 1920x1080@30, and the portrait flag is
SLOWER still at 27.8s because black bars are nearly free to encode.

Next in this repo, in order: (1) render at the clips' native size — worth 1.8x on the
encode and revisits D-005/D-017, which the measurement shows were wrong for mobile's
material; (2) the transcription endpoint JET-201 needs; (3) the segment stitch and
concat endpoints JET-202 needs. Both (2) and (3) are blocked on shape decisions the
tickets ask for. Also still open: caption preview is landscape-only and needs its own
ticket, and D-005's superseded_by points at D-011 instead of D-017 and needs a human
with direct board access.

Nothing is committed. Working tree holds JET-196, JET-197 and the perf work together.
### 2026-10-26T13:05:25+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T13:01:18+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:53:40+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:44:34+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:21:47+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:20:51+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:15:30+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +3 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:03:06+05:30

Session ended while on JET-197. Touched: bench_assembly.py, docker-compose.yml, app/main.py, app/core/config.py, app/pipeline/stitch_pipeline.py, tests/test_target_frame.py, scripts/compare_whisper_models.py, video-stitching.md, +1 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-26T12:00:00+05:30

Profiled assembly end to end — it is not the bottleneck. 0.23x realtime, linear in
clip count; captions add 0.08x. Whole video path for a 4-min song is ~80s. The cost
is Whisper: large-v3 cold start was 99s and 2.9 GB on every container recreate.
Added a cache volume (measured 87s -> 6.2s), a startup guard that refuses to boot
with USE_VOCAL_SEPARATION=true and no Demucs (it used to degrade silently), and
scripts/compare_whisper_models.py so the model choice can be made on real audio.
Put the numbers in coord ctx. MoviePy measured at 4x slower — rejected, not adopted.
JET-196's portrait output is now behind ENABLE_PORTRAIT_OUTPUT, default off (D-017).
Nothing committed.

**I made a board mistake that needs a human:** I ran `coord supersede D-005 D-011`
guessing an id instead of reading the one coord printed. D-005's real successor is
D-017; D-011 is an unrelated JET-198 decision. The CLI will not re-point an
already-superseded decision and decisions/ is not hand-editable, so D-005's
frontmatter is wrong and someone with direct board access has to fix it.

Next: decide the Whisper model on real audio with the new script, then decide
whether the v1 pipeline (fused single encode, transcription overlapped with
analysis) is still worth it — on the measurements it is worth ~25s per song, far
less than the Whisper levers.
### 2026-10-23T15:04:34+05:30

Session ended while on JET-197. Touched: Dockerfile, docker-compose.yml, app/pipeline/stitch_pipeline.py, app/processors/ffmpeg/ffmpeg_engine.py, tests/test_target_frame.py, jet196_check.py, jet196_ass.py, video-stitching.md, +11 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-23T16:30:00+05:30

JET-197 implemented and handed back. Two synchronous endpoints — frame-extraction
returns a lossless PNG inline and stores nothing; frame-comparison takes the video
and the anchor rather than two image URLs, because with nothing stored the video
side has no URL. D-010 records both choices and the Rec.709 greyscale that keeps
the caller's 4.0 threshold meaningful. Shapes written down in contracts/video-frames.md
and both registered in the registry. Verified live over HTTP including six concurrent
extractions. Nothing committed; JET-196 is still open alongside this.

Next: someone runs the test steps on real material. The one thing synthetic clips
could not confirm is the middle of the caller's band (2.1-3.3 for a clip that
honoured its pin) — the 0 and 10+ ends are verified. Also still open from JET-196:
the landscape-only caption preview, and the rate-card question.
### 2026-10-22T15:35:25+05:30

Session ended while on JET-196. Touched: Dockerfile, docker-compose.yml, app/pipeline/stitch_pipeline.py, app/processors/ffmpeg/ffmpeg_engine.py, tests/test_target_frame.py, jet196_check.py, jet196_ass.py, video-stitching.md, +2 more. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T14:05:00+05:30

JET-196 implemented and moved to review. The audio/lyrics workflows now derive
orientation from the clips (majority wins, ties go landscape) while holding the
frame size fixed, so landscape callers are unchanged — verified by rendering both
orientations in the container. Both caption canvases follow the frame. D-005
records why the size is not derived. Nothing committed.

Next: someone runs the ticket's test steps against a real portrait job and closes
it. Two things left open — the caption preview is still landscape-only (noted on
video-captions.md, needs its own ticket), and nobody has confirmed with the rate
card owner that no video-service rate card declares a `resolution` enum selector;
if one does, a portrait job's settlement would fail where a landscape one does not.

### 2026-10-22T13:45:07+05:30

Session ended. Touched: Dockerfile, docker-compose.yml. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T12:42:06+05:30

Session ended. Touched: Dockerfile, docker-compose.yml. Nothing committed. (written automatically — no one said what is next)

### 2026-10-22T12:30:27+05:30

Session ended. Touched: Dockerfile, docker-compose.yml. Nothing committed. (written automatically — no one said what is next)

### 2026-10-19T19:06:16+05:30

Session ended. Touched: graphify-out/.graphify_chunk_01.json. Nothing committed. (written automatically — no one said what is next)
