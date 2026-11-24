---
owner: music-jetkreate-backend
status: active
---

# /api/v1/billing and /api/admin/billing

Written by hand (JET-421, JET-422), so it describes the API rather than defining it.
The source of truth is the zod schemas in
`music-jetkreate-backend/src/modules/billing/billing.routes.ts`. Credits are the only
unit a user sees, and no user response carries USD (D-100).

## User — `/api/v1/billing` (signed in)

- `GET /me`:
  `{ balance, lowBalance, frozen, freeReshoots, plan: { id, name, refill: { amount, period } | null, rollover }, nextRefillAt | null, limits: { day, week, month, renders } }`.
  Each limit is `{ limit | null, used, left | null, resetsAt }`, and `null` means no
  limit. Windows are calendar day, week and month in the plan's time zone.
- `GET /usage?period=day|week|month` (default `week`), or `?from=&to=` (ISO, at most 92 days):
  `{ from, to, total, freeReshootCredits, byCategory[], byFeature[], byModel[], byProject[] }`.
  - `byCategory`, `byFeature` and `byModel` are lists of `{ key, name, credits }`, and each one sums to `total`.
  - `total` is what the ledger charged.
  - Categories are `planning`, `stills`, `clips`, `checks`, `song`, `lyrics`, `captions`, `stitch` and `other`. A render that has not finished yet shows as `held`.
  - A render is counted in the window it started, including everything charged and returned for it since.
  - `byModel` names a model family (for example "Omni video"), never a provider id. It splits the total in proportion to each model's metered work.
  - Each `byProject` item is `{ musicVideoId, title, thumbnail, credits, renders }`.
- `GET /history?cursor=&limit=` (default 30, max 100):
  `{ entries: [{ id, type, label, credits, balanceAfter, createdAt, project?, breakdown? }], nextCursor | null }`.
  - Entries are newest first. To get the next page, pass `nextCursor` as `cursor`.
  - `label` is ready to show, for example "Video: Zaaya, 40 unused credits back", "Weekly refill" or "Special request".
  - A render's settle entry has `breakdown: { charged, freeReshootCredits, byCategory }`.
  - Entry types are `grant`, `refill`, `reserve`, `settle`, `charge`, `refund`, `adjust`, `purchase` and `expire`. `credits` is positive when added and negative when taken.

### Errors on any spending route
| Status | `code` | Extra fields | Meaning |
|---|---|---|---|
| 402 | `insufficient_credits` | `balance`, `needed` | Not enough credits (only when billing is enforced) |
| 403 | `account_frozen` | | The account is on hold |
| 409 | `concurrent_limit` | `limit` | Another render is already running |
| 429 | `daily_limit` / `weekly_limit` / `monthly_limit` / `render_limit` | `resetsAt` | A spending limit for the day, week or month, or the daily render count, was reached |
| 429 | `rate_limited` | `retryAfter` (seconds) | Too many requests in a short time |

`GET /api/v1/music-videos/estimate` returns `credits { floor, typical, ceiling }` for each tier.
A render's state includes `credits { reserved, charged, reshootCredits } | null`.

## Admin — `/api/admin/billing` (admin role; every request goes to AuditLog)

- `GET /rate-card | /plans | /settings`: the active version and its history.
- `GET /:kind/:version`: one version.
- `POST /:kind/draft { payload, note? }`: saves a validated draft. Nothing changes until it is published.
- `POST /:kind/:version/publish`: makes that version live. It takes effect everywhere within 10s.
- `POST /:kind/rollback { version }`: makes an earlier version live again, saved as a new version.
- `POST /rate-card/preview { payload | version, from?, to? }`: prices the window's calls (the last 7 days by default) on both the draft and the live card. Returns `{ current, draft, change, changePct, byModel[] }`. Calls are compared at list price, so free reshoots and the tier multiplier are left out.
- `GET /users/:id`: the account, limits left, and the last 50 ledger entries.
- `POST /users/:id/grant { credits, reason, key? }`: a positive amount is a `grant`, a negative one an `adjust`. Send a fresh `key` for each click: the same key grants only once, and a repeat answers 200 instead of 201.
- `POST /users/:id/plan { planId?, limitsOverride? }`: changes the plan or the per-user limits (`null` means use the plan's). AuditLog keeps the before and after.
- `POST /users/:id/freeze { reason }`, `/unfreeze`, `/zero { reason }`.
- `GET /reports?from=&to=` (the last 7 days by default) returns:
  - `byDayModel[]`: per day and model, `{ date, model, calls, credits, costUsd, creditsUsd, marginUsd }`. Credits here are metered at list price.
  - `ledger`: `{ byType, charged, chargedUsd, freeReshootCredits, refunded }`. `charged` is what users were actually charged.
  - `topSpenders[]`: the top 20.
  - `frozen[]`: frozen accounts.
