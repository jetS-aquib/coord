---
id: JET-260
title: Let the creator choose where the lyrics sit in the frame (captionPosition)
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-06T15:20:44+05:30
updated: 2026-11-06T15:21:44+05:30
decisions: 
---

## Request

Send captionSettings.captionPosition on POST /api/v1/music-videos/:id/render, with a picker for the lyric position. Allowed values: top_left, top_center, top_right, center_left, center, center_right, bottom_left, bottom_center, bottom_right, random_fixed. Default the picker to bottom_center. Do not send both captionPosition and caption_position (the API refuses both spellings together).

## Understanding

I read this as: mobile should expose a lyric position choice and send it on render. Assumptions: (1) the backend needs no change, it already validates and forwards captionPosition (captionSettingsV1.ts, then the stitch request); (2) mobile currently sends no captionPosition, or sends random_fixed — I have NOT read the mobile code, so please confirm what it sends today; (3) bottom_center is the right default; (4) I have not rendered with each position, so how every caption style looks at every spot is unchecked.

## Plan

1. Check what captionSettings mobile sends on render today. 2. Add a position picker (9 spots, maybe plus random) to the caption options screen. 3. Send the choice as captionSettings.captionPosition. 4. Default to bottom_center. 5. Render one song at two positions and confirm the lyrics stay put.

## Reason

Lyrics appear at seemingly random places in the frame. The backend and video service already accept a fixed position, but when none is sent the caption style picks its own placement (and random_fixed gives every caption a different spot). The creator has no way to say where lyrics should sit.

## Related files

music-jetkreate-mobile: the caption options screen and the render request builder

## Acceptance criteria

Choosing bottom_center and rendering gives a video whose lyrics all sit at bottom centre; choosing top_left puts them all top left. The render status response echoes the chosen captionPosition in captionSettings.

## Test steps

—

## Thread
2026-11-06T15:20:44+05:30 aquib N: created ticket, status: - -> open
2026-11-06T15:21:44+05:30 aquib N: status: open -> approved
