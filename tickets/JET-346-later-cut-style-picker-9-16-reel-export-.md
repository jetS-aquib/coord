---
id: JET-346
title: Later: cut-style picker, 9:16 reel export, re-cut an old video, cold-open toggle
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-18T01:21:26+05:30
updated: 2026-11-18T01:21:26+05:30
decisions: 
---

## Request

Mobile surface for the backend's EDIT_V2: let a person pick a cut style (calm / on the beat / fast), export a 30-45s 9:16 reel around the hook, re-cut an already finished video without re-filming, and turn a cold open on or off.

## Understanding

Not to start until the backend exposes the endpoints, which are not built yet. Filed now so it is not lost. Each needs a backend route first, under JET-345 or a follow-up.

## Plan

1. Backend adds a re-cut endpoint and a reel output.
2. Mobile adds the picker and an export button on the finished video.
3. Both are flag-gated.

## Reason

Before the demo, EDIT_V2 is backend-only so no TestFlight build is needed. These are the user-facing follow-ups.

## Related files

—

## Acceptance criteria

—

## Test steps

—

## Thread
2026-11-18T01:21:26+05:30 aquib N: created ticket, status: - -> open
