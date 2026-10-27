---
owner: video-processing-backend
status: active
---

# /api/v1/song-read

Written for JET-206, so the planner can cut to the song instead of to the
video model's clip length. These are the shapes — you should not have to read
the Python to call them.

The planner today knows exactly one thing about a track: its duration in
seconds. This answers the other question — what the song is *doing* — so a
scene can be a section and a clip can be a whole number of bars.

It is here rather than in the Node backend because the DSP belongs where
ffmpeg and the audio already are, and because this service already holds the
transcript (JET-201, D-021): sections come from lyric repetition plus
instrumental gaps, which costs nothing extra when the song was warmed at
render start.

**Synchronous**, like the transcription and frame endpoints: one of these per
song, fired early. The analysis itself is a few seconds; the expensive half is
the transcript, and that is usually already made.

Requires `X-Service-Assertion`, minted exactly as for stitching
(`iss: jetkreate-creator-api`, `aud: video-service`, HS256, `exp - iat` ≤ 60s,
`jti` single-use for ten minutes). The body is `extra="forbid"`.

## `POST /api/v1/song-read`

```jsonc
// request
{ "audioUrl": "https://…/song.mp3", "language": "auto" }   // or "hi", "en", …

// 200
{
  "duration_seconds": 211.4,
  "bpm": 92.01,
  "beats_per_bar": 4,
  "downbeats": [0.42, 3.03, 5.64, 8.25, …],   // seconds
  "energy": [0.31, 0.34, 0.88, …],            // one per bar, 0..1
  "language": "hi",
  "sections": [
    { "label": "intro",  "start": 0.0,  "end": 10.86, "lines": [] },
    { "label": "verse",  "start": 10.86, "end": 34.0,
      "lines": [ { "start": 11.2, "end": 14.8, "text": "…" }, … ] },
    { "label": "chorus", "start": 34.0, "end": 55.7, "lines": [ … ] }
  ],
  "cached": false
}
```

`language` should be the same value you send to `lyric-transcription` and to
the stitch. A different language is a different transcript, and a different
transcript is different sections.

## What each field is worth

**`bpm`** — one tempo for the whole song. Measured to within about 0.05 BPM on
a steady track, which over three minutes is under a fifth of a beat of drift.
There is no tempo-drift detection: a song that changes tempo halfway gets a
grid that is right for one half. See D-028.

**`downbeats`** — absolute times in seconds, not bar indices to reconstruct.
4/4 is assumed, and the bar phase is measured rather than taken as zero, so a
downbeat is the beat the bar actually starts on.

**`energy`** — coarse RMS per bar, scaled 0..1 against the song's own 95th
percentile. `energy[i]` is the bar starting at `downbeats[i]`, so there is one
fewer energy value than downbeat. It exists to tell a chorus from a verse. It
is not a loudness standard and should not be compared between songs.

**`sections`** — spans covering the whole song with no holes: each one ends
where the next begins, the first starts at 0 and the last ends at the
duration. **Every boundary is snapped to a downbeat**, which is the point — a
section boundary that is not on a downbeat is a scene change you cannot cut
to.

`label` is one of `intro`, `verse`, `pre-chorus`, `chorus`, `bridge`, `outro`,
and **is a guess**. Read the boundaries as much more reliable than the names:
they come from instrumental gaps and the bar grid, the labels come from lyric
repetition. The chorus is the block of words that comes back; a short block
leading into one is a pre-chorus; a block that appears once after the second
chorus and before the last is a bridge. A song whose shape is
verse/chorus/verse/chorus is reported with no bridge rather than a guessed
one.

## An instrumental still answers

A track with no words, or one whose transcription failed, comes back with
`sections: []` and `language: "unknown"`, and with `bpm`, `downbeats` and
`energy` filled in as normal. Fall back to duration-based packing for the
structure and keep the grid. The call does not fail.

## Cached on the audio's bytes

Same rule as the transcript (D-021), and for the same reason: your URLs are
signed, so the same song re-signed an hour later is a different string and
would miss a URL-keyed cache every time. A re-render of unchanged audio is
free, an edited song is correctly a miss, and regenerating a plan costs
nothing. Entries live 24 hours and the most recent 64 are kept.

The key also carries a version of this analysis, so a release that changes
what a read says cannot serve one made the old way.

## Errors

| status | when |
|---|---|
| 401 | no assertion, or an invalid, expired or replayed one |
| 422 | a field not defined here, or audio that is not readable or is under a second long |
| 502 | the `audioUrl` could not be fetched |
| 500 | the analysis itself failed |

## Notes

This says what the song is doing and nothing about the video. Where the cuts
go is `cutPlanV1` in music-jetkreate-backend; a scene is a section, a clip is
1–4 bars chosen by the energy curve and snapped to a downbeat.
