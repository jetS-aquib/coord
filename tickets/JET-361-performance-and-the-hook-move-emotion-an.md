---
id: JET-361
title: Performance and the hook move: emotion and intensity per shot from the song's energy, no staring, and a repeatable dance move on the hook
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-18T17:10:49+05:30
updated: 2026-11-18T17:10:49+05:30
decisions: 
---

## Request

Shot list gets an emotion and intensity per shot from the section's energy; faces written as small physical signs, one emotion per subject. 'Staring at each other' and 'walking around each other' banned for all directors. Hook sections get one short repeatable dance move (performance lane), the same move every chorus. Spike two ways first: (a) prompt the video model directly to dance, (b) generate a 3 s reference move clip and pass it as a Gemini Omni Flash 1.2 reference video. Also spike Omni reference images (cast portraits + place plate) for identity and scale.

## Understanding

Zoya's render felt like Mira's: two people staring and walking around each other with blank faces, not matching the song's intensity. No in-house shooting. Omni 1.2 takes up to 3 reference videos (<=3 s) and 6 reference images; we send none today. Spikes are a handful of single clips, judged by eye and QA, before any build. Behind flags.render.performance and flags.render.hookMove.

## Plan

1. shotListV1: emotion + intensity per row from energy; banned list.
2. Spike A/B for dance: 3 clips each way on the Tu Mil Jaaye hook.
3. Spike reference images: 10 shots with vs without.
4. Build the winner into the hook sections (performance lane).
5. Full renders of the eval set.

## Reason

Viral potential sits in the hook and in faces that feel something.

## Related files

src/services/render/shotListV1.ts, src/services/render/directorsV1.ts, src/services/ai/omniVideoService.ts, src/services/render/renderOrchestratorV1.ts

## Acceptance criteria

Eval renders: no staring shots; hook has a clean repeatable move you'd post as a reel; spike results written up with the clips.

## Test steps

—

## Thread
2026-11-18T17:10:49+05:30 aquib N: created ticket, status: - -> open
