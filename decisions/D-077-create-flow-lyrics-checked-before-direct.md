---
id: D-077
title: Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first
date: 2026-11-09
status: active
superseded_by: 
repos: music-jetkreate-mobile, music-jetkreate-backend, video-processing-backend
tickets: JET-271, JET-272, JET-273, JET-274, JET-275, JET-276, JET-277
---

## Context

Audit against the pitch values (accuracy, efficiency, speed, ease, continuity, consistency) for pro and rookie users. Flow had 8 taps, 2 dead waits, 12 decisions and 6 free-text fields on one screen, price shown after the choice that sets it.

## Options considered

Lyrics: optional row vs gate. Pro/rookie: two modes vs one toggle vs rookie only. Directors: own screen vs folded into Direction vs dropped. Rendering: mobile stitching first vs server measurement and progressive segments first.

## Decision

Lyrics stay a gate before Direction (extraction accuracy is not good enough to skip). One 'Let me review the plan first' toggle, off by default, is the pro path. Directors fold into Direction as a chip row. Direction is guided chips plus one optional special request; prompts are baked from templates. Rendering R&D measures first and overlaps stitching with filming server-side; on-device work is a later flag-gated preview spike.

## Reason

Wrong words on the master cost a full re-render. One toggle keeps one flow to maintain. Measured data says video work is ~45-80s of a 6+ minute render; downloads, uploads and serial queueing are the cost, which phones cannot fix.

## Consequences

Track -> Lyrics -> Direction -> Ready -> Working. Backend needs JET-271..275. Mobile-side native rendering is deprioritised until JET-276/277 report.
