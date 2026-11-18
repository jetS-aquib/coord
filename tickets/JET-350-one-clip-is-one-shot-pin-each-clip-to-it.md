---
id: JET-350
title: One clip is one shot: pin each clip to its own opening still and a drawn closing still of the same shot, never the next shot's
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T15:30:12+05:30
updated: 2026-11-18T16:00:45+05:30
decisions: D-088
---

## Request

Stop clips morphing into the next shot. Each shot gets two stills: its opening still, as today, and a new closing still of the same shot a few seconds later, drawn with the opening still as its reference. The clip is pinned between those two.

## Understanding

Quality first, cost later (the requester's call): a drawn closing still per shot rather than no end pin. Assumed: the closing still is drawn from the opening still plus the same shot prompt plus 'a few seconds later, the action advanced', and goes through the same still check. The anchor list becomes two per clip; plans stored with N+1 anchors still resume on the old path. Supersedes D-029 with a decision record. Behind flags.render.shotPins.

## Plan

1. RenderPlanV1: clips carry closeAnchor (prompt, imageUrl, gate); deriveAnchorsV1 unchanged for old plans.
2. renderAnchorsV1: after a clip's opening still passes, draw its closing still with that still as reference, then gate it.
3. renderOneClipV1: under the flag, startFrame = opening still, endFrame = closing still; seam check scores both against them.
4. Decision record superseding D-029.
5. Tests: pins are the same shot; old plans unchanged; flag off is byte-identical.
6. Verify with a stills preview, then one full render compared against mvr_1794989625320_48693f7a.

## Reason

On mvr_1794989625320_48693f7a (Zoya, Tu Mil Jaaye), clip i was pinned from still i to still i+1, which is the next shot: a different person, size and place. Clip 1 starts on her inside the train and ends on him on the platform. 17 of 57 clips drifted above seam 15. Only section changes were exempt (D-029).

## Related files

src/services/render/renderOrchestratorV1.ts, src/models/RenderPlanV1.ts, src/services/render/seamCheckV1.ts

## Acceptance criteria

On the same song and director, no clip shows a person or place that its own two stills don't. Clips above seam 15: well under 17/57.

## Test steps

1. `npx vitest run src/services/render/renderV1.test.ts src/services/render/callSheetV1.test.ts` passes.
2. Stills preview of Tu Mil Jaaye with Zoya: the call sheet shows each shot's closing still as the same shot a few seconds on, not the next shot.
3. Full render of the same song and director. `renderReport.ts <jobId>`: clips above seam 15 well under 17/57.
4. Watch it: no clip turns into a different person, place or vehicle partway through.

## Thread
2026-11-18T15:30:12+05:30 aquib N: created ticket, status: - -> open
2026-11-18T15:52:50+05:30 aquib N: status: open -> approved
2026-11-18T16:00:27+05:30 aquib N: linked decision D-088 (Every shot change is a cut: a clip is pinned to its own opening and closing still, never the next shot's)
2026-11-18T16:00:45+05:30 aquib N: status: approved -> in_progress
2026-11-18T16:00:45+05:30 aquib N: status: in_progress -> review — flags.render.shotPins: each clip's closing still is drawn against its opening still, gated, and pinned as the end frame; seam check measures against it; clips no longer wait on the next still; call sheet shows the shot's own closing still. Old plans/flag off = D-029. Decision D-088 supersedes D-029. Needs a preview then a full render.
2026-11-18T17:10:55+05:30 aquib N: Render mvr_1794998373760_2de1c52f: seam drift fell to 3/57 but travel shots walked forward then reversed — the closing still is near-identical to the opening one, a return-trip pair. flags.render.shotPins set to false (uncommitted). Superseded in practice by JET-357 (motion-safe pins).
