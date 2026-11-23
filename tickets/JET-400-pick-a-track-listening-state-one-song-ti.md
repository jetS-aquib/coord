---
id: JET-400
title: Pick a track: listening state, one song timeline from the real waveform, three read outcomes, and typing lyrics yourself
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:49:55+05:30
updated: 2026-11-23T18:11:54+05:30
decisions: 
---

## Request

Depends on: JET-386, JET-392, JET-398.

Redesign Pick a track per SCREEN_REDESIGN.md §3-4: serif title, coral play, a flat line until the read lands, an honest listening panel with elapsed time and 'while you wait' title/shape; then one SongTimeline drawn from songRead.energy that replaces the file-name waveform, the parts strip and the second window strip (V1 UX-007/009/035/039). Separate the three outcomes (words found / no singing / read failed with Retry) and add 'Add lyrics myself' (V1 UX-003). Send contentHash from the upload so repeat songs are instant.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

The lyrics gate stays mandatory (product decision); a failed read must never silently skip it. No percentages or invented stages: the backend only reports 'reading'. Snapping (part edges within 3s, else bars) and the screen-reader adjustable grips are kept. Hook/Extended hide on one-part or sub-45s songs.

## Plan

1. uploads.ts: pass contentHash through to song-read.
2. ListeningPanel + flat line + reveal (waveform rises, first lyric line, land haptic).
3. SongTimeline replacing track-player waveform, SongReadStrip and the window strip; delete lib/waveform.ts.
4. Outcome states + Retry + Add lyrics myself sheet posting to the manual lyrics endpoint.
5. Remove the false 'only happens once' copy; fix '1 parts'.

## Reason

The first and longest wait in the app, and the place a failure currently removes the mandatory lyrics check.

## Related files

src/app/(create)/audio.tsx, src/features/create/song-read.tsx, song-window-picker.tsx, track-player.tsx, create-context.tsx, src/lib/uploads.ts, src/lib/waveform.ts

## Acceptance criteria

Re-upload a known song -> parts and lyrics within ~3s; a new song shows elapsed time and no percentage; one timeline with one coral playhead; an instrumental offers 'Add lyrics myself' and the typed lines appear on the Lyrics screen; a forced read failure offers Retry.

## Test steps

1. Pick a new song: serif title, a flat line, and 'Listening to …' with elapsed time and no percentage; Continue disabled with 'Waiting for the lyrics'. Change the title and shape while waiting.
2. When the read lands the bars rise with a haptic: one timeline, HOOK labelled. Pick Hook, drag a grip (it snaps), tap Play: one coral playhead.
3. Re-upload the same file: parts and lyrics within about 3s.
4. Pick an instrumental: 'No singing found…'. Add lyrics myself, type 3 lines, Save (Save visible above the keyboard): Continue opens Lyrics with those lines.
5. Airplane mode during the read: 'We could not read this track…' with Try again, Add lyrics myself, Continue without lyrics.

## Thread
2026-11-23T15:49:55+05:30 aquib N: created ticket, status: - -> open
2026-11-23T18:10:40+05:30 aquib N: status: open -> approved
2026-11-23T18:11:54+05:30 aquib N: status: approved -> in_progress — Working on it
2026-11-23T18:23:22+05:30 aquib N: Built, not committed. One SongTimeline (features/create/song-timeline.tsx) from songRead.energy replaces the fake waveform, parts strip and second window strip; window picker drawn on it with snapping and adjustable grips kept. ListeningPanel: elapsed time, one pulsing cue dot, no percentage, no 'only happens once'. Title + shape while waiting. Three outcomes: words / no singing / read failed (Try again, Add lyrics myself, Continue without lyrics). Add lyrics myself -> POST /lyrics/manual, then re-reads the song. contentHash skipped: the server hashes uploads itself (JET-386). lib/waveform.ts kept: planning-stage (Working) still uses it.
