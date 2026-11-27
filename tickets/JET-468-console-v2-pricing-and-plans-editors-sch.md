---
id: JET-468
title: Console v2: pricing and plans editors (schema forms from /meta, diff, impact preview, save draft / make live / roll back)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:58+05:30
updated: 2026-11-27T15:51:40+05:30
decisions: 
---

## Request

Form editors for rate card, plans and settings using /meta schemas (.coord/contracts/api-admin.md Me/meta; api-billing.md; JET-450).
Size: M. Builds on: JET-462, JET-463. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

GET /meta returns JSON Schemas for rateCard, plans, settings and each config bundle. Build a SchemaForm (fields, hints, validation) with an Advanced JSON tab and a structured diff vs live. Billing: Save draft -> Preview impact (POST /billing/rate-card/preview) -> Make live (C2, shows impact %) -> Roll back (C2). Plans editor uses plan ids from /meta; change-plan dialogs become a select. Config bundles reuse the same SchemaForm with Save version / Make live.

## Plan

1. SchemaForm + diff component.
2. Billing config pages.
3. Config bundle pages.
4. Replace free-text plan id with a select.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

apps/admin/app/(console)/billing/config/**, apps/admin/app/(console)/control/config/**, packages/ui schema-form

## Acceptance criteria

An invalid rate entry is blocked before saving with the same rule the backend uses; Make live shows the margin impact and needs a recent sign-in; the diff lists changed fields, not two JSON dumps.

## Test steps

—

## Thread
2026-11-26T15:48:58+05:30 aquib N: created ticket, status: - -> open
2026-11-27T15:51:40+05:30 aquib N: status: open -> approved
