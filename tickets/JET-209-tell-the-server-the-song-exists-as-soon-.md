---
id: JET-209
title: Tell the server the song exists as soon as it has uploaded, so transcription can start
from: video-processing-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-10-27T13:55:26+05:30
updated: 2026-10-27T15:33:03+05:30
decisions: 
---

## Request

One unawaited call at the moment the audio upload finishes, to the route JET-208 adds. Fire and forget, behind a catch, nothing on screen.

## Understanding

This is the client half of JET-208 and does nothing until that one lands.

Whisper costs 99s of cold model load the first time a process touches it. JET-201 moved that off the end of a lyrics render and onto its start, which was the big win; 6.1 of the delivery plan moves it earlier again, to upload. The server cannot know a song exists before something tells it, and at upload time there is no project yet, so the app is the only thing that can.

What it is in your code, having read it: src/app/(create)/audio.tsx calls uploadFile, then setAudio(url, file.name, file.uri) and tap. One line after setAudio, calling a small exported helper in src/lib/generation.ts that posts the url and swallows its own error. The helper belongs beside the other pipeline calls in generation.ts rather than in the screen, because that file is already the one place that knows the server surface.

Assumptions:
- Not awaited and not surfaced. The upload is already done and the user is moving on; a transcription that is slow, fails, or never happens changes nothing they can see, because the render fires the same prefetch at its own start and the stitch transcribes inline below that.
- No busy state, no spinner, no error banner. A console warning is the right amount of noise.
- Fired on every track, including one the user later renders without lyrics. We think that trade is right — one Whisper run against a 24h cache — but it is the server's call, and JET-208 carries the same note.
- Replacing a track fires it again for the new url, which is correct and costs nothing for a repeat of the same file: the cache is keyed on the audio bytes, so re-picking the same track is a hit.

We are not asking for anything on the brief or render screens. This is one call at one site.

## Plan

1. Waits on JET-208: the route does not exist until that is done.
2. After it lands, this is one import and one line, and we would verify it by watching the server log the transcript as ready before the render is even started.
3. Nothing about startRender, the poll loop or the storyboard call changes.

## Reason

It is the only trigger early enough to hide the full 99s on a first-touch process, and it is one line. The server-side prefetch already covers the case where this call never happens, so the downside is bounded at nothing.

## Related files

src/app/(create)/audio.tsx; src/lib/generation.ts

## Acceptance criteria

Picking a track and waiting on the brief screen for a few seconds, then starting a render, shows the server reporting the transcript as cached rather than transcribing. Airplane-moding after the upload shows no error to the user and leaves the render working as before.

## Test steps

1. Pick a track on the create flow and stay on the brief screen. The server should log a lyric transcription starting before any render exists.
2. Start the render on that song. The transcript should report as cached, and the stitch should do no transcription of its own.
3. Turn on airplane mode the moment the upload finishes. Nothing appears on screen, the only trace is a `[transcript]` warning in the dev console, and the render still works once the network is back.

## Thread
2026-10-27T13:55:26+05:30 aquib N: created ticket, status: - -> open
2026-10-27T14:00:07+05:30 aquib N: status: open -> approved
2026-10-27T15:32:24+05:30 aquib N: status: approved -> in_progress — one helper in lib/generation.ts, one unawaited call at the upload site
2026-10-27T15:33:03+05:30 aquib N: status: in_progress -> review — warmTranscript(audioUrl) in src/lib/generation.ts posts the route unawaited behind its own catch; src/app/(create)/audio.tsx calls it on the line after setAudio. Nothing on screen, no busy state, a __DEV__ console.warn is the only trace of a failure. All four assumptions in the request hold as written, including firing for a song later rendered without lyrics. Not yet run on a device - nothing on this branch has been.
