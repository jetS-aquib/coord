---
owner: music-jetkreate-backend
status: active
---

# /api/admin: the admin console's API

Written by hand (JET-426…431, JET-448…458). This file describes the API but does not define
it. The definition is in the code: the zod schemas in `music-jetkreate-backend/src/routes/admin.ts`,
`adminAccess.ts` (roles and the permission for every route), `adminAudit.ts`, `adminOps.ts`,
`src/shared/posthogApi.ts`, `src/modules/billing/billing.routes.ts` + `costsV1.ts` and
`src/modules/finance/`. Billing config routes (`/api/admin/billing/:kind…`) are in [api-billing.md](api-billing.md).
The defaults behind this API (roles, retention, churn, …) are recorded in **D-109**.

Wording (JET-458): **save draft** stores a version that is not live; **make live** puts it live.
- Billing: `POST /billing/:kind/draft` = save draft, `…/:version/publish` = make live.
- Config bundles: `POST /config/:bundle` = save version, `…/:version/activate` = make live.

The route paths are unchanged.

## Access (JET-448)

- **Auth:** every route needs `Authorization: Bearer <access token>` and the request signature, the same as the
  app. Sign in with the normal login. There is no separate admin login.
- **Roles:** `User.role` is one of `owner | ops | support | finance | viewer`. The old value `admin` means owner.
  Anyone else gets `403 FORBIDDEN`. When `flags.posthog.admin` is off, everyone gets `404`.
- **Permissions:** every route maps to one permission (the table is in `adminAccess.ts`, and `GET /meta`
  returns it). A role without that permission gets `403 { code: 'PERMISSION_DENIED', details: { permission } }`.
  Hiding buttons in the console is cosmetic; the backend decides.

  | role | can |
  |---|---|
  | owner | everything (roles, delete user, IP and user agent in the audit log) |
  | ops | read all but finance; suspend, ban, logout, quota; renders, content, flags, kill switches, config save and make live; billing freeze |
  | support | read all but finance; suspend (not ban), logout, export user data; renders, content; grant credits of at most **500** at a time |
  | finance | read all; billing grant (any amount), freeze, zero, plan, rate card / plans / settings; finance inputs and scenarios |
  | viewer | read everything but finance |

- **Recent sign-in (C2):** these routes need a sign-in within the last **10 minutes**, otherwise
  `401 { code: 'REAUTH_REQUIRED' }`. The console asks the admin to sign in again, then retries.
  - `DELETE /users/:id`
  - `POST /users/:id/role`
  - `POST /billing/users/:id/zero`
  - `POST /billing/:kind/:version/publish`
  - `POST /billing/:kind/rollback`
  - `POST /killswitches/:key` with `on: false`

  The sign-in time is the token's `auth_time`. It carries across refreshes, so only a real sign-in resets it.
  Tokens issued before this change have no `auth_time`, so admins sign in once after the deploy.
- **MFA:** not built. See the JET-448 thread.
- **CORS:** `ALLOWED_ORIGINS` (a comma list) replaces the defaults, which include `http://localhost:3100`.
- **Errors (JET-458):** every error from these routes is `{ status: 'error', code, message, details? }`.
  - A failed zod check is `400 { code: 'VALIDATION_ERROR', errors: [{ field, message }] }`.
  - A missing item is `404 { code: 'not_found' }` unless a route below names another code.
  - `401`s from sign-in itself (`TOKEN_EXPIRED`, `INVALID_TOKEN`) also carry `code` and `message`, plus the older `error`.
- **Paging:** cursor everywhere: `?cursor=&limit=` returns `{ …, nextCursor | null }`, newest first. Pass
  `nextCursor` back as `cursor`. `/users` (sort=newest) and `/renders` also return `total`, and still accept the old `skip`.
- **User labels (JET-450):** every row that names a user also has `userEmail`. This covers renders, content, feedback,
  public assets, elements, ledger, the reports' `frozen` and `topSpenders`, search hits and ops stuck renders.
  The audit log has `actorEmail` and `targetLabel`.

## Me, search, meta (JET-448, JET-450)

- `GET /me` returns `{ id, email, role, permissions[], authTime, recentAuth, grantLimit | null }`. `grantLimit` is null when the role can grant any amount.
- `GET /search?q=` (at least 2 characters) returns `{ q, hits: [{ type, id, label, sublabel, userId, userEmail, exact }] }`, exact matches first.
  - `type` is `render` (full jobId), `ledger` (idempotency key), `user` (id, part of an email, or name), `music-video` or `podcast` (id or a word of the title).
  - Only types the role can read are returned. Each list is capped at 10.
- `GET /meta` returns everything the console used to hard-code:
  - `roles, permissions, rolePermissions, grantLimit`
  - `userStatuses, authProviders`
  - `renderStatuses` (pipeline order), `terminalStatuses`, `renderStages`, `renderActions`
  - `contentKinds, ledgerTypes, auditKinds, auditActions, configBundles`
  - `killSwitches [{key,label}]`, `plans [{id,name,enabled}]`, `defaultPlanId`
  - `billingKinds, financeKinds`, `namedQueries [{name, segmentable}]`, `segments`
  - `schemas: { rateCard, plans, settings, bundles: { <bundle>: … } }` as JSON Schema (input shape) for form editors.

## Users (JET-428, JET-448, JET-457)

- `GET /users?q=&status=&role=&authProvider=&createdFrom=&createdTo=&sort=newest|oldest|email|name&cursor=&limit=&skip=`
  returns `{ users: [{ id, email, name, role, status, authProvider, createdAt }], total, nextCursor }`.
  - `role=admin` matches every admin role.
  - Cursor paging applies with `sort=newest`. The other sorts use `skip`, and `nextCursor` is then null.
- `GET /users/:id` returns:
  - `user`: profile fields plus `devices`
  - `settings`
  - `quota`
  - `billing`: `{ balance, frozen, frozenReason, planId, limitsOverride }`, never null
  - `counts`, `lastLoginAt`, `lastActivityAt`

  `billing` is read the same way as `GET /billing/users/:id`, so the two always agree (JET-458). The first view creates the
  credit account with its signup grant, exactly as the user's first app call would (D-109). This read is logged (`user.view`).
- `GET /users/:id/usage` and `PUT /users/:id/quota { renderSeconds | null }`: unchanged. The quota change is logged with before/after.
- `POST /users/:id/status { status: 'active'|'suspended'|'banned', reason? }` returns `{ userId, status, before }`.
  - `banned` needs `users.ban` (not support).
  - Errors: `409 self_action`, `409 target_is_admin` (any admin role).
- `POST /users/:id/role { role: 'creator'|'owner'|'ops'|'support'|'finance'|'viewer' }` (`'admin'` is stored as `owner`) returns `{ userId, role, before }`.
  - Owner only, and C2.
  - Errors: `409 self_action`, `409 last_owner`.
- `POST /users/:id/logout` returns `{ userId, sessionsRevokedAt }`. Every older token stops working (`401 INVALID_TOKEN`).
- `DELETE /users/:id { confirm: <their email> }` returns `{ success, userId, files }`.
  - Owner only, and C2.
  - Errors: `400 confirm_mismatch`, `409 self_action`, `409 target_is_admin`.
  - The email typed is stored hashed, never plain.
- `GET /users/:id/events?cursor=&limit=`: PostHog events, newest first. Unchanged, and now logged.
- `POST /users/:id/export` (owner and support, JET-457) returns a JSON **download** (`Content-Disposition: attachment`):
  `{ exportedAt, profile, settings, credits: { balance, planId, ledger[] }, musicVideos[], podcasts[], renders[], elements[], feedback[] }`.
  It is metadata only; media stays at its URLs. Logged as `user.export`.

## Renders (JET-429, JET-451, JET-458)

- `GET /renders?status=&userId=&cursor=&limit=&skip=` returns `{ renders: [{ …summary, userEmail, allowedActions }], total, nextCursor }`.
- `GET /renders/:jobId` returns `{ render: { …, userEmail, allowedActions }, plan, cost, calls, callsCostUsd, project, traceId }`.
- `allowedActions` lists exactly what the action routes would accept now:
  - `cancel`: not finished.
  - `resume`: stopped (paused, blocked, failed or cancelled) with clips and no video.
  - `stitch`: blocked, with at least one shot done.
  - `restart`: stuck, meaning a worker status with no live lease and no write for 10 minutes.

  A completed render has `[]`.
- `POST /renders/:jobId/cancel | /resume | /stitch | /restart` returns `{ success, …summary, allowedActions }`.
  - A refused action is `409` (wrong status) or `400` (nothing left).
  - `restart` runs a stuck render again. It claims the lease first, so a run that is actually alive is never doubled.

## Content moderation (JET-429)

Unchanged, plus `userEmail` on rows, and before/after on takedown and restore (`content.hide` / `content.unhide`).
- `GET /{music-videos|podcasts}`
- `GET /{kind}/:id` (renders there include `allowedActions`)
- `POST /{kind}/:id/takedown { reason }`
- `POST /{kind}/:id/restore`
- `GET /feedback`

## Public assets and elements (JET-429)

Unchanged, plus `userEmail` on list rows. Writes are logged as `asset.create|update|delete` and `element.update|delete`, with before/after.

## PostHog through the backend (JET-427, JET-455, JET-456, D-104)

Needs `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_PROJECT_ID`, otherwise `503 posthog_not_configured`.

- `POST /analytics/query { name, from, to, segment? }` returns `{ name, segment, columns[], rows[][], cached }`.
  - The window is at most **92 days**, and results are cached for 60s.
  - `segment` is `all` (the default), `plan` or `cohort` (signup month). It is accepted only by queries marked `segmentable` in `/meta`, and it adds a `segment` column.
  - `cohort` `1970-01-01` means a person with no creation date.

  | name | columns | segmentable |
  |---|---|---|
  | `dau` / `wau` / `mau` | `period, users` | |
  | `signups` | `day, signups` | |
  | `signup_to_first_render` | `signed_up, rendered` | |
  | `retention_weekly` | `segment, cohort, week, users` | ✓ |
  | `renders_per_day` | `day, status, renders` | |
  | `render_failures` | `reason, renders` | |
  | `ai_spend_per_day` | `day, model, cost_usd, calls` | |
  | `activation_funnel` | `segment, step, users`: one row per step (`1 signed_up`, `2 song_read`, `3 plan_approved`, `4 render_completed`) for people who signed up in the window | ✓ |
  | `time_to_first_render` | `segment, people, median_minutes, p90_minutes` | ✓ |
  | `feature_adoption` | `segment, active_users, recut, reel, share, reshoot, edit` (people who used each; divide by `active_users`) | ✓ |
  | `renders_per_active_user` | `week, segment, active_users, renders, per_user` | ✓ |
  | `churn` | `segment, rendered_users, churned`: people whose first completed render was in the window, more than 28 days before `to`; churned = no activity in the 28 days before `to` (D-109) | ✓ |
  | `limit_hits` | `day, kind, hits` | |
  | `ai_quality` | `week, plan_score, reshoots, renders_completed, reshoots_per_render` | |

  - The server now sends `plan_approved` (`{ jobId, afterPreview }`; `afterPreview: true` means the stills were approved too).
  - It sets the person property `plan_id` when an admin changes a plan.
  - Platform, app version and signup source need the mobile client events (JET-373).
  - All the queries above were run against the live project on 2026-11-26.
- `POST /analytics/query { hogql }`: an admin's own SELECT, capped at 1000 rows (unchanged).
- `GET /posthog/flags` returns `{ flags: [{ id, key, name, active, rolloutPercentage | null, conditions, multivariate, payload, updatedAt, groups, allowUserIds, denyUserIds }] }`.
- `POST /posthog/flags { key, description? }` creates a flag that is off and rolled out to nobody, and answers `201` with the flag.
  - The key is lowercase letters, digits, `-` and `_`.
  - Errors: `409 flag_exists`, `409 use_killswitch_route`.
- `PATCH /posthog/flags/:key` takes any of:
  - `active`
  - `rolloutPercentage` (single condition only, otherwise `409 flag_too_complex`)
  - `payload`
  - `conditions: [{ rolloutPercentage, properties?: [{ key, value, operator? }] }]`: replaces the release conditions. Person properties only; `operator` defaults to `exact`.
  - `allowUserIds` / `allowEmails`: always on. Replaces the list; `[]` clears it.
  - `denyUserIds` / `denyEmails`: always off.

  Emails become user ids on the server, so no email is sent to PostHog. An unknown email is `400 unknown_emails { details: { emails } }`.
  Servers see the change within about 30 seconds. Kill switch keys give `409 use_killswitch_route`.
- `DELETE /posthog/flags/:key` switches the flag off and archives it (PostHog's soft delete), returning `{ key, archived: true }`.
- `GET /posthog/flags/:key/usage` returns `$feature_flag_called` by `day, response, calls` for the last 30 days.
  The server evaluates flags without sending these events, so only client evaluations show up.
- `GET /killswitches` returns `{ switches: [{ key, label, inPosthog, active, serverSees }] }`. The switches are renders, sign-ups, catalogue, best tier, publish kit and push.
- `POST /killswitches/:key { on }` returns `{ key, on }`. Switching off is C2. Needs `killswitch.write` (ops, owner).

## Config bundles (JET-430)

Unchanged:
- `GET /config/:bundle`
- `GET /config/:bundle/:version`
- `POST /config/:bundle` (save version, `201`)
- `POST /config/:bundle/:version/activate` (make live)

Writes are logged as `config.save` and `config.activate`, with before/after.

## Billing (JET-430, JET-452)

- `GET /billing/users/:id` now answers `404` for a user that doesn't exist, instead of creating an account.
- Every billing write is logged with before/after:
  - `billing.grant` (balance before and after)
  - `billing.freeze`, `billing.unfreeze`, `billing.zero`
  - `billing.plan`
  - `billing.config.draft`, `billing.config.publish`, `billing.config.rollback`
- `POST /billing/users/:id/grant`: support (without `billing.write`) gets `403 PERMISSION_DENIED` above 500 credits.
- `GET /billing/ledger?userId=&kind=&from=&to=&cursor=&limit=` returns `{ entries: [{ …, userEmail }], nextCursor }`.
- `GET /billing/reports`: unchanged, plus `userEmail` on `topSpenders` and `frozen`.
- `GET /billing/costs?from=&to=&groupBy=day|provider|model|feature|category|user|plan&userId=&model=&provider=&feature=&category=&planId=`
  returns `{ from, to, groupBy, rows: [{ key, calls, tokens, callSeconds, costUsd, credits }], total: { calls, costUsd, credits } }`.
  - The window is at most 92 days and defaults to the last 7 days.
  - Successful calls only, the same as `/reports`, so the day totals reconcile.
  - `groupBy=user` adds `userEmail`.
  - `callSeconds` is time spent in calls, not video length.
- `GET /billing/unit-costs?from=&to=` returns:
  - `completedRenders`, `costPerCompletedRenderUsd`, `costPerRenderSecondUsd`
  - `activeUsers`, `totalCostUsd`, `costPerActiveUserUsd`
  - `waste: { costUsd, byReason: [{ reason, renders, costUsd }] }`
  - `estimateAccuracy: { renders, belowFloor, withinRange, aboveCeiling, measuredOverFloor }`

  Definitions (D-109): an active user had at least one AI call in the window. A render's cost is every call it made, the same as `callsCostUsd` on `/renders/:jobId`. Waste is renders that ended failed or cancelled in the window.
- `GET /billing/liability` returns:
  - `{ at, credits, creditsUsd, creditsPerUsd, accounts }`
  - `byPlan: [{ planId, accounts, credits }]`
  - `lowBalance: { threshold, accounts }`
  - `breakage90d: { issued, expired, rate }`

## Finance (JET-453). finance.read / finance.write: owner and finance

Stored versioned, like billing config: save a draft, make it live, roll back. USD is the currency of record; enter an INR bill at that month's `fx` rate.

- `GET /finance/inputs` and `GET /finance/scenarios` return `{ kind, active, history }`.
- `GET /finance/:kind/:version`.
- `POST /finance/:kind/draft { payload, note? }` (`201`).
- `POST /finance/:kind/:version/publish`.
- `POST /finance/:kind/rollback { version }` (`201`).

`kind` is `inputs` or `scenarios`.

- **inputs payload:**
  - `lines: [{ month: 'YYYY-MM', category, kind: 'fixed'|'variable', amountUsd, note }]`
  - `cash: [{ month, amountUsd }]` (cash at month end)
  - `revenue: [{ month, amountUsd }]` (until payments exist)
  - `fx: [{ month, inrPerUsd }]`

  `category` is `ai-provider:<name>`, `gcs`, `compute`, `db`, `posthog`, `email`, `people`, `tools`, `marketing` or `other`.
- **scenarios payload:** `{ scenarios: [{ id, name, startMonth, horizonMonths (1–60), startingCashUsd?, inputs: [{ key, kind: 'cost'|'revenue', monthlyUsd, growthPctPerMonth, source, confidence }], multipliers: { worst, expected, best } }] }`.
  Costs are multiplied by the multiplier and revenue divided by it.
- `GET /finance/burn?from=YYYY-MM&to=YYYY-MM` (default the last 12 months) returns:
  - `{ inputsVersion, inputsPublishedAt, months }`
  - each month: `{ month, costUsd, revenueUsd, netBurnUsd, fixedUsd, byCategory, aiProviders: [{ provider, invoiceUsd | null, measuredUsd, varianceUsd | null }] }`

  Once an AI invoice is entered for a month, it replaces the measured AI cost in that month's burn.
- `GET /finance/runway` returns `{ cashUsd, cashMonth, months[], avgNetBurnUsd, runwayMonths | null }`.
  Runway is cash divided by the average net burn of the last 3 finished months with data. It is null when not burning.
- `GET /finance/scenarios/:id/projection?version=` returns `{ scenario, version, startingCashUsd, months: [{ month, worst, expected, best, actual | null }] }`.
  - Each case is `{ costUsd, revenueUsd, netBurnUsd, cashUsd }`.
  - It is reproducible from the stored version alone.
  - `actual` comes from `/burn`.

## Ops (JET-451). ops.read: everyone but finance

- `GET /ops/pipeline?stuckMinutes=10` returns:
  - `{ at, stuckMinutes }`
  - `inFlight: [{ status, stage, renders }]`
  - `stuck: [{ jobId, userId, userEmail, status, stage, leaseOwner, leaseUntil, updatedAt, quietMinutes, allowedActions: ['restart','cancel'] }]`
  - `last24h: { renders, medianPhaseMs: { <phase>: ms }, clipRetryRate, failureReasons: [{ reason, renders }] }`
- `GET /ops/providers` returns `{ at, circuits, last24h: { <provider>: [{ hour, calls, failed, errorRate, p50Ms, p95Ms }] } }`.
  Circuits are the live breakers. History comes from GenerationLog.
- `GET /ops/api?from=&to=` (default 24h, at most 7 days) returns:
  - `total: { requests, rpm, rate5xx, rate4xx, avgMs, p50Ms, p95Ms }`
  - `groups: [{ group, …same }]`
  - `hourly: [{ hour, requests, err5xx, p95Ms }]`

  Data is collected from deploy onward, one row per minute, route group and instance, kept 30 days. A route group is the first 3 path segments with ids collapsed, for example `api/music-videos/:id`. p50 and p95 are histogram bucket edges (50, 100, 250, 500 ms, 1, 2.5, 5, 10, 30, 60 s), not exact.
- `GET /ops/alerts` returns `{ alerts: [{ timestamp, kind, text, host, userId }] }`: `server_alert` events from the last 7 days (PostHog).
- `GET /ops/loops` returns `{ instance, startedAt, loops: { <name>: { lastRunAt, runs, lastError, lastErrorAt } } }`.
  - Loops: `song-read-sweeper`, `render-lease-heartbeat`, `render-resume-startup`, `job-recovery-startup`, `api-metrics-flush`.
  - The view is of the process that answered.

## Audit log (JET-431, JET-449)

- **What is written:** one row per admin write, plus personal-data views.
  - Row shape: `{ actor: 'admin:<id>', actorEmail, kind, action, target, before, after, payload: { route, status, query, body }, ip, userAgent, timestamp }`.
  - `kind` is `write`, `read` (personal-data views: `user.view`, `user.view_events`, `user.view_usage`, `billing.view_user`, `admin.export`) or `auth` (`user.signup`, `user.login`, `user.login_failed`).
  - Bodies, queries and before/after are redacted before writing: passwords, tokens and secrets become `[redacted]`, and emails become `sha256:<16 hex>`.
  - Rows expire after **400 days**.
  - When an account is deleted, its rows keep who did what, but lose the user's ip and user agent.
- **Action names** (all in `/meta` `auditActions`):
  - users: `user.status|role|logout|delete|quota|export`
  - renders: `render.cancel|resume|stitch|restart`
  - content: `content.hide|unhide`, `asset.*`, `element.*`
  - flags: `flag.create|update|archive`, `killswitch.update`
  - config: `config.save|activate`
  - billing: `billing.grant|freeze|unfreeze|zero|plan`, `billing.config.draft|publish|rollback`
  - finance: `finance.draft|publish|rollback`

  Rows from before this change keep their old `admin.<METHOD> <route>` names.
- `GET /audit?kind=write|read|auth|all&actor=&action=&target=&from=&to=&cursor=&limit=` (default `kind=write`, limit 50, max 200)
  returns `{ entries, nextCursor }`, newest first. Paging never repeats or skips a row.
  - `action` is a prefix (`billing.`, `user.status`).
  - Each entry has `actorEmail` and `targetLabel` (the email when the target is a user).
  - `ip` and `userAgent` are returned only to owners.
- `GET /audit/:id` returns one row, in the same view.
- `POST /audit/export { what, filters?, rows? }` returns `{ ok: true }`. The console calls it when it exports a CSV, so the export is on the record as `admin.export`.

## Flags and limits

- `GET /flags`: unchanged.
