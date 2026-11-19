---
id: JET-367
title: Release: alert someone when a render fails or the API returns 5xx
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-19T12:27:11+05:30
updated: 2026-11-19T18:02:09+05:30
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

Setup: PostHog keys in .env, flags.posthog.events on (default). ALERT_WEBHOOK_URL stays empty until a Teams webhook exists.
0. Live check already sent: PostHog → Activity, event server_alert with text "jet367-live-check"; PostHog → Error tracking, issue "jet367-live-check: test error".
1. Render failure: make a render fail (bad GEMINI_API_KEY, Film) -> one server_alert (kind render_failed) with jobId, user, tier, stage and the error in text.
2. Blocked render -> one server_alert (kind render_blocked).
3. Crash: any unhandled error -> an issue in Error tracking with its stack and route; plus one server_alert (kind 5xx) per 5xx response.
4. Refusals stay quiet: renders-enabled off -> Film gives 503 renders_off and no server_alert.
5. Spend limit: launch-limits dailySpendUsd 0.01 -> 503 capacity and a server_alert (kind capacity).
6. Email: in PostHog make an insight "server_alert, total count, last hour" and add an Alert (threshold > 0, notify by email); repeat 1 -> the email arrives.
Regression sheet rows TC-090 to TC-091.

## Thread
2026-11-19T12:27:11+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:58:11+05:30 aquib N: status: open -> approved
2026-11-19T18:02:08+05:30 aquib N: Built. src/shared/alert.ts: alertV1 posts {text} (works for Slack and Google Chat incoming webhooks) with the host prefixed, 5s timeout, never throws. Render failed/blocked: one message per render from the same emit() point the PostHog render events use (trackRenderV1 no longer returns early when PostHog flags are off, so alerts don't depend on them). 5xx: a res 'finish' listener catches every 5xx however it was sent, throttled to one per 5 min with a count of what was held back; 503 is skipped (renders_off and capacity are deliberate refusals). Extra: the daily spend breaker tripping alerts (one an hour), and the allowance check failing (which refuses every render) alerts. ALERT_WEBHOOK_URL optional in env.ts (empty allowed), placeholder added to .env; the boot banner warns when it is unset. Throttle is per process (noted). No mobile change: alerts are server-side only.
2026-11-19T18:02:09+05:30 aquib N: status: approved -> in_progress
2026-11-19T18:02:09+05:30 aquib N: status: in_progress -> review — Built and tested; needs a webhook URL for the live check. Not committed.
2026-11-19T18:10:07+05:30 aquib N: Changed on request: the team uses Teams and may not get a webhook, so PostHog is the alert channel. Every alert is a server_alert event (kind render_failed / render_blocked / 5xx / capacity / limit_check, text, jobId, userId, host); crashes from the error handler also go to PostHog Error Tracking with stacks (captureErrorV1, posthog-node captureException). Email notification = a PostHog insight alert on server_alert. ALERT_WEBHOOK_URL stays as an optional chat webhook (throttled per kind), unset for now; the boot warning for it was dropped. Live-checked: one test server_alert and one test exception sent (jet367-live-check).
