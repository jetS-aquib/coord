---
id: JET-240
title: Send lyricEngine on the song's four calls, so Gemini is a choice you make rather than one a deployment makes for everybody
from: video-processing-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-03T15:17:53+05:30
updated: 2026-11-03T15:27:20+05:30
decisions: D-063
---

## Request

Add an env flag on your side (LYRIC_ENGINE, same shape as your STITCH_API_VERSION) and send its value as lyricEngine on all four calls for a song: lyricTranscription(), songRead(), the clip-stitching-with-lyrics stitch, and segment-concat if you are on segments. Absent means whisper, so doing nothing keeps today's behaviour exactly.

## Understanding

You are the flow that wanted Gemini (D-059). It is live here and it works, but until now the engine was LYRIC_ENGINE on our deployment, which answers for every caller at once - including creater-ai-backend, which calls /api/v1/clip-stitching-with-lyrics and has never heard of engines. So we could not turn Gemini on for you without turning it on for them. D-061 moves the choice into the request: optional lyricEngine on v1 and v2 alike, absent is whisper, a bad value is a 422. Assumptions I am making, correct me if wrong: (1) you want this per deployment rather than per user or per song, so one env flag is enough and nothing needs to reach the phone; (2) you are the only caller that wants Gemini, and creater-ai-backend should keep Whisper; (3) you call songRead() and lyricTranscription() for the same song you then stitch, so all four need the same value.

## Plan

1. Read .coord/contracts/video-transcription.md, the 'Which engine transcribes - you say, not the deployment' section. 2. Add a module-level flag in video-api.service.ts beside STITCH_API_VERSION: const LYRIC_ENGINE = process.env.LYRIC_ENGINE === 'gemini' ? 'gemini' : undefined. 3. Pass it as lyricEngine on lyricTranscription() (~line 716), songRead() (~line 739), the clip-stitching-with-lyrics body (~line 464) and the segment-concat body if you use it. Omit the key entirely when it is undefined - the bodies are extra=forbid, and null is not whisper. 4. Log the engine once per render beside stitchApiVersionV1(), so a render whose captions read wrong is attributable. 5. Deploy with it unset first and confirm nothing moved, then set it to gemini.

## Reason

The engine has to be the same on all four calls or it is not an error - it is a cache miss. The transcript cache and the song-read cache are both keyed on it now, so a mismatch transcribes the song twice: 200s of Whisper that the JET-201 warm-up was supposed to have saved, plus a full Gemini run, and sections read off different words than the captions are burnt from.

## Related files

src/modules/video/video-api.service.ts

## Acceptance criteria

With LYRIC_ENGINE unset, every request body is byte-identical to today's and no 422s appear. With it set to gemini, all four calls carry lyricEngine: 'gemini', a lyrics render completes, and the job state for that render reports lyric_engine: gemini. creater-ai-backend is untouched and still gets Whisper.

## Test steps

—

## Thread
2026-11-03T15:17:53+05:30 aquib N: created ticket, status: - -> open
2026-11-03T15:23:03+05:30 aquib N: status: open -> approved
2026-11-03T15:27:20+05:30 aquib N: linked decision D-063 (Our song-read cache keys on the lyric engine, rather than bumping its generation)
2026-11-03T15:27:38+05:30 aquib N: Built, not committed. LYRIC_ENGINE added beside STITCH_API_VERSION in video-api.service.ts; only the exact string 'gemini' switches, and unset omits the key entirely on all four calls (clip-stitching-with-lyrics, lyric-transcription, song-read, segment-concat — we do use segment-concat, on any song with 2+ segments). The engine goes in after the caption spread on both stitch bodies, same reason as outputFrame: a caller does not get to pick it. Render log line now reads 'stitching via /api/v1, gemini lyrics — N clips'.

One thing beyond the plan, because the WHY is exactly the bug it causes: our OWN SongReadV1 cache is keyed on audioUrl + SONG_READ_CACHE_V1 and did not know about the engine, so flipping the flag would have served Whisper sections against Gemini captions. The row now stores lyricEngine and songReadIsFreshV1 compares it — '' both for old rows and an unset flag, so this re-reads nothing on deploy. D-063.

Nothing reports lyric_engine in job state: there is no precedent for it there (stitchApiVersionV1 is log-only too), so I left the log line as the record. Say the word if you want it on the job.

Checks: src/modules/video/lyricEngine.test.ts (4 cases — unset sends no key, gemini carries on all four, typos do not switch, concat body cannot override) plus a songReadIsFreshV1 case in renderV1.test.ts. 64 tests pass. Three pre-existing tsc errors in renderOrchestratorV1 around segmentStitch (OutputFrameV1 passed where a boolean is expected, JET-232/237 leftover) are unrelated and were there before this change.
