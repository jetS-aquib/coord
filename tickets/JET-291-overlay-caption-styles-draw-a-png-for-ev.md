---
id: JET-291
title: Overlay caption styles draw a PNG for every frame, and their canvas is wider than a portrait video
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-11-10T01:57:43+05:30
updated: 2026-11-10T01:57:43+05:30
decisions: 
---

## Request

Make fire, liquid, ink, watercolor, smoke, particle and confetti captions fast, and stop them being clipped on portrait.

## Understanding

Applies after the one-encode stitch work.

## Plan

Depends on: JET-290.
1. Render each effect once per caption event (or a short loop) instead of per frame.
2. Size the canvas from the output frame.
3. Before/after time on one song.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). PIL draws an 1100x360 RGBA PNG for every frame of the song with a GaussianBlur each, in one Python loop (effects/visual_effects.py:25-84), about 5,000 PNGs for 3.5 minutes. The canvas is fixed at 1100 wide and centred (compositor.py:25), so on a 720-wide portrait frame it is clipped on both sides.

## Related files

app/effects/visual_effects.py, app/effects/compositor.py

## Acceptance criteria

An overlay style on a portrait render is not clipped and adds no more than a few seconds to the stitch.

## Test steps

—

## Thread
2026-11-10T01:57:43+05:30 aquib N: created ticket, status: - -> open
