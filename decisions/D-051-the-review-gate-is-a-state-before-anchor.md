---
id: D-051
title: The review gate is a state before anchoring, opt-in per render, and the direction pass stays in the worker
date: 2026-10-30
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-228
---

## Context

Batch 8 rows 8.2, 8.3 and 8.5 all require the plan to be SHOWN before any spend. Today startRenderV1 persists a plan with status 'queued', returns 202 and kicks a worker; the worker runs applyDirectionV1 (two text calls) and then renderAnchorsV1, which is where the money starts. RenderPlanV1's status enum is queued | anchoring | rendering | verifying | stitching plus blocked and the three terminals — there is no state between queued and anchoring at all. Two existing commitments constrain the answer. The direction pass was deliberately MOVED off the request into the worker because three text calls on the request once returned a 202 after 65.9 seconds, so a person waited over a minute for a job id; undoing that is explicitly not allowed. And row 8.6 says start filming is never blocked, which is a hard constraint on the gate rather than a slogan. 9.9's narration separately names 'planning' and 'casting' phases that do not exist.

## Options considered

1. Run the direction pass on the render request and return the plan synchronously. Simplest client, and it is the 65.9-second 202 again. 2. One new status, 'planning', and have the client decide when to call accept. Fewest states, and it cannot tell 'still working' from 'waiting on you', which is the one thing the screen must know. 3. A separate pre-render 'plan' resource with its own lifecycle, promoted to a render on accept. Clean, and it is a second document, a second id, a second resume path and a migration. 4. Two new statuses on the existing plan — 'planning' while the pass runs, 'review' when it is written and nothing more has been bought — with the gate opt-in per render and an explicit accept that starts the spend.

## Decision

Option 4. RenderPlanV1 gains 'planning' and 'review', both between 'queued' and 'anchoring' and both non-terminal. The direction pass stays exactly where it is, in the worker, and the render still answers 202 immediately. POST /:id/render takes an optional review:boolean defaulting to FALSE: without it a render goes queued -> planning -> anchoring and never stops, which is byte-identical to today for the web path and for any client that does not want the gate. With it the worker stops at 'review' after the plan is written and waits for POST /render/:jobId/accept, which is idempotent and never 409s. There is no server-side timer that auto-proceeds. Two places had to learn about the new state or they would have defeated it: resumeRendersOnStartupV1 excludes 'review' exactly as it excludes 'blocked', and runPlanV1 returns early on it — a deploy must not start a $25 render nobody approved.

## Reason

The two states are not one state. 'The treatment is being written' and 'the treatment is written and I am waiting for you' are different sentences on the screen, and collapsing them means the client has to infer which by watching fields change, which is how a progress UI starts lying. That is also what 9.9 already asked for by naming 'planning', so the state earns itself twice.

Opt-in rather than on-by-default is what satisfies 8.6 without a timer. A gate that every client hits is a gate that can strand somebody; a gate one client asks for is a feature that client controls, and the only way to be stopped by it is to have asked to be. It also means this decision cannot regress the web path or the baseline renders — the same property D-047 bought for the house director, for the same reason.

No timer is the part worth defending. The obvious shape is 'auto-proceed after N minutes so nothing hangs'. But what hangs costs two text calls and one image, and what the timer would start costs ~$25. A fuse should fail towards the cheap side, and here that means waiting forever. An abandoned plan in 'review' is already visible to GET /:id/render and already cancellable; nobody is stranded and nobody is billed.

Keeping the direction pass in the worker is not a convenience either. It is the whole reason the gate is affordable: the plan the person reviews is a plan that was built asynchronously, so the gate costs the render nothing in latency and the request still returns a job id at once.

## Consequences

A third kind of 'not finished' exists alongside 'blocked', and both mean a person has to act. findActivePlanV1 counts a plan in 'review' as active, so a second render against the same project is refused with a message naming the job and saying to accept or cancel it — the same posture 'blocked' already has, rather than a silent second $25 render. A render that stops at the gate has spent two text calls and one image: the plate is now drawn during 'planning' rather than at anchoring, because 8.2's cast cards need a picture and that image was always going to be paid for. If a plan is abandoned in 'review' that one image is the whole loss. Mobile is the only client that sends review:true today, so every web render and every stored project behaves exactly as it did. The next thing this makes possible is 9.9: the narration finally has real phases to name instead of inventing them, and the crew notes written during 'planning' give it content rather than labels.
