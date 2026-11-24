---
id: D-102
title: Metering and charging hang off the GenerationLog sink; renders reserve then settle cumulatively; abuse controls hold in soft launch
date: 2026-11-24
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-417, JET-419, JET-420
---

## Context

B11 needs every AI call metered and charged, renders reserved and settled, and abuse controls, without touching ~60 call sites or the old pricing code.

## Options considered

Meter at each call site vs at logGenerationToDb. Settle once vs cumulatively. Abuse controls behind billingEnforced vs always on.

## Decision

Meter and per-call charge at logGenerationToDb (category and feature from aiContext, else from the fn name). A call outside a render is charged after it, unguarded; the refusal happens before it (aiGuardV1: rate limit per user/IP and route, frozen, minimum balance). Renders reserve ceiling x (1 + reserveBuffer) in startRenderV1 and on resume; every terminal emit settles on the frozen rate card, cumulatively, so a resume or re-film after the end settles only what is new; excess over the reservation is charged unguarded. Cancelled renders settle after 10 minutes so in-flight shots are counted. Rate limits, concurrent caps, the anomaly freeze and grant eligibility apply even when billingEnforced is off. The old weekly-seconds check stays (old code); it only applies while the PostHog limits flag is on. Grant needs a verified email only once JET-385 sends codes (setting, off).

## Reason

One sink covers every provider and needs no call-site changes. Cumulative settles make retries, resumes and re-films safe without extra state. Abuse is not a pricing question, so soft launch should not open it.

## Consequences

Calls inside a render that never reaches another terminal state after a post-completion edit are charged at the next settle. Balance can dip below zero by a render's overrun or one call's cost. The limiter is in memory per instance (1-2 instances).
