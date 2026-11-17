---
id: JET-341
title: UX fixes from the end-to-end run: stale title, invisible selection, jumping editor sheet, window not followed, misleading labels
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-17T18:19:51+05:30
updated: 2026-11-17T18:33:51+05:30
decisions: 
---

## Request

Fix the UX issues found walking the whole journey on the emulator (2026-11-17). Each is small; together they are what makes the demo feel finished.

## Understanding

Found in E2E (screens are mobile's, nothing here needs the backend except item 5's last part):
1. Replacing the track keeps the old title: picked a catalogue song, replaced it with an upload, Direction still said 'Waiting for Your Love'.
2. Call sheet: '1 shot selected' but no card shows a selected mark. From the stills slideshow, 'Change this shot' selects whichever shot is playing at the moment of the tap (got shot 5 while looking at shot 2) — pause on tap, or select the shot on screen when the slideshow opened the bar.
3. Studio: multi-select changes the sheet height under the finger (the 'Keep this scene' row disappears at 2+), so the next press lands on the video and closes the editor. Keep the strip where it is.
4. Studio dry run that changes nothing still shows a disabled 'Film 0 scenes again' — hide it, keep 'Not now'.
5. Song window not followed: the Lyrics screen shows the whole song (show or highlight only the window's lines); no price on the window picker (call /estimate with trim there); send trim to /brief so the pitch fits (backend half is JET-340).
6. Library shows 'RENDERING' for a render waiting at its call sheet (status review); say 'Waiting for you' (and 'Previewing' for previewing).
7. Call sheet says 'nothing charged yet' after preview stills were drawn; say 'only the stills so far' or show the stills cost.
8. Stills slideshow progress bar looks like an empty text field.
9. During filming the app ended up on the Library instead of staying on the filming screen or landing on the video — unclear trigger, worth a look.
Assumption: copy choices are the app's; these are the problems, not the exact words.

## Plan

1. Reset title (and draft-derived fields) when the track changes.
2. Selected state on shot cards; slideshow pauses and passes its shot.
3. Fixed-height editor sheet or anchored strip.
4. Hide the film button when no diffs.
5. Lyrics windowed; live price on the picker; trim on /brief.
6-8. Status label, cost copy, progress bar style.
9. Reproduce the filming-screen exit; fix if real.

## Reason

Senior PM pass on the v0 demo: none block the journey, all make it feel unfinished.

## Related files

src/app/(create)/audio.tsx, src/app/(create)/lyrics.tsx, src/app/(create)/plan.tsx, src/app/(create)/working/[id].tsx, src/features/create/video-studio.tsx, src/features/create/animatic.tsx, src/features/create/song-window-picker.tsx, src/app/(app)/index.tsx

## Acceptance criteria

Each of the 9 items, re-walked on the emulator, no longer happens.

## Test steps

—

## Thread
2026-11-17T18:19:51+05:30 aquib N: created ticket, status: - -> open
2026-11-17T18:33:51+05:30 aquib N: status: open -> approved
