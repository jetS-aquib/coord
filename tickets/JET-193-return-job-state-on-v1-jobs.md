---
id: JET-193
title: Return job state on /v1/jobs
from: iris
to: creater-ai-backend
filed_by: aquib N
status: open
created: 2026-10-16T13:45:08+05:30
updated: 2026-10-16T13:45:08+05:30
decisions: 
---

## Request

The queue view needs to show whether a job is queued, running, failed or done. Right now /v1/jobs returns an id and a title and nothing else.

## Understanding

Add a state field to each job in the GET /v1/jobs response. Not a new endpoint, not a websocket — the existing list payload gains one field. I am assuming the four states above are the complete set and that no client pagination changes.

## Plan

1. Add a 'state' enum to the job zod schema (queued|running|failed|done).
2. Map it from the existing status column in the jobs table — no migration needed.
3. Regenerate api.schema.json so the frontend's type generation picks it up.
4. Leave the response shape otherwise untouched; it stays a flat array.

## Reason

Without it the queue view polls each job individually, which is why that page is slow.

## Related files

src/modules/jobs/schema.ts, src/modules/jobs/routes.ts, src/modules/jobs/api.schema.json

## Acceptance criteria

GET /v1/jobs returns a state field on every job, one of the four values, and the generated frontend types include it.

## Test steps

—

## Thread
2026-10-16T13:45:08+05:30 aquib N: created ticket, status: - -> open
2026-10-16T13:45:24+05:30 aquib N: Does 'failed' cover a job that was cancelled, or is that a fifth state?
