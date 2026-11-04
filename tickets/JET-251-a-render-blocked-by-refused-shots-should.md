---
id: JET-251
title: A render blocked by refused shots should show why each was refused, offer a fix, and re-render only those
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-04T13:21:06+05:30
updated: 2026-11-04T13:22:40+05:30
decisions: 
---

## Request

When a render ends blocked because the video provider refused some shots, the error screen should list each refused shot with what caused the refusal and a suggested rewrite of its direction. The person accepts or edits each suggestion, taps once, and only those shots are re-generated; the render then carries on to the finished video as usual.

## Understanding

1. DEPENDS ON JET-250 (backend). Do not start until JET-250 is done; the fields and endpoint below come from it and will be documented in .coord/contracts/api-music-videos.md.
2. Trigger: render status 'blocked' with clipsRefused > 0. Each clip with state 'refused' carries error (a human sentence), refusal.cause (real-person | copyright | content) and refusal.suggestedPrompt (string or null).
3. Per refused shot the screen shows: which shot (scene / lyric line from the call sheet if handy), the cause in plain words, the current direction, and an editable field pre-filled with suggestedPrompt — or with the current prompt when there is no suggestion.
4. One button sends POST …/render/:jobId/clips/fix { clips: [{ index, prompt }] } for every shot shown, then returns to the normal progress screen. The poll/SSE carries on as for any render; nothing new to watch.
5. The existing 'stitch it anyway' (…/stitch) stays available as the secondary action for someone who wants the incomplete cut.
6. Assumption: shots that failed for non-content reasons (state 'failed') are not on this screen; Resume already handles them.
7. Assumption: show the cost before the tap — N shots × the per-clip price. Ask backend if the per-clip unit price is not already on the cost lines (it is: cost.lines[clips].unitUsd).

## Plan

1. Wait for JET-250 done; read the updated contract.
2. Blocked-render screen: list refused clips with cause, current prompt, editable suggested prompt.
3. 'Fix and re-render N shots' button → POST …/clips/fix; show N × per-clip cost on it.
4. On 202, return to the render progress view; on 409, refresh the render and re-show the screen.
5. Keep 'Stitch without them' as the secondary action.

## Reason

Today a person in this state gets one paragraph saying N shots were refused and nothing to act on. Fixing them means guessing at prompt changes one shot at a time. Backend is adding the cause and a suggested prompt per shot and a single call that re-renders several shots at once (JET-250); this is the screen that uses them.

## Related files

—

## Acceptance criteria

A blocked render with refused shots shows each one with its cause and a pre-filled suggested direction. Editing and tapping fix re-renders only those shots, and the render finishes as a normal completed video. Shots that were already done are not re-generated.

## Test steps

1. Start a render whose story names a real celebrity in one scene, and let it run to the end.
2. The render stops on the fix screen: that shot is listed with 'real person' as the cause and a suggested direction describing a kind of person instead.
3. Leave the suggestion as is (or tweak it) and tap 'Fix and re-render'.
4. The progress screen shows only that shot generating, then stitching, then the finished video plays.
5. On a render that was refused nothing, this screen never appears.

## Thread
2026-11-04T13:21:06+05:30 aquib N: created ticket, status: - -> open
2026-11-04T13:22:40+05:30 aquib N: status: open -> approved
