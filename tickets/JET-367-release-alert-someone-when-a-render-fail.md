---
id: JET-367
title: Release: alert someone when a render fails or the API returns 5xx
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T12:27:11+05:30
updated: 2026-11-19T12:27:11+05:30
decisions: 
---

## Request

Today failures are only pino log lines. Send a notification for a failed/blocked render and for 5xx bursts.

## Understanding

Nobody is told when a paid render fails at launch. Assumptions: (1) a webhook (Slack or Google Chat — you pick the URL) is enough, no new monitoring vendor; (2) one message per failed render with jobId, stage and error; (3) 5xx alert is rate-limited (at most one per 5 minutes with a count); (4) the URL is a secret, so it goes in env, not flags.ts.

## Plan

1. alertV1(text) posting to the webhook, never throwing.
2. Call it where a render is marked failed/blocked and in the error middleware for 5xx (throttled).
3. Test: a failure posts once; a webhook outage does not break the request.

## Reason

—

## Related files

—

## Acceptance criteria

A forced render failure posts one message with the jobId; 20 forced 5xx within a minute post one message.

## Test steps

—

## Thread
2026-11-19T12:27:11+05:30 aquib N: created ticket, status: - -> open
