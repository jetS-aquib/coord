---
id: JET-367
title: Release: alert someone when a render fails or the API returns 5xx
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-19T12:27:11+05:30
updated: 2026-11-19T17:58:11+05:30
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

Setup: create an incoming webhook (Slack: an app with Incoming Webhooks for the channel; Google Chat: Space → Apps & integrations → Webhooks), put it in .env as ALERT_WEBHOOK_URL, restart. The boot log no longer shows the "ALERT_WEBHOOK_URL unset" warning.
1. Render failure: make a render fail (e.g. cancel the network to Gemini mid-render, or set a bad GEMINI_API_KEY and Film) -> one message "🔴 Render failed: <jobId> (user …, tier, stage, shots, ~$ spent)" with the error on the next line.
2. Blocked render: a render that ends needing clip fixes -> one "🟠 Render blocked" message.
3. 5xx burst: hit an endpoint that 500s 20 times in a minute -> one "🔴 500 on …" message; the next 5xx after 5 minutes says "+19 more since the last alert".
4. Refusals stay quiet: renders-enabled off -> Film gives 503 renders_off and no message.
5. Spend limit: set launch-limits dailySpendUsd to 0.01 -> Film gives 503 capacity and one "🟠 Daily spend limit reached" message (at most one an hour).
6. Webhook down: set ALERT_WEBHOOK_URL to https://example.invalid/x, repeat 1 -> the render and the API behave the same; the log says "[alert] webhook failed".
Regression sheet rows TC-090 to TC-091.

## Thread
2026-11-19T12:27:11+05:30 aquib N: created ticket, status: - -> open
2026-11-19T17:58:11+05:30 aquib N: status: open -> approved
2026-11-19T18:02:08+05:30 aquib N: Built. src/shared/alert.ts: alertV1 posts {text} (works for Slack and Google Chat incoming webhooks) with the host prefixed, 5s timeout, never throws. Render failed/blocked: one message per render from the same emit() point the PostHog render events use (trackRenderV1 no longer returns early when PostHog flags are off, so alerts don't depend on them). 5xx: a res 'finish' listener catches every 5xx however it was sent, throttled to one per 5 min with a count of what was held back; 503 is skipped (renders_off and capacity are deliberate refusals). Extra: the daily spend breaker tripping alerts (one an hour), and the allowance check failing (which refuses every render) alerts. ALERT_WEBHOOK_URL optional in env.ts (empty allowed), placeholder added to .env; the boot banner warns when it is unset. Throttle is per process (noted). No mobile change: alerts are server-side only.
