---
id: JET-234
title: Lyrics have never once burned on a v1 render, because showLyrics is hardcoded false — turn it on, and let the user pick a style
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-01T02:35:44+05:30
updated: 2026-11-02T12:15:14+05:30
decisions: D-058
---

## Request

Flip the hardcoded showLyrics: false in src/lib/generation.ts to true, and add a lyrics toggle plus a caption style picker to the brief. The backend half — the style and font list, and the settings on the render call — lands with this ticket.

## Understanding

This is a one-line bug with a feature behind it, and the one line is the urgent half. ProjectSettings in src/lib/generation.ts:105 has showLyrics: false as its default and line 230 sends it on every project save. The server reads showLyrics ?? true, so an explicit false wins. I checked rather than assumed: 44 of 47 projects in the database have showLyrics false and the other 3 have it unset, and ALL 41 v1 render plans ever created carry showLyrics: false with empty caption settings. Not one render in the history of this pipeline has had lyrics on it. The whole caption system — word timings, 20-odd styles, fonts, kinetic animation — has been built, paid for, and reached by nobody. The web client has had a working toggle and a style palette since before v1 existed. ASSUMPTIONS: (1) false was a placeholder nobody came back to, not a product decision — if lyrics are deliberately off for this flow, say so on the thread and I will close this; (2) you want the picker on the brief screen rather than the call sheet, because the call sheet is about shots and this is about the master; (3) a toggle plus a style list is enough and the kinetic tuning sliders the web exposes are an engineer's control, not a producer's. Correct me on any of these.

## Plan

1. The one line first, and it can ship on its own: ProjectSettings.showLyrics -> true in src/lib/generation.ts. That alone gives every new render burnt-in lyrics in the default style, with no screen work at all.
2. GET /api/v1/music-videos/caption-styles — one call, serving the styles and the fonts together, each with a label and font metadata. Served by this backend; shipping with this ticket.
3. A lyrics toggle on the brief, on by default, and under it a style list. Default picks itself — doing nothing burns the default style, same as step 1.
4. POST /api/v1/music-videos/:id/render accepts showLyrics and captionSettings. Both optional; absent is today's behaviour. Validated at our boundary so a bad key is a 400 on the render call rather than a 422 at the end of a paid render.
5. Preview is optional and later: POST /api/v1/video/caption-preview already exists and the web picker uses it, but it renders on a landscape canvas whatever the job is — filed as JET-233. The list has labels and font metadata, which is enough to draw a readable picker without it.

## Reason

9.8 in the render pipeline delivery plan, and the lyric video is named there as its own genre — per-word reveal on the beat, typography as composition. We pay Whisper for word timings on every song already, three times over if the warm call misses, and then throw the result away at the stitch. This is the cheapest visible quality win on the board: the work is done on both services and one boolean is holding it shut.

## Related files

yours: src/lib/generation.ts (ProjectSettings line ~105, the project save at ~230), src/lib/music-videos.ts (showLyrics already optional on the type), src/app/(create)/brief.tsx. ours: src/modules/musicVideo/musicVideoV1.routes.ts, src/modules/video/video-api.service.ts, src/services/render/renderOrchestratorV1.ts. reference: music-jetkreate-frontend/src/components/globalComponents/CaptionPalette.tsx is a shipped, working picker and the settings shape is proven there.

## Acceptance criteria

A render started from the phone with nothing touched comes back with lyrics burnt in. The toggle turns them off and that render comes back without them. A style picked on the brief is the style on the master. A client that has not been updated still renders exactly as it does today — every new field is optional on the wire.

## Test steps

1. Start a render from the phone on a song with vocals, change nothing. The finished video has lyrics burnt in, on the beat.
2. Turn the lyrics toggle off and render again. No captions, and the audio and cuts are unchanged.
3. Pick a style other than the default, render, and compare against step 1. Visibly different typography on the master.
4. GET /api/v1/music-videos/caption-styles. A list of styles and fonts with labels, enough to draw the picker.
5. POST a render with no showLyrics and no captionSettings — the old client's shape. Still 202, still renders.
6. POST a render with a nonsense caption style. A 400 naming the field, immediately, not a render that fails forty minutes later at the stitch.

## Thread
2026-11-01T02:35:44+05:30 aquib N: created ticket, status: - -> open
2026-11-01T02:45:33+05:30 aquib N: linked decision D-058 (Fix the zod guard in the shared error handler, rather than wrapping the one v1 route that needed a 400)
2026-11-02T12:15:14+05:30 aquib N: status: open -> approved
