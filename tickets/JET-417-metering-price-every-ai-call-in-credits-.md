---
id: JET-417
title: Metering: price every AI call in credits and tag it with feature, render and project, so usage can be broken down
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-24T12:55:45+05:30
updated: 2026-11-24T13:36:48+05:30
decisions: D-100, D-102
---

## Request

Depends on: JET-416. Every AI call must be measured and billed, and a user must see the breakdown. GenerationLog already records each call's USD cost (63 logTokenUsage call sites plus the ai Proxy in services/ai/shared.ts), but not credits, and not which feature or render it belongs to.

## Understanding

Assumptions: (1) every AI call already passes a choke point: the ai Proxy (generateContent, interactions.create) or logTokenUsage/logBytePlusVideoCost/logMagicrollVideoCost; image.service.ts bypasses the Proxy and needs wiring; (2) each GenerationLog row gains credits (from the active rate card at call time), rateCardVersion, category (planning|stills|clips|checks|song|lyrics|captions|stitch|other), feature (the route or stage, e.g. brief, special_request, treatment, anchor, clip, frame_gate), jobId? and projectId?, all taken from aiContext (already per request and per render); (3) calls made by video-processing on our behalf (song read and Gemini transcription, stitch) are metered here from what we request: song_read per audio minute, stitch per output second, from the rate card, because their real cost is not reported back; (4) a failed call is logged with credits but marked failed, and whether it is charged is the charging request's call; (5) no change to what is charged yet: this request only measures.

## Plan

1. Extend GenerationLog: credits, rateCardVersion, category, feature, jobId, projectId (+ index userId,createdAt,category).
2. One priceCallV1(model, operation, units) from the rate card; call it in tokenLogger and the Proxy.
3. Put feature/category/jobId/projectId on aiContext at each route and render stage.
4. Wire image.service.ts through.
5. Meter song read and stitch calls to video-processing.
6. Test: one render logs every call with a category and jobId; credits = units x rate.

## Reason

Without it no charge can be explained and no breakdown can be shown.

## Related files

src/models/GenerationLog.ts, src/utils/tokenLogger.ts, src/services/ai/shared.ts, src/shared/posthog.ts, src/modules/image/image.service.ts, src/modules/video/video-api.service.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

After one render, every GenerationLog row for that jobId has credits > 0 (or 0 by explicit rate), a category and a feature; summing credits by category equals the total; a brief or special-request call outside a render is logged with its feature and no jobId.

## Test steps

1) Render a short song; 2) in Mongo group GenerationLog by category for that jobId -> planning, stills, clips, checks, stitch all present with credits; 3) POST /special/understand -> one row with feature special_request and credits; 4) upload a song -> a song_read row priced per audio minute.

## Thread
2026-11-24T12:55:45+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
2026-11-24T13:23:16+05:30 aquib N: status: open -> approved
2026-11-24T13:36:47+05:30 aquib N: linked decision D-102 (Metering and charging hang off the GenerationLog sink; renders reserve then settle cumulatively; abuse controls hold in soft launch)
2026-11-24T13:36:47+05:30 aquib N: status: approved -> in_progress — building in music-jetkreate-backend
2026-11-24T13:36:48+05:30 aquib N: Built (not committed). GenerationLog gains credits, rateCardVersion, category, feature, jobId (indexed). Metered in one place: logGenerationToDb asks billing (meterV1/chargingV1); category from aiContext or the fn name (clips, stills, planning, checks, song, lyrics, captions, stitch, other). Song read metered per audio minute and stitch/recut/reel per output second as 'video-processing' rate-card rows (seed: 1 credit/min, 0.05/s). Not done: projectId on rows (jobId links them), and legacy image.service.ts is left as is (old code; its calls still meter if they log). D-102.
2026-11-24T13:36:48+05:30 aquib N: status: in_progress -> review — built and tested; see notes
