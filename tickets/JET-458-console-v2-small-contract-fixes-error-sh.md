---
id: JET-458
title: Console v2: small contract fixes (error shape, render allowedActions, publish verb, billing summary on user detail)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-26T15:07:37+05:30
updated: 2026-11-26T15:38:12+05:30
decisions: D-109
---

## Request

(1) Document {code, message} in api-admin.md. (2) GET /renders/:jobId and list rows include allowedActions: ["cancel"|"resume"|"stitch"]. (3) Align verbs in the contract: draft -> save draft, publish -> make live; for bundles, POST /config/:bundle = save version, /activate = make live (rename in docs; keep routes). (4) /users/:id billing summary consistent with /billing/users/:id (or document why it differs).

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b11. Suggested priority: P1 (small).

## Understanding

Found during the audit and the live run on 2026-11-26. (1) Contract says errors are {error, code}; errorHandler sends {status, code, message}. (2) Render cancel/resume/stitch are shown for any status. (3) "publish" makes billing config live but only stores a config bundle version. (4) GET /admin/users/:id returns billing: null when /billing/users/:id shows an account (seen live: profile says no account, billing tab shows 700). Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: None. Schema: None. Events: None. Security: allowedActions must mirror server-side guards.

## Plan

1. Confirm feasibility and answer the open questions: Is billing: null intentional (no account until first spend) or a bug?
2. Propose the API shape (allowedActions field; contract doc edits.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: A completed render returns allowedActions: [].
4. Fill Test steps.
Risks: None. Dependencies: None.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Contract updated; allowedActions present and matches what the action endpoints accept; user detail and billing tab agree on balance.

## Test steps

1. Any admin error (for example `GET /api/admin/users/nope`) is `{status:'error', code:'not_found', message}`. 2. `GET /api/admin/renders/<completed jobId>`: render.allowedActions is []; for a paused render it is ['cancel','resume']. 3. Open a user who has never opened the app: `GET /api/admin/users/<id>` billing.balance equals `GET /api/admin/billing/users/<id>` account.balance. 4. The contract (.coord/contracts/api-admin.md) says save draft / make live.

## Thread
2026-11-26T15:07:37+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:31+05:30 aquib N: status: open -> approved
2026-11-26T15:35:33+05:30 aquib N: linked decision D-109 (Console v2 backend: admin roles, re-auth, audit hardening, metrics store, finance store and the business defaults behind them)
2026-11-26T15:38:10+05:30 aquib N: BUILT. (1) The contract documents {status:'error', code, message, details?}; admin.ts now throws AppErrors everywhere, so every admin error has that shape. The auth 401s add code and message next to the old error. (2) allowedActions on render list rows, detail, action responses and project renders: cancel | resume | stitch | restart, computed from the same guards the action routes use (a test pins each case). A completed render has []. (3) The contract uses save draft / make live; routes unchanged. (4) billing:null was deliberate (reading never created an account), but the billing tab's read did create one and also applied due refills, so the two disagreed. Now both read through accountV1: one balance, never null, and the first admin view creates the account with its signup grant, as the app's first call would. GET /billing/users/:id now 404s for a user that doesn't exist instead of creating an orphan account.
2026-11-26T15:38:12+05:30 aquib N: status: approved -> in_progress
2026-11-26T15:38:12+05:30 aquib N: status: in_progress -> review — built; see the BUILT note and Test steps
