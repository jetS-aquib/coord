---
id: JET-312
title: Two instances can run the same render: saves don't check the lease owner, and an expired lease is only taken over at startup
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-13T13:07:25+05:30
updated: 2026-11-13T13:28:07+05:30
decisions: 
---

## Request

Fence every render save on the lease owner, and reclaim expired leases while running, not only at boot.

## Understanding

Deployment is 1-2 instances (memory: monolith). I assume the cheapest correct fence is: the run's saves go through one helper that adds {leaseOwner: me} to the filter, and a run that loses the lease stops at its next save. Takeover = a periodic timer (same cadence as the heartbeat) that runs the existing startup claim for plans whose lease expired.

## Plan

1. Route the run's plan saves through queueSaveV1 with a filter on leaseOwner = this process; on no match, stop the run (throw a LeaseLost error caught at the loop top).
2. Add a setInterval (e.g. every 60s) that finds non-terminal plans with leaseUntil < now and kicks them with afterLease, reusing resumeRendersOnStartupV1's logic.
3. Unit test: a save after the lease moved to another owner stops the run and writes nothing.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 2. Lease claim/heartbeat exist (orch:121-148, JET-281) but plan saves never filter on leaseOwner. If a heartbeat misses and another instance claims the lease, both keep filming and paying. A render on a crashed instance only resumes when some instance restarts (orch:1155); POST /resume answers 409 for it.

## Related files

src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

A render whose lease is taken by another owner stops within one save. A render left by a dead instance resumes within about 2 minutes without any restart.

## Test steps

1. Start a render locally.
2. In Mongo, set its leaseOwner to "other" and leaseUntil to the future.
3. Within one clip the log shows the run stopped (lease lost) and no more clips are submitted.
4. Set leaseUntil to the past: within ~2 minutes this instance picks it up again.

## Thread
2026-11-13T13:07:25+05:30 aquib N: created ticket, status: - -> open
2026-11-13T13:28:07+05:30 aquib N: status: open -> approved
