---
id: JET-346
title: Later: cut-style picker, 9:16 reel export, re-cut an old video, cold-open toggle
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-11-18T01:21:26+05:30
updated: 2026-11-20T15:03:39+05:30
decisions: 
---

## Request

Mobile surface for the backend's EDIT_V2: let a person pick a cut style (calm / on the beat / fast), export a 30-45s 9:16 reel around the hook, re-cut an already finished video without re-filming, and turn a cold open on or off.

## Understanding

On the finished-video screen: re-cut the video in another cut style (calm / on beat / fast) with a preview, keep or undo; and make a 30-45s 9:16 reel of the hook to save or share. Backend is READY (JET-377, in review): see contracts/api-music-videos.md under v1 rendering. Nothing is generated, so no cost/limit screens are needed, but a stitch takes 1-4 minutes, so it is a "working on it" state, not a spinner.

The app learns progress from the poll it already uses (GET …/render/:jobId): `recut` = { status stitching|ready|failed|kept, cutStyle, url, error, canUndo }, `reel` = { status, url, error }, `cutStyle` = the kept pace ('' = the director's own).

Cold-open toggle is DROPPED from this request: the backend has no per-video switch (the cold open comes with the director, under the graphicLayer flag). Re-filming in another style before render is also not here: cut style only applies to finished videos.

Assumption: the screens show only when PostHog flag `render-recut` is on for the user (same key the backend checks; the endpoints answer 404 when off). If the app has no PostHog flags yet (JET-373), hide the buttons when the first call answers 404.

## Plan

1. Finished-video screen: a "Re-cut" button -> picker Calm / On beat / Fast -> POST …/render/:jobId/recut {cutStyle}; show "Re-cutting…" while recut.status is stitching (poll as usual).
2. When ready: play recut.url as a preview beside the current video; "Keep this cut" -> POST …/recut/keep (the video updates); "Undo" (shown when recut.canUndo) -> POST …/recut/undo.
3. "Make a reel" button -> POST …/reel; when reel.status is ready, play reel.url with Save to Photos / Share.
4. failed -> show error with Try again; 409 -> "already working on it"; 429 -> "5 an hour, try later".
5. Gate all of it on PostHog `render-recut` (or hide on 404).

## Reason

Before the demo, EDIT_V2 is backend-only so no TestFlight build is needed. These are the user-facing follow-ups.

## Related files

—

## Acceptance criteria

—

## Test steps

Backend on JET-377, with PostHog `render-recut` on for your user (or no EXPO_PUBLIC_POSTHOG_KEY in the app, in which case the button shows and hides itself on the first 404).

1. Open a finished video. A film icon is in the top bar beside the scissors. Tap it: a RE-CUT panel shows "Cut now: The director's own", three paces, and a reel section.
2. Pick Fast → Re-cut. "Re-cutting it fast… you can leave and come back" shows. Leave the screen, come back after a few minutes, open the panel: it shows Watch the new cut / Keep this cut.
3. Watch the new cut: the player swaps to the preview; "Back to the video" swaps back. Keep this cut: the video now plays the fast cut, the panel says "Cut now: Fast", and "Undo the last re-cut" appears. Undo puts the old video back.
4. Make a reel: "Making your reel…", then Watch the reel (plays tall) and Share the reel (share sheet with the mp4; Save to Photos is in that sheet on iOS).
5. Tap Re-cut or Make a reel six times in an hour: the sixth says "five re-cuts and reels this hour". With the flag off: no film icon (or it disappears after the first tap answers 404).

## Thread
2026-11-18T01:21:26+05:30 aquib N: created ticket, status: - -> open
2026-11-20T13:35:20+05:30 aquib N: Revised: backend is ready (JET-377 in review). Cold-open toggle dropped (no per-video switch exists). Understanding/Plan rewritten with the exact endpoints and poll fields.
2026-11-20T15:00:56+05:30 aquib N: status: open -> approved
2026-11-20T15:01:51+05:30 aquib N: status: approved -> in_progress
2026-11-20T15:03:39+05:30 aquib N: status: in_progress -> review — Finished-video screen: film icon -> RE-CUT panel. Pace Calm / On the beat / Fast -> recut; stitching line you can leave; Watch the new cut (swaps the player) / Keep / Undo. Make a reel -> Watch / Share. 409/429/failed shown in words. Gated on PostHog render-recut, hides on 404. Save to Photos not built: the share sheet covers it without a new native module. Uncommitted.
