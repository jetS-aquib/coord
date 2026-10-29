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
  "cached": false,
  "read_version": "2"
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

**No sung section covers more than about a third of the track** (JET-215).
Instrumental gaps alone do not find every boundary: a chorus that runs
straight out of the verse before it leaves no silence anywhere, so a
continuously sung passage used to arrive as one section covering 78% of a
song. A block that long is now cut at a line that is sung twice inside it —
the same repetition the labels are read from, read *within* a block — and
failing that at its longest breath. Pieces are never cut below 8 seconds, so
"about a third" is a target and not a guarantee: a passage with nowhere left
to cut stays whole rather than being chopped into unusable slivers. An
`intro` or `outro` carries no lines and is never subdivided.

`label` is one of `intro`, `verse`, `pre-chorus`, `chorus`, `bridge`, `outro`,
and **is a guess**. Read the boundaries as much more reliable than the names:
they come from instrumental gaps and the bar grid, the labels come from lyric
repetition. The chorus is the block of words that comes back; a short block
leading into one is a pre-chorus; a block that appears once after the second
chorus and before the last is a bridge. A song whose shape is
verse/chorus/verse/chorus is reported with no bridge rather than a guessed
one.

## `read_version` tells you a read you stored has gone off

`read_version` is which version of the analysis produced this answer. Store it
beside any read you keep, and compare it for **equality** with the one on the
next read of the same song: a different value means the sections in front of
you were produced by different code, and anything you derived from them — a
cut plan, a shot list, a look bible — was derived from something else.

Nothing more is promised about the string. It is not monotonic, not semver,
not ordered, and two values being different tells you nothing about which is
newer. Compare, do not sort.

It is deliberately **not** the whole cache key. The key here is
`READ_VERSION + app_version`, and `app_version` moves on every release, so a
caller comparing that would see a mismatch on every deploy — noise that
teaches people to ignore the one line that matters. `read_version` moves when
the analysis moves.

A cached response carries the same value as a fresh one, by construction
rather than by convention: `READ_VERSION` is part of the cache key, so an
entry can only ever have been written by the version answering now. It was
`"1"` for JET-206 and is `"2"` since JET-215 reshaped sectioning. Added for
JET-219, D-038; a caller that ignores the field is unaffected.

**The transcript endpoint has no equivalent and deliberately so.** Its cache
key is the whole transcription configuration, including `app_version`, so the
only honest value to return would change on every deploy and cry wolf. D-038
also leaves `TranscriptV1` unversioned on purpose. The day that store carries
a generation is the day this is worth adding, and it is one line then.

## The same bytes give the same read

Byte-identical audio returns byte-identical sections, cache or no cache
(JET-215). It did not before: the transcript is decoded by Whisper, and
with `WHISPER_TEMPERATURE_FALLBACK` on a window that failed a confidence or
repetition check was re-decoded by *sampling*, which CTranslate2 seeds from
the system random device and will not let you re-seed. So the words came
back slightly different between runs, and both the block boundaries and the
labels are read from the words. That is why a chorus became a verse: the two
decodes of it were no longer similar enough to be recognised as the same
block sung again.

The fallback is off by default now, so decoding is beam search only and
reproducible. The analysis itself — tempo, bars, energy, blocking,
subdivision, labelling — was always deterministic, and is unchanged. See
D-035.

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
