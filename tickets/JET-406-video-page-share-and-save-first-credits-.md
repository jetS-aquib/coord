---
id: JET-406
title: Video page: Share and Save first, credits with faces, Scenes and Versions, shots in video time, copy that copies
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-11-23T15:50:04+05:30
updated: 2026-11-24T13:00:38+05:30
decisions: D-099
---

## Request

Depends on: JET-389, JET-398.

SCREEN_REDESIGN.md §11 (V1 UX-018/019/036/037/038/046): serif title and mono meta; Directed by with avatar; Share (primary) · Save to phone · ⋯ (Edit scenes, Delete); Starring row with cast portraits; post caption without a card where Copy really copies; tabs Scenes (Shots+Stills+Cast merged, face filter from castTags) and Versions; shot labels in video time; language name instead of 'hi'.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Save needs expo-media-library and Copy needs expo-clipboard: both first-party Expo, new dependencies, recorded with coord decide. Video-time labels use the detail's videoStartSeconds.

## Plan

1. Action row + ⋯ menu.
2. Starring row; Scenes tab with face filter; remove Stills/Cast tabs.
3. Save to Photos; clipboard copy.
4. Shot labels + language names.

## Reason

The payoff screen leads with what people want to do next.

## Related files

src/app/(app)/video/[id]/index.tsx, src/features/video/video-about.tsx, video-assets.tsx, src/lib/share.ts, src/lib/video-detail.ts, package.json

## Acceptance criteria

Share is the first button; Save puts the video in the gallery; tapping a face filters to that person's scenes; shot 1 of the Zaaya hook reads 0:00; Copy shows 'Copied' with no share sheet.

## Test steps

1. Needs the new dev build (npx expo run:android). Open a finished video: serif title, "0:28 · Tall · …", Directed by with avatar, Starring line; back chevron visible over the player.
2. Tap Save: "Saved to gallery", no permission prompt, video in Gallery. Tap Share: system share sheet with the file.
3. Post it: tap Copy, it reads "Copied", no share sheet; paste elsewhere shows the caption. Language reads "English"/"Hindi", not a code.
4. ⋯ → Delete opens the themed confirm sheet with Delete in red; cancel.
5. Scenes: scene 1 reads "1 · 0:00 · …"; tap a face (initial when no portrait): "Elena · in 4 of 5 scenes" and only those scenes; tap a scene and the player jumps there. Versions still has the re-cut chips.

## Thread
2026-11-23T15:50:04+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:12:20+05:30 aquib N: status: open -> approved
2026-11-24T12:19:36+05:30 aquib N: linked decision D-099 (expo-media-library and expo-clipboard for Save to phone and Copy caption)
2026-11-24T13:00:38+05:30 aquib N: status: approved -> in_progress
2026-11-24T13:00:38+05:30 aquib N: status: in_progress -> review — Built and committed (3fff167); Test steps filled
