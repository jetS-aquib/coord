---
id: D-022
title: Segments are jobs of their own; the finalise call is the one that settles the attempt
date: 2026-10-26
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-202
---

## Context

JET-202 splits stitching into a segment call per scene plus a join at the end, so the service works while clips are still being generated instead of sitting idle for four minutes. The stitch endpoints return the same job for a repeated attempt (JET-155, one job per attempt) and report that job's outcome to the creator API. A render now makes several stitch-shaped calls, so that rule cannot apply to all of them.

## Options considered

Dedupe each segment against a composite attempt id; make segments ordinary jobs with no attempt; pass segment outputs between calls as signed URLs or as job ids.

## Decision

POST /api/v1/segment-stitch creates a job with a workspace but no attempt: it is not deduplicated and reports nothing to the creator API. POST /api/v1/segment-concat is attempt-scoped exactly as the stitch endpoints are, and is the call that carries the measurement and the settlement. The finalise takes segment job ids, not URLs, and signs the stored outputs itself behind the same ownership check the job endpoints use. Segments must share a frame and frame rate; a mismatch fails the finalise. Segment boundaries are hard cuts and are the caller's to align to scenes. The existing single-call endpoints are unchanged.

## Reason

A composite attempt id would have put a fabricated attempt on the creator API's callback, so one render would report several outcomes for one reservation. Segment compute is internal expense and is not what the rate card charges; the customer's video, its duration and its resolution all come from the finalise, so settling there keeps one attempt to one settlement with no billing change at all. Job ids rather than URLs because the caller already holds them, they do not expire, and signing server-side avoids handing out download URLs for a bucket that holds other workspaces' renders. ffmpeg stream-copies mismatched segments without an error and produces a master whose second half is the wrong shape, so the check is ours to make.

## Consequences

A retried segment call renders a second segment; the caller posts whichever job id it holds and the spare costs compute and storage, never a double charge. Segments are never deleted from the bucket. ENABLE_PORTRAIT_OUTPUT must not change mid-song or the finalise refuses the segments. Each join keeps the crossfade overlap a single-call render would have spent, so the joined video runs about one transition longer per boundary and the final mux trims that from the end of the last clip. A caller that ignores both endpoints renders exactly as before.
