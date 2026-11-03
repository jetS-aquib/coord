---
id: D-066
title: An ffmpeg call that overruns is killed and the job fails, rather than waited on
date: 2026-11-03
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-246
---

## Context

Every ffmpeg and ffprobe call in this service was subprocess.run with no timeout. The worker pool is one thread wide (MAX_CONCURRENT_JOBS=1), so one call that stops returning holds the only slot and every job behind it stays queued with nothing draining. Found while chasing JET-246: a 39-clip landscape render. A stitch puts all clips into one ffmpeg as separate inputs with one xfade per boundary, so decoders and buffers scale with the clip count and the frame; a 1920x1080 master is 2.25x the pixels of the usual 720x1280 portrait one, over three encode passes, and on a machine that starts swapping it stops finishing. Nothing in the filter graph is wrong - it is simply big enough that 'slow' and 'never' became the same thing to a caller.

## Options considered

1) Leave it and make it visible: write a heartbeat with the phase while ffmpeg runs, so a stalled render can be told from a working one. Rejected: it answers 'is it alive' and not 'will it ever finish', and the slot is still held forever. 2) Attack the cause: refuse or split a graph above a pixels-times-clips budget so such a stitch is never built as one process. Rejected for now - it changes which renders are accepted and needs a number nobody has measured. 3) A hard wall-clock ceiling per call, kill the child, fail the job.

## Decision

MEDIA_TIMEOUT_SECONDS, default 1800, floored at 60 whatever is set. Every ffmpeg and ffprobe call on the render path goes through app/core/media_timeout.run, which kills the child on overrun and raises MediaTimeout naming the step that overran - 'burning the captions exceeded 1800s and was killed' - deliberately not the command, which for that stitch is 39 paths and the whole filter graph going into a job row a human has to read. The Whisper preload wait takes the same ceiling, and its executor is shut down with wait=False, because a bounded wait is worthless if the cleanup then blocks on the same thread.

## Reason

The requester already treats a failed stitch as a resumable render and re-drives it, so a kill turns a dead render into a retry, which is strictly better than a caller polling 'queued' on work that is not happening. Generous on purpose: this is there to end a render that has stopped progressing, not to cap a legitimately slow one. Option 2 remains the right fix for the underlying size problem and is not foreclosed by this.

## Consequences

A legitimately slow render on a slow host can now be killed where it used to eventually finish; 30 minutes per call is the bet, and MEDIA_TIMEOUT_SECONDS is the knob if a deployment needs more. The floor means MEDIA_TIMEOUT_SECONDS=10 is 60 seconds, which is a surprise worth knowing when testing the behaviour. A caption preview inherits the full ceiling while holding its single render slot, so a stuck preview means 429s for up to that long; acceptable because the slot is acquired non-blocking and callers get a fast refusal rather than a hang. The real size problem is untouched: a 39-clip 1080p stitch is still one ffmpeg process with 39 decoders.
