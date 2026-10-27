---
id: JET-206
title: Song structure and beat map from the audio and the transcript
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: approved
created: 2026-10-27T13:44:14+05:30
updated: 2026-10-27T13:47:32+05:30
decisions: 
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

—

## Thread
2026-10-27T13:44:14+05:30 aquib N: created ticket, status: - -> open
2026-10-27T13:47:32+05:30 aquib N: status: open -> approved
