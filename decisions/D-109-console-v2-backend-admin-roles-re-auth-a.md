---
id: D-109
title: Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them
date: 2026-11-26
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-web
tickets: JET-448, JET-449, JET-450, JET-451, JET-452, JET-453, JET-454, JET-455, JET-456, JET-457, JET-458
---

## Context

The console v2 audit (music-jetkreate-web/planning/ui-ux-audit/09) asked for 11 backend changes. Each one left open questions that are business calls (role list, retention, churn, active user, currency, view-as). The web console can't start until the APIs are final, so the backend shipped with defaults that are easy to change. They are recorded here so anyone can overturn them.

## Options considered

Roles: (a) widen User.role, (b) a separate adminRole field. Re-auth: (a) auth_time claim on the token, (b) a separate re-auth endpoint and session store. Ops metrics: (a) a Mongo per-minute rollup, (b) sampled PostHog events, (c) Cloud Monitoring (the deploy target is unknown to the backend). Finance data: (a) a new collection, (b) the existing versioned billing config store. JSON schema: (a) the zod-to-json-schema dependency, (b) zod 4's built-in z.toJSONSchema. DSAR export: (a) an async zip on a signed URL, (b) a synchronous JSON download.

## Decision

Roles: User.role widened to owner|ops|support|finance|viewer. The old 'admin' value means owner, so there is no migration. Permissions follow the web team's table (07-administrative-controls.md). The table lives in src/routes/adminAccess.ts and a test asserts every route has a rule. Support grants are capped at 500 credits each. C2 routes need a sign-in in the last 10 minutes (token auth_time, which carries across refresh): delete user, role change, zero balance, billing publish and rollback, and switching a kill switch off. Audit: one row per write, with a domain action name and before/after. Reads are logged only for personal-data views. Secrets are dropped and emails hashed before writing. Rows are kept 400 days (TTL). Account deletion anonymises the user's rows (ip and user agent removed) but keeps the trail. Ops: a Mongo per-minute rollup per route group and instance, TTL 30 days. Provider history comes from GenerationLog, which already exists. Loop heartbeats are per process. Finance: a new kind in the BillingConfigV1 store (draft/publish/rollback reused), USD of record with FX per month. Definitions: an active user had at least one AI call in the window (for unit costs). Churn is 28 days with no activity after at least one completed render. Waste is measured cost on renders that failed or were cancelled. Analytics segments are plan and signup cohort; platform waits on JET-373 client events. Flags: allow and deny lists are distinct_id (user id) conditions, and emails are turned into ids server-side so no email reaches PostHog. Kill switches get their own route. View-as is not built; a richer read-only user detail is offered instead. DSAR export is a synchronous JSON download. MFA is not built (see JET-448 thread). Revenue (JET-454) is a written answer only. JSON schema uses zod 4's built-in, so no new dependency. User detail now reads billing through accountV1, as the billing tab does, so both show one balance. That creates the account and its signup grant on first view, the same as the app's first call.

## Reason

Each default is the proposal the web team wrote, or the smallest thing that is safe. Every one is a constant or a table in one file, so changing it later is a one-line edit plus a contract note, not a migration.

## Consequences

Admins sign in again once after deploy before any C2 action, because old tokens have no auth_time. An existing database needs one collMod to turn the AuditLog timestamp index into the TTL index (post-deploy step). Action names change from admin.<METHOD> <route> to domain names; old rows keep their names, and kind=all still finds them. ApiMetricMinuteV1 adds a few writes a minute per instance.
