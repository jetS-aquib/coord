---
id: JET-342
title: Almost every Hindi/Punjabi song is shot as two people in a yellow-flower field: suggest places from the lyrics, and let a person pick or change them
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-17T18:23:49+05:30
updated: 2026-11-17T18:23:49+05:30
decisions: 
---

## Request

Internal users report nearly all Hindi/Punjabi renders land in an open mustard field with two leads. Places should come from the song, vary between videos, and be easy for a person to choose before filming and to change per part on the call sheet.

## Understanding

Causes, from the code: (1) the brief's 'Where' options are coarse — 'Nature' is literally 'open nature: fields, water, hills, big sky' — and the director auto-picks it for most romantic songs; (2) director voices steer there: Jassi names 'mustard fields', Rohan is 'the two leads ... a grand new place for each part' (two people in a landscape by default); (3) songContextV1 'settings' for a Punjab/North India song returns the regional stock places, which the treatment then uses. Nothing grounds places in what the lyrics are about, and nothing avoids places this person's recent videos already used. Assumptions: suggestions are text cards (no extra image spend); the look bible keeps choosing per-section places, constrained by what the person picked; changing a part's place on the call sheet uses the existing edit API (scope {section}, diff place) which JET-326 built.

## Plan

1. /brief returns 3-4 concrete place suggestions read from the lyrics and song context (e.g. 'a rain-soaked rooftop in old Delhi', 'a dhaba at night'), each with a one-line why, plus the director's pick; accepts a chosen place or free text.
2. Treatment/look bible: the chosen place(s) are a commitment; without a choice, avoid the regional stock image unless the lyrics point at it, and avoid places used in the person's last 3 renders.
3. Soften the director voices that hard-code places (Jassi's mustard fields becomes one option among village lanes, dhaba, courtyard).
4. Call sheet: each part carries its place and an id so the app can offer 'change this part's place' through POST /edits scope {section}.
5. Contract + tests (prompt contains chosen place; recent-places exclusion; brief schema).

## Reason

Repetitive backgrounds make every video look the same; it is the most common internal complaint.

## Related files

src/services/render/briefV1.ts, src/services/render/treatmentV1.ts, src/services/render/directorsV1.ts, src/services/render/songContextV1.ts, src/services/render/callSheetV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts

## Acceptance criteria

Five different Hindi/Punjabi songs rendered with defaults land in places drawn from their lyrics and not all in fields; a place picked on the Direction screen is where the video is set; changing a part's place on the call sheet redraws that part's stills there.

## Test steps

—

## Thread
2026-11-17T18:23:49+05:30 aquib N: created ticket, status: - -> open
