---
id: JET-403
title: Home as a studio wall: brand header, in-progress row with live progress, featured video, server thumbnails, long-press delete
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:49:59+05:30
updated: 2026-11-23T17:50:53+05:30
decisions: 
---

## Request

Depends on: JET-387, JET-388, JET-398.

Redesign the Library per SCREEN_REDESIGN.md §2 (V1 UX-014/015): logo + 'jetKreate Music' header with a compact '+ New'; In progress row with the newest still and a coral progress line ('FILMING 4/5'); featured newest video; grid with clean titles and mono meta; 'Start from a song' tile for new users; long-press Rename/Delete. Poll the list every 15s while anything is unfinished and refresh on returning to the foreground; a finished card pulses once with the success haptic. Use the server thumbnailUrl and stop decoding frames on the phone.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Dropping on-device frame decoding (lib/thumbnails.ts, mock register M1) should also cut the memory behind JET-371; that ticket stays the owner of the picker-kill fix and is noted. No new dependency.

## Plan

1. Header, In progress row, featured, grid restyle.
2. thumbnailUrl in MediaSlot; remove useThumbnail for the Library.
3. Polling + AppState refresh + ready pulse.
4. Long-press menu with delete.

## Reason

The first screen should show the work and what is being made; also the main memory saving on the Library.

## Related files

src/app/(app)/index.tsx, src/components/video-poster.tsx, src/components/media-slot.tsx, src/lib/thumbnails.ts, src/lib/music-videos.ts

## Acceptance criteria

With a render running, Home shows it in progress with a moving count and its newest still, and it moves to the grid within ~15s of finishing; Library memory (dumpsys meminfo) drops versus today with 100+ videos.

## Test steps

1. Start a render, go Home: it sits in In progress with its newest still, a coral line along the bottom, and 'FILMING 4/5' moving without pulling to refresh.
2. Leave Home open until it finishes: within about 15s it leaves the row, becomes the featured video, the phone buzzes once and the card pulses.
3. Header shows the logo with 'jetKreate Music', '+ New' and settings; '+ New' starts a song.
4. Long-press any card -> 'Delete ...?' -> Delete: it disappears.
5. On an account with no finished videos the grid's first tile is 'Start from a song'. With 100+ videos, adb shell dumpsys meminfo com.jetsynthesys.jetkreatemusic is lower than before.

## Thread
2026-11-23T15:49:59+05:30 aquib N: created ticket, status: - -> open
2026-11-23T17:38:27+05:30 aquib N: status: open -> approved
2026-11-23T17:50:53+05:30 aquib N: status: approved -> in_progress — Working on it
2026-11-23T17:50:54+05:30 aquib N: Built, not committed. Home: brand header with '+ New' (40 tall) and settings; serif greeting + mono '12 videos · 2 in progress'; In progress row 120x160 newest still with cue progress line and mono stage ('FILMING 4/5', warnings in warning colour); featured newest at 16:10; 2-column grid radius 8, cleaned titles, mono '0:27 · 9m ago'; 'Start from a song' dashed tile when nothing is finished. Polls every 15s and on foreground while anything renders; a newly finished card gets a success haptic and one ring pulse. Long-press -> delete confirm. Cards use server thumbnailUrl only; MediaSlot no longer decodes frames (lib/thumbnails stays for Working's shot strip). Rename on long-press skipped: no partial-update endpoint, and POST /api/music-videos rewrites the whole record.
