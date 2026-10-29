---
id: D-032
title: The song read gates the flow: no brief until the track has been read
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-mobile, music-jetkreate-backend
tickets: JET-213, JET-214, JET-206
---

## Context

The mobile session built the listening state on the audio screen and then asked whether Continue should block on the song read. Its evidence said no, and the evidence was correct on its own terms: startRenderV1 awaits songReadV1 at plan time, the endpoint is synchronous and cached on the audio's bytes, so a user who rushes past still gets a render cut to the downbeat. The only thing rushing costs today is lyrics via fillLyricsV1, and a gate on the song read would not close that race because it is a different call.

## Options considered

1. Non-blocking: the listening strip resolves when it resolves, Continue is always live. Correct for the brief as it exists today, which is a free-text box the read does not touch. 2. Gate the brief on the read, with releases for an instrumental, a 404 and a failure. 3. A full-screen listening stage — a gate dressed as a step.

## Decision

Option 2. The brief is not shown until the read has landed or has definitively failed. An instrumental (sections: [], 404 by contract), an error, or a timeout releases the gate immediately and the flow continues exactly as it does today. Whisper's cold load is accepted as the price; a managed STT or a warm pool is the optimisation for when it matters, not now.

## Reason

This is a product dependency, not a data-safety one, and that distinction is why the mobile session's reading of the evidence pointed the other way. Batch 7.10 makes the brief's own questions, defaults and examples come from the song: a sparse acoustic track and a 128 BPM club record do not deserve the same four questions. A brief rendered before the read exists can only be the generic form we already have, and the read arriving behind it cannot retroactively change what was asked. So the gate buys the input to the next screen, not the correctness of the render. The releases are not optional: a gate with no release traps a user on a perfectly valid song, which is worse than any delay it prevents.

## Consequences

Mobile holds the brief behind the listening state, with releases on 404, error and timeout. The wait is bounded by one synchronous call, cached on the audio's bytes, so it is paid once per song and never on a re-entry. Until 7.10 ships the gate buys nothing visible, so it should land WITH 7.10 or be felt as a delay for no reason. The copy must not invent stages or percentages — there is one call and it answers when it answers. If the read is routinely slow enough to hurt, that is an argument about STT latency and belongs with the managed-STT question, not with this decision.
