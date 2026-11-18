---
id: JET-351
title: Detailed reference before filming: a plate for every place, and inside, outside and a second angle for every vehicle
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T15:30:12+05:30
updated: 2026-11-18T16:00:45+05:30
decisions: 
---

## Request

Turn on and extend per-location plates (JET-262): one empty, wide establishing frame per place, drawn before any still, and every still in that place drawn against it. A vehicle place gets three plates: interior, exterior with the people for scale, and a second interior angle. Stills pick the plate that matches their shot.

## Understanding

Quality first: up to 3 plates per vehicle place, 1 per other place, even though that is more image calls per render. Assumed: a place counts as a vehicle when its location text names one (car, jeep, train, metro, bus, bike, boat, auto); the GEN_V2 treatment already writes the vehicle in full into the location. Which plate a still uses comes from its shot text (inside vs outside words), defaulting to interior. Behind flags.render.locationPlates (on) plus a new vehicle-plates flag.

## Plan

1. renderLocationPlatesV1: vehicle places draw interior, exterior and second-angle plates; the prompt asks for exact scale against two adults.
2. paintFor: choose the plate for each still by its shot text.
3. Plate prompt: 'empty, wide, the exact place, no people, one frame, no panels'.
4. Tests for plate choice; one stills preview of the Zoya song.

## Reason

On mvr_1794989625320_48693f7a every metro shot invented its own train: locationPlates is off, so the only reference was the six-panel cast plate. In the earlier Rohan render the jeep changed size and model shot to shot.

## Related files

src/services/render/renderOrchestratorV1.ts, src/services/render/renderPromptsV1.ts

## Acceptance criteria

In a stills preview of a metro or car song, every still in a section shows the same carriage or vehicle, at a believable size against the people.

## Test steps

1. Start a stills preview (preview: true) of Tu Mil Jaaye with Zoya, 9:16.
2. Logs: `location plates N over M place(s)`; a vehicle place (e.g. inside the metro carriage) draws 3 plates.
3. In the plan, `locationPlates` holds `<place>`, `<place> #exterior` and `<place> #interior2` for each vehicle place.
4. Look at the stills of one metro section: the same carriage throughout, at believable size against the people.

## Thread
2026-11-18T15:30:12+05:30 aquib N: created ticket, status: - -> open
2026-11-18T15:52:53+05:30 aquib N: status: open -> approved
2026-11-18T16:00:45+05:30 aquib N: status: approved -> in_progress
2026-11-18T16:00:45+05:30 aquib N: status: in_progress -> review — locationPlates ON, new vehiclePlates flag: a vehicle place draws interior, exterior (people scale) and a second interior angle, the last two against the first. Each still picks a plate from its shot text; interior shots alternate angles. Plates now stored through durableUrl. Needs a stills preview.
