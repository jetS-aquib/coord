---
id: D-026
title: The output frame is chosen per render by the caller, not by a deployment flag
date: 2026-10-27
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-mobile, music-jetkreate-backend, creater-ai-backend
tickets: JET-196
---

## Context

D-005 derived the frame's orientation from the clips; D-017 then put that behind ENABLE_PORTRAIT_OUTPUT, default off, specifically so no caller could change the frame while nobody had checked what downstream players and compositing do with a non-16:9 master. The mobile app is now adding an aspect ratio selector — 9:16, 1:1, 16:9 — which a user picks per song. A deployment flag cannot express that, and hardcoding one aspect for the whole service is exactly what the selector exists to remove.

## Options considered

Keep the flag and ship only 9:16 on the mobile deployment; add a second flag per aspect; make the frame an explicit field on the stitch request.

## Decision

The clip-stitching requests take an explicit output frame, chosen per render. ENABLE_PORTRAIT_OUTPUT and the majority-of-clips derivation behind it are superseded: with a frame on the request there is nothing left to infer. A request that names no frame keeps today's landscape default, so existing callers are unchanged and nothing has to migrate. The contract changes, so it is a ticket against video-processing-backend before any of it is written.

## Reason

The derivation in D-005 was a way to avoid a client change when no client could express an intent. A selector is that intent, stated by the person who knows what the video is for, and it cannot contradict the material the way an inferred frame can. Holding the frame fixed also costs real time: 31 portrait clips encode in 13.6s at their native 720x1280 against 24.4s at 1920x1080, measured — a 1.8x saving that was parked precisely because the frame could not be stated. One field settles both.

## Consequences

D-017 is superseded and ENABLE_PORTRAIT_OUTPUT is removed once every caller sends a frame; until then an absent frame means landscape, so no deployment has to be reconfigured on the day. The caption canvas already follows the frame and needs no change, but the caption preview still renders landscape whatever the master is, and that gap becomes visible as soon as users pick an aspect — its own ticket. The creator API's measurement carries the resolution string as a rate-selecting attribute, so a 1:1 or 9:16 render now reports a resolution no rate card has seen; confirm with the rate card owner before the selector ships. The iris vendored copy is unaffected.
