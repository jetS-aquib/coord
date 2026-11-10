---
id: JET-286
title: A failed shot shows an empty box: keep the prompt we actually sent, why it failed, and what to write instead
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: in_progress
created: 2026-11-10T01:57:39+05:30
updated: 2026-11-10T15:11:05+05:30
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

1. `npx vitest run src/services/render/renderV1.test.ts`: passes, including "failure transparency (JET-286)".
2. Force a missing shot: set `flags.gemini.timeoutMs.video = 5000` in src/config/flags.ts, restart, start a demo render. Shots time out, retry once, then fail and the render ends blocked. Put the flag back to 600_000.
3. `GET /api/v1/music-videos/render/:jobId` on that render: each failed clip has `failure` with cause `timeout`, a plain `likelyReason`, `prompt`, `sentPrompt` (longer than `prompt`, with location/cast/look) and `suggestedPrompt` equal to `prompt`. `error` is the plain sentence, not a raw provider message.
4. `POST …/clips/fix` with ONE of the failed shots and a changed prompt: the log says "redrawing 1 still(s) from the new words"; only that shot re-renders; the others stay failed and the render blocks again.
5. A refused shot (if you have a prompt that gets refused): its `failure.cause` is `refused` and `suggestedPrompt` is a rewrite once the render is blocked.

## Thread
2026-11-10T01:57:39+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:06:27+05:30 aquib N: status: open -> approved
2026-11-10T15:11:05+05:30 aquib N: status: approved -> in_progress
2026-11-10T15:11:05+05:30 aquib N: Built. Per clip: sentPrompt (what the model got) and failure {cause refused|timeout|no_video|quota|error, rawReason (server only), provider, at, suggestedPrompt}. Summary adds failure {cause, likelyReason, prompt, sentPrompt, suggestedPrompt} on every failed/refused clip; refusal stays as it was. error on a failed clip is now a plain sentence instead of the raw provider message. Suggestions: refused AND no_video (usually a silent safety filter) get a rewrite at the blocked gate, one call; timeout/quota/error get the shot itself (nothing to change). Fix: only listed shots are retried; a shot whose words changed has its opening still (and the closing one, if it is the last shot) redrawn from the new words before rendering. Deviation from the plan: suggestions rewrite the editable shot line, not sentPrompt, because a fix replaces the shot line and the server composes the rest again; rewriting sentPrompt would double it. Checked mobile: BlockedDecision already sends every missing shot and requires text for each, so retry-only-listed changes nothing for the current app. Contract updated. Mobile follow-up is JET-287.
