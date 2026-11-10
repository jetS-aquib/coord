---
id: JET-288
title: A Punjabi song gets an East Asian or African cast: ground casting and every prompt in the song's language and region
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-10T01:57:41+05:30
updated: 2026-11-10T20:28:09+05:30
decisions: 
---

## Request

Work out the song's cultural context once (language, region, community, wardrobe, settings, gestures) and feed it to casting, the story, the shot list and the stills.

## Understanding

One Gemini call with Google Search grounding per render (Google only; about free at this volume). The user's own choices always win over the inferred context. Assumption: the context is stored on the plan and shown in the brief so the creator can correct it.

## Plan

1. songContextV1: one grounded call -> {language, region, community, wardrobe, settings, gestures, confidence}; cached with the song read.
2. Casting prompt takes the context and the requested cast size; drop the hard-coded 1-3.
3. Script, treatment, shot list and still prompts get the context block.
4. Director voice reaches the shot list.
5. Decision record (new call, grounding cost).
6. Check: render one Punjabi, one Hindi and one English song and look at the cast.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). The song's language is detected (SongReadV1.language) but used only in the brief, labelled a guess (briefV1.ts:178,235). Region is never detected. Casting asks for "ethnicity/features" with no context and is hard-coded to extract 1 to 3 characters (videoService.ts:365,374), so band and crowd sizes are never met. The directors' Hindi/Bhojpuri knowledge is only in code comments (directorsV1.ts:49-55). Research (CultureScore 2026; Delhi/Pune workshops): models use cultural knowledge only when the region is named specifically.

## Related files

src/services/render/songContextV1.ts (new), src/services/videoService.ts, scriptV1.ts, treatmentV1.ts, shotListV1.ts, renderOrchestratorV1.ts

## Acceptance criteria

A Punjabi song with no casting choice produces a Punjabi cast, wardrobe and setting; a requested band of 4 gets 4 people; an English song is unaffected.

## Test steps

—

## Thread
2026-11-10T01:57:41+05:30 aquib N: created ticket, status: - -> open
2026-11-10T20:28:09+05:30 aquib N: status: open -> approved
