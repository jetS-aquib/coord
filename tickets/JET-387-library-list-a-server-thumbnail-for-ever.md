---
id: JET-387
title: Library list: a server thumbnail for every video, and live progress for unfinished ones
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-23T15:47:46+05:30
updated: 2026-11-23T15:47:46+05:30
decisions: 
---

## Request

GET /api/music-videos returns the MusicVideo document plus renderStatus (renderOrchestratorV1.ts:654-679). The app has no thumbnail field, so it decodes a frame from every MP4 on the phone (mobile lib/thumbnails.ts), which is a likely part of the low-memory kills (JET-371). Unfinished items carry no stage or counts, so the redesigned Home cannot show 'FILMING 4/5' or the newest shot. Add thumbnailUrl to every item, and a progress block to unfinished ones.

## Understanding

Assumptions: (1) thumbnailUrl = the opening shot's still (assets stills kind 'opening' or clip 0's anchor), falling back to posterUrl, which today is the first still that landed (not necessarily the opening); (2) a small size is enough — if stills are large, a 480px-wide variant is preferable but not required now; (3) progress = {stage, stageCount, stageTotal, clipsDone, clipsTotal, latestStillUrl} from summarizePlanV1 for statuses other than completed/failed/cancelled; (4) one extra RenderPlanV1 read per unfinished item is acceptable (few per user); (5) no new endpoint — the app already calls this list on focus and will poll it every 15s while anything is unfinished.

## Plan

1. Attach thumbnailUrl to every item (opening still, else posterUrl).
2. For unfinished items attach progress from the plan summary.
3. Keep the response backward compatible (new optional fields only).
4. Test with a rendering project and a finished one.

## Reason

Lets the app stop decoding video frames on the phone (memory, JET-371) and lets Home show what is being made.

## Related files

src/services/render/renderOrchestratorV1.ts (list decoration ~654), src/modules/musicVideo/musicVideo.controller.ts

## Acceptance criteria

GET /api/music-videos while a render is filming returns that item with progress.stage 'filming', clipsDone/clipsTotal and a latestStillUrl that opens; every finished item has a thumbnailUrl that opens in a browser.

## Test steps

—

## Thread
2026-11-23T15:47:46+05:30 aquib N: created ticket, status: - -> open
