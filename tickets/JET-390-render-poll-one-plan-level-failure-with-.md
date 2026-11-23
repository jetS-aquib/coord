---
id: JET-390
title: Render poll: one plan-level failure with a cause and whether retrying can help
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:47:51+05:30
updated: 2026-11-23T17:15:01+05:30
decisions: 
---

## Request

When a render stops, the plan carries only error: string (summarizePlanV1, renderOrchestratorV1.ts:2255). Causes exist per clip (refusal.cause, failure.cause at :2465-2472) but the app has to aggregate them, and cannot tell a retryable timeout from a quota or a content refusal. The redesigned stopped screen says what happened in plain words and offers only actions that can help.

## Understanding

Assumptions: (1) add failure: {cause: 'refused'|'timeout'|'no_video'|'quota'|'provider_credit'|'limit'|'error', refusalCause?: 'real-person'|'copyright'|'content', clipsAffected: number[], retryable: boolean, message} for failed/blocked/cancelled-by-system plans; (2) limit refusals (render_limit/capacity/renders_off) map to cause 'limit', retryable false; (3) the same block is returned on GET /:id/render (activeRender) so a stopped card opened from the Library gets it; (4) JET-336 (checking stage) and JET-286 (failed shot keeps prompt/why) are related; reuse their fields rather than duplicating.

## Plan

1. Derive failure from the clips + plan error at terminal status.
2. Return it on both render reads.
3. Tests per cause.

## Reason

Today the app can only say 'That did not finish. The render stopped.' and offers a retry that may cost money for nothing.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/renderStageV1.ts

## Acceptance criteria

Force a refused clip: GET /render/:jobId returns failure.cause 'refused', refusalCause 'real-person', clipsAffected [n], retryable true. Exhaust the weekly limit: failure.cause 'limit', retryable false.

## Test steps

—

## Thread
2026-11-23T15:47:51+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:51:00+05:30 aquib N: status: open -> approved
2026-11-23T17:11:47+05:30 aquib N: Built, not committed. failure {cause, refusalCause?, clipsAffected, retryable, message} on every summarizePlanV1 (so both GET /render/:jobId and GET /:id/render) for failed/blocked plans; null when running/done/cancelled by the person. provider_credit is matched from the error text (credit/billing/insufficient balance/402). Limit refusals happen before a plan exists, so the 429/503 body carries failure {cause:'limit', retryable:false}. TEST: 1) force a refused clip -> failure.cause 'refused', refusalCause 'real-person', clipsAffected [n], retryable true; 2) exhaust the weekly limit -> 429 with failure.cause 'limit', retryable false.
2026-11-23T17:15:01+05:30 aquib N: status: approved -> in_progress
