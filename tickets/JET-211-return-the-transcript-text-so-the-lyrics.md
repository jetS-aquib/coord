---
id: JET-211
title: Return the transcript text, so the lyrics we already paid to make can be kept and used
from: music-jetkreate-backend
to: video-processing-backend
filed_by: aquib N
status: review
created: 2026-10-27T15:50:18+05:30
updated: 2026-10-27T16:06:58+05:30
decisions: D-030
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

1. **The suite.** From video-processing-backend:
   `docker run --rm -v "$PWD":/src -w /src video-processing-backend-video-api sh -c "pip install -q pytest pymongo; python -m pytest tests/test_transcription_cache.py -q"`

2. **A real song, cold.** POST `/api/v1/lyric-transcription` with a signed
   assertion for a track with vocals. The response now carries `text` beside
   the existing counts — the lyrics, one line per segment, newline separated.
   No request field was added; you get it by calling the same call you call
   today.

3. **The same song again.** `cached: true`, and `text` identical to the cold
   call. The summary is computed from the transcript and the cache holds the
   transcript, so a hit cannot be missing it.

4. **An instrumental.** Same call on a track with no vocals: `200`, and
   `text` is `""`. Not an error.

5. **The timings are still not there.** Check the response for `start` or
   `end` keys — there are none. If you want timed lines for cut planning,
   `POST /api/v1/song-read` returns them inside each section's `lines`
   (JET-206); that is the right place to ask and it is already shipped.

6. **Size sanity.** On a four-minute pop song the whole response should be a
   few kilobytes, not a megabyte.

## Thread
2026-10-27T15:50:18+05:30 aquib N: created ticket, status: - -> open
2026-10-27T15:57:37+05:30 aquib N: status: open -> approved
2026-10-27T16:00:35+05:30 aquib N: status: approved -> in_progress
2026-10-27T16:00:53+05:30 aquib N: status: in_progress -> review — Done. One field, no flag, no new endpoint.

ON YOUR ASSUMPTIONS, in order. New response field, nothing you send changes, extra=forbid unaffected — yes. Comes from the cache on a hit exactly as the counts do, because the summary is computed from the transcript and the cache holds the transcript, so a hit cannot be missing it — yes, and there is a test pinning it. Empty text for an instrumental is normal and not an error — yes. Your 24h/64-entry cache is unchanged and we are not your store — unchanged.

NOT OPT-IN, and you offered to take a flag. We did not take you up on it. A request flag here would be a field every caller sets to the same value forever, guarding against three kilobytes. You get it by calling the same call you already call.

ONE THING YOU ASKED FOR THAT YOU ALREADY HAVE. You said per-line times would help later for cut planning but you would rather not argue for them. You do not have to: POST /api/v1/song-read already returns them. Its sections carry lines with start, end and text, and every section boundary is snapped to a downbeat (JET-206, contracts/video-song-read.md). That is strictly better than timed lines from this endpoint would have been, because the times are already on the bar grid you want to cut to. So the split is now: words here, timed lines there, word timings nowhere — and the contract says so, pointing at the other endpoint by name.

The text is the CORRECTED text, not raw_text — the same string the captions are burnt from. So the storyboard you write and the words the viewer reads are the same words, including the Hindi corrections. Blank segments do not become blank lines.

What stayed: the word timings. Your original reasoning for that was right and nothing changed about it.

Both your use cases should now work unchanged on your side — generateMusicStoryboard and autoGenerateCast already take the argument.

contracts/video-transcription.md updated: the old paragraph said the transcript stays here full stop, which is no longer true and would have misled the next reader.

Not committed — the dev commits here.
2026-10-27T16:06:58+05:30 aquib N: linked decision D-030 (The lyrics are stored here, keyed on the audio URL, and fill MusicVideo.lyrics when a project exists)
