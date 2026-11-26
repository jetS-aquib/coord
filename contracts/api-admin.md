---
owner: music-jetkreate-backend
status: active
---

# /api/admin — the admin console's API

Written by hand (JET-426…431). It describes the API; it does not define it. The source
of truth is the zod schemas in `music-jetkreate-backend/src/routes/admin.ts`,
`src/shared/posthogApi.ts` and `src/modules/billing/billing.routes.ts`. Billing admin
routes (`/api/admin/billing/*`) are in [api-billing.md](api-billing.md). This file covers
everything else.

## Access

- **Auth:** every route needs `Authorization: Bearer <access token>` plus the request signature, the same
  as the app (`requireAuth` + `requireSignature`). Sign in through the existing `/api/auth/google` (or
  email login) and `/api/auth/refresh`. There is no separate admin login.
- **Role:** the user's `User.role` must be `'admin'`. Anyone else gets `403 { code: 'FORBIDDEN' }`. When
  `flags.posthog.admin` is off, everyone gets `404`. Roles are set with `POST /users/:id/role`; the
  first admin still has to be set in Mongo.
- **Audit:** every request is written to AuditLog after it answers, as
  `{ actor: 'admin:<id>', action: 'admin.<METHOD> <route path>', target: <:id | :jobId | :key | :bundle>, payload: { status, query, body } }`.
  Flag changes and config activation also write a row with `before` and `after`.
- **CORS:** `ALLOWED_ORIGINS` (comma list) replaces the defaults when set. The defaults include
  `http://localhost:3100` (the console on a dev machine). Calls from the console's Next.js server are
  server-to-server and don't need CORS.
- **Errors:** `{ error, code }`. A failed zod check is `400 { code: 'VALIDATION_ERROR', details }`.
  Missing things are `404 { code: 'not_found' }` unless a route below says otherwise.
- **Paging:** two styles.
  - `/users` and `/renders` use `?limit=&skip=` and return `total`.
  - Every other list uses `?cursor=&limit=` (default 25, max 100) and returns `{ items | entries, nextCursor | null }`, newest first. To get the next page, pass `nextCursor` back as `cursor`.

## Users (JET-428)

- `GET /users?q=&status=&role=&authProvider=&createdFrom=&createdTo=&sort=newest|oldest|email|name&limit=&skip=`
  returns `{ users: [{ id, email, name, role, status, authProvider, createdAt }], total }`.
  `q` matches email or name (case-insensitive) or an exact id.
- `GET /users/:id` returns:
  - `user`: `{ id, email, name, role, status, authProvider, createdAt, updatedAt, isEmailVerified, statusReason, statusChangedAt, sessionsRevokedAt, devices: [{ platform, createdAt }] }`
  - `settings`: the UserSettings document, or `null`
  - `quota`: `{ …renderAllowance, override | null }`
  - `billing`: `{ balance, frozen, frozenReason, planId, limitsOverride }`, or `null` if no credit account exists yet. Reading never creates one.
  - `counts`: `{ musicVideos, podcasts, renders: { <status>: n } }`
  - `lastLoginAt | null` (from AuditLog `user.login`/`user.signup`) and `lastActivityAt | null` (the last AI call)
- `GET /users/:id/usage`: render seconds, renders by status, and 30-day cost (unchanged, JET-372).
- `PUT /users/:id/quota { renderSeconds: number | null }`: sets or clears the weekly override (unchanged).
- `POST /users/:id/status { status: 'active'|'suspended'|'banned', reason? }` returns `{ userId, status, before }`.
  - The user's next app request answers `403 ACCOUNT_SUSPENDED`, and refresh is refused.
  - Errors: `409 self_action` (your own account), `409 target_is_admin` (remove the role first).
- `POST /users/:id/role { role: 'admin'|'creator' }` returns `{ userId, role, before }`.
  - Errors: `409 self_action`, `409 last_admin`.
- `POST /users/:id/logout` returns `{ userId, sessionsRevokedAt }`.
  - Every access and refresh token issued at or before that moment stops working (`401 INVALID_TOKEN`). The user signs in again.
  - A sign-in within the same second as the logout is also refused, so retry after a second.
- `DELETE /users/:id` with body `{ confirm: <the user's email> }` returns `{ success, userId, files }`.
  - It is the same hard delete as the user's own `DELETE /users/me`. Files are removed in the background.
  - Errors: `400 confirm_mismatch`, `409 self_action`, `409 target_is_admin`.
- `GET /users/:id/events?cursor=&limit=` (default 50, max 200) returns the user's PostHog events, newest first:
  `{ events: [{ id, event, timestamp, properties }], nextCursor | null }`.
  `cursor` is the last event's timestamp. Returns `503` if PostHog isn't configured (see below).

## Renders

- `GET /renders?status=&userId=&limit=&skip=`: a summary of each render with its cost (unchanged).
- `GET /renders/:jobId` (JET-429) returns:
  - `render`: the summary
  - `plan`: the full RenderPlanV1 document (stages, clips, anchors, cast, timings, flagSnapshot, billing…)
  - `cost`: the itemised `renderCostV1`, or `null` for a half-made plan
  - `calls`: every GenerationLog row for the render, oldest first
  - `callsCostUsd`
  - `project`: `{ id, title, userId, moderation }`
  - `traceId` (= jobId, for PostHog LLM traces)
- `POST /renders/:jobId/cancel | /resume | /stitch`: the same as the owner's buttons (unchanged).

## Content moderation (JET-429)

`{kind}` is `music-videos` or `podcasts`. A takedown hides the item from its share link and public
pages. The owner keeps it, nothing is deleted, and the share token is kept, so restoring it brings the
same link back. (The `Video` collection is a YouTube metadata cache, not user content, so it has no
routes.)

- `GET /{kind}?userId=&status=&q=&hidden=true|false&cursor=&limit=` returns `{ items, nextCursor }`.
  Each item has `moderation | null` and `shared` (boolean). The share token itself is never returned.
- `GET /{kind}/:id` returns `{ item }`. For music videos it also returns `renders[]` (the last 50) and `feedback[]`.
- `POST /{kind}/:id/takedown { reason }` returns `{ id, moderation: { hidden: true, reason, by, at } }`.
  - The share page `/s/:token` answers 404.
  - The owner's `POST …/share` answers `403 taken_down`.
- `POST /{kind}/:id/restore` returns `{ id, moderation: { hidden: false, … } }`.
- `GET /feedback?rating=up|down&userId=&musicVideoId=&cursor=&limit=` returns `{ items, nextCursor }`:
  VideoFeedback rows `{ userId, musicVideoId, renderJobId, rating, reasons[], note, createdAt, updatedAt }`, newest first.

## Public assets and elements (JET-429)

- `GET /public-assets?status=pending|approved|rejected&type=image|video|audio&userId=&cursor=&limit=`
- `POST /public-assets { name, type, url (https), modelKey?, aspectRatio?, resolution?, duration?, prompt?, isPublic?, status? }`
  returns `201`. It defaults to `status: 'approved'` and `isPublic: true`.
- `PATCH /public-assets/:asset_id` takes any of the same fields (for example `{ status: 'approved' }`). `DELETE /public-assets/:asset_id`.
- `GET /elements?userId=&type=character|background|object&q=&cursor=&limit=`, `GET /elements/:id`.
- `PATCH /elements/:id { name?, description?, dummy_name?, type? }`, `DELETE /elements/:id`. There is no
  admin create: an element belongs to a user.

## PostHog through the backend (JET-427, D-104)

The backend needs `POSTHOG_PERSONAL_API_KEY` (phx_, with the scopes `query:read` and `feature_flag:write`)
and `POSTHOG_PROJECT_ID`. `POSTHOG_API_HOST` is optional and defaults to `POSTHOG_HOST` without the `.i`
(so `https://eu.posthog.com`). Without those keys, every route here answers `503 posthog_not_configured`.

- `POST /analytics/query { name, from, to }` (ISO dates) returns `{ name, columns[], rows[][], cached }`.
  Results are cached for 60s per process. The named queries are:
  | name | columns |
  |---|---|
  | `dau` / `wau` / `mau` | `period, users` |
  | `signups` | `day, signups` |
  | `signup_to_first_render` | `signed_up, rendered` (people who signed up in the window, and how many of them started a render) |
  | `retention_weekly` | `cohort, week, users` (cohort = signup week; week 0 = the signup week) |
  | `renders_per_day` | `day, status (started/completed/failed/blocked/cancelled), renders` |
  | `render_failures` | `reason, renders` (the first 80 characters of the error, top 50) |
  | `ai_spend_per_day` | `day, model, cost_usd, calls` |
- `POST /analytics/query { hogql }`: an admin's own query, SELECT/WITH only, capped at 1000 rows. A bad
  query is `400 posthog_bad_query`.
- `GET /posthog/flags` returns `{ flags: [{ id, key, name, active, rolloutPercentage | null, conditions, multivariate, payload, updatedAt }] }`.
  `rolloutPercentage` is `null` when the flag has several release conditions.
- `PATCH /posthog/flags/:key { active?, rolloutPercentage? (0–100), payload? }` returns the flag after the change.
  - `409 flag_too_complex`: a rollout change on a flag with several conditions, or a payload on a multivariate flag. Edit those in PostHog.
  - `404 flag_not_found`.
  - Other PostHog failures are `502 posthog_error`.

## Config bundles (JET-430)

Bundles are `starters`, `styles`, `lyricLooks`, `directors`, `copy`, `limits` and `home`. Which version
is live is set by the payload of the `ui-config` flag in PostHog.

- `GET /config/:bundle` returns `{ bundle, live | null, source: 'posthog'|'env'|'latest', versions: [{ version, schemaVersion, minAppVersion, publishedBy, createdAt, live }] }`, newest first.
- `GET /config/:bundle/:version` returns `{ bundle, version, schemaVersion, minAppVersion, createdAt, payload, publishedBy }`.
- `POST /config/:bundle { payload, schemaVersion?, minAppVersion? }` publishes the next version
  (`201`). It doesn't make the version live.
- `POST /config/:bundle/:version/activate` returns `{ bundle, version, uiConfig }`.
  - It sets `ui-config`'s payload `bundles[bundle] = version` and keeps the other bundles.
  - `/api/v1/config/manifest` reflects the change within about a minute.
  - Needs PostHog configured (`503` otherwise). A missing `ui-config` flag is `404 flag_not_found`.
- The old no-auth `POST /api/admin/config/seed` and `/api/admin/billing/seed` have been removed. Use
  `scripts/seed-config.ts` and `scripts/seed-billing.ts`.

## Billing ledger (JET-430)

- `GET /billing/ledger?userId=&kind=<grant|refill|reserve|settle|refund|charge|adjust|purchase|expire>&from=&to=&cursor=&limit=` (default 50, max 200)
  returns `{ entries: [{ id, userId, type, credits, balanceAfter, ref, idempotencyKey, meta, createdAt }], nextCursor | null }`,
  newest first, across all users.

## Audit log (JET-431)

- `GET /audit?actor=&action=&target=&from=&to=&cursor=&limit=` (default 50, max 200) returns `{ entries, nextCursor | null }`,
  sorted by timestamp then _id, newest first. Paging never repeats or skips a row.
  - `action` is a prefix: `admin.` gives every admin request, `admin.POST /users/:id/status` gives status changes, `user.` gives auth events.
  - `actor` is exact: `admin:<id>` for an admin, or a user id for their own auth events.
  - `target=<userId>` gives everything done to that user.
- `GET /audit/:id` returns one row: `{ _id, actor, action, target, payload, ip, userAgent, timestamp }`.
  `payload` is as stored (it can include emails), and only admins can read it.
- Actions written besides `admin.*`: `user.signup`, `user.login` (`payload.method`), `user.delete`
  (actor is the user, or `admin:<id>`), `admin.posthog.flag` and `admin.config.activate` (`before`/`after`),
  and `admin.billing.user_plan`.

## Flags and limits

- `GET /flags`: kill switches, launch limits, today's spend, and render flags as this process sees them (unchanged).
