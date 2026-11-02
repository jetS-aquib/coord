---
id: JET-239
title: A dead render shows Stop instead of Resume, and the Try again it hides would re-pay for every clip
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-02T17:51:45+05:30
updated: 2026-11-02T17:51:45+05:30
decisions: 
---

## Request

On the working screen, treat a `failed` render as failed when re-attaching to it, and make the recovery call POST /render/:jobId/resume instead of starting a new render.

## Understanding

A render stopped at the stitch with 45 of 45 shots drawn. The screen shows the error text and then offers 'Leave it running' and 'Stop render'. There is no way to restart it and nothing is running.

TWO SEPARATE BUGS, and I caused the first one to surface — saying so plainly because the timing will otherwise look like your change broke it.

(1) RE-ATTACH CALLS A DEAD RENDER RUNNING. working/[id].tsx:137-146:

    const running = await activeRender(project.id);
    if (running) {
      if (running.status === 'review') return toCallSheet(...);
      setStatus(running.status === 'blocked'
        ? { kind: 'blocked', state: running }
        : { kind: 'running', state: running });   // <- 'failed' lands here
      return;
    }

Everything that is not review or blocked becomes 'running'. That used to be safe because GET /:id/render 404'd for this plan and activeRender returned null, so the screen fell through to the 'idle' branch and showed 'Render this song'.

I changed that this morning. isResumableV1 asked 'is a clip pending?', which answers no for a render that drew every clip and died on the stitch — the most expensive render there is to strand. It now asks whether a master exists, so the endpoint returns the plan with status 'failed' and resumable: true. Our payload is more honest and your re-attach reads it as running.

It also cannot self-correct: liveJob is `live && !isTerminal(live.status) ? live.jobId : null` (:265), and 'failed' is terminal, so the poll effect never starts and the status === 'failed' branch at :294 — which is written correctly — never fires on a cold open. In-session it works; only re-attach is broken.

(2) THE RECOVERY YOU DO HAVE RE-PAYS FOR THE WHOLE RENDER. The failed branch (:529) offers 'Try again' -> setTick(t => t + 1), which starts a new render from the top. On the render that prompted this, that is 45 clips drawn and paid for a second time. There is no resume call anywhere in src/lib/generation.ts — POST /render/:jobId/resume has existed since JET-198 and the client has never called it.

ASSUMPTIONS:
1. 'Try again' starting fresh is an oversight, not a decision. If it was deliberate, say so and I will stop asking.
2. You would rather read status off the payload than have us split the endpoint in two. We can add a separate 'resumable render' route if you prefer — tell me on this thread, it is cheap now.

## Plan

1. In the re-attach branch, handle 'failed' explicitly, the way review and blocked already are: set { kind: 'failed', message: describeFailure(running.error), final: isSpent(running.error) }. The payload carries `error`, `status` and `resumable` — resumable: true means the work is still there to pick up.
2. Add a resume call to generation.ts: POST /api/v1/music-videos/render/{jobId}/resume, 202 with the plan summary. It re-queues the existing plan; clips already done are not re-rendered and not re-charged.
3. Point the recovery CTA at it. Suggest 'Pick it up where it stopped' when resumable is true, keeping 'Try again' only for a plan that is not resumable.
4. Nothing else on the screen changes — the shot strip, the hero and the director line all read the same payload they do today.

NOT ASKING YOU TO CHANGE: the in-session poll path at :294. That branch is already right and this does not touch it.

BACKEND SIDE, ALREADY DONE, so this is not blocked on us: the endpoint returns the stranded plan with resumable: true; director {id, name} is on the payload (JET-235); and as of now a render that drew every clip and died on the stitch is picked back up automatically when the backend restarts, because finishing it spends nothing with any provider. That last one means the specific render in the screenshot is already recovering — but it is a safety net for renders nobody is watching, not a substitute for a button.

## Reason

A person looking at a dead render is offered 'Stop render'. The one real action — pick up 45 finished shots — is not on the screen, and the action that is hidden behind the correct branch would charge them again for work they already have. This is the exact money-stranding JET-198 and this morning's fix exist to prevent, stopped one layer short of the person.

## Related files

src/app/(create)/working/[id].tsx:137-146 (re-attach), :265 (liveJob/isTerminal), :294 (poll, already correct), :529 (Try again); src/lib/generation.ts:506 (activeRender), no resume call exists

## Acceptance criteria

Force-quit the app during a render that then fails at the stitch, reopen it, and the screen offers to pick the render back up rather than to stop it. Taking that option finishes the existing render without re-rendering any clip that is already done.

## Test steps

1. Start a render and let it reach the stitch with every shot drawn.
2. Make the stitch fail (stop the video service, or use a project that has already failed this way).
3. Force-quit the app — fully quit, so the screen re-attaches rather than staying in session.
4. Reopen the app and open that project. The screen says the render stopped and offers to pick it up. It does NOT offer 'Stop render'.
5. Tap it. The shot strip still shows every finished shot, no clip re-renders, and the render resumes at the stitch.
6. Check the backend log: no clip generation calls, only the stitch.

## Thread
2026-11-02T17:51:45+05:30 aquib N: created ticket, status: - -> open
