---
id: JET-326
title: Scoped prompt edits: one instruction applied to a shot, a selection, a section, or 'from shot N on', with a dry run before spend
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-17T15:36:21+05:30
updated: 2026-11-17T15:40:15+05:30
decisions: D-083
---

## Request

POST /render/:jobId/edits {instruction, scope} returns a dry-run diff per affected shot plus cost; POST /render/:jobId/edits/:editId/apply runs it. Must handle 'make it night', 'remove the drummer', 'rainy street instead'. Works pre-spend (redraw stills only) and on finished renders (redraw stills, then re-film via JET-327).

## Understanding

Scope is one of {indices:[...]}, {from:N}, {section:i}, or 'all'. One Gemini text call (the edit interpreter) turns the instruction + scope into a structured per-clip diff: timeOfDay/place override, castTags to drop/add, prompt rewrite. Day→night needs a clip-level timeOfDay/place override that rebuilds clip.environment (today it comes only from lookBible.timeOfDayByIndex). Removing a character needs the cast block built per clip from castTags; today castBlockV1 always injects the whole cast and the plate shows everyone, so that must change. Locked shots (JET-327) are excluded from range scopes. Assumption: the interpreter output is run through the existing safety/sanitize pass. Depends on JET-325 for the pre-spend still redraw.

## Plan

1. Edit model on the plan: edits[{id, instruction, scope, diff[], cost, status, at}]; log into overrides.
2. Interpreter: Gemini text call → zod-validated diff; unknown asks become prompt rewrites.
3. Clip fields timeOfDay/place overrides; environmentForV1 reads them first.
4. castBlockV1 → built from clip.castTags; plate is not used as reference for clips that drop a cast member.
5. Apply: pre-spend → mark anchors stale, redraw; post-spend → redraw edge+inner anchors, hand to multi-clip re-render.
6. Routes + contract; tests for scope resolution, locked-shot exclusion, cast removal prompt.

## Reason

Users must be able to steer a specific part of the video in plain words, not just one clip at a time.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/renderPromptsV1.ts, src/services/render/shotListV1.ts, src/models/RenderPlanV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

'make it night' with scope from:10 returns a dry run listing only shots 10+ (minus locked) with cost, and applying it changes only those stills/clips; 'remove <character>' yields stills without that character.

## Test steps

—

## Thread
2026-11-17T15:36:21+05:30 aquib N: created ticket, status: - -> open
2026-11-17T15:37:03+05:30 aquib N: linked decision D-083 (Stills-first preview and one scoped edit model for music videos)
2026-11-17T15:40:15+05:30 aquib N: status: open -> approved
