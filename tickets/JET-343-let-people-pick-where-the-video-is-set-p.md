---
id: JET-343
title: Let people pick where the video is set: place cards on the Direction screen, and 'change this part's place' on the call sheet
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-17T18:23:50+05:30
updated: 2026-11-17T18:39:50+05:30
decisions: D-087
---

## Request

Give the person a clear, easy place choice before filming, and a way to change a part's place on the call sheet.

## Understanding

Today 'Where' is six generic chips (Nature, City at night...) that the director pre-fills, and the call sheet shows each part's place as text with no way to change it except typing an edit. Backend half (place suggestions on /brief, place per part on the call sheet) is the request filed alongside this one. Assumptions: suggestions arrive as text cards with a one-line why; a free-text 'somewhere else' stays; changing a part's place uses POST /edits with scope {section} and the instruction 'set it in <place>' or a structured place field.

## Plan

1. Direction screen: replace/augment the Where chips with 3-4 place cards from /brief (director's pick marked), plus 'Somewhere else' free text.
2. Call sheet section header: show the place prominently with a 'Change place' action -> place cards or text -> edit dry run (scope = that part) -> apply (stills redraw).
3. Carry the chosen place into the render request.

## Reason

People want to choose the background; today it is buried and generic.

## Related files

src/app/(create)/brief.tsx, src/app/(create)/plan.tsx, src/features/create/section-filmstrip.tsx, src/lib/generation.ts

## Acceptance criteria

A person picks 'a dhaba at night' on the Direction screen and the call sheet and stills are there; on the call sheet they change part 2 to a rooftop and only part 2's stills redraw.

## Test steps

—

## Thread
2026-11-17T18:23:50+05:30 aquib N: created ticket, status: - -> open
2026-11-17T18:23:59+05:30 aquib N: Needs backend JET-342 (place suggestions on /brief, place per part on the call sheet).
2026-11-17T18:38:53+05:30 aquib N: linked decision D-087 (Places come from the lyrics; a picked place is a commitment)
2026-11-17T18:38:53+05:30 aquib N: Backend half is built (JET-342): /brief returns places [{place, why}], first is the director's pick; send the tapped card's place (or typed text) as direction.where on the project; 'change this part's place' = POST …/edits with scope {section: sections[i].index}. Contract updated.
2026-11-17T18:39:50+05:30 aquib N: status: open -> approved
