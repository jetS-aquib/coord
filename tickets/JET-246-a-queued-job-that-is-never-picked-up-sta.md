---
id: JET-246
title: A queued job that is never picked up stays queued forever, and a restart abandons it rather than reclaiming it
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-03T16:31:23+05:30
updated: 2026-11-03T16:31:23+05:30
decisions: 
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

—

## Thread
2026-11-03T16:31:23+05:30 aquib N: created ticket, status: - -> open
