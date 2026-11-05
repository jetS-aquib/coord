---
id: JET-254
title: Render finish callbacks only wake a waiter in the same process, so they stop helping once the backend runs more than one instance
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-05T12:11:29+05:30
updated: 2026-11-05T12:11:29+05:30
decisions: 
---

## Request

JET-252 wakes a render's wait from the finish callback using an in-memory Map (jobWaiters in video-api.service.ts). It is per process. Behind a load balancer with N instances only the instance that holds the wait can use the callback; the callback may land on another instance and be dropped, so that wait sits on its 15s fallback poll. Correctness is unaffected, latency and request savings shrink as instances grow. Also: at very high concurrency (tens of thousands of renders) each in-flight stitch job still costs one GET per 15s on the video service.

## Understanding

Not a bug today. I assume one backend instance now, and that the video service's job-status GET is the shared bottleneck at scale. Waiters are tiny (under 1 KB each) and cleaned up on every exit, so memory is not the concern; cross-instance delivery and poll volume are.

## Plan

1. Decide delivery: Redis pub/sub, or Mongo change stream, keyed by jobId, so any instance's callback wakes the owning instance. 2. Replace wakeJobWaiter's direct map lookup with a publish; each instance subscribes and wakes its local waiter. 3. Keep the 15s poll as the fallback and consider jittering it so thousands of waits do not align. 4. Load-test with several instances behind a balancer.

## Reason

Not needed at 12-20 concurrent users on one instance. Needed before running several instances or reaching very high concurrent renders.

## Related files

src/modules/video/video-api.service.ts,src/modules/video/musicVideoCallback.controller.ts

## Acceptance criteria

With 3 instances behind a balancer, a render settles within ~1s of the callback regardless of which instance receives it; polling stays at most one GET per 15s per job.

## Test steps

—

## Thread
2026-11-05T12:11:29+05:30 aquib N: created ticket, status: - -> open
