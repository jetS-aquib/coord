---
id: JET-213
title: Show the song read before the brief, so the app has visibly listened
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-10-27T16:46:11+05:30
updated: 2026-10-27T16:48:28+05:30
decisions: 
---

## Request

A screen between upload and the brief that draws what the server now knows about the track: tempo, the sections with their names and lengths, and where the loudest part is. GET /api/v1/music-videos/:id/song-read, no new backend work needed.

## Understanding

This is 6.7 of the delivery plan and the last mobile row of Batch 6. The backend half is done: the planner now cuts to the song rather than to the model's maximum duration, and the read it cuts to is served by GET /api/v1/music-videos/:id/song-read.

The payload: { bpm, beatsPerBar, durationSeconds, language, downbeats: number[], energy: number[], sections: [{ label, start, end, lines: [{ start, end, text }] }] }. Sections cover the whole song with no holes, every boundary is on a downbeat, and energy is one value per bar, 0..1, where energy[i] is the bar starting at downbeats[i].

404 means there is nothing to draw — an instrumental, or the read was unavailable — and the render still works, cut by duration as before. So the screen is skippable by design, not an error state.

What we think it is, and you know the app better than we do: a waveform or a simple energy bar per section, the section names along it, the tempo somewhere small, and Continue. The one thing worth getting right is that the labels are a GUESS and the boundaries are not — 'chorus' may be wrong, the place it starts is not. We would not put the label anywhere a user would argue with it.

Also now on the render payload, if you want it on the strip: every clip carries sectionLabel, startSeconds and musicalSeconds. A shot can say 'Chorus · 5.2s' instead of 'Shot 14'.

Assumptions:
- The call is cheap and cached twice over (our DB, then theirs on the audio's bytes), so calling it on screen entry is fine and re-entering costs nothing.
- Nothing blocks on it. A slow or missing read shows the brief as it is today.
- No new inputs on this screen. It is a reveal, not a gate — the user reads it and continues.

## Plan

1. File this; the backend end is already deployed behind it.
2. Mobile fetches the read after the project exists and before the brief.
3. Optional and separate: label each tile in the shot strip with its section.

## Reason

The planner now hears the song, and nothing in the app says so. A screen that shows the structure before asking anything is the cheapest trust in the whole flow — and it is reading data we already compute and already pay for.

## Related files

mobile: src/app/(create)/song-read.tsx (new), src/lib/generation.ts; backend: already served

## Acceptance criteria

Picking a track and continuing shows tempo and the song's sections before the brief, with the chorus visibly bigger than the verses. An instrumental skips the screen rather than showing an error. The shot strip can name a shot's section.

## Test steps

—

## Thread
2026-10-27T16:46:11+05:30 aquib N: created ticket, status: - -> open
2026-10-27T16:48:28+05:30 aquib N: status: open -> approved
