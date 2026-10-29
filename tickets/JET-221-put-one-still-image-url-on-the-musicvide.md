---
id: JET-221
title: Put one still image URL on the MusicVideo record, so a library card never has to decode an MP4
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-10-29T17:01:26+05:30
updated: 2026-10-29T17:11:15+05:30
decisions: 
---

## Request

Mirror one already-drawn still onto the MusicVideo document as a plain string field — a poster URL — the same way renderOrchestratorV1 already mirrors storyboard.N.clipUrl. Written as soon as the first anchor still exists, so it is there during the render and not only at the end. Any of the anchor stills or the six-panel plate will do; we do not need a new image generated.

## Understanding

The Library card for a FINISHED 4:16 render is an empty grey rectangle with a film icon. We checked the record and the data is healthy — 32 of 32 scenes carry a clipUrl, and that clip is a 200 over range requests, 2MB in 0.18s from this machine. So nothing is missing or broken on your side. The problem is entirely how a client turns a video into a picture.

WHY A MOBILE CLIENT CANNOT SOLVE THIS ITSELF. The record carries no image URL of any kind — only finalVideoUrl and storyboard[].clipUrl, both MP4s. To draw a card we open the MP4 with the platform's native retriever over HTTP and read until it can decode a frame, one file at a time with a 12s deadline (lib/thumbnails.ts, lib/media-timeout.ts). On a real iPhone 15 Pro on wifi that is now failing: the card stayed empty for a completed project whose clip we can fetch in a fifth of a second from a laptop on the same network. We cannot see which way it failed from here — that needs a device log — but the fix is the same either way, because the decode should never have been on the critical path for a thumbnail.

WHAT YOU ALREADY HAVE THAT WOULD SOLVE IT OUTRIGHT. The render draws anchor stills before any clip renders — we receive them as clip.openingFrameUrl on the v1 render state, and the six-panel plate as plateUrl (JET-205). They are plain images. They load on the device reliably and instantly; it is specifically MP4 frame extraction that does not. Our shot strip already leans on openingFrameUrl for exactly this reason and it has never been empty. The Library cannot, because it reads MusicVideo and the stills live on the render job, which the Library has no jobId for (MusicVideo carries no jobId — noted in media-slot.tsx as mock register M2).

ASSUMPTIONS, correct us:
 - One string field on MusicVideo is enough. We do not need a sprite sheet, a set, or per-scene stills — one picture per project is what a card shows.
 - D-013 is the precedent and the argument: the project document stays the source of truth and the render plan stays derived, which is exactly why clipUrl is mirrored. A poster is the same kind of write, for the same reason, and a client that has never heard of v1 can read it.
 - Written EARLY matters more than which still is chosen. A card is empty for the whole twenty minutes of a render; the first anchor exists minutes before the first clip. If it is cheaper to write it at completion only, say so and we will take it, but we lose the part of this that the user actually complained about.
 - This is unrelated to JET-194 but points the same way: media that a client has to resolve on a third-party host is where every one of our media bugs has landed.

WHAT WE HAVE ALREADY DONE ON OUR SIDE, so you are not fixing it twice: the Library used to ask for a thumbnail only when status was completed, which ignored the clipUrls you mirror per scene as shots finish. It now asks at every status, so a project that is mid-render shows its own footage once a decode succeeds. That is a real improvement and it is still a video decode, so it is still unreliable. This ticket is the part that makes it not matter.

## Plan

1. File this and carry on. Nothing of ours is blocked: the card is ugly, not broken, and we have already widened what it tries.
2. When the field lands, read it first in video-poster.tsx and fall back to the current clip decode. One conditional, no new screen.
3. If you would rather not touch the model, the other shape that works for us is a jobId on MusicVideo — then the Library can fetch the render state and use openingFrameUrl itself. We prefer the string; say which you want.

## Reason

The Library is the first screen after signing in and the only place a finished video is seen again. A finished 4:16 video showing as an empty grey rectangle reads as 'my render was lost', which is the single worst thing this screen can say, and it says it about a render that completed perfectly.

## Related files

backend: src/models/MusicVideo.ts, src/services/render/renderOrchestratorV1.ts (mirrorSceneToProjectV1 is the pattern). Ours: src/components/video-poster.tsx, src/components/media-slot.tsx

## Acceptance criteria

A MusicVideo record carries a URL to a still image, populated while the render is still running, and GET /api/music-videos returns it in the list. Opening the app on a phone shows a picture on every card that has had at least one anchor drawn — rendering or finished — with no MP4 read on the device.

## Test steps

1. Open the app on the phone and look at the Library. Every card that previously showed an empty grey rectangle with a film icon now shows a picture — the records were backfilled, so this needs no new render.
2. The picture appears immediately, not after a pause. Nothing is decoding: it is a 63KB WebP, not a frame pulled out of an MP4.
3. Start a new render and leave the Library. Once the first anchor lands the card shows a picture while it is still rendering, with the breathing mark over it and the RENDERING chip — not a blank breathing rectangle.
4. Check the write is once-only: the card's picture does not change as more anchors and clips arrive.
5. A project with no posterUrl (an older record, or one created before the first anchor) still falls back to decoding a clip, exactly as before — no card regresses.

## Thread
2026-10-29T17:01:26+05:30 aquib N: created ticket, status: - -> open
2026-10-29T17:02:05+05:30 aquib N: status: open -> approved
2026-10-29T17:04:40+05:30 aquib N: status: approved -> in_progress — work started in music-jetkreate-backend
2026-10-29T17:11:15+05:30 aquib N: Backend half verified and the mobile half is in. Four notes.

1. WIRED AS SPECIFIED. MusicVideo.posterUrl is read in src/lib/music-videos.ts, normalised through reachableUrl() like every other media URL, and passed to MediaSlot as a new stillUrl prop. When it is set, NOTHING decodes: useThumbnail is handed null and the image is rendered as-is. The clip-then-master decode stays only as the fallback for a project that has no posterUrl.

2. YOU BACKFILLED, which we had not asked for and which means this is visible immediately rather than on the next render — all five records in the local DB already carry one. Thank you; worth saying out loud because it changes the test from 'start a render' to 'open the app'.

3. THE NUMBERS. The poster is a 63KB image/webp that fetches in 0.13s. What it replaces was opening a multi-megabyte MP4 with the platform frame retriever, one file at a time, against a 12s deadline. expo-image decodes WebP on both platforms, so nothing extra is needed for the format.

4. STILL OPEN ON OUR SIDE, and not yours: we never found out HOW the old decode was failing on the device — timeout or error — because that needs a Metro log we do not have yet. This ticket makes it not matter for the Library card, but the same decode path still backs the shot strip and the reel, so we are not treating the question as closed.
2026-10-29T17:11:15+05:30 aquib N: status: in_progress -> review — backend field verified, mobile half wired — ready for you to check on the device
2026-10-29T18:40:26+05:30 aquib N: Verified on a full live render (mvr_1793277832749_3e886f1a): MusicVideo.posterUrl is set to a scene-image URL, written the moment the first anchor lands and again on resume if a run stopped between the two writes. Ready to close.
