---
id: JET-204
title: Per-clip render state is now on the wire, so the reel can show which shot is being worked on
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-10-26T18:37:29+05:30
updated: 2026-10-27T16:26:12+05:30
decisions: 
---

## Request

Show a small state indicator in the corner of each clip in the reel/storyboard view, driven by the new per-clip 'state' field. The backend side is done and deployed in the plan summary and the SSE stream; nothing needs to be derived client-side.

## Understanding

A render shows 31 clips and, until now, the only per-clip information on the wire was status (pending/done/failed/refused) and a seam score. A person watching a render could not tell which shot was being generated right now, which one was being re-rendered because its seam missed, or which ones were actually finished — a clip is 'done' the moment it has a video, and it can still be re-rendered afterwards when its seam is measured.

summarizePlanV1 now sends, per clip: index, sceneIndex, status, state, durationSeconds, videoUrl, seamScore, seamScores, attempts, error. The same shape goes down the SSE stream on every checkpoint, which is now also written when a clip STARTS generating, not only when it finishes.

'state' is the field to drive the icon. It is derived on the backend, in one place, on purpose: 'done' is not the same as finished and two clients deriving that separately would disagree the first time one of them forgot about the score. Please do not re-derive it from status.

  queued         nothing has started on this shot
  generating     being drawn, first attempt
  regenerating   being drawn again - a retry, or its seam missed and it is being re-asked
  checking       it has a video, and its seam is being measured; it may still change
  finalized      rendered and measured, nothing more will happen to it
  failed         it did not render
  refused        the provider refused it on content grounds; needs a prompt edit by a person

Assumptions, correct any:
1. You already poll or stream the plan summary for the render screen (JET-198 was about re-attaching to an in-flight render, so I assume that screen exists).
2. 'checking' is brief on a normal render - a few seconds - so it may not be worth its own icon and could share with generating. Your call, you can see the screen.
3. The two that actually need to be distinguishable at a glance are 'refused' and 'failed' versus everything else, because those are the only two a person can act on.
4. seamScores (the full history, including discarded takes) is for a debug view if you want one, not for the main UI.

## Plan

1. Read clip.state from the plan summary instead of clip.status.
2. Small corner indicator per clip for the seven states; refused/failed visually distinct from the in-progress ones.
3. Optionally show seamScore on a long press or in a debug view.
4. Nothing to poll differently - the stream already carries it.

## Reason

A render takes about seven minutes and shows 31 identical spinners today. The information to do better has existed in the plan document all along and was simply not on the wire. It is now, and the backend writes a checkpoint when a clip starts rather than only when it lands, so the state actually changes while someone is watching.

## Related files

wherever the render/storyboard screen reads the plan summary

## Acceptance criteria

During a live render, each clip shows which of the seven states it is in, and a clip that is re-rendered after a failed seam check visibly changes from finalized/checking back to regenerating.

## Test steps

1. Start a render and watch the reel: clips should move queued -> generating -> checking -> finalized, not all at once at the end.
2. Find a render where a clip tripped the seam threshold (the backend logs 'clip N seam X over 9 - re-rendering') and confirm that clip shows 'regenerating' after it had already shown a video.
3. Force a refusal and confirm that clip is visually distinct from a clip that merely failed.

## Thread
2026-10-26T18:37:29+05:30 aquib N: created ticket, status: - -> open
2026-10-26T18:40:30+05:30 aquib N: status: open -> approved
2026-10-26T18:49:02+05:30 aquib N: Built on the mobile side. The strip on (create)/working/[id] now lists every shot, not only the finished ones, and reads clip.state straight off the wire - nothing re-derived. Three weights, not seven icons: failed and refused are loud and differ in both glyph and colour, generating/regenerating carry the accent and a slow pulse, queued/checking/finalized stay quiet. The strip follows the shots being filmed until someone scrolls it by hand. Two things to correct me on: (1) we POLL every 4s, we do not hold the SSE stream - it drops the moment the app backgrounds, which is exactly when a creator leaves a 20 minute render running - so a 'checking' window shorter than 4s will sometimes be missed, which we are fine with; (2) sceneIndex, attempts and seamScores are on the wire but unused, no debug view yet. Not yet seen on a device: nothing in this branch has been run end to end.
2026-10-27T16:26:12+05:30 aquib N: status: approved -> in_progress — shipped in a149a3a
2026-10-27T16:26:12+05:30 aquib N: status: in_progress -> review — Built and committed as a149a3a. The strip on (create)/working/[id] lists every shot now, not only the finished ones, and reads clip.state straight off the wire - nothing re-derived. failed and refused differ in both glyph and colour; generating and regenerating carry the accent and a slow pulse; queued, checking and finalized stay quiet. JET-205 then put the opening stills in the same tiles. Two things to know: we poll every 4s rather than holding the SSE stream, so a 'checking' window shorter than that can be missed; and sceneIndex, attempts and seamScores are on the wire but unused. Not yet run on a device.
