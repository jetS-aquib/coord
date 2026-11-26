---
id: JET-428
title: Admin users: full profile, filters, suspend/ban, admin role, force logout and delete
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T17:04:19+05:30
updated: 2026-11-26T12:36:16+05:30
decisions: D-108
---

## Request

Everything the console's Users page needs to see and act on one user.

## Understanding

Today GET /admin/users only searches by text, and the only user write is the quota override. User.status (active/suspended/banned) exists and requireAuth already rejects non-active users, but nothing sets it. Role can only be set in Mongo. deleteAccountV1 (src/modules/auth/deleteAccount.ts:42) already deletes a user and their files. Assumption: force logout = rotate the stored snonce so existing tokens fail signature; if snonce isn't stored per user, it means adding a tokenVersion check in requireAuth — I'll say which once I've read jwt.ts.

## Plan

1. GET /admin/users filters: status, role, authProvider, createdFrom/To, sort.
2. GET /admin/users/:id: profile, settings, quota, billing summary, counts of videos/renders/podcasts, last seen.
3. POST /admin/users/:id/status {status, reason}.
4. POST /admin/users/:id/role {role}; refuse demoting yourself or the last admin.
5. POST /admin/users/:id/logout (invalidate sessions).
6. DELETE /admin/users/:id via deleteAccountV1, requires {confirm: email}.
7. Tests for the role guards and status change.

## Reason

—

## Related files

src/routes/admin.ts, src/shared/middleware/requireAuth.ts, src/shared/jwt.ts, .coord/contracts/api-admin.md

## Acceptance criteria

Suspending a user makes their next app request 403; reactivating restores it; an admin can't demote themselves; delete removes the user and files; every action is in AuditLog.

## Test steps

1. As an admin, `POST /api/admin/users/<test user>/status {status:'suspended',reason:'test'}`; the test user's next app request answers 403 ACCOUNT_SUSPENDED. 2. Set it back to active; the app works again. 3. `POST /api/admin/users/<your own id>/role {role:'creator'}` answers 409 self_action. 4. `POST /api/admin/users/<test user>/logout`; the app on that account is signed out within one request (401) and can sign in again. 5. `DELETE /api/admin/users/<test user> {confirm:'<their email>'}`: user and files gone; GET /api/admin/audit?target=<id> shows every step.

## Thread
2026-11-24T17:04:19+05:30 aquib N: created ticket, status: - -> open
2026-11-26T12:23:39+05:30 aquib N: status: open -> approved
2026-11-26T12:36:16+05:30 aquib N: linked decision D-108 (Admin force logout by a revocation time on User; takedown as a moderation flag, not a delete)
2026-11-26T12:37:05+05:30 aquib N: BUILT (uncommitted). Force logout = User.sessionsRevokedAt; requireAuth and refresh reject tokens with iat <= it (D-108). The snonce isn't stored, so rotating it wasn't possible. Routes: GET /admin/users gains status, role, authProvider, createdFrom/To and sort=newest|oldest|email|name (still limit/skip/total). GET /admin/users/:id -> {user (incl statusReason, statusChangedAt, sessionsRevokedAt, devices[]), settings, quota, billing|null (read-only, never creates an account), counts{musicVideos,podcasts,renders{status:n}}, lastLoginAt, lastActivityAt}. POST /:id/status {status, reason}, POST /:id/role {role: admin|creator}, POST /:id/logout, DELETE /:id {confirm: email}. Refusal codes for the console: 409 self_action (any action on yourself), 409 target_is_admin (suspend/ban/delete an admin: demote first), 409 last_admin (defensive, can't really fire), 400 confirm_mismatch. Delete reuses deleteAccountV1, files are removed in the background, and AuditLog gets user.delete with actor admin:<id>. Login and signup now write AuditLog user.login / user.signup, which is where lastLoginAt comes from. Users who signed in before this ships show null until their next login.
