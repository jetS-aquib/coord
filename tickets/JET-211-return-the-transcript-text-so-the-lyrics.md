---
id: JET-211
title: Return the transcript text, so the lyrics we already paid to make can be kept and used
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: open
created: 2026-10-27T15:50:18+05:30
updated: 2026-10-27T15:50:18+05:30
decisions: 
---

## Request

Add the transcribed text to the POST /api/v1/lyric-transcription response — the plain lyrics as a string, and per-line start/end times if they are cheap to include. Same call, same cache, one more field. We will store it; we are not asking you to.

## Understanding

Your contract is explicit that the transcript stays with you, and the reasoning is sound for the case it was written for: we do not render captions, you do, so shipping every word timing back would be a megabyte nobody reads. JET-201 and JET-208 are both built on that and neither needs a word of it.

What changed is that we now transcribe at UPLOAD (JET-208, measured on a real run this morning: 169s cold, 475 words, 'en'). At that moment the song's words exist, and they are the single best input to everything downstream of it that we currently guess at:

- generateMusicStoryboard already takes a lyrics argument. Mobile has never sent one, so every storyboard we generate is written from a direction prompt and a duration, with no idea what the song says.
- autoGenerateCast takes lyrics too (renderOrchestratorV1 passes String(mv.lyrics) and it is almost always the empty string).
- MusicVideo.lyrics exists in our schema already and is only ever filled from a create payload nobody sends.

So we are paying for a transcription, logging that it has 475 words, and throwing all 475 away — then writing the video's shot list without them.

What we are asking for is the text, not the word timings. 475 words is about 3 KB; that is not the megabyte the contract is avoiding. Per-line times would help us later for cut planning, but they are a nice-to-have and we would rather have a small response you are happy with than argue for timings we have no use for yet.

Assumptions, correct any:
- A new response field, not a new endpoint. Nothing we send changes, so no caller of yours breaks and extra=forbid is unaffected.
- It comes from the cache on a hit exactly as the counts do, so a second call still costs nothing and still reports cached: true.
- If you would rather it be opt-in because of the response size, a request flag is fine and we will send it — say which you prefer and we will follow.
- Empty or absent text for an instrumental is normal and we will treat it as such.
- Your 24h / 64-entry cache stays what it is. We are asking for the text so we can keep our OWN durable copy; we are not asking you to become our store.

## Plan

1. File this and wait. Nothing on our side starts before it is approved.
2. When it lands: persist the text at warm time, keyed on audioUrl — there is no project yet at upload, which is the whole point of JET-208.
3. Copy it into MusicVideo.lyrics the moment a project with that audio exists, so the field that is already in the schema finally holds something.
4. Feed it to generateMusicStoryboard and autoGenerateCast, which both already take it.
5. Record the storage choice as a decision, including why it is keyed on the audio rather than on a project id.

## Reason

We transcribe every uploaded song and discard the result. The shot list for the video is then written without knowing what the song says, which is the single largest quality lever left in the pipeline and it costs one field on a response we already make.

## Related files

app/api/v1/router.py or wherever lyric-transcription answers; .coord/contracts/video-transcription.md; consumers: music-jetkreate-backend renderOrchestratorV1.ts, models/MusicVideo.ts

## Acceptance criteria

POST /api/v1/lyric-transcription on a song with words returns the transcribed text alongside the existing counts, on both a cold call and a cached one. An instrumental returns the same shape with the text empty. No request field is required to get it, or exactly one is and it is documented. The contract says what the field is and what it is not.

## Test steps

—

## Thread
2026-10-27T15:50:18+05:30 aquib N: created ticket, status: - -> open
