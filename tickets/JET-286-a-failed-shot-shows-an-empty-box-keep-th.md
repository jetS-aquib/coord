---
id: JET-286
title: A failed shot shows an empty box: keep the prompt we actually sent, why it failed, and what to write instead
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:39+05:30
updated: 2026-11-10T01:57:39+05:30
decisions: 
---

## Request

For every failed or refused shot, return the prompt the creator wrote, the prompt actually sent, a plain cause, the likely reason and a suggested prompt, so the fix screen can be filled in.

## Understanding

Provider-neutral fields so a second provider later fills the same shape: sentPrompt, cause in {refused, timeout, no_video, quota, error}, rawProviderReason (server-side; the app gets a cleaned likelyReason), provider. Extends JET-250. Assumption: rawProviderReason is not shown to the creator verbatim.

## Plan

1. Per attempt on the clip: sentPrompt, cause, rawProviderReason, provider.
2. summarizePlanV1 returns prompt, sentPrompt, cause, likelyReason, suggestedPrompt for failed and refused clips.
3. suggestRefusalFixesV1 also covers failed clips and works from sentPrompt.
4. fixClipsV1 resets only the clips in the request.
5. A fixed clip redraws its stills from the new prompt before rendering.
6. Update api-music-videos.md.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). clip.prompt holds only the shot-list line; clipPromptV1 and withFramePinning rewrite it at send time and the sent text is never saved. The raw provider reason only reaches a console log. Timeout and "no video returned" share one path with no cause (renderOrchestratorV1.ts:2729-2747). summarizePlanV1 returns no prompt (:1684-1733), so the app's box is empty. Suggestions exist only for refused, not failed. Bugs: fixClipsV1 resets every failed clip, not only the ones sent (:2864); a fix keeps the old stills, which the team's notes say caused the refusal (:2753), so it is refused again and salvaged with no stills.

## Related files

src/services/render/renderOrchestratorV1.ts, src/models/RenderPlanV1.ts, src/services/ai/omniVideoService.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

A blocked render's summary shows, for each bad shot, both prompts, a cause and a suggested prompt; fixing one shot leaves other failed shots untouched; a refused shot fixed with new wording renders with fresh stills.

## Test steps

—

## Thread
2026-11-10T01:57:39+05:30 aquib N: created ticket, status: - -> open
