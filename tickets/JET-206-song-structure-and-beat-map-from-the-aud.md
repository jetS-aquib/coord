---
id: JET-206
title: Song structure and beat map from the audio and the transcript
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: done
created: 2026-10-27T13:44:14+05:30
updated: 2026-10-27T16:46:30+05:30
decisions: D-028, D-031
closed: 2026-10-27
---

## Request

A synchronous endpoint that reads a song and returns its musical structure: sections (intro/verse/pre-chorus/chorus/bridge/outro) with start and end times, BPM and the downbeat times, a coarse energy value per bar, and the detected language. Same auth and body rules as the existing endpoints (X-Service-Assertion, extra=forbid).

## Understanding

The v1 planner currently knows exactly one thing about a track: its duration in seconds. generateMusicStoryboard takes a lyrics argument and mobile never sends it, and targetSceneCount is ceil(duration / model max duration), so cuts land on a ten-second model grid and physically cannot land on a downbeat or a section change. Batch 6 of the render plan fixes that by deriving scenes from song structure instead of model duration, and this endpoint is the input it needs.

We are asking video-processing-backend rather than doing it in Node because the DSP belongs where ffmpeg and the audio already are, and because this service already holds the transcript: POST /api/v1/lyric-transcription (JET-201, D-021) caches on the audio's bytes, so by the time we call this the transcript for the same song is usually already made and sections can come from lyric repetition plus instrumental gaps rather than from audio alone.

Assumptions we are making, and would rather be corrected on than have you build around:
- Synchronous, like the frame endpoints and like lyric-transcription — one call per song, fired early, no job id and no poll. If the analysis turns out to cost more than a few seconds warm, a 202 job is fine and we will poll.
- Cached on the audio's bytes under the same rule as the transcript, so a re-render of an unchanged song is free and an edited song is correctly a miss.
- Section labels are a best guess and we will treat them as such. Getting the boundaries right matters much more to us than getting the names right: a mislabelled chorus costs us a wrong prompt, a boundary in the wrong place costs us a cut in the wrong place.
- Energy is coarse and per bar — something monotonic enough to compare a verse against a chorus. We do not need a loudness standard.
- Downbeats as absolute times in seconds, not bar indices we have to reconstruct. Constant-tempo assumption is acceptable for the pop we render; if the track drifts, we would rather have the times you measured than a grid you extrapolated.
- A song with no transcript (instrumental, or transcription failed) should still answer with BPM, downbeats and energy, with sections empty or a single span, rather than failing. We will fall back to the current duration-based packing when sections are absent.
- This adds a dependency for beat tracking that the service does not have today (numpy is there, librosa is not). If that is unwelcome, say so on the ticket — we would rather hear it now than see it decided silently.

We are not asking you to decide where the cuts go. Cut planning stays in music-jetkreate-backend (render/cutPlanV1.ts); this endpoint answers what the song is doing and nothing about the video.

## Plan

1. File this and wait. Nothing in Batch 6 that depends on a beat map is started before it is approved.
2. Meanwhile build SongReadV1 (models/SongReadV1.ts) against a hand-made fixture in this response shape — derived and disposable, same contract as RenderPlanV1, regenerable from the audio and never authored.
3. When the endpoint lands, call it from startRenderV1 alongside the existing unawaited lyric-transcription call, and persist the result as the SongRead on the project.
4. cutPlanV1.ts consumes sections + downbeats + energy: a scene is a section, a clip is 1-4 bars by energy snapped to the downbeat, with a deliberate hold through the hook.
5. Fall back to today's ceil(duration / maxDuration) packing whenever the song read is absent or sections are empty, so a failure here costs the musical cutting and never the render.
6. Record the planner change as a decision once 6.4 lands: scenes derive from song structure, not from model duration.

## Reason

Everything in Batch 6 and most of Batches 7 and 8 reads sections and bars as input. The shot list generator takes them directly, so writing it against the ten-second grid means writing it twice. This is the long pole of the batch and video-processing-backend is idle, which is why it is filed first.

## Related files

new: app/services/song_read.py; app/api/v1/router.py; app/schemas/; new contract in .coord/contracts/; consumers: music-jetkreate-backend render/cutPlanV1.ts, models/SongReadV1.ts

## Acceptance criteria

Calling the endpoint with a 4-minute pop track returns a BPM within a beat or two of the real tempo, downbeat times that line up with the track when played against it, sections whose boundaries land on real section changes, and a per-bar energy curve where the chorus bars read higher than the verse bars. An instrumental track still answers with BPM, downbeats and energy. A second call on the same audio bytes is served from cache. A call for a song whose transcript already exists does not re-run Whisper.

## Test steps

1. **The suite.** From video-processing-backend:
   `docker run --rm -v "$PWD":/src -w /src video-processing-backend-video-api sh -c "pip install -q pytest pymongo; python -m pytest tests/test_song_read.py -q"`
   17 tests. The tempo ones build their own click track with ffmpeg at a known
   BPM, so there is no audio fixture and the answer is known exactly.

2. **A real song.** POST `/api/v1/song-read` with `{"audioUrl": "...", "language": "auto"}`
   and a signed `X-Service-Assertion`, for a track whose tempo you know.
   `bpm` should be within a beat or two of the real one.

3. **The downbeats line up.** Play the track and tap along; the values in
   `downbeats` should land where you tap, and the spacing should be
   `4 * 60 / bpm` seconds throughout. If the grid is right at the start and
   wrong by the end, the tempo is slightly off — that is the failure to
   report, not a wrong-looking individual value.

4. **The sections are in the right places.** Check the boundaries first and
   the labels second. Every `start` and `end` should be a value that also
   appears in `downbeats`, sections should cover the whole song with no gaps,
   and a boundary should land where the song actually changes. The `label` is
   a guess and is documented as one.

5. **The chorus reads louder.** `energy[i]` is the bar starting at
   `downbeats[i]`. The bars inside a chorus section should read higher than
   the bars inside a verse.

6. **An instrumental still answers.** Same call with a track that has no
   vocals: expect `200`, `sections: []`, `language: "unknown"`, and `bpm`,
   `downbeats` and `energy` filled in as normal.

7. **It is cached, and Whisper does not run twice.** Call it twice for the
   same audio: the second returns `cached: true` and comes back in well under
   a second. Calling it for a song whose transcript was already warmed by
   `/api/v1/lyric-transcription` should not re-run Whisper — watch the log.

8. **No image rebuild needed.** `requirements.txt` is unchanged (D-028), so
   this deploys without `--build`.

## Thread
2026-10-27T13:44:14+05:30 aquib N: created ticket, status: - -> open
2026-10-27T13:47:32+05:30 aquib N: status: open -> approved
2026-10-27T15:22:51+05:30 aquib N: linked decision D-028 (Beat tracking is numpy and ffmpeg, not librosa)
2026-10-27T15:23:10+05:30 aquib N: status: approved -> in_progress
2026-10-27T15:23:26+05:30 aquib N: status: in_progress -> review — Shipped as POST /api/v1/song-read. Contract is contracts/video-song-read.md; the dependency question you raised is settled and recorded as D-028.

ON YOUR ASSUMPTIONS, in your order.

Synchronous, as you asked — the analysis is a few seconds, and the expensive half is the transcript, which is usually already made. Cached on the audio bytes under the same rule as the transcript, so regenerating a plan costs nothing. The key also carries a version of the analysis itself, so a release that changes what a read says cannot serve one made the old way.

Sections and labels: you said boundaries matter more than names, and we built to that. Boundaries come from instrumental gaps and are snapped to a downbeat; labels come from lyric repetition. The contract says plainly that the labels are the less reliable half. One thing you did not ask for but should know: a song shaped verse/chorus/verse/chorus comes back with NO bridge rather than a guessed one. A bridge is only claimed for a block appearing once after the second chorus and before the last. Calling verse 2 a bridge would hand you a deliberate break at the exact point the song is repeating itself, which is worse than no bridge at all.

Energy is coarse RMS per bar, 0..1 against the song own 95th percentile. energy[i] is the bar starting at downbeats[i], so there is one fewer energy value than downbeat.

Downbeats are absolute seconds. 4/4 assumed; the bar PHASE inside it is measured rather than taken as zero, so a downbeat is the beat the bar actually starts on.

Instrumental: answers with sections empty, language unknown, and bpm/downbeats/energy filled in. Does not fail.

THE DEPENDENCY, which you asked to be told about rather than have decided silently: no new dependency. numpy and the ffmpeg already on the box. librosa would have pulled scipy, numba and llvmlite into an image that already carries a 2.9 GB Whisper model, for one job on material you scoped to steady 4/4 pop. Measured accuracy on synthetic click tracks: within 0.05 BPM across 74 to 165 BPM, which over three minutes is under a fifth of a beat of drift. requirements.txt is unchanged, so this deploys with no --build.

One finding worth your time, because it would have bitten whoever did this next. The obvious implementation is wrong and quietly so: autocorrelation can only report a WHOLE number of frames, and at this hop lag 21 is 123.1 BPM while lag 22 is 117.5 — a real 120 BPM track can only come back as one or the other, both wrong by over 2 BPM, which walks the grid a full bar off the song across four minutes. Parabolic interpolation of the peak does not fix it either: the peak is one or two frames wide, so the parabola fits its shape rather than the period. What works is asking the song directly — of the periods near that one, which pulse train lands on the onsets. All of that is in D-028 so nobody re-derives it.

CEILING, named in the module header: one tempo for the whole song. No tempo-drift detection, no time-signature detection. A track that changes tempo halfway gets a grid right for one half. The upgrade is to add librosa and delete the middle third of the file, and the seams are already in the right places for that.

Not committed — the dev commits here.
2026-10-27T16:21:05+05:30 aquib N: status: review -> done
2026-10-27T16:46:30+05:30 aquib N: linked decision D-031 (Scenes and clip lengths derive from the song's structure, not from the model's maximum duration)
