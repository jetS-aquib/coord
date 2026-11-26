---
id: JET-458
title: Console v2: small contract fixes (error shape, render allowedActions, publish verb, billing summary on user detail)
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:37+05:30
updated: 2026-11-26T15:12:31+05:30
decisions: 
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

—

## Thread
2026-11-26T15:07:37+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:31+05:30 aquib N: status: open -> approved
