---
id: JET-281
title: A restart resumes every unfinished render with no owner, so two instances render the same clips and pay for them twice
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: done
created: 2026-11-10T01:57:36+05:30
updated: 2026-11-10T14:37:05+05:30
decisions: 
closed: 2026-11-10
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

1. `npx vitest run src/services/render/renderV1.test.ts`: passes, including "reclaimInFlightClipsV1".
2. Restart mid-render (one instance): start a render, wait until clips are generating, stop the server with Ctrl+C, start it again. The log shows "released N render lease(s) on shutdown", then "resuming mvr_…" and "N clip(s) were mid-generation in a run that died — back to pending". The render finishes; no clip ends failed because of the restart.
3. Hard kill (no graceful shutdown): same as 2 but `kill -9` the process. On start the log says "is leased by … — trying again in ~90s"; about 90s later the render resumes by itself.
4. Two instances: run a second server on another port (`PORT=5007 npm run dev`) against the same database while a render runs on the first, then restart the second. Its log says the render "is leased by …" and it does not start a second run; in Mongo the plan's `leaseOwner` stays the first server's.
5. In Mongo, while a render runs, `leaseUntil` moves forward about every 30s; after it finishes, `leaseOwner` is empty.

## Thread
2026-11-10T01:57:36+05:30 aquib N: created ticket, status: - -> open
2026-11-10T14:04:48+05:30 aquib N: status: open -> approved
2026-11-10T14:29:04+05:30 aquib N: status: approved -> in_progress
2026-11-10T14:29:04+05:30 aquib N: Built. Lease on the plan (leaseOwner + leaseUntil, 90s, heartbeat every 30s; flags.render.leaseMs). runPlanV1 claims it before running and releases it on the way out; graceful shutdown releases all of this process's leases so a restart resumes at once; a hard-killed process's renders resume when the lease lapses (startup sweep retries once then). rerender/fix/resume guards check the lease, not only the in-memory set. Clips left 'generating' by a dead run go back to pending without spending the attempt (the provider call is still made again; we cannot re-attach to one in flight). Clip, still and plate URLs go through durableUrl(): a failed GCS upload is retried once from the local file and otherwise fails the clip, so a /temp/ path never lands on a plan (unchanged when GCS is not configured, i.e. dev). Not covered: SSE progress and finish callbacks are still per-process (JET-254); a resume tapped while the run drains on the OTHER instance now gets a 409 'try again in a minute' instead of being queued.
2026-11-10T14:29:04+05:30 aquib N: status: in_progress -> review — Ready to review; uncommitted.
2026-11-10T14:37:05+05:30 aquib N: status: review -> done
