---
id: D-030
title: The lyrics are stored here, keyed on the audio URL, and fill MusicVideo.lyrics when a project exists
date: 2026-10-27
status: active
superseded_by: 
repos: music-jetkreate-backend, video-processing-backend
tickets: JET-211, JET-208
---

## Context

JET-211 put the transcript text on the lyric-transcription response. The transcription is fired when the audio finishes uploading (JET-208), minutes before a project exists, so there is nothing to attach it to at the moment it is made. video-processing-backend's own copy is a cache by design — a JSON file per audio digest, 24 hours, 64 entries — and their contract says plainly it is not our store. MusicVideo.lyrics has been in our schema from the start and is only ever written from a create payload no client sends, so autoGenerateCast has always been handed an empty string.

## Options considered

1. Hang it on the project: needs a project at upload time, which is exactly what JET-208 removed. 2. Re-fetch from their endpoint whenever we want the words: free on a cache hit, a second Whisper run a day later, and nothing to read if their container has restarted. 3. Our own collection keyed on the audio, written when the transcription answers, copied onto the project when one appears. 4. No store: keep passing the empty string.

## Decision

Option 3. TranscriptV1 { audioUrl unique, language, text, words, segments, durationSeconds }, upserted from the .then of the warm call. At plan time fillLyricsV1 copies the text onto MusicVideo.lyrics when the project has none of its own, and returns it for the cast generator to use in the same run.

## Reason

Keyed on audioUrl rather than on the audio's bytes because that key is only forced on video-processing-backend by the signed URLs they are handed; ours are permanent bucket URLs written once, so the URL is a stable identity and we do not have to read the song to compute a key for it. Anything the user typed themselves wins — this only fills a gap, never overwrites. A failed write is a warning, never a failed render: the whole chain hangs off a promise nothing awaits.

## Consequences

A transcription is paid for once and kept forever rather than for 24 hours. The cast is written from the song's actual words for the first time. A render started before the warm finishes proceeds as it did before and the next one has the words. The storyboard generator still does NOT get them: its only call site is video.controller.ts, which this work may not edit (D-006), so that half is an open question for the human and not a silent decision.
