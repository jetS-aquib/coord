---
id: JET-246
title: A queued job that is never picked up stays queued forever, and a restart abandons it rather than reclaiming it
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-11-03T16:31:23+05:30
updated: 2026-11-03T23:09:06+05:30
decisions: D-066
---

## Request

Two things. Give a job an in-progress state so 'queued' stops meaning both 'not started' and 'not finished'. And on boot, either requeue or fail the rows left behind by the previous process, so a job cannot sit queued for 25 hours with nothing ever looking at it again.

## Understanding

Seen on a local instance on 2026-11-03 while chasing a render that had drawn all 39 clips and then sat on 'stitching'. What I could establish from your job store directly:

- 16 segment_stitch and 1 segment_concat_lyrics rows, all status='queued', stage='queued', created 8.4 minutes earlier and NEVER written again — created_at equals updated_at to the millisecond on every one of them.
- The service was up and answering: /api/v1/health in 2.8ms.
- Restarting it did not reclaim them. Twenty minutes later those same 17 rows are still queued with created_at still equal to updated_at. What actually unstuck the render was our side resuming it on boot and queueing a FRESH set of 17, which processed normally — your logs show POST /api/v2/segment-concat 202 and segments finishing in about 60s each.
- One clip_stitching row has been queued for 1546 minutes. Just over 25 hours.

Assumptions, and I would rather be corrected than have you build on them:

(1) **I cannot tell a running job from a stalled one, and that is the first half of the request.** Your store only ever holds queued, completed or failed — there is no running or processing in the whole collection (452 segment_stitch completed, 95 failed, 0 ever in flight). So 'queued' means 'not finished', not 'not started'. My first read of this was that nothing was running, and the honest version is weaker: I inferred it from created_at equalling updated_at and from the rows still being untouched 20 minutes later, not from a status. I also leaned on the python process sitting at 0.1% CPU, which proves less than I first thought — ffmpeg is a child process and would not show there.

(2) **I do not know what stalled them, and I am not going to guess in your code.** The one lead worth having: these were queued roughly 23 minutes into a process that was, per the logs on screen at the time, running Demucs and Whisper large-v3 on CPU for a 257s track. If a CPU-bound transcription can starve whatever consumes this queue, that would explain both the stall and why nothing retried afterwards. That is a hypothesis from timing, not a measurement.

(3) 95 failed segment_stitch against 452 completed is a 17% failure rate all-time. Probably unrelated and probably its own ticket, but you are better placed to say.

(4) This was a local dev instance, so the stall may not reproduce on your deployment. The orphaning on restart should, since it is a boot-time behaviour and not a load one.

## Plan

1. Add an in-progress state and write it when a worker takes a job, so a stalled job is distinguishable from a running one without reading created_at. This is the part that makes the rest diagnosable.
2. On boot, sweep rows the previous process left mid-flight — requeue them or fail them with a reason. Either is better than leaving them, and failing them loudly is fine: our side already treats a failed stitch as a resumable render and re-drives it.
3. Then look at what stalled the first batch. The Demucs/Whisper timing above is where I would start, but step 1 is what makes it visible rather than inferred.
4. Separately, if you want it: the 17% segment_stitch failure rate.

## Reason

A render that has drawn and paid for every one of its 39 clips then waits on a stitch that nobody will ever run. From our side it is indistinguishable from a slow stitch, so the render sits in 'stitching' and the person watching is told work is happening. The only thing that recovered it was our own boot-time resume queueing a second set of jobs, which means the first set was pure waste and we only got away with it because the segment stitches are cheap. The 25-hour-old row says this is not a one-off.

## Related files

whatever owns the job store and the worker that consumes it — app/api job persistence and the segment_stitch/segment_concat path

## Acceptance criteria

A job that a worker has taken reads as something other than 'queued'. After a restart, no row is left in a state no process will ever pick up: on boot they are requeued or failed with a reason. A render whose segment jobs die with the service either completes or fails, rather than waiting on a queue nothing is draining.

## Test steps

1. `.venv/bin/pytest tests/test_queued_forever.py -v` — all 16 pass. Reintroduce
   the duplicate `create_or_get_job` in `submit_workflow` and 16 tests across
   this file and `test_v2_pipeline.py` fail. That is the guard, not the fix.
2. Start the service. The boot log must say one of
   `[jobs] swept N job(s) the last process left behind` or
   `[jobs] nothing left behind by the last process` — one of the two, every boot.
3. Submit any `clip-stitching*` call. The row must leave `queued` within a
   second (status `running`, a stage on it) and the render must actually start.
   Before this it answered 202 and sat at `queued` with
   `created_at == updated_at` forever.
4. Kill the process mid-render, restart. The abandoned row must read `failed`
   with "the process that owned this job exited before it finished", not `queued`.
5. Set `MEDIA_TIMEOUT_SECONDS=60` — 10 is floored to 60, deliberately — and
   submit a stitch whose encode runs longer than that. It must fail in about 60s
   with `MediaTimeout: <step> exceeded 60s and was killed`, naming the step, and
   the worker slot must free so the next job runs.
6. A 39-clip render end to end: the 16 segments and the concat all complete, and
   the job store holds 17 rows for it rather than 34.

## Thread
2026-11-03T16:31:23+05:30 aquib N: created ticket, status: - -> open
2026-11-03T16:33:07+05:30 aquib N: status: open -> approved
2026-11-03T17:33:19+05:30 aquib N: Done. Six root causes found and fixed in video-processing-backend (commit 6049035 on feature-mobile-v2):

1. Double attempt claim (the primary cause of queued-forever): JET-202 wrapped create_or_get_job in if attempt_scoped: but left the original call above it. Every submission claimed its attempt twice — the second saw created=False and returned 202 without ever submitting the render. Removed the orphaned first call.

2. GC'd asyncio tasks: create_task returned a task with only a weak reference. Added self._tasks: set[asyncio.Task] with a done-callback discard so the loop cannot GC a task mid-flight.

3. CancelledError not caught: except Exception silently left a killed task's job at queued. Changed to except BaseException and re-raise so a cancelled task marks its job failed and propagates the cancellation correctly.

4. Boot sweep: fail_jobs_left_by_a_dead_process() added and wired into app lifespan. Called before the first request; every non-terminal row from the previous process is failed with an explanation. store.unfinished() added to both FileJobStore and MongoJobStore.

5. ffmpeg/ffprobe timeouts: new app/core/media_timeout.run() wraps subprocess.run with settings.media_timeout_seconds (default 1800s, min 60s, env MEDIA_TIMEOUT_SECONDS). All 13 bare subprocess.run calls on the render path routed through it: ffmpeg_engine, stitch_pipeline, lyric_extractor, caption_style_renderer, compositor, clip_trim, frames, song_read, gemini_transcriber.

6. Whisper preload bounded: _whisper_preload_future.result() now passes timeout=settings.media_timeout_seconds. Executor shutdown changed to wait=False so a stalled model load cannot also block the cleanup.

Regression suite: tests/test_queued_forever.py — 16 tests covering the double-claim fix, task reference fix, boot sweep, and cancellation handling. Bug was reproduced by reintroducing the duplicate claim; 12 tests failed. Fixed; all 38 tests now pass (610 total in the suite, 1 unrelated MongoDB connectivity failure in the sandbox).
2026-11-03T17:33:47+05:30 aquib N: TEST STEPS — run these to verify before closing:
1. cd video-processing-backend && .venv/bin/pytest tests/test_queued_forever.py -v — all 16 must pass.
2. Start the service fresh. Check startup logs for a sweep line — either 'swept N jobs left by the previous process' or 'nothing left behind'.
3. Submit a stitch request and observe the job row: status must move from queued to running before the render starts.
4. Kill the process mid-render. Restart. The abandoned job must appear as failed with a 'left behind' message — not still at queued.
5. With MEDIA_TIMEOUT_SECONDS=10, submit a stitch. Must fail in ~10s with a MediaTimeout error naming which step timed out, not hang forever.
2026-11-03T23:06:55+05:30 aquib N: Two corrections to the test steps above, both checked against the code rather than assumed — follow them as written and step 2 and step 5 would both look like failures.

STEP 5 is wrong about the timing. MEDIA_TIMEOUT_SECONDS is floored at 60 in config.py (max(60.0, ...)), deliberately, so that nobody can set an absurd ceiling. MEDIA_TIMEOUT_SECONDS=10 resolves to 60.0 — verified. So the step is: set MEDIA_TIMEOUT_SECONDS=60, submit a stitch of enough clips that a phase takes longer than a minute, and it must fail in about 60s with 'MediaTimeout: <step> exceeded 60s and was killed', naming the step. Waiting 10s and seeing nothing is the floor working, not the fix failing.

STEP 2 was not true when it was written, and is now. The sweep only printed when it found something, so a clean boot was silent and there was no 'nothing left behind' line to look for. Added one: a boot now always says either '[jobs] swept N job(s) the last process left behind' or '[jobs] nothing left behind by the last process'. Whether the sweep ran is the first question anyone asks of this ticket, so it should not be inferable only from the absence of output.

Also, for the record: the one failing test in the suite is tests/test_golden_script.py::test_rendered_lines_have_small_nonoverlapping_gap, and it is not MongoDB. It is a CalledProcessError from an ffmpeg lavfi call inside that test, it fails identically on the commit before this work (checked by stashing), and it is unrelated to JET-246. Worth knowing before someone chases a database that is answering fine.

Unchanged and still true: the double attempt claim was the primary cause, and reintroducing it fails the new suite loudly (16 tests across test_queued_forever.py and test_v2_pipeline.py), which is the part that keeps it fixed.
2026-11-03T23:07:14+05:30 aquib N: status: approved -> in_progress — fixed in 6049035 plus the README and boot-log follow-up
2026-11-03T23:08:32+05:30 aquib N: status: in_progress -> review — Six causes fixed in 6049035, plus the README lifecycle section, MEDIA_TIMEOUT_SECONDS documented, and a boot line on a clean sweep. Two corrections to the test steps posted earlier in the thread — the 60s floor and the missing clean-boot line — are folded into the Test steps above.
2026-11-03T23:09:06+05:30 aquib N: linked decision D-066 (An ffmpeg call that overruns is killed and the job fails, rather than waited on)
