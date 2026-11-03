---
id: D-068
title: A render tier buys checking and re-shooting, not a cheaper model
date: 2026-11-03
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-243
---

## Context

9.5b asks for a budget a producer picks — demo, standard or hero — resolving the model, the re-render budget and the check budget server-side, with the cost known before the money. The brief already draws the dial with nothing behind it.

## Options considered

(a) tier resolves a cheaper model for demo (seedance-1-5-pro is $0.052/s against omni's $0.10); (b) tier resolves only the spend caps, all three on omni; (c) tier changes the cut so demo generates fewer seconds.

## Decision

(b), with the model field wired and read. RENDER_TIERS_V1 in config/videoModelsV1.ts holds three rows: a modelKey, a rerenderBudget(clipCount), and whether the frame gate and the clip check run. demo is 0 re-renders and no checks, standard is the fifth-of-the-song fuse the pipeline already used, hero is half. The state payload and the call sheet carry estimatedCostUsd as a floor and costCeilingUsd as the tier's ceiling. An absent tier resolves standard's caps and still takes its model from the project record.

## Reason

(a) is where the real money is and it is not available: generateClipV1 speaks only the Interactions API and startRenderV1 refuses every BytePlus row, so a tier pointed at one would 400 every render on that tier. A test now asserts all three resolve a google-omni model. (c) changes the edit to change the price, which is the one thing a producer did not ask for. What is left is honest: the base cost of a song is fixed by its length, so the only choice is how much is spent checking and re-doing, and that is reported as a range because a tier allowed to re-shoot half the song does not have one price.

## Consequences

demo/standard/hero differ measurably in re-render budget, in checks and in reported ceiling, but NOT in model — the ticket's 'done when' asked for model too and that half is deferred, noted on JET-243. Mobile can draw the dial and show a floor and a ceiling. The env flags RENDER_FRAME_GATE and RENDER_CLIP_CHECK stay a kill switch: a check runs only if the deployment and the tier both allow it. Tier is stored on the plan, so a later change to what hero means cannot rewrite what a finished render was. The day a second provider is renderable, demo moving to it is one row in RENDER_TIERS_V1 and a contract line.
