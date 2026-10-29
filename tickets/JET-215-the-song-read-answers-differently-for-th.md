---
id: JET-215
title: The song read answers differently for the same bytes, and one section covers most of the song
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-10-29T12:30:42+05:30
updated: 2026-10-29T12:46:22+05:30
decisions: D-035, D-036
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

1. Nothing to configure. If your deployment sets WHISPER_TEMPERATURE_FALLBACK, unset it — the default is now false and that is what makes the read reproducible.
2. POST /api/v1/song-read with The Weeknd - Timeless (3260751 bytes, sha256 b9bac21478f9ceab). Compare against your stored 27 Oct and 29 Oct reads: the sections will match neither, which is the point. Keep this one.
3. Check the 200.9s span is gone: no section in the response should run longer than ~85s (a third of 256.0), and the former 34.0-234.9 'verse' should now be three or more sections. Every start and end should still appear in the `downbeats` array.
4. Wait for the 24h transcript and read caches to expire (or delete storage/transcripts and storage/song-reads), then POST the same audio again. The `sections` array must be identical to step 3 — same boundaries, same labels, field for field. That is the reproducibility half; `cached` will be false on both.
5. Repeat 2-4 for akcent - stay with me (247.8s). The two 90s choruses should each be under ~83s, and more of them.
6. An instrumental is unchanged: POST a track with no vocals and confirm `sections: []`, `language: "unknown"`, and `bpm`/`downbeats`/`energy` still filled in.

## Thread
2026-10-29T12:30:42+05:30 aquib N: created ticket, status: - -> open
2026-10-29T12:33:35+05:30 aquib N: status: open -> approved
2026-10-29T12:39:19+05:30 aquib N: Read app/services/song_read.py before standup and found the cause of both halves. One assumption in the Understanding above is WRONG and I would rather correct it than have you chase it: I guessed the non-determinism was in the segmentation rather than in Whisper. It is almost certainly Whisper.

Sections do not look at the audio at all. _blocks() splits the TRANSCRIPT wherever there is an instrumental gap >= INSTRUMENTAL_GAP_SECONDS (3.5s), and label_blocks() then groups those blocks by difflib.SequenceMatcher ratio >= REPEAT_SIMILARITY (0.80); the group that recurs most becomes the chorus and everything else is positional reasoning around it. So:

- THE 200.9s SECTION is the 3.5s gap rule meeting a track with continuous vocals. Timeless has no 3.5s hole through its middle, so the whole middle is ONE block and therefore one section carrying 73 lines. The repeated hook line sits INSIDE that single block, and since grouping is between blocks, the one signal that would have found the chorus is invisible to it. Same shape on akcent - stay with me.
- THE FLIP FROM chorus TO verse is Whisper variance crossing the 0.80 line. We have it in our own data: the same line came back as 'Exotanic all over her body' one time and 'XO Tati, fall over her body' another, in the same pass. Two runs that disagree like that score differently against 0.80, and the chorus group collapses to singletons, which is exactly the 27 Oct vs 29 Oct difference.

So the ask is narrower than the Understanding makes it sound, and cheaper. Neither half needs a structure model or a new dependency:
  (a) subdivide a block that is long, rather than only splitting on silence. A 200s block with 73 lines wants splitting on repetition inside itself.
  (b) make the grouping robust to transcription noise, or pin the transcript so the same bytes reuse the same words. If the transcript were stable the labels would be too, and you already cache it on the bytes - a longer-lived transcript may fix the reproducibility half on its own.

The beat side is not in question: tempo, downbeats and bar energy all looked right on both songs, and the phase measurement is doing its job.
2026-10-29T12:41:37+05:30 aquib N: linked decision D-035 (Beam search only: a reproducible transcript beats a second look at a bad window)
2026-10-29T12:42:10+05:30 aquib N: linked decision D-036 (Subdivide a long block on its own lyric repetition, not with a structure model)
2026-10-29T12:42:10+05:30 aquib N: Not segmentation -- Whisper. Your assumption 1 is the wrong half, and the 'more interesting bug' is the one you have. The transcript differs run to run: WHISPER_TEMPERATURE_FALLBACK re-decodes a window that fails a confidence or repetition check at temperature 0.2-1.0, and every decode above 0 is a random sample. CTranslate2 seeds that sampler per thread from the system random device and only lets you set a global that a thread reads once, at its first sample, so a warm worker cannot be re-seeded. There is no seed to set. Sung lyrics trip the repetition check constantly, which is why the choruses in particular moved and why 'every chorus became a verse': the two decodes were no longer similar enough for the labeller to recognise the same block sung again. The boundaries moved with them because the blocks are cut at the gaps between transcript lines. Fallback is now off by default -- beam search only, deterministic (D-035). The DSP was never the problem: tempo, bars, energy and the labelling are pure numpy and gave you the same answer both times. Cost of the fix, so you have it: a window Whisper decodes badly is kept rather than re-rolled. On the subdivision you were right to assume we would not reach for a trained model (D-036): the line you found repeated twice inside that 200.9s verse is the whole signal, and label_blocks already reads that same repetition between blocks -- it just never looked inside one. Downbeat snapping is untouched; splits only ever land on a line start, which then snaps as before.
2026-10-29T12:43:29+05:30 aquib N: On your (b) — pinning the transcript with a longer TTL does not get there, and I would rather say so than let you find out in a month. The cache keys on the bytes, so a longer TTL makes a re-render inside the window free, which it already was; your own done-when is two days apart with the cache COLD, and the first cold read after any eviction, deploy or settings change would still roll the dice. Making the 0.80 grouping noise-tolerant has the same shape of problem: it would stabilise the labels while the block boundaries, which are cut at the gaps between transcript lines, keep moving underneath. The words had to stop moving. They have.
2026-10-29T12:46:22+05:30 aquib N: status: approved -> in_progress
2026-10-29T12:46:22+05:30 aquib N: status: in_progress -> review — Built. Determinism came from making Whisper stop sampling (D-035); subdivision from reading your repeated hook inside a block instead of only between blocks (D-036). Test steps are on the ticket — step 4 is the one that matters: cold cache, same bytes, identical sections.
2026-10-29T17:41:22+05:30 aquib N: One more cost, from Batch 7B which landed after this was filed. The frame gate now reads every anchor still against that shot's stated location before the clip is paid for — it is the main defence against a hallucinated frame being animated faithfully and then scored as a perfect seam. On both recent renders the read returned exactly two distinct section labels (verse, outro), so the look bible holds two locations for 45 clips and all 45 frames are checked against one of two places. The check still catches a frame that went somewhere else entirely, but it cannot catch the thing it was built for: a shot that drifted to a different room inside what should have been several distinct sections. Finer, stable boundaries would make that check real. Nothing is blocked — the gate degrades to the clip's own storyboard environment where the bible says nothing, and skips entirely where nothing is stated.
