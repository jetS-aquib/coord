---
id: JET-205
title: The anchor stills and the plate sprite are drawn but never sent, so the strip is 32 grey cards for the first few minutes
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-10-27T12:03:04+05:30
updated: 2026-10-27T12:03:04+05:30
decisions: 
---

## Request

Put the images the render already has on the wire: each anchor's imageUrl, and plateUrl. Per-clip is easier for us than a parallel anchors array - clip i's opening still is anchors[i].imageUrl, and that mapping is yours, not ours.

## Understanding

A render spends its first phase drawing 33 anchor stills ('Setting the look. 17 of 33 key frames'), and JET-203 added a six-panel plate sprite on top. Both land in RenderPlanV1 - anchors[].imageUrl and plan.plateUrl - and neither is in summarizePlanV1, so the phone only ever learns anchorsDone as a number. The shot strip we just built for JET-204 therefore shows 32 empty tiles with a clock for the several minutes before the first clip renders, which is the longest stretch of dead screen in the whole flow and the one where the person is most likely to leave.

deriveAnchorsV1 makes anchor i the opening still of clip i (one more anchor than clips, closing the last one), so each tile already has a frame waiting for it. Assumptions, correct any: (1) anchor imageUrls are reachable by the same media host rule as videoUrl, so reachableUrl() repairs them the same way; (2) they are small stills, cheap to fetch 32 of; (3) the plate is one image for the whole song, not per clip; (4) showing a still that a clip has not matched yet is acceptable - we would treat it as what the shot is aiming at, and replace it the moment the clip lands.

## Plan

1. Backend: add openingFrameUrl (or anchorImageUrl) per clip in summarizePlanV1, derived from anchors[index].imageUrl, plus plateUrl at the top level.
2. Mobile: each strip tile shows its opening still while the shot is queued or generating, and swaps to the rendered clip's own frame when it lands.
3. Mobile: the plate sprite fills the hero while the anchors are being drawn, so 'setting the look' is something a person can see rather than a count.

## Reason

The anchoring phase is minutes long and currently shows nothing but a progress sentence. The pictures that would fill it already exist and are already paid for.

## Related files

src/services/render/renderOrchestratorV1.ts (summarizePlanV1), .coord/contracts/api-music-videos.md

## Acceptance criteria

The state payload carries, for every clip, the URL of the still it opens on, and plateUrl for the song. Both appear on the poll route and the SSE stream, and both are documented in the contract.

## Test steps

—

## Thread
2026-10-27T12:03:04+05:30 aquib N: created ticket, status: - -> open
