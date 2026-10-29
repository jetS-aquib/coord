# video-processing-backend — aquib N

- **Current task:** JET-215 built and handed back
- **Status:** waiting on human
- **Blockers:** none. JET-215 and JET-212 are both with the requester; JET-199/200/201/203 are ours to close with `coord ok`
- **Last updated:** 2026-10-29T12:46:53+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->

### 2026-10-29T12:46:53+05:30

**JET-215 — the same bytes now give the same read, and no section swallows the song.**

Two halves, two causes, and the first was not where the ticket guessed.

*Reproducibility.* Not segmentation — Whisper. `WHISPER_TEMPERATURE_FALLBACK`
re-decodes a window that fails a confidence or repetition check at temperature
0.2–1.0, and every decode above 0 samples. CTranslate2 seeds that sampler per
thread from `std::random_device`, and `set_random_seed` only writes a global a
thread reads once at its first sample, so a warm worker cannot be re-seeded and
there is no seed to set. Sung lyrics trip the repetition check constantly, which
is why the choruses moved most. Default is now off — beam search only, and
deterministic. D-035 has the alternatives and the quality cost.

*The 200.9s section.* `_blocks` only ever split on a 3.5s instrumental gap, and a
continuously sung track has none. `_subdivide` now cuts a block longer than a
third of the song: first at every line sung twice inside it, then at the longest
breath inside whichever piece is still too long. Only line boundaries are used,
so everything still snaps to a downbeat. READ_VERSION is 2 so old cached reads
miss. D-036.

Simulated both reported shapes: Timeless-shaped goes from one 200.9s section to
a worst case of 81s (32%), akcent-shaped to 38s (15%); boundaries on the grid,
instrumental unchanged.

Next: nothing of ours. JET-215 is in review with Test steps — the requester
re-reads both tracks against their stored 27/29 Oct documents. JET-212 is still
waiting on them. JET-199/200/201/203 are ours to close with `coord ok`.

### 2026-10-27T16:52:38+05:30

**JET-212 — a frame at a time, not just at an end.** `atSeconds` on
`/api/v1/frame-extraction` and `/api/v1/frame-comparison`, replacing
`position` when present. `position` went required → optional; that is the
only change to the old shape, so every existing call returns the same bytes.

This is the other half of JET-207. Once a clip is generated at the model's
length and used at the music's length, `last` is a frame in the 2.8 seconds
nobody watches — the seam check was scoring a cut frame against an anchor the
next clip opens on, so a clip could be re-rendered for a mismatch no viewer
would see while a real one at 5.217s went unmeasured.

Both fields together is a 422, as the requester asked, rather than a
precedence rule nobody remembers. A time past the end falls through the same
`-sseof` cascade `last` uses, so a clip that came back a frame short costs a
different measurement and never the render.

Two properties worth keeping pinned, both tested rather than asserted in
prose: `-ss` goes before `-i`, so the same time gives byte-identical bytes
(without that a re-measurement after a re-render means nothing); and the
score scale is untouched, so the 9.0 threshold and the 132-clip band behind
it (D-018) still mean what they meant. The second was the requester's stated
main worry and a moved scale would have cost another five renders to
re-derive.

Flagged on the ticket, not fixed here because it is theirs: their plan
measures the tail at `musicalSeconds` minus a frame, which needs the clip's
real fps — 41.7ms at 24fps against 33.3ms at 30. Subtract the wrong one on a
clip whose last frame sits near the boundary and you measure the frame after
the cut, which is the exact defect the ticket exists to remove. Offered to
return fps on the extraction response if that is awkward to get there; it is
one ffprobe field already read.

440 tests pass. Nothing committed.

Next: four tickets this repo FILED are back from review and are ours to close
once verified — `coord ok 199`, `200`, `201`, `203`. JET-202 is still
correctly `go`: segments are posted all at once at the end, so its win is
unclaimed. Still unticketed: `contracts/video-segments.md` should say
segments do not encode in parallel here (`MAX_CONCURRENT_JOBS=1`).

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
