---
id: JET-420
title: Abuse controls: per-user rate limits on AI routes, one free grant per person, concurrent render caps, and automatic freeze on unusual spend
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-24T12:55:49+05:30
updated: 2026-11-24T13:36:48+05:30
decisions: D-100, D-102
---

## Request

Depends on: JET-418, JET-419. Free credits invite abuse: many accounts for many grants, scripted calls to the cheaper AI routes, parallel renders. We need controls so the system cannot be drained.

## Understanding

Assumptions: (1) per-user and per-IP rate limits (express-rate-limit, already a dependency) on every AI route outside a render, set in BillingSettingsV1: e.g. song-read, special/understand, brief, estimate, director ranking; values configurable; (2) the signup grant only after email is verified (JET-385) and once per verified email, Google account and device id (the app sends a device id header; stored hashed); a duplicate gets an account with 0 credits, not a refusal; (3) concurrentRenders per plan (default 1) enforced at reserve; (4) anomaly rule in settings: spend over X credits in an hour, or over Y renders in a day, freezes the account (frozen: no new spend, renders running finish) and alerts (existing serverErrorAlert channel + PostHog event); admin unfreezes; (5) an admin can freeze, unfreeze and zero a balance; (6) the platform spend breaker stays; (7) disposable-email domains blocked from the grant via a configurable list.

## Plan

1. Rate limiters from settings, keyed by user and IP.
2. Grant eligibility: verified email, unique identity and device hash.
3. Concurrent render cap at reserve.
4. Anomaly check after each charge; freeze plus alert.
5. Admin freeze/unfreeze.
6. Tests: the 11th call in a minute gets 429; a second account on the same device gets no grant; a third parallel render is refused; spending past the hourly threshold freezes.

## Reason

Free credits only work if they cannot be farmed.

## Related files

src/modules/billing/*, src/middleware/*, src/modules/auth/*, src/models/User.ts, src/models/CreditAccountV1.ts, src/routes/admin.ts

## Acceptance criteria

Scripted calls to special/understand above the limit get 429 with retryAfter; two accounts from one device get one grant; a user cannot run more renders at once than the plan allows; an account that spends past the hourly threshold is frozen and an alert is sent.

## Test steps

1) Call POST /special/understand 15 times in a minute -> 429 after the limit; 2) sign up twice with the same X-Device-Id -> the second account has 0 credits and a ledger note; 3) start 2 renders on a plan with concurrentRenders 1 -> the second gets 409 concurrent_limit; 4) set the hourly threshold to 50 and spend 60 -> account frozen, alert in the log; 5) admin unfreeze -> spending works again.

## Thread
2026-11-24T12:55:49+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
2026-11-24T13:23:24+05:30 aquib N: status: open -> approved
2026-11-24T13:36:47+05:30 aquib N: linked decision D-102 (Metering and charging hang off the GenerationLog sink; renders reserve then settle cumulatively; abuse controls hold in soft launch)
2026-11-24T13:36:47+05:30 aquib N: status: approved -> in_progress — building in music-jetkreate-backend
2026-11-24T13:36:48+05:30 aquib N: Built (not committed). aiGuardV1: aiCallsPerMinute (setting, 10) per user (else IP) per route, 429 rate_limited with retryAfter; 202 reading_lyrics polls are not counted. Signup grant: one per normalized email and per X-Device-Id (sha256) via GrantClaimV1; a duplicate gets a 0 grant entry with the reason; disposable domains get none; requireVerifiedEmail setting off until JET-385. concurrentRenders checked at reserve (409 concurrent_limit). After every spend: past anomaly.creditsPerHour (5000) or rendersPerHour (6) freezes and alerts (server_alert billing_freeze + account_frozen event). Admin: GET /api/admin/billing/users/:id, POST …/freeze, …/unfreeze, …/zero. All of these hold even with billingEnforced off. D-102.
2026-11-24T13:36:48+05:30 aquib N: status: in_progress -> review — built and tested; see notes
