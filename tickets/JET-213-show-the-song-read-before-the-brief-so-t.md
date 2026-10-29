---
id: JET-213
title: Show the song read before the brief, so the app has visibly listened
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: review
created: 2026-10-27T16:46:11+05:30
updated: 2026-10-29T11:48:42+05:30
decisions: D-032
---

## Request

A screen between upload and the brief that draws what the server now knows about the track: tempo, the sections with their names and lengths, and where the loudest part is. GET /api/v1/music-videos/:id/song-read, no new backend work needed.

## Understanding

This is 6.7 of the delivery plan and the last mobile row of Batch 6. The backend half is done: the planner now cuts to the song rather than to the model's maximum duration, and the read it cuts to is served by GET /api/v1/music-videos/:id/song-read.

The payload: { bpm, beatsPerBar, durationSeconds, language, downbeats: number[], energy: number[], sections: [{ label, start, end, lines: [{ start, end, text }] }] }. Sections cover the whole song with no holes, every boundary is on a downbeat, and energy is one value per bar, 0..1, where energy[i] is the bar starting at downbeats[i].

404 means there is nothing to draw — an instrumental, or the read was unavailable — and the render still works, cut by duration as before. So the screen is skippable by design, not an error state.

What we think it is, and you know the app better than we do: a waveform or a simple energy bar per section, the section names along it, the tempo somewhere small, and Continue. The one thing worth getting right is that the labels are a GUESS and the boundaries are not — 'chorus' may be wrong, the place it starts is not. We would not put the label anywhere a user would argue with it.

Also now on the render payload, if you want it on the strip: every clip carries sectionLabel, startSeconds and musicalSeconds. A shot can say 'Chorus · 5.2s' instead of 'Shot 14'.

Assumptions:
- The call is cheap and cached twice over (our DB, then theirs on the audio's bytes), so calling it on screen entry is fine and re-entering costs nothing.
- Nothing blocks on it. A slow or missing read shows the brief as it is today.
- No new inputs on this screen. It is a reveal, not a gate — the user reads it and continues.

## Plan

1. File this; the backend end is already deployed behind it.
2. Mobile fetches the read after the project exists and before the brief.
3. Optional and separate: label each tile in the shot strip with its section.

## Reason

The planner now hears the song, and nothing in the app says so. A screen that shows the structure before asking anything is the cheapest trust in the whole flow — and it is reading data we already compute and already pay for.

## Related files

mobile: src/app/(create)/song-read.tsx (new), src/lib/generation.ts; backend: already served

## Acceptance criteria

Picking a track and continuing shows tempo and the song's sections before the brief, with the chorus visibly bigger than the verses. An instrumental skips the screen rather than showing an error. The shot strip can name a shot's section.

## Test steps

1. Pick a track with lyrics. Under the track card, the parts of the song should appear as blocks: as wide as they last, as tall as they are loud, with the loudest one in the accent colour and `112 BPM · 3:28 · 7 parts` under it.
2. Confirm the chorus blocks are visibly taller than the verses, and that narrow parts keep their shape but carry no word.
3. Pick an instrumental. Nothing should appear, no error and no empty space, and Continue should still work.
4. Replace the track with a different song. The old song's shape must not stay on screen while the new read is fetched.
5. Start a render and check the shot strip names the section where each one begins.

## Thread
2026-10-27T16:46:11+05:30 aquib N: created ticket, status: - -> open
2026-10-27T16:48:28+05:30 aquib N: status: open -> approved
2026-10-27T16:51:50+05:30 aquib N: Half of this is built, half is blocked on JET-214 (just filed, needs approval).

Blocked: the screen. GET /api/v1/music-videos/:id/song-read takes a project id, and on mobile there is no project between upload and the brief - saveProject() posts the storyboard with the project, so the record is not created until the working screen, after the planner runs. The alternative is creating a draft project at every upload, which puts a row in the Library for every abandoned file. JET-214 asks for an audioUrl-scoped variant instead, the way transcript/warm is scoped; songReadV1(audioUrl, userId) is already exported on your side, so it is a route and nothing else.

Built: the third clause of DONE WHEN. clips[].sectionLabel is read and the shot strip marks where a section begins - the word sits above the first tile of each section, not on every tile, because you are right that the boundary is measured and the label is a guess. Every tile's accessibility label carries its section. startSeconds and musicalSeconds are on the wire and not used yet; 'Chorus - 5.2s' as a shot's title is exactly the place a person would argue with the label, so it is waiting for the screen that gives the labels context.
2026-10-27T17:18:30+05:30 aquib N: status: approved -> in_progress — the read draws inline on the audio screen, not as a fourth step
2026-10-27T17:18:30+05:30 aquib N: status: in_progress -> review — Built, with one deliberate departure from the plan: it is not a new route. GET-wise we use POST /api/v1/music-videos/song-read from JET-214, called on the audio screen once the upload lands, and the read draws under the track card rather than as a screen between audio and the brief. Reasons, in order of weight: the 404 case - a route that is sometimes not there makes the flow change shape between songs, where inline it simply renders nothing; the read is feedback about the thing already on screen, not a destination; and the committed Nav Read says three steps is already the modal push limit. Same tap count either way. The Nav Read in MOBILE-DESIGN.md records the call.

What it draws: each part as a block, as wide as it lasts and as tall as it is loud, the loudest one in the accent colour, with '112 BPM, 3:28, 7 parts' under it. A chorus looks like a chorus without anyone being told that is what it is. Labels only where a block is wide enough to hold one - you were right that the boundary is measured and the word is a guess, so a narrow block keeps its shape and loses its word. The full list goes to a screen reader regardless. No spinner, no error state, nothing in flight.

The strip half was already in from the earlier note: sectionLabel marks where a section begins. startSeconds and musicalSeconds are still on the wire and unused. Not run on a device.
2026-10-29T11:18:39+05:30 aquib N: Your blocker is cleared: JET-214 is done and in review. POST /api/v1/music-videos/song-read takes { audioUrl } and returns the same payload as the project-scoped route, so the screen can be built where you asked for it — between upload and the brief, with no project and no draft row in the Library. Nothing else changed on our side. Also now on the render payload, if the strip wants it: discardedSeconds, and per clip sectionLabel, startSeconds and musicalSeconds.
2026-10-29T11:48:42+05:30 aquib N: linked decision D-032 (The song read gates the flow: no brief until the track has been read)
2026-10-29T11:48:53+05:30 aquib N: Decision on the gate, recorded as D-032, and your analysis was right on its own terms — I am overriding the conclusion, not the evidence. You were answering 'must the data be there for the render to be correct', and the answer is no: startRenderV1 awaits the read at plan time, so a user who rushes still gets a musical cut. The reason to gate is the screen AFTER the brief, which does not exist yet: Batch 7.10 makes the brief's own questions, defaults and examples come from the song, because a sparse acoustic track and a 128 BPM club record do not deserve the same four questions. A brief drawn before the read can only be the generic form, and a read arriving behind it cannot retroactively change what was asked.

So: hold the brief behind your listening state, and RELEASE IT on 404, on error and on a timeout — an instrumental answers 404 by contract and a gate with no release traps a user on a perfectly good song, which is worse than the delay it prevents. Your copy rule stands as written: one call, no invented stages, no fake percentages.

One timing note: until 7.10 ships, the gate buys nothing a user can see, so it is best landed with it rather than before it. If you would rather keep Continue live until then, that is a reasonable reading of the same decision — say so on the thread and it is yours to call.
2026-10-29T11:54:31+05:30 aquib N: Timing call on D-032, taking the reading its own consequences recommend: the gate lands WITH 7.10, not before it. Continue stays live until then.

Why, since it is mine to own. The payoff is a brief drawn from the song, so until 7.10 the brief is the same generic form whether the read is in or not and the gate converts a real wait into nothing anyone can perceive. I cannot shorten the wait to make that safe either: a ceiling short enough to dodge a cold read IS designing around Whisper's cold load, which you have said not to do, so the honest ceiling is long enough that only a stuck call trips it - and that means a cold song genuinely waits. A demo is close and a wall with no visible payoff is a bad place to spend that.

The listening state is in and is the sanctioned UI from option 2, not the full-screen stage from option 3: seven blocks breathing out of phase under the track, 'Listening to your track.' and, after twelve seconds, 'Still listening. It only happens once for a song.' No stages, no percentages - one call, as agreed. A 404, an error and a network failure all settle the same way and the strip simply is not there.

The call site carries the decision: src/app/(create)/audio.tsx names D-032, says what to change when 7.10 lands - lift  out of SongReadStrip and disable Continue on it - and that the three releases are not optional. Nothing on this branch has been run on a device yet.
