# video-processing-backend — aquib N

- **Current task:** D-073 — Gemini lyrics dropped whole verses; now transcribes mix + Demucs vocal stem and merges. Uncommitted, waiting on the human to commit. JET-256 (music side cache bump) waiting on approval
- **Status:** waiting on human
- **Blockers:** the board does not sync from this machine — `coord sync` push fails with `remote: error: inflate: data stream error`. Everything else: JET-232, JET-233, JET-222, JET-219, JET-215 and JET-212 are with the requester; JET-199/200/201/203 are ours to close with `coord ok`
- **Last updated:** 2026-11-05T19:00:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-11-05T19:00:00+05:30

**Missing lyrics in videos — D-073.** Not the caption mapping (verified: zero transcript words lost between transcript and burned ASS). Gemini on the full mix drops sung stretches and sometimes returns a 12-word repetition loop. Now: Demucs stem (192k, not 96k — 96k read 0 words) + mix sent in parallel, fuller one leads, silences >4s filled from the other, loop reply = that input failed. Transcript cache key (TRANSCRIPT_VERSION 2) and READ_VERSION 3 bumped. Files: gemini_transcriber.py, stitch_pipeline.py, transcription.py, song_read.py, tests. Next: commit; JET-256 on music side; watch Demucs CPU/RAM on the 2-vCPU/4GB server. Comparison scripts are in this session's scratchpad (not kept). Also filed today: JET-252 (done), JET-255 (poll retry).
Round 2 (user's local render still had the gap): Gemini also truncates or mis-times the VOCALS reply at random (6 words; or 307 words with verse 1 placed 10s late). Each reply is now judged by how much of the stem's singing it covers (want 85%), retried up to 3x, stopping early on an identical answer; best-covering reply leads the merge. Stay With Me 5/5 runs at 92-95%. Timeless/short top out ~77-80% (ad-libs on the stem) and still vary run to run (498 vs 424, 88 vs 64) — not worse than before, not solved. Deleted the two local cache entries the bad 18:47 render left (transcripts/092fb4…, song-reads/4c421f…).

### 2026-11-05T01:00:39+05:30

Session ended while on JET-246. Touched: app/main.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-04T13:38:25+05:30

Session ended while on JET-246. Touched: app/services/job_service.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-04T00:32:29+05:30

Session ended while on JET-246. Touched: app/pipeline/stitch_pipeline_v2.py, tests/test_v2_single_pass.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-03T18:00:00+05:30

**JET-246 — a render that returned 202 and never ran. Handed back for review.**

Six causes, one of them primary and none of them what the ticket or I first
guessed. It was never CPU starvation and never the landscape frame:
`submit_workflow` claimed its attempt **twice**. JET-202 wrapped the claim in
`if attempt_scoped:` and left the original call above it, so the second claim
read `created=False` — the JET-155 deduplication signal — took a fresh render
for a retried one, and returned a job id without submitting anything. Every
`clip-stitching*` and `segment-concat` call since 2026-10-27 was affected. A
39-clip render left 16 orphan segment rows plus a concat that never started:
exactly the 16 + 1 the ticket reported.

The thing that made it findable: `prepare_and_submit` writes
`status="running"` as its 6th statement and `JobManager._run` writes it first,
so a row at `queued` with `created_at == updated_at` cannot be a slow render
or a busy worker — it can only be a coroutine that never ran a line. That one
fact ruled out both standing hypotheses in a minute. **The two failing
`test_v2_pipeline` tests had been telling us this for a week** (KeyError
'pipeline' — the row returned was the orphan, with the short metadata).

Also fixed, all the same shape — an unbounded wait on the one worker slot:
tasks held in a set so the loop cannot GC them mid-flight; `BaseException` so
a cancelled task settles its row instead of abandoning it; a boot sweep that
fails what a dead process left; and `MEDIA_TIMEOUT_SECONDS` (D-066) on all 16
ffmpeg/ffprobe call sites, since none of them had a timeout.

**Next:** JET-246 is in review and needs the requester to verify and close.
JET-240 (lyricEngine, D-061) is still waiting on approval.

Two notes for whoever is next:

- `coord review` refuses until the ticket's **Test steps section** is filled
  in, and there is no CLI flag that writes it — `--test` only works on
  `coord new`. coord's own drill (`bin/drill.js:184`) edits the section in the
  file, so that is what I did. Worth a `--test` on `review`.
- The suite is 610 passing, 1 failing:
  `test_golden_script.py::test_rendered_lines_have_small_nonoverlapping_gap`.
  It fails identically before any of this work (checked by stashing) and it is
  an ffmpeg lavfi `CalledProcessError`, **not** MongoDB, whatever an earlier
  thread entry says.

### 2026-11-03T00:00:00+05:30

**D-061 — the lyric engine is the request's to name; `LYRIC_ENGINE` is gone.**

D-059 put the engine on the deployment, which answers for every caller at
once. `creater-ai-backend` calls `/api/v1/clip-stitching-with-lyrics` and has
never heard of engines, so Gemini could not be turned on for
music-jetkreate-backend without turning it on for them. Now: optional
`lyricEngine` on the lyrics stitch, segment-concat, lyric-transcription and
song-read, v1 and v2 alike; **absent is `whisper`, hardcoded**; a bad value
is a 422 off a `Literal`. The env var is deleted rather than kept as the
fallback — two ways to answer the same question is one way for a deployment
to move what an old caller gets, which is the whole point of the decision.

The only part that can go wrong silently is the two cache keys:

- `transcription_config()` harvests `lyric_*` off **settings**, so it cannot
  see a per-request engine. `fingerprint()` now takes `lyric_engine` as an
  argument. Without that, the caller who asked for nothing is served Gemini's
  words out of another caller's warm-up — worse than the problem being fixed.
- `song_read.cache_key()` was bytes + READ_VERSION + app_version and nothing
  else. It now carries the engine **and `language`**, which it should always
  have had: sections are read from the transcript's words.

Adding the engine to the fingerprint changes every existing key, so the
transcript cache is cold once on deploy. 24h TTL, nothing depends on it.

**Next:** JET-240 is filed to music-jetkreate-backend for their four call
sites and needs approving. And `submit_workflow` has a **pre-existing** bug
sitting right where I added the engine to job metadata: it calls
`create_or_get_job` twice, first with a short metadata dict, so the full one
(carrying `pipeline`, `output_frame` and now `lyric_engine`) never reaches
the state of an attempt-scoped job. That is why
`tests/test_v2_pipeline.py::test_the_job_records_which_pipeline_rendered_it`
and `::test_v2_runs_on_the_v2_pipeline_and_v1_on_v1` fail on HEAD, and it
makes the engine unattributable on exactly the jobs you would want to
attribute. The fix is deleting the first call (job_service.py ~126-135); left
alone because it is JET-237's area, not asked for, and changes what that
ticket's tests assert.

