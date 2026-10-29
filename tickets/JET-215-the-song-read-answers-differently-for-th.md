---
id: JET-215
title: The song read answers differently for the same bytes, and one section covers most of the song
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-10-29T12:30:42+05:30
updated: 2026-10-29T12:30:42+05:30
decisions: 
---

## Request

Two things about /api/v1/song-read, both measured on real tracks today. First: the same audio read twice gives different sections. Second: on both songs we have read, one or two spans cover 73-78% of the track, which leaves almost nothing for anything downstream to work with. We are not asking for better LABELS — JET-206 said those are a guess and we believed you. We are asking for boundaries that are stable for a given input and that subdivide a long span.

## Understanding

Batch 7 of the render plan landed today and a full 4:16 render is running on it. The treatment, the look bible and the shot list all key off the read's sections, so what the read says is now the shape of the video rather than just the shape of the cuts. That is what surfaced this.

THE EVIDENCE, from our side.

1. NON-DETERMINISM ON IDENTICAL BYTES. The Weeknd - Timeless, 3260751 bytes, sha256 b9bac21478f9ceab, uploaded repeatedly from the same local file (we verified every copy on disk is byte-identical).
   read on 27 Oct:  intro 0.0-10.0 · chorus 10.0-34.0 · verse 34.0-234.9 · chorus 234.9-237.9 · outro 237.9-256.0
   read on 29 Oct:  intro 0.0-7.0  · verse  7.0-34.0  · verse 34.0-231.9 · verse  231.9-240.9 · outro 240.9-256.0
   Three boundaries moved by 3 seconds and every chorus became a verse. Both answers are in our SongReadV1 store, keyed on the two upload URLs; we can hand you both documents.
   Your cache is 24h on the bytes, so this is not a cache bug — it is what a cold read of the same file returns two days apart. It matters because a re-render of an unchanged song is supposed to be free and reproducible, and today it is neither: the same song renders as a different video.

2. ONE SPAN SWALLOWS THE SONG. Not a one-off — it is both tracks we have read.
   Timeless (256.0s): verse 34.0-234.9 is 200.9s, 78% of the song in one section.
   akcent - stay with me (247.8s): chorus 30.6-122.5 (91.9s) and chorus 122.5-210.6 (88.1s), 73% in two.
   There is material to subdivide with: the Timeless 'verse' carries 73 transcript lines, and the line 'she just wanna roll and i dont mind it' appears twice inside it. Our own hook detector found that repetition in the lines you returned, so the signal is in data you already hold.

WHAT IT COSTS US, concretely, so you can judge whether this is worth your time:
 - 33 of our 44 clips fell inside that one 200.9s section. Our shot-size progression runs wide-to-close across a section, which is right for 2-8 clips and produces six identical medium-wides in a row across 33.
 - Our look bible gives one location per section LABEL, deliberately, so that chorus 2 is the same place as chorus 1. With three sections all labelled 'verse', 78% of the video is one location.
 - Our lyric-to-image rule goes disjunctive at the bridge. No bridge was returned on either song, so that rule has never once fired.

ASSUMPTIONS, which we would rather be corrected on than have you build around:
 - We assume the non-determinism is in the segmentation and not in Whisper, because the boundaries moved as well as the labels. If the transcript itself differs run to run, that is the more interesting bug and we would like to know.
 - We assume you would rather make the existing detector stable and finer-grained than add a new dependency. If the honest answer is that this needs a trained structure model, say so on the ticket — we would rather hear it than get a tuned heuristic that moves again.
 - We assume boundaries still snap to downbeats; nothing we do works if they do not.
 - We are NOT asking for perfect labels. A boundary in the wrong place costs a cut in the wrong place; a wrong label now also costs a location, which is new since JET-206, but it is still the cheaper of the two errors.

## Plan

1. File this and keep rendering. Batch 7 already degrades to the storyboard when the read is thin, so nothing of ours is blocked.
2. Meanwhile, cap our own shot-size progression so a long section re-establishes periodically instead of holding one size for ten shots. That is our bug, not yours, and it is the half of the flatness we can fix without you.
3. Stop keying location on the section label alone once boundaries are stable — until then, a repeated label is as likely to be a mislabel as a real reprise.
4. Re-read both tracks when this lands and compare against the two stored reads above, which we will keep.

## Reason

Everything Batch 7 added reads sections as input, so the read is no longer only deciding where the cuts go — it is deciding how many places the video has and whether the chorus is allowed to look like a chorus. The reproducibility half matters on its own: a user who re-renders an unchanged song should get the same video, and right now they do not.

## Related files

video-processing-backend: app/services/song_read.py. Ours, for context: src/services/render/cutPlanV1.ts, lookBibleV1.ts, shotListV1.ts

## Acceptance criteria

Reading the same audio bytes twice, two days apart with the cache cold, returns identical sections. No single section covers more than about a third of a track on either of the two songs named above. A section carrying 73 transcript lines with a line repeated inside it is subdivided rather than returned whole. Boundaries still land on values that appear in downbeats, and an instrumental still answers as it does today.

## Test steps

—

## Thread
2026-10-29T12:30:42+05:30 aquib N: created ticket, status: - -> open
