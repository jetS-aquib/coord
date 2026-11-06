---
id: JET-262
title: The story does not follow the music, and every location after the first has no reference image
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-06T16:23:00+05:30
updated: 2026-11-06T16:31:56+05:30
decisions: D-075, D-076
---

## Request

Add a story/script writer stage before the director's treatment, and draw one reference plate per location instead of one plate for the whole song.

## Understanding

The treatment call writes story, places, palette, wardrobe and lens in one answer, from at most 6 lyric lines per section and no energy or timing, so the story cannot follow the song's build or react to specific lines. Separately, renderPlateSpriteV1 draws only the first clip's environment, so locations 2..n have no image reference. Assumptions: (1) a separate writer call is better than enlarging the treatment prompt; (2) the app-facing shape (logline, beats) must not change, so no mobile request; (3) a null writer must leave today's render byte-identical; (4) generateSceneImage can take extra reference URLs through its characterImageUrls array — to be verified; (5) both changes go behind flags so the same song can be compared on and off.

## Plan

1. New scriptV1.ts: generateScriptV1 gets every lyric line with time, per-section energy, hook, brief, pitch, cast, language; returns premise, arc, scenes[{index,story,storyEn,lyricHook}]; never throws; finishReason check + one retry.
2. treatmentV1: optional script input; when present the outline carries each scene and rule 2 becomes 'stage this script'; beats come from the script.
3. directV1 calls the writer before the treatment; add a 'writer' crew message; shot list rows get lyricHook.
4. Plates: cast sheet without environment, plus one plate per unique location; anchors get cast sheet + their location plate; fallback to today's behaviour when a plate is missing. Behind a flag.
5. scriptV1.test.ts for normalisation and the null fallback.

## Reason

Creators say the story of the video does not feel joined to the music, and later locations drift because nothing anchors them.

## Related files

src/services/render/scriptV1.ts,src/services/render/treatmentV1.ts,src/services/render/shotListV1.ts,src/services/render/renderOrchestratorV1.ts,src/services/render/renderPromptsV1.ts

## Acceptance criteria

With the flags on, a render logs a script whose chorus scene is the payoff and whose scenes cite real lyric lines; clips in the 2nd and 3rd location match their own plate; with the writer forced to fail the render matches today's.

## Test steps

1. Render a song that has words and at least two locations with both flags off. Keep the backend log and the stills.
2. Set RENDER_SCRIPT_WRITER=1 and RENDER_LOCATION_PLATES=1, restart, and render the same song with the same brief.
3. In the log, the [ScriptV1] line should give a premise, a turn, and scenes that quote real lyric lines. The biggest scene should be on the loudest section. The crew notes should include "writer: Wrote N scenes…".
4. The log should show "location plates N/N". Stills in the 2nd and 3rd location should look like the same place each time it comes back. Check that night sections still look like night.
5. Point the text model at a bad name and render again. You should see "[ScriptV1] attempt 2/2", and the render should then finish the way it does with the flags off.

## Thread
2026-11-06T16:23:00+05:30 aquib N: created ticket, status: - -> open
2026-11-06T16:27:45+05:30 aquib N: linked decision D-075 (Story gets its own writer call before the treatment, and each location gets its own reference plate)
2026-11-06T16:28:06+05:30 aquib N: linked decision D-076 (Story gets its own writer call before the treatment, and each location gets its own reference plate)
2026-11-06T16:30:30+05:30 aquib N: status: open -> approved
2026-11-06T16:31:29+05:30 aquib N: status: approved -> in_progress
2026-11-06T16:31:56+05:30 aquib N: status: in_progress -> review — Built behind RENDER_SCRIPT_WRITER=1 and RENDER_LOCATION_PLATES=1, both off by default. Typecheck clean, render tests 237/237. Not yet rendered end to end — that is the test. D-076.
