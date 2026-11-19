---
id: JET-372
title: Release: PostHog on the backend — AI observability, evals, runtime flags and kill switches, launch limits, and the admin API
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-19T13:31:01+05:30
updated: 2026-11-19T14:45:06+05:30
decisions: D-089
---

## Request

Instrument the backend with PostHog (EU cloud) for render analytics, a trace per render of every Gemini call with cost, eval scores, runtime feature flags and kill switches, free-launch limits with a daily spend breaker, and an admin API the planned Next.js panel will call. Full plan: docs/rnd/03-posthog-and-launch.md.

## Understanding

No analytics, remote flags or admin exist today; AI cost only reaches Mongo GenerationLog. Verified hooks: every Gemini call passes the ai Proxy in src/services/ai/shared.ts:51-80 (generateContent + interactions.create) — one choke point; image.service.ts:16 bypasses it; aiCallEvents already emits per call; render lifecycle points in renderOrchestratorV1.ts (startRenderV1, setStageV1, runPlanV1 done/failed, gateOnCompletenessV1, cancel/pause/resume, edits). PostHog facts (docs, Nov 2026): @posthog/ai/gemini wraps generateContent only, so Omni video is captured manually with a per-second price; events sharing $ai_trace_id form a trace (we use jobId); our checks go in as $ai_metric, PostHog online LLM-judge evals sample 5-10% with our Gemini key; posthog-node evaluates flags locally every 30s and returns undefined until the first poll, so every flag needs a safe default. Assumptions: EU cloud (no India region; DPDP has no localisation rule for this data today); distinct_id = Mongo user id, never email; Mongo stays the enforcement record for limits, PostHog only observes and configures; pipeline prompts are captured, the creator's own free text (special request, typed edits) in privacy mode; free-launch numbers are placeholders you set in the launch-limits payload. JET-363 is subsumed by A5 (same unit and route set). The admin panel itself is a new repo, filed once it is onboarded.

## Plan

A1. src/shared/posthog.ts singleton (keys in env, shutdown on SIGTERM); server events render_started/stage/completed/failed/blocked/cancelled/paused/resumed, edit_applied, clip_rerendered, limit_hit, song_read_done, upload_done with tier, director, seconds, shots, cost, duration and the flag snapshot.
A2. In the shared.ts Proxy: $ai_generation for every generateContent (model, lane, tokens, calculateCost, latency s, error, trace=jobId, span=fn); interactions.create captured manually with $ai_request_price per second; image.service.ts moved onto the shared client; userId/jobId via AsyncLocalStorage set at request and render entry; one $ai_span per render stage.
A3. $ai_metric on the render trace for frameGate verdicts, clipCheck QA kinds, seam, planScore, storyOrder; two online LLM-judge evals at 5% (config); evalPlans.ts to offline evals when out of beta.
A4. flags.ts keeps defaults, a loader overlays PostHog flags every 30s; kill switches renders-enabled, new-signups-enabled, catalogue-enabled, tier-best-enabled; remote-config payload launch-limits; per-user rollout of R&D render flags as experiments; each render stores its flag snapshot.
A5. Launch limits: rendered seconds per rolling 7 days from Mongo on render/rerender/fix/apply (429 render_limit with seconds left); UserGenerationQuota override; global daily spend breaker from GenerationLog (503 capacity); signup gate + beta allowlist.
A6. Admin API: requireAdmin on User.role 'admin'; users search, a user's usage and cost, set/clear quota override, renders list with renderCostV1, cancel/resume/stitch a stuck render, flag snapshot; every action logged to AdminAction.
Each phase behind flags.posthog.* (off by default); tests for event mapping, ALS context, flag defaults, breaker.

## Reason

Launch without billing needs spend control, kill switches and visibility into cost, quality and funnel.

## Related files

src/shared/posthog.ts (new), src/services/ai/shared.ts, src/modules/image/image.service.ts, src/services/render/renderOrchestratorV1.ts, src/config/flags.ts, src/middleware/generationLimiter.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/routes/admin*.ts (new), src/models/AdminAction.ts (new), docs/rnd/03-posthog-and-launch.md

## Acceptance criteria

One Draft render is a single PostHog trace with every Gemini call, Omni clips with cost and the QA metrics; renders-enabled off refuses new renders within 30s; a user over the allowance gets 429 render_limit; the breaker returns 503 capacity; the admin API answers only admins.

## Test steps

—

## Thread
2026-11-19T13:31:01+05:30 aquib N: created ticket, status: - -> open
2026-11-19T13:31:16+05:30 aquib N: linked decision D-089 (PostHog (EU cloud) for product analytics, AI observability, evals and runtime flags; Mongo stays the record that enforces limits)
2026-11-19T14:45:06+05:30 aquib N: status: open -> approved
2026-11-19T14:57:59+05:30 aquib N: A1+A5 built (uncommitted), behind flags.posthog.{events,limits,remote}, all off. 429 render_limit / 503 capacity / 503 renders_off / 403 signups_closed; allowance on /estimate. Also gated /accept from review (start filming spends too). Handed back before A2.
