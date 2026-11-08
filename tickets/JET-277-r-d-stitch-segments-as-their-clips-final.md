---
id: JET-277
title: R&D: stitch segments as their clips finalize, and define a render manifest
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-09T03:24:16+05:30
updated: 2026-11-09T03:24:30+05:30
decisions: D-077
---

## Request

Research and design, no production change, flag-gated if prototyped. (1) Post a segment stitch as soon as every clip in that scene is finalized (not done, which can still be re-rendered by the seam check), so stitching overlaps with filming; the final call is concat -c copy + audio + captions. (2) Write down a render manifest shape (jobId, clip index, version, url, checksum, duration, in/out, transition, audio ref, lyrics timeline, status) that a future on-device preview or stitch could consume. Report the expected saving using the measured numbers from the companion video-processing-backend request.

## Understanding

Today all segments are posted together after verifySeamsV1 (ponytail note near renderOrchestratorV1.ts:3469). Clips render 6 at a time with no order guarantee, so early scenes are usually finished minutes before the last clip. Segment boundaries are hard cuts already (renderOrchestratorV1.ts:2915), so a segment does not depend on its neighbours. ASSUMPTIONS: (a) a clip re-rendered after its segment was posted invalidates that segment, which is re-posted (version in the manifest); (b) mobile on-device work is a later, separate spike that only reads the manifest; (c) the current path stays the default and the fallback.

## Plan

1. Measure how long the last clip lags the first finalized scene on 3 recent renders.
2. Design progressive posting + invalidation; manifest schema in a contract draft.
3. Estimate saving; prototype behind a flag only if worth it.

## Reason

Overlap stitching with filming instead of moving FFmpeg to phones; cheapest path to a shorter wait.

## Related files

src/services/render/renderOrchestratorV1.ts (stitchInSegmentsV1, segmentClipsV1), contract draft

## Acceptance criteria

A short report: lag numbers, design, expected saving, and the manifest draft; no change to default behaviour.

## Test steps

—

## Thread
2026-11-09T03:24:16+05:30 aquib N: created ticket, status: - -> open
2026-11-09T03:24:30+05:30 aquib N: linked decision D-077 (Create flow: lyrics checked before direction, guided choices over free text, one review toggle for pros, rendering R&D server-first)
