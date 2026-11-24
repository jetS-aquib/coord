---
id: JET-416
title: Billing config: an admin-editable rate card, plans and billing switches that take effect within seconds
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-24T12:55:44+05:30
updated: 2026-11-24T13:20:31+05:30
decisions: D-100, D-101
---

## Request

Depends on: nothing. AI prices are hard-coded today (tokenLogger MODEL_PRICING, videoModelsV1 pricePerSecond, the BytePlus/Magicroll tables), so changing a price needs a deploy. Billing needs one configurable source: what each model costs us and what it costs the user in credits, the plans (free at launch) and the billing switches.

## Understanding

Assumptions: (1) the user-facing unit is CREDITS (decided 2026-11-24); (2) three Mongo collections, each versioned and immutable once published with one active version, like the config bundles (JET-412) but NOT in PostHog, because money needs an audit trail: RateCardV1, PlanV1 and BillingSettingsV1; (3) a rate entry has {model, operation (text|image|clip|tts|vision|transcribe|stitch|song_read), unit (second|image|call|1M_input_tokens|1M_output_tokens|audio_minute), resolution?, tier?, costUsd, credits}; a tier multiplier per tier; a global creditsPerUsd fallback for a model without an entry, so a new model is never free by accident; (4) a plan has signupGrant, refill {amount, period day|week|month, anchor, timezone}, rollover {enabled, maxCarry, expiresAfterDays}, maxBalance, limits {perDay, perWeek, perMonth in credits; rendersPerDay; concurrentRenders; maxVideoSeconds}, allowedTiers, enabled; (5) BillingSettingsV1 holds freeReshoots (bool, reversible), billingEnforced (bool), lowBalanceThreshold, anomaly thresholds (used by the abuse request); (6) 'immediately' = every instance caches the active versions for 10s and a publish clears the cache on the instance that served it, so on 1-2 instances a change applies within ~10s; running renders keep the rate frozen at their start (the charging request); (7) the seed's version 1 equals today's prices, so costs logged in USD do not change on deploy; (8) the admin publish API lives here; admin UI is the future panel repo.

## Plan

1. Models RateCardV1, PlanV1, BillingSettingsV1 (versioned, active pointer, immutable versions).
2. zod schemas; billingConfigV1() with a 10s cache, cleared on publish.
3. Seed v1 from MODEL_PRICING, videoModelsV1 and BytePlus/Magicroll; free plan v1; settings v1 (freeReshoots on).
4. tokenLogger, renderCostV1 and videoModelsV1 prices read from the rate card (the hard-coded tables stay only as the seed).
5. Admin routes: GET active and history, POST draft, POST publish, POST rollback (to a previous version), all audited.
6. Tests: a publish is visible to a new read within the cache window; a missing model falls back to creditsPerUsd; an invalid entry is rejected.

## Reason

Prices, plans and switches change without a deploy, and every change is recorded.

## Related files

src/models/RateCardV1.ts, src/models/PlanV1.ts, src/models/BillingSettingsV1.ts, src/modules/billing/*, src/utils/tokenLogger.ts, src/services/render/renderCostV1.ts, src/config/videoModelsV1.ts, src/routes/admin.ts, scripts/seed-billing.ts

## Acceptance criteria

Publishing a rate card that doubles Omni's credits per second changes POST /estimate within 10s, without a restart; GET active shows the new version; rollback restores the old one; the AuditLog has both actions.

## Test steps

1) npx tsx scripts/seed-billing.ts; 2) GET /api/admin/billing/rate-card -> v1 with today's prices; 3) POST a draft doubling omni clip credits, publish it; 4) within 10s POST /api/v1/music-videos/estimate shows double the credits; 5) POST rollback to v1 -> estimate returns to the old number; 6) POST an entry with negative credits -> 400.

## Thread
2026-11-24T12:55:44+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
2026-11-24T13:02:21+05:30 aquib N: status: open -> approved
2026-11-24T13:20:12+05:30 aquib N: linked decision D-101 (Billing config in one versioned collection; credits seeded at 100 per USD of cost; USD cost logging left on the old tables)
2026-11-24T13:20:25+05:30 aquib N: Built (not committed). New module src/modules/billing/ + models BillingConfigV1 (one collection, kind rateCard|plans|settings — D-101), scripts/seed-billing.ts. Admin: GET /api/admin/billing/{rate-card|plans|settings}, POST …/draft {payload,note}, POST …/:version/publish, POST …/rollback {version}, GET …/:version. POST /api/v1/music-videos/estimate now adds credits {floor,typical,ceiling} to each tier from the live card (awaits the 10s cache). Not done, by choice: tokenLogger/renderCostV1 USD still read the hard-coded tables (they are the seed, so they agree) — JET-417 meters from the card. Tests: src/modules/billing/billing.test.ts; the Mongo half runs with MONGO_TEST_URI=mongodb://127.0.0.1:27017/billing_test.
2026-11-24T13:20:30+05:30 aquib N: status: approved -> in_progress — building in music-jetkreate-backend
2026-11-24T13:20:31+05:30 aquib N: status: in_progress -> review — built and tested; see notes
