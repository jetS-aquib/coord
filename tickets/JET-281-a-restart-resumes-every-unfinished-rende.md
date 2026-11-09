---
id: JET-281
title: A restart resumes every unfinished render with no owner, so two instances render the same clips and pay for them twice
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:36+05:30
updated: 2026-11-10T01:57:36+05:30
decisions: 
---

## Request

Make sure exactly one instance runs a given render, and that a restart does not re-pay for clips that were already generating.

## Understanding

Deployment is 1 instance, at most 2. A Mongo lease on the plan (owner id + expiry, renewed by a heartbeat) is enough. Assumption: a clip whose provider call was in flight at restart is re-requested (we cannot re-attach to it today) but does not lose an attempt. Overlaps JET-254 (callbacks in another process) but is a separate fix.

## Plan

1. RenderPlanV1 gains leaseOwner + leaseUntil.
2. kick/resume claims the lease with findOneAndUpdate (free or expired only); heartbeat every 30s; release on finish.
3. rerender/fix/resume check the lease, not only the in-memory set.
4. A restart resets the attempt count of a clip that was generating when the process died.
5. Never store a /temp/ URL on a plan: a failed upload is a failed clip.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). resumeRendersV1 (renderOrchestratorV1.ts:1057, called from index.ts:143) restarts every unfinished render except blocked/review/paused. No lease: with 2 instances, or overlap during a deploy, both resume the same render. The running set is in memory, so rerender/fix guards only see their own instance. An in-flight clip is paid again and its attempt count is not reset, so it gets no retry. If a GCS upload fails the clip URL becomes a local /temp/ path (gcs.ts:84) another instance cannot read.

## Related files

src/models/RenderPlanV1.ts, src/services/render/renderOrchestratorV1.ts, src/index.ts, src/services/gcs.ts

## Acceptance criteria

Two instances started against one database with an unfinished render: exactly one resumes it. Killing the process mid-render and restarting does not show any clip generated twice in the cost record, and no plan ever holds a /temp/ URL.

## Test steps

—

## Thread
2026-11-10T01:57:36+05:30 aquib N: created ticket, status: - -> open
