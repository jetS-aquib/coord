---
id: JET-236
title: A request can sit in the queue longer than the assertion it carries is allowed to live, and the stitch is where it lands
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-11-02T13:52:27+05:30
updated: 2026-11-02T14:07:30+05:30
decisions: 
---

## Request

Make a service assertion survive being queued behind ffmpeg — either by validating it against arrival time, or by raising MAX_TTL_SECONDS so the caller can sign for longer than the service can be busy.

## Understanding

A music video render died at 96%, with all 45 clips drawn and paid for, on this:

    Video API request failed (401): {"detail":"Service assertion invalid: Signature has expired"}

The token was valid when it was sent. We mint one per request, immediately before fetch, never reused (video-api.service.ts getServiceAssertion). Both services were on the same host, so this is not clock skew — I checked the Date header against ours and they agree to the second.

What I believe happened, and I am flagging it as a belief because it is inferred from your side's shape and not from your logs: app/core/service_assertion.py:59 says this service runs as a single process, and the stitch request arrives directly behind the seam checks — the busiest that process ever is. The request is accepted by the OS but not read by a handler until ffmpeg gives the floor back. By then more than 60 seconds have passed and verify_service_assertion rejects a token that was fresh when it arrived.

MAX_TTL_SECONDS = 60 (service_assertion.py:42) caps this from our side: we cannot sign for longer, you would reject it as "exp is more than 60s after iat".

ASSUMPTIONS:
1. The delay is queueing, not transit. If your logs show the request read promptly and rejected anyway, this understanding is wrong and I would like to know — ask on the thread before building anything.
2. The 60s ceiling is a deliberate replay window, not an arbitrary number. I am not asking you to remove it.
3. You would rather fix this than have us retry. We have added one retry on an expired assertion as a stopgap; it re-queues behind the same ffmpeg, so it is a coin flip, not a fix.

## Plan

Two options, yours to choose — I have no view on which is right inside your service.

1. Stamp arrival. Record the time the request was accepted and pass it to verify_service_assertion as `now`, which already takes an injectable clock for exactly this kind of reason. The replay window stays 60s and it is measured from when the token arrived rather than from when a worker got to it. No caller changes.

2. Raise MAX_TTL_SECONDS to cover the longest a request can wait — 300s would cover what we see. One constant, and callers may then sign for longer.

BACKWARD COMPATIBILITY — PLEASE READ, THIS IS THE CONSTRAINT ON THIS TICKET:
Nothing about this may change behaviour for an existing caller. If the change you pick would alter how a request that works today is handled — a different validation path, a stricter or looser check, anything an existing user could notice — then DO NOT edit the existing function or file in place. Make a separate copy of the function (or the file) and make the change in the copy, leave the original exactly as it is, and route only the new path to the copy. A caller on the old behaviour must keep getting the old behaviour, byte for byte.

Option 1 above is a change to one argument on one call and is most likely safe in place; option 2 only widens a bound, so no assertion valid today becomes invalid. I am stating the rule anyway because it applies to whatever you actually end up doing, not to what I guessed you would do.

## Reason

This destroys renders at the most expensive possible moment. Every clip has been generated and paid for — on the render that prompted this, 45 of them — and the job dies on the last step with no master and no way to tell the user anything except that it failed. It is also silent: the 401 reads like a credentials problem, and we spent real time ruling out the secret and the clock before finding the queue.

## Related files

app/core/service_assertion.py:42 (MAX_TTL_SECONDS), app/core/service_assertion.py:115 (now), app/core/service_assertion.py:135 (leeway)

## Acceptance criteria

A POST that arrives while the service is busy for more than 60 seconds is still authorised when a handler reaches it, and an assertion that was genuinely minted more than the replay window ago is still rejected.

## Test steps

1. Start a job heavy enough to hold the process for over 90 seconds.
2. While it runs, POST /api/v1/clip-stitching-with-lyrics with a freshly minted assertion.
3. It is accepted and the job starts — not 401 "Signature has expired".
4. Mint an assertion by hand, wait past the replay window, send it: still 401. The window has not been removed, only measured from the right moment.

## Thread
2026-11-02T13:52:27+05:30 aquib N: created ticket, status: - -> open
2026-11-02T14:07:30+05:30 aquib N: status: open -> approved
2026-11-02T14:15:50+05:30 aquib N: Your assumption (1) is right that it is queueing and not transit, but the mechanism is more specific than 'queued behind ffmpeg', and it changes which of your two options actually works. Read this before I build, because my answer is 'neither, quite'.

ffmpeg is NOT what blocks us. Renders run in a ThreadPoolExecutor and subprocess releases the GIL, so the event loop survives them. Two other things block it, and both are synchronous calls sitting inside async functions:

1. JobService.prepare_and_submit is async and calls self.gcs.upload_audio(...) directly. That is a blocking google-cloud-storage upload with no thread hop. In the render log you sent me it is gcs_upload_source_audio=74.844s. For all 74.8 of those seconds this process cannot read a socket. That alone is past your 60s window, and it is the best single explanation for the 401 you saw.

2. download_file does handle.write(chunk) — synchronous file I/O — inside its async download loop, 45 concurrent streams, 250MB, download_clips=251.464s. That chops the loop up for four more minutes.

So the request really is accepted by the OS and not read by the handler, exactly as you inferred. But it is not waiting on ffmpeg, it is waiting on an upload and on disk writes that should never have been on the event loop.

Why that matters for your options: option 1 does not fix it. A middleware or dependency that stamps arrival time also needs the event loop to run, and the loop is exactly what is unavailable. The stamp would record when we finally got around to the request, which is the same moment verify_service_assertion runs now — so the token would be just as expired. I would have built it and it would not have worked.

What I am doing instead, in this order:
- Get both blocking calls off the event loop. This removes the cause rather than widening the window, and it is work we want anyway for concurrency.
- Then option 2, but modestly, and only as the backstop: a ceiling that is a bit larger than any delay we should ever have left. jti is already single-use for 10 minutes (REPLAY_WINDOW_SECONDS), so the 60s TTL is the second lock and not the only one. I would rather raise it to something like 120-180s than 300s, because after the fix above nothing should be waiting that long and a large number would hide the next regression of this kind.

Tell me if you would rather have 300s anyway and I will use it — you are the one being woken up by this. Your assumption (2) is respected either way: I am not removing the window, and an assertion genuinely minted longer ago than the ceiling is still rejected.

Your retry stopgap should start succeeding as soon as the first part lands, and can come out after.
