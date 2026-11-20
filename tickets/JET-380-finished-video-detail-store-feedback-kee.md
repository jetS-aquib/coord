---
id: JET-380
title: Finished-video detail: store feedback, keep every re-cut and reel, one detail + assets read, AI post caption
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-20T15:37:13+05:30
updated: 2026-11-20T15:37:13+05:30
decisions: 
---

## Request

The app's finished-video screen is being rebuilt YouTube-style: player on top, then title, director, style and a ready-to-post caption, a thumbs up/down, and tabs for Shots, Stills, Versions and Cast. It needs four things the backend does not have today: (A) feedback stored, not only sent to PostHog; (B) every re-cut and reel kept as a version instead of overwritten; (C) one owner-checked read with the video's facts and all its assets; (D) an AI-written caption and hashtags per video.

## Understanding

Found in code: no feedback/rating is persisted anywhere; RenderPlanV1.recut and .reel are single Mixed fields overwritten on every request (renderOrchestratorV1.ts:4650, plan.set(kind, ...)), with one undo; cast[].imageUrl, closing stills and locationPlates are in RenderPlanV1 but in no response; shots and opening stills are only on the render poll; all asset urls are permanent public GCS urls (src/shared/gcs.ts), so no signing is needed. Assumptions: (1) feedback is one row per person per video (latest wins), tied to the render and the version being watched; the free-text note is stored but never sent to PostHog; the server sends $ai_feedback (trace id = renderJobId) and the app stops sending its own. (2) Versions live on the render plan; the existing recut/reel poll fields stay, derived from the newest version, so today's app keeps working. (3) The detail read resolves the render with studioRenderJobIdV1 and leaves out prompts, cost and flag snapshots. (4) The caption is one cheap Gemini call through the shared AI proxy (costed and traced), written once per finished video in the song's language, from title, language, director, direction labels and logline only (never the person's own special request), cached on the project, with a rewrite route under the existing 5/hour limit and a publish-kit PostHog kill switch. Guess: 'tagline' for the director is the short phrase list the director profile already has; if there is none, name only.

## Plan

1. VideoFeedback model {userId, musicVideoId, renderJobId, versionId, rating up|down, reasons[], note<=500, timestamps}, unique (userId, musicVideoId). PUT /api/v1/music-videos/:id/feedback (zod: rating, reasons enum mood|faces|offbeat|lyrics|fake|other, note) upserts and returns {feedback}; DELETE clears. Server capture('$ai_feedback') without the note.
2. RenderPlanV1.versions[] {id, kind original|recut|reel, cutStyle, url, posterUrl, durationSeconds, aspectRatio, status, error, createdAt} + currentVersionId. Backfill 'original' lazily on read. recut/reel POSTs append; keep/undo map onto versions; new POST /render/:jobId/versions/:versionId/use (recut or original only, reel -> 409), mirrors finalVideoUrl to the project as keep does today. Poll keeps recut/reel derived from the newest entries.
3. GET /api/v1/music-videos/:id/detail: video facts (title, createdAt, completedAt, durationSeconds, aspectRatio, tier, cutStyle, finalVideoUrl, posterUrl, renderJobId, currentVersionId), director {id,name,avatarUrl,tagline}, direction labels, song {title, durationSeconds, bpm, language, window}, feedback, publish, assets {shots[] {index,startSeconds,endSeconds,sectionLabel,lyricLines,shotSize,videoUrl,stillUrl}, stills[] {kind opening|closing|plate|location, url, shotIndex?, label}, cast[] {tag,name,imageUrl}, versions[]}. 404 for anyone else's video.
4. publish {status ready|writing|failed, caption, hashtags[]} on MusicVideo; written on render completion or first detail read when missing; POST /:id/publish/rewrite (5/hour shared limit); flag publish-kit.
5. Contract update in contracts/api-music-videos.md; decision record (stored feedback, versions model, caption cost).
6. vitest beside the code: owner 404, versions append and never overwrite, use/keep/undo, feedback upsert, detail has no prompts, caption skips the special request.

## Reason

Feedback that only reaches PostHog cannot be shown back to the person or used per render; overwritten re-cuts and reels lose work the person made; the redesigned screen needs one read for everything it shows instead of three polls.

## Related files

src/models/VideoFeedback.ts (new), src/models/RenderPlanV1.ts, src/models/MusicVideo.ts, src/services/render/renderOrchestratorV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/shared/posthog.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

GET /:id/detail returns the facts, director, publish caption and all four asset kinds for a finished video, and 404 for another user's; a second re-cut adds a version and the first is still there and usable; PUT feedback twice leaves one row with the latest values and the next detail read returns it; the existing recut/reel poll fields still work for the shipping app.

## Test steps

—

## Thread
2026-11-20T15:37:13+05:30 aquib N: created ticket, status: - -> open
