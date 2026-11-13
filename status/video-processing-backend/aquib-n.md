# video-processing-backend — aquib N

- **Current task:** JET-323 (lyric timing from a forced aligner, behind LYRIC_FORCED_ALIGNMENT) built and uncommitted, waiting on the requester's ear test. JET-321/322 committed (b8cf497, 5a00afc), waiting on the requester. JET-276 paused.
- **Status:** waiting on human
- **Blockers:** the board does not sync from this machine — `coord sync` push fails with `remote: error: inflate: data stream error`. Everything else: JET-232, JET-233, JET-222, JET-219, JET-215 and JET-212 are with the requester; JET-199/200/201/203 are ours to close with `coord ok`
- **Last updated:** 2026-11-13T16:20:00+05:30

## Handoff notes

<!-- newest first: add a new "### <timestamp>" block on top; what was done, what's next -->
### 2026-11-13T16:20:00+05:30

**JET-323.** Round 2 (star between lines, unsure lines may move at confidence >=0.5, lines ordered by where found): eval lines within 1s 92%->96%, no song worse; replay harness at scratchpad sync/replay.py. New app/processors/lyrics/aligner.py (torchaudio MMS_FA, whole song, 30s emission chunks, model loaded per song and dropped). `gemini_transcriber._retime`: aligner times per line when confidence >= 0.3, else Gemini's fitted between sure neighbours; no overlaps; words held to the next start (<1s gap), min 0.3s. LYRIC_FORCED_ALIGNMENT now defaults on (config.py, not .env); flag is in both cache keys, so no version bump. Oye Hoye: overlaps 13->0, uncaptioned singing 11s->4.6s. Previews in the scratchpad (oye/ab_final.mp4). Open: Docker prefetch of the 1.2GB MMS weights; music backend SONG_READ_CACHE_V1 bump when the flag is turned on; the 'lut-put' repeats moved 1.7s, need an ear. Next: user renders with the flag on, then commit.

### 2026-11-13T16:30:00+05:30

**JET-321 + JET-322**, one working tree, uncommitted, 698 tests pass. 321: each process heartbeats `alive_at` on its live jobs every 30s (daemon thread from lifespan). The sweep runs at boot and every 30s and fails only jobs silent > 180s, then calls `_report_outcome`. Pre-worker failures report too. A completed/failed job can no longer be written (store filter), and `_run` skips the callback if it lost. No instance id: a heartbeat covers both cases. 322: `transcription.within_limit` (daemon thread, TRANSCRIPTION_TIMEOUT_SECONDS=1200). A hang fails its job and releases the lock; the thread is abandoned, not killed (ponytail comment). Bhojpuri fix committed (4e690bc); music backend bumped to cache 4 by the user and verified. Next: commit as two commits; the requester runs the Test steps.

### 2026-11-12T17:00:00+05:30

**Bhojpuri lyrics ("Sent Gamkauwa", no request).** The read showed DJ tags, "Ready." and Bengali. Cause: Gemini's transcription model heard only the tags (30% of the singing); the lyric sheet had the real lines but `_pin` vetoed it because it held under half the transcript's (tag) words. Fix: the veto only applies when the transcript covered >= 50% of the stem's singing (MIN_COVERAGE_TO_VETO). Song: 0% -> 41% word recall, no Bengali. Eval set: rule never fires (coverage 71-92%), no change. Tried and dropped: sheet without the transcript hint (35%), a regional-dialect prompt line (31%). Cleared `coord on` (was JET-276). Next: commit; bump music backend SONG_READ_CACHE_V1 3 -> 4; Bhojpuri still ~40%, the model's hearing is the ceiling.

### 2026-11-12T12:20:00+05:30

**JET-276.** Measured one 36-clip, 243s, 9:16 project locally (Mac, 10 cores) on v2 then v1: wall 73s v2 vs 163s v1. Per segment the biggest stage is the JET-207 trim re-encode (~24s median), not download (~4s) or xfade (2.6s v2 / 5.2s v1). The v1 concat burns at 1080x1920 (62.8s) vs v2 720x1280 (19.7s). Trims run before the pool, so all 15 run at once: 14 ffmpeg, ~2.7GB, ~7 cores, no FFMPEG_THREADS cap. Added two log-only timers (queue_wait, clip_trims), then reverted them; the patch is in the request thread. Full table is a note on the request. music-jetkreate-backend flags.ts was flipped to v1 for the run and reverted (no diff left). Next: re-apply the patch, then on the VM rerun to get real numbers; worth a request to cap or pool the trims.

### 2026-11-11T17:36:41+05:30

Session ended while on JET-306. Touched: start-on-jet-276-replicated-goblet.md, app/infrastructure/jobs/manager.py. Nothing committed. (written automatically — no one said what is next)

### 2026-11-10T14:35:00+05:30

**JET-280.** Segments now run in their own pool (SEGMENT_WORKERS=2); the concat, whole-song stitches and fallbacks stay on MAX_CONCURRENT_JOBS. A transcript cache hit is read without transcription.lock. FFmpegEngine._run adds `-threads cores//(both pools)` (FFMPEG_THREADS overrides). Segments call back under their own attemptId (callback_attempt_id, which settles nothing). Cancel step dropped: D-079. Contracts video-segments.md and video-stitching-v2.md corrected. On the 2-vCPU prod box this means -threads 1 and up to 3 encodes at once, so watch RAM; SEGMENT_WORKERS=1 is the safe setting if it struggles. Next: commit, then the person who filed it checks the Test steps. test_golden_script fails before this change too.

### 2026-11-09T01:00:00+05:30

**JET-265** (on top of uncommitted JET-264). Lutt Putt Gaya went blank because the whole-song transcribe call heard 56-63 words and JET-264 threw the sheet away under 80% agreement. Now: with a stem, the clock is the stem in ~30s pieces (gemini_transcriber._cuts/_transcribe_pieces; D-073's mix+stem merge and _fill_silences deleted); the sheet carries line start/end and is the source (_pin: transcript times within 5s of the line, else the sheet's window spread over sung frames, silent lines dropped, transcript-only lines kept). Roman for any script via transliterate(known=) by word core. Lutt 220 words, Oye Hoye chorus 81-87%, Stay With Me 329/333. Scripts: scratchpad s265/ (not kept). Next: commit (264+265 together), `coord review 264` and `265`, JET-256 on the music side, test a Tamil/Punjabi song.

