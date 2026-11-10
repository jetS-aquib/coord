---
id: JET-302
title: R&D + audit: does each planning chair hand its work to the next, and is our order the order real music videos are made in?
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T22:13:24+05:30
updated: 2026-11-10T22:13:24+05:30
decisions: 
---

## Request

Audit the hand-offs between the planning stages (song read, song context, director, writer, casting, treatment/production design, shot list/DOP, safety, stills, clips, edit): what each one receives, what it produces, and what never reaches the next one. E.g. if the story writer is kept, does the story reach the casting director and the director? Research how a real music video is actually made, end to end, and compare our flow to it.

## Understanding

Two halves. (1) Audit of our code: a map of every planning call's inputs and outputs, and the leaks between them. Known already: casting runs BEFORE the treatment and the writer, so people are chosen from the brief and lyrics without knowing the story; the director's voice reaches the treatment and (since JET-288) the shot list but not casting; the writer's premise only reached the shot list after JET-285, and the writer is now off (D-082) partly because its moments made the story reset. (2) R&D: the real-world order of a music video (brief/commission, director's treatment, approval, pre-production: casting, locations, styling, production design, storyboard/shot list with the DOP, shoot, edit to the track, grade), with cited sources (industry guides, director and commissioner interviews, production-company workflows). Assumption: this request produces findings, a hand-off map and a gap table, plus a script, not a pipeline change; reorders are filed as follow-up requests after review. Google-only constraint unaffected.

## Plan

1. Map our flow from code: each planning stage, the fields it reads, the fields it writes, and who reads them next (renderOrchestratorV1 applyDirectionV1/directV1, videoService autoGenerateCast, scriptV1, treatmentV1, shotListV1, lookBibleV1, promptSafetyV1, still and clip prompt builders).
2. scripts/rnd/handoffs.ts: for one real plan, print what each stage was actually given and what it returned, so a leak is visible (e.g. a story beat that names a person the cast does not have).
3. Research the real-world production order and who decides what (roles, sign-offs, what each department is handed), with sources.
4. Gap table: real order vs ours, what each gap costs on screen (wrong-looking cast for the story, wardrobe that ignores the story, shots that ignore the treatment), and the fix for each.
5. Answer the specific question: with the writer on, would story-first then casting fix its failure, or is the writer still redundant with the treatment?
6. Decision record on the target order; file the reorders as separate requests with dependencies.

## Reason

Asked 2026-11-10 after JET-285: the writer lost a blind A/B, and one suspected cause is that its story never reached the people who act on it. Casting runs before any story exists (renderOrchestratorV1 applyDirectionV1: songContext -> resolveCastV1 -> directV1). In a real production the treatment is approved first and casting, locations and wardrobe are briefed from it. JET-289 (regional directors) adds more director input to this same chain, so where that input flows should be known first.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/ai/videoService.ts, src/services/render/scriptV1.ts, treatmentV1.ts, shotListV1.ts, lookBibleV1.ts, renderPromptsV1.ts, scripts/rnd/handoffs.ts (new)

## Acceptance criteria

A hand-off map (stage -> inputs -> outputs -> next reader) and a real-world vs ours gap table with sources, a script that dumps one plan's hand-offs, a decision record on the target order, and follow-up requests filed for each reorder.

## Test steps

1. Read the hand-off map and gap table on the request thread. 2. Run npx ts-node --transpile-only scripts/rnd/handoffs.ts <jobId> on a recent plan and check each stage's inputs are as the map says. 3. Check the follow-up requests exist and their dependencies match the recommended order.

## Thread
2026-11-10T22:13:24+05:30 aquib N: created ticket, status: - -> open
