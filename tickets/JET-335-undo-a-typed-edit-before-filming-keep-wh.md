---
id: JET-335
title: Undo a typed edit before filming: keep what the edit replaced on the call sheet, not only on filmed takes
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-17T16:54:07+05:30
updated: 2026-11-17T16:57:12+05:30
decisions: 
---

## Request

Make POST /render/:jobId/edits/:editId/undo (or a sibling) work while the render is still at review, putting back the shots' previous words, light, place, cast and stills that a prespend edit replaced.

## Understanding

Before filming, applyEditV1 changes clip fields (action, timeOfDay, place, cast) and the touched anchors in place. I assume it can snapshot those fields and the old anchor still onto the edit (as takes do after filming) and restore them on undo, listing the edit in undoableEdits while the render is at review. Quick row changes (PATCH shotSize, lane, musicalSeconds) are already reversible by the app with the old values, so they are out of scope.

## Plan

1. In applyEditV1 prespend, store before-values per touched clip and the replaced anchors on the edit. 2. Let undoEditV1 restore them when the render is at review and redraw the affected stills. 3. List such edits in undoableEdits at review. 4. Document in api-music-videos.md. Mobile (call sheet) then shows Undo on typed edits.

## Reason

undoEditV1 only restores clip takes, which exist once shots are filmed. On the call sheet a typed edit (apply, phase prespend) rewrites the plan and redraws stills with no record of what it replaced, so the app cannot offer Undo there and a wrong edit can only be fixed by typing another.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/editsV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

Apply 'make it night' to shot 3 on a call sheet, then undo it: shot 3's action, light, place and still are as before, and the render is still at review.

## Test steps

1. Render with `{ "review": true }`; on the call sheet propose and apply `{ "instruction": "make it night", "scope": { "indices": [3] } }`.
2. Poll: `undoableEdits` lists that edit. Call sheet shot 3 now reads night.
3. `POST …/edits/<editId>/undo` → status stays `review`; shot 3's action, light, place, cast and still are as before (with a preview, the old still URL is back, nothing redrawn).
4. Apply two edits on shot 3, then undo the first → 409 "undo that one first".

## Thread
2026-11-17T16:54:07+05:30 aquib N: created ticket, status: - -> open
2026-11-17T16:54:42+05:30 aquib N: status: open -> approved
2026-11-17T16:57:12+05:30 aquib N: status: approved -> in_progress
2026-11-17T16:57:12+05:30 aquib N: status: in_progress -> review — Built in music-jetkreate-backend (uncommitted). Contract updated. Tests green (captchaBypass failure is pre-existing, unrelated).
