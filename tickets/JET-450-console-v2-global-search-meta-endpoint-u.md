---
id: JET-450
title: Console v2: global search, meta endpoint, uniform paging, user labels on references
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:26+05:30
updated: 2026-11-26T15:11:59+05:30
decisions: 
---

## Request

(1) GET /admin/search?q= returns typed hits across users (email, id, name), renders (jobId), music videos/podcasts (id, title), ledger (idempotency key, paymentId later). (2) GET /admin/meta returns enums: render statuses in pipeline order and stages, ledger types, audit actions, config bundles, kill switches with labels, plan ids/names, and the JSON schema of rate card, plans, settings, launch-limits and each config bundle (zod -> JSON schema) for form editors. (3) Cursor paging on /users and /renders too (keep total where cheap). (4) Every row that references a user includes userEmail.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b3. Suggested priority: P1.

## Understanding

The console hard-codes bundles, kill switches, audit actions, ledger kinds, render statuses and stages; has no search; and shows raw userIds on renders, audit, ledger and frozen accounts. Paging is skip on /users and /renders, cursor elsewhere. Support needs 6+ steps to find a render from an email; lists drift from the backend; ids instead of people. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: No new collections; an index for search (users.email exists; jobId/title indexes to verify). Schema: Possibly text index on MusicVideo.title; verify existing indexes. Events: None. Security: Search results respect B1 permissions; no PII beyond what list endpoints already return.

## Plan

1. Confirm feasibility and answer the open questions: Is zod-to-json-schema an acceptable new backend dependency (decision record)? Keep skip paging for back-compat during transition?
2. Propose the API shape (GET /admin/search, GET /admin/meta; /users and /renders accept cursor; userEmail on renders, ledger, audit, frozen, topSpenders rows.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: Pasting a jobId returns exactly that render as the first hit in < 300 ms on current data.
4. Fill Test steps.
Risks: Regex search on large collections without indexes; cap and index. Dependencies: None.

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

Search finds a user by partial email, a render by full jobId, a video by title word; /meta lists every value the console currently hard-codes; schema output validates the live rate card; /users?cursor= works.

## Test steps

—

## Thread
2026-11-26T15:07:26+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:11:59+05:30 aquib N: status: open -> approved
