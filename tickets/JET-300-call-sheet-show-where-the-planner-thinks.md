---
id: JET-300
title: Call sheet: show where the planner thinks the song is from ("Set in Malwa, Punjab")
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-10T20:44:29+05:30
updated: 2026-11-10T21:12:49+05:30
decisions: 
---

## Request

The render summary now carries songContext {language, region, community, confidence} (JET-288). Show one line on the call sheet when confidence is not low.

## Understanding

Optional polish; renders already use the context without any app change. The point is that a creator can see a wrong guess and correct it through their direction text, which always wins. Assumption: one muted line near the logline is enough; no editing UI.

## Plan

1. Read songContext from the render summary (null-safe).
2. If region and confidence != 'low', show 'Set in {region}' near the logline on the call sheet.
3. Nothing when null or low.

## Reason

JET-288 / D-080: casting now follows the song's researched region.

## Related files

call sheet screen, render summary type

## Acceptance criteria

A Punjabi song's call sheet shows 'Set in Malwa, Punjab'; an English song shows nothing.

## Test steps

1. Render a Punjabi song with the call sheet on. 2. See 'Set in …Punjab' under the logline. 3. Render an English song: no line.

## Thread
2026-11-10T20:44:29+05:30 aquib N: created ticket, status: - -> open
2026-11-10T21:12:49+05:30 aquib N: status: open -> approved
