---
id: D-058
title: Fix the zod guard in the shared error handler, rather than wrapping the one v1 route that needed a 400
date: 2026-11-01
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-234
---

## Context

Caption settings on POST /api/v1/music-videos/:id/render are validated at our boundary because the stitch request models downstream are extra="forbid" and the stitch is the LAST call of a render that has already paid for ~45 clips — an unknown caption key would otherwise be a 422 on a ~$25 song forty minutes after the request carrying the typo was answered 202. The validation worked on the first try and still answered 500, not 400. The cause is not in the new code: src/shared/middleware/errorHandler.ts guards on Array.isArray(err.errors), and zod 4 renamed that property to issues. This repo is on zod 4.3.6, so err.errors is undefined, the guard has matched nothing since the upgrade, and EVERY validation failure on EVERY zod-validated route in this service has been falling through to the unknown-error branch — answered 500, with the raw zod JSON in the message. Nothing failed loudly when it broke, which is why it survived: the guard still compiled, still typechecked, and simply stopped being true.

## Options considered

1. Wrap the one new .parse call in a try/catch that returns 400 itself. Smallest possible diff, touches nothing shared, and leaves every other route in the service — v0 and v1 — answering 500 for bad input, including the three other v1 schemas in the same file. 2. Fix the guard in the shared handler to read issues, keeping errors for a zod 3 shaped error. One line of real change plus a test, and it corrects every caller at once. 3. Fix the handler but gate the new behaviour behind a flag so v0 routes keep answering 500. 4. Leave it and document that validation errors are 500s.

## Decision

Option 2. The guard reads issues ?? errors, and a test asserts a real zod 4 failure is a 400 with the offending field named, a zod 3 shaped error still is, and a genuine unknown error is still a 500.

## Reason

This is the root cause and the shared function is where every caller already routes through, so one guard is a smaller diff than a guard per call site — and patching only the path JET-234 named would have left the other three schemas in the same file still wrong. The handler's own doc comment already says 'ZodError -> 400'; this restores its documented intent rather than changing it. Option 1 was rejected because it ships the deliverable while knowingly leaving the bug: the entire value of validating caption settings early is that a client can tell a bad request from a broken server, and a 500 does not let them. Option 3 was rejected because a flag to preserve a behaviour nobody wants is the kind of config CLAUDE.md's boundaries exist to prevent.

## Consequences

Every zod-validated route in this service, v0 and v1 alike, now answers 400 VALIDATION_ERROR with field-level detail for bad input instead of 500 INTERNAL_ERROR with raw zod JSON. THIS IS A BEHAVIOUR CHANGE ON SHARED CODE AND IT REACHES v0, which is worth saying plainly even though it is a strict improvement: a client that treats any non-2xx as failure is unaffected, a client that branched on the status now gets the correct one, and the raw zod payload stops being echoed to callers. Nothing in a success path moves. A side effect worth having: 500 rates in logs should drop, because a share of them were never server errors.
