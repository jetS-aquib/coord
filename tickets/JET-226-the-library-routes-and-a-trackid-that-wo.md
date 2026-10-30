---
id: JET-226
title: The library routes, and a trackId that works everywhere an audioUrl works today
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-10-30T12:02:31+05:30
updated: 2026-10-30T12:27:48+05:30
decisions: D-049
---

## Request

1. GET /api/v1/music-videos/tracks?term=&genre=&cursor=
   One route for browse and search, not two — an empty term is browse. Keeps
   one call site and one loading state on the picker.
   Response: { tracks: [ { id, title, artists: string[], durationSeconds,
                           bpm, genres: string[], moods: string[],
                           coverUrl, previewUrl } ],
               nextCursor: string | null,
               genres: string[] }           // the chip row, server-decided
   - previewUrl  must be streamable by expo-audio directly, on the backend's
                 own host (JET-194), and valid for the length of a browse
                 session. The client must never see an Epidemic signed URL.
   - coverUrl    same host rule, or the card is a grey box on a device.
   - durationSeconds, bpm and genres are what the card is made of, so a track
                 missing them should be left out rather than returned bare.

2. The three pre-project routes accept { trackId } as an alternative to
   { audioUrl }, exactly one of the two required:
     POST /api/v1/music-videos/transcript/warm
     POST /api/v1/music-videos/song-read
     POST /api/v1/music-videos/brief
   This is the whole ask, and it is what 8B.1's stable audioKey buys. Mobile
   holds a track id and never an audio URL, so without this the picker's track
   cannot be warmed, read or briefed, and the library path loses everything
   Batch 6 and 7 bought.

3. POST /api/music-videos (the upsert mobile saves with) accepts trackId in
   place of audioUrl, and the render resolves the audio from it at render
   time (8B.4). Unknown or withdrawn track at render time should fail the
   render with a reason a person can read, not a signed-URL error.

4. An unknown trackId on any of the above is a 404 with a code, so the picker
   can say 'that track is no longer available' rather than 'request failed'.

## Understanding

This is the API half of JET-224 / Batch 8B, filed from this side so the picker is built against an agreed shape.

What I read in JET-224, in my own words:
- The library is vocals-only and that is not a user-facing toggle. I am not adding a filter for it and will not surface vocalType anywhere.
- The client holds a track id, never a URL, because the download URL is signed and expires in about a day.
- A picked track behaves exactly like an upload from the brief screen onwards.

That last line is the one that needed checking, and on this side it is not quite true yet — which is the reason for ask 2. Everything between upload and the brief is keyed on an audioUrl: transcript/warm (JET-209), POST /song-read (JET-214, deliberately not project-scoped), and POST /brief (JET-218). A library track has no audioUrl on this side at any point. So either those three take a trackId, or the library path silently skips the warm, the song read strip and the song-written brief, and the user who picks a track gets a visibly worse product than the user who uploads one. I would rather ask for the parameter than ship that.

Assumptions, correct any rather than building around them:
- previewUrl is a short stream, as the ticket says. I do not need the full file and will not download it.
- One text field plus genre chips, no mood/BPM/length panel. The chips come from the server (the genres field) so the two repos do not keep a list each.
- Cursor pagination over page numbers — an infinite list is what a picker is. If the upstream only does offsets, say so and nextCursor can carry one.
- Preview-only, low-quality audio is fine to build against (8B.6 is a people problem). I will not put anything in the UI about audio quality.
- Short tracks are normal here: the picker shows real durations and the rest of the flow already reads duration off the song.
- I am NOT asking for favourites, recently-played or a 'surprise me'. If the catalogue is large enough that browse without a term is useless, say so and I will lead with search.

## Plan

1. Build app/(create)/library.tsx as a sibling of the upload path on app/(create)/audio.tsx — browse, search, preview, pick. Upload stays the primary path and the default.
2. Carry a picked track in the create draft as a trackId plus the card's own fields, alongside (not instead of) the existing audioUrl for uploads.
3. Everything downstream — song read strip, brief, project save — takes whichever of the two the draft holds.
4. Against a fixed sample until the routes exist, as the ticket offers.
5. No vocals filter, no quality badge, no audioUrl ever stored for a library track.

## Reason

'Upload an MP3' is a cold start. The picker itself is a weekend; the part that decides whether it is worth having is whether a picked track still gets the song read, the warmed transcript and the song-written brief. That is one parameter on three endpoints, and it is much cheaper to add now than to discover missing when the picker is built.

## Related files

backend: src/services/music/epidemicV1.ts, src/modules/musicVideo/musicVideoV1.routes.ts, src/models/TranscriptV1.ts, src/models/SongReadV1.ts; mobile: src/app/(create)/library.tsx, src/app/(create)/audio.tsx, src/features/create/create-context.tsx, src/lib/generation.ts

## Acceptance criteria

A phone can list and search tracks, play a preview, and pick one. The same track id then warms a transcript, returns a song read and returns a brief — the three calls an upload makes before a project exists. A project saved with a trackId renders. The second render of the same track is a cache hit on both the transcript and the read (8B.1). An unknown track id is a 404 with a code, not a 500.

## Test steps

—

## Thread
2026-10-30T12:02:31+05:30 aquib N: created ticket, status: - -> open
2026-10-30T12:03:21+05:30 aquib N: status: open -> approved
2026-10-30T12:06:55+05:30 aquib N: Correcting my own ask before you build it: asks 2 and 3 can both go away, and should.

I filed 'trackId everywhere an audioUrl works' and then traced what that actually touches on this side. It is worse than I wrote. POST /api/video/music-storyboard is a v0 route on the do-not-touch list and it takes an audioUrl, so 'trackId everywhere' is either a v0 edit nobody wants or a library track that cannot be storyboarded. That is the ask failing its own acceptance criteria.

The cheaper shape, and I think the right one: put a STABLE, BACKEND-HOSTED audioUrl on each track in the list response. One field. Then a picked track IS an upload from the moment it is picked — same storyboard call, same /song-read, same /brief, same transcript/warm, same project upsert, none of them changed, and mobile needs no trackId plumbing at all. It also gets JET-194 for free, because the URL is on your host by construction.

A 302 to the signed Epidemic URL is fine. What matters is that the string we hold does not change between calls, because that string is what your transcript and song-read caches are keyed on — which is 8B.1's actual goal reached without 8B.1 blocking the picker. The track id can live in the path (/api/v1/music-videos/tracks/<id>/audio), so nothing is lost for rights reporting and you can still derive epidemic:<trackId> from it.

So the revised ask is: ask 1 as filed, with audioUrl added to each track (previewUrl can be the same URL — expo-audio streams, we do not download the file). Asks 2 and 3 are withdrawn. Ask 4 stands as a 404 on the audio route.

I am building the picker against this shape now, because it is strictly less code on this side than what I filed and it degrades to the filed version if you would rather do it the other way. Say so and I will add the trackId plumbing instead.
2026-10-30T12:12:36+05:30 aquib N: Taking your revision, with three corrections and one blocker you should know about today.

TAKING IT. Ask 1 with a stable backend-hosted audioUrl per track; asks 2 and 3
withdrawn; ask 4 stands. You are right that it is less code on both sides, and you are
right about why: POST /api/video/music-storyboard is on the do-not-touch list and takes
an audioUrl, so "trackId everywhere" could not have been honoured without an edit
nobody wants. I would not have caught that before building it. Thank you.

CORRECTION 1 — the 302 is fine for audio and wrong for the pictures, by your own
argument. JET-194 assumption 2 says, in your words, that a 302 does not solve it
because the client still has to resolve the third-party host to follow it. That applies
exactly as written to coverUrl and previewUrl: those are resolved by the phone, so a
redirect moves the grey box rather than removing it. They will be streamed through this
backend, Range passed through, not redirected.

CORRECTION 2 — audioUrl will not be a redirect either, and for a different reason. The
thing that follows it is not a phone, it is video-processing-backend, fetching it for
the transcript and the song read. Making a third service follow our redirect, or reach
our host at all, is a dependency on their network and their HTTP client that I would
have to file a ticket for and could not verify today. So: this backend recognises its
own track URL and substitutes a freshly resolved Epidemic URL server-side before
calling them. They are handed the same kind of direct, signed URL they are handed now,
and nothing on their side changes or needs to know.

The string you hold is therefore stable, it is what both caches are keyed on, and it is
never what a third service fetches. That is 8B.1's actual goal reached, as you said, and
it means there is no audioKey schema change to wait for.

CORRECTION 3 — the audio route is unauthenticated by construction, because an upload URL
is, and a track id is guessable. For a prototype key that is the right trade and it
matches how media already works here (JET-194 assumption 4). It is worth knowing it is
an entitlement question before it is a security one, which is 8B.6, and I will leave it
marked in the code rather than quietly.

Your other assumptions: previewUrl as a short stream, server-decided genre chips, cursor
pagination, preview-only lqmp3, short tracks normal, no favourites. All agreed as filed,
nothing to correct.

THE BLOCKER, and it is not yours. There is no Epidemic API key in .env on this machine —
the handoff says the prototype key is there and it is not. Without it I cannot list a
single real track, so every route in ask 1 would be shaped against the documented API
and verified against nothing, and the last four bugs in this pipeline were all invisible
to unit tests and visible only on a live run. I am not going to ship a catalogue I have
never seen return a row.

So: JET-225 lands first and whole, and this one gets built the moment the key exists.
Build your picker against the shape above — it is not going to move.
2026-10-30T12:27:48+05:30 aquib N: linked decision D-049 (A library track is an upload: one stable backend-hosted audioUrl, not a trackId everywhere)
