---
id: JET-315
title: The project's status lies: in_production is never reset, and a client save can wipe finalVideoUrl and status
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-13T13:07:27+05:30
updated: 2026-11-13T13:47:36+05:30
decisions: 
---

## Request

Keep MusicVideo.status in step with its render, and stop client saves from overwriting server-owned fields.

## Understanding

Server-owned fields: status, finalVideoUrl, captionsUpdating. I assume the app does not need to write status at all (it sends in_production before startRender, which the server writes anyway). The list endpoint already returns renderStatus beside status, so the app can be fixed without a new field.

## Plan

1. In saveMusicVideo, drop status and finalVideoUrl from client input (keep them on create defaults only).
2. When a render ends failed/cancelled, set MusicVideo.status back to completed if it still has a finalVideoUrl, else draft. Blocked/paused leave it in_production (they are resumable) - renderStatus tells the app which.
3. Restitch: update MusicVideo.finalVideoUrl only where it still equals the old URL.
4. Contract note in api-music-videos.md.

## Reason

From the state-machine audit (doc: Music app state machines, 2026-11-13). Risk 7. The run sets MusicVideo.status=in_production on start (orch:1955) and completed on finish (2037) but never resets it on failed/blocked/paused/cancelled, so the app shows 'Rendering'/'Still rendering' forever. saveMusicVideo (musicVideo.controller.ts:81-82) accepts any status string, defaults it to draft, and sets finalVideoUrl to '' when omitted, which the app does. The restitch also writes MusicVideo.finalVideoUrl unconditionally (orch:3859).

## Related files

src/modules/musicVideo/musicVideo.controller.ts, src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

A failed or cancelled render no longer leaves its project in_production. Saving a project from the app never clears its video.

## Test steps

1. Render a song to completion, then start a re-render and cancel it.
2. The project shows its old finished video again, not 'Still rendering'.
3. Edit the project title in the app; the video is still there.

## Thread
2026-11-13T13:07:27+05:30 aquib N: created ticket, status: - -> open
2026-11-13T13:44:49+05:30 aquib N: status: open -> approved
2026-11-13T13:47:35+05:30 aquib N: Built. (1) saveMusicVideo ignores body status; empty/missing finalVideoUrl keeps the stored one; a non-empty one (web's own pipeline) is saved and marks completed - kept because music-jetkreate-frontend MusicToVideo.tsx:322 saves its own finalVideoUrl. (2) settleProjectV1: on cancel and on run failure, project in_production -> completed if it has a video, else draft (one pipeline updateOne). Blocked/paused untouched. (3) Restitch only replaces MusicVideo.finalVideoUrl where it still equals the old one. (4) Contract note under POST /api/music-videos. Checked settle on local Mongo (video->completed, none->draft, completed untouched). Mobile: no change needed for this; reading renderStatus for blocked/paused is JET-320. Side effect: web projects with a storyboard but no video now show draft instead of in_production.
2026-11-13T13:47:36+05:30 aquib N: status: approved -> in_progress
2026-11-13T13:47:36+05:30 aquib N: status: in_progress -> review
