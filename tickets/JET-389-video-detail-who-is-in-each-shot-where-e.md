---
id: JET-389
title: Video detail: who is in each shot, where each shot sits in the video, a short cast summary, and the recipe it was made from
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T15:47:49+05:30
updated: 2026-11-23T15:47:49+05:30
decisions: 
---

## Request

GET /api/v1/music-videos/:id/detail (services/render/videoDetailV1.ts) is missing four things the redesigned video page needs: (a) shots[].castTags — stored on the plan (RenderPlanV1.ts:181,411) but dropped; (b) each shot's place in the final video (clipMapV1, already on the render poll at renderOrchestratorV1.ts:2400) — shots today carry song time only, so a 0:26 video labels shot 1 as '2:08'; (c) cast[].summary — a 6-8 word description; today only name and imageUrl reach the app and the call sheet shows the raw prompt description; (d) recipe — the raw choices it was made from {directorId, direction (raw picks), where, special, visualStyle, aspectRatio, tier, captionStyle, window} so 'Make another like this' can seed a new draft from one call.

## Understanding

Assumptions: (1) all additions are optional fields, backward compatible; (2) videoStartSeconds/videoEndSeconds come from clipMapV1 of the final cut; absent for videos stitched before clip maps existed; (3) cast summary: generated once when the cast is drawn (short Gemini call in the casting step) or derived deterministically from the description by trimming to age/clothing keywords — implementer picks; also return it on the render poll's cast so the call sheet can use it; (4) recipe carries what is already on the MusicVideo document (GET /api/music-videos/:id has it) — no new storage.

## Plan

1. shots[]: add castTags and videoStartSeconds/videoEndSeconds.
2. cast[]: add summary (and on the render poll's cast).
3. Add recipe block from the project document.
4. Update contract notes in .coord/contracts if the detail is documented there.

## Reason

Lets the video page link faces to scenes, label shots in video time, stop showing prompt text on the call sheet, and offer 'Make another like this'.

## Related files

src/services/render/videoDetailV1.ts, src/services/render/renderOrchestratorV1.ts (cast summary + poll), casting step

## Acceptance criteria

For the Zaaya hook video: detail shots have castTags ['@image1'…], shot 1 videoStartSeconds 0 (not 129), cast[0].summary like '28, linen shirt, silver ring', and recipe.directorId 'neel'.

## Test steps

—

## Thread
2026-11-23T15:47:49+05:30 aquib N: created ticket, status: - -> open
