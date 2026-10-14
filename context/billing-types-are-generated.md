---
title: Billing types are generated
added: 2026-10-14
updated: 2026-10-14
by: aquib N
---

creater-ai-frontend/scripts/generate-billing-types.mjs reads creater-ai-backend/src/modules/billing/api.schema.json and emits the frontend's billing types. That schema is generated from the zod schemas the backend routes validate with, so it is the real contract — not a doc someone keeps in sync by hand.

Change a billing response shape in the backend and the frontend's types change on the next run. File a ticket to the frontend when you do. Override the path with BILLING_SCHEMA_PATH if your clones are not side by side.
