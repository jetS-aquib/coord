---
id: JET-228
title: The call sheet screen, and a review gate that starts closed and never blocks Start filming
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-10-30T16:20:12+05:30
updated: 2026-10-30T16:42:09+05:30
decisions: D-051, D-052, D-053, D-056
---

## Request

Build the plan screen — cast review, the shot list in plain words, the director's notes under each section, and the reason on every row (plan rows 8.2, 8.3, 8.4, 8.6, 8.7) — against the shape below, and drive the new review gate: send review:true when you start the render, poll until status is 'review', show the call sheet, and POST .../accept when the person taps Start filming. Nothing is paid for until that POST.

## Understanding

In my own words: mobile already starts a render and polls it. Today that render goes straight from queued to anchoring, and anchoring is where the money starts. 8.2/8.3/8.5 all need the plan SHOWN before any spend, so I am adding a state in between where the plan exists, costs about two text calls and one reference image, and nothing else has been bought. The screen you build in that state is the call sheet: this is what your director decided, here is why, start filming.

8.6 is the hard constraint on all of it, not a slogan. Start filming is never blocked, so:
 - the gate is OPT-IN per render. No review flag means today's exact one-shot path, which is what the web client and anyone who does not want the gate keep getting. Sending review:true is what opens it.
 - accept is valid at ANY time and never 409s. Accepting a plan that already passed the gate answers 200 with the current summary rather than an error, so a double tap, a retry on a flaky connection, or a resumed screen can never strand somebody on a plan they cannot start.
 - there is no server-side timer that auto-proceeds. A plan sitting in review has spent cents, not dollars, and a timer that starts a $25 render because nobody looked is a worse failure than a plan that waits. If you would rather have one, say so on the thread and I will add it — it is a deadline, not a redesign.

ASSUMPTIONS I AM MAKING, each of which I would rather have corrected than guessed:
 1. You poll, you do not hold SSE (2.6 — SSE drops when the app backgrounds). So everything below is on the plan document and comes back from the ordinary poll or from one extra GET. Nothing here is SSE-only.
 2. The call sheet is a SEPARATE GET rather than more fields on the poll payload. It is static once written and it is big — 45 rows with lyric lines, beats and reasons — and the poll runs every second or two. Fetch it once when status becomes 'review', and again after a regenerate.
 3. You want the director's notes and the reasons as DATA, not as sentences to parse back. Every row below is already a decision the planner made and stored; I am handing them over as fields.
 4. Cast cards carry a one-line description each plus the shared six-panel reference plate (plateUrl, already on the poll payload). I am NOT drawing a portrait per cast member: that is one image call per person before anything has been approved, for a card. If you need per-person art, that is a decision worth making on the thread rather than me assuming it.
 5. 'swap' in 8.2 I am reading as out of scope for now — regenerate the cast, or accept it. Swapping to a specific person needs a character picker that does not exist on either side. Say if that is wrong.
 6. You already have the shot strip reading state per clip (JET-205). The call sheet is a different screen from that one and sits before it.

## Plan

1. POST /api/v1/music-videos/:id/render takes an optional review:boolean, default false. False is byte-identical to today.
2. The plan status enum gains two states between 'queued' and 'anchoring': 'planning' (the direction pass is running — song read, cut plan, casting, treatment, look bible, shot list; two text calls and one image) and 'review' (the plan is written, nothing else has been bought, waiting on a person). Without review:true the render goes queued -> planning -> anchoring and never stops.
3. GET /api/v1/music-videos/render/:jobId/call-sheet returns the read model (shape under FILES below). Valid in any status from 'review' onwards, so the screen can be reopened mid-render.
4. POST /api/v1/music-videos/render/:jobId/accept moves 'review' -> 'anchoring' and starts the spend. Idempotent, never 409.
5. POST /api/v1/music-videos/render/:jobId/cast/regenerate — re-rolls the cast and rewrites the shot list against it. Only in 'review'. One or two text calls.
6. POST /api/v1/music-videos/render/:jobId/shots/:idx/regenerate — rewrites one row's action line. Only in 'review'. One text call. Uses the plan's STORED director, never a re-resolved one.
7. crew[] on the ordinary poll payload: an append-only list of {at, chair, line} written as each handoff lands — the music supervisor read the song, the editor cut it, casting cast it, the director wrote the treatment, the designer the look, the DOP the shots. Content, not just a phase label, and pollable by construction. This is also what 9.9's narration should be drawn from rather than inventing stages.
8. Every row carries 'why' (8.7), computed in code from the grammar that already decided it — not a model call and not an adjective.

## Reason

The four brief inputs of 7.1 are optional and so do not read as a feature, and the whole of Batch 8 is the answer: you hand the song to a named director, and the call sheet is that director showing you their plan. Right now every one of those decisions — shot size, lane, lyric mode, the place, the beat, the words sung under the shot — is already computed and already stored on the plan, and none of it has ever been shown to anybody. The screen is most of the product value of the batch and it costs the backend one new read model over fields that already exist.

The gate matters for a second reason that is not product: a $25 render currently starts on a tap with nothing shown first. Two text calls and one image is a cheap place to find out the director misread the song.

## Related files

GET /render/:jobId/call-sheet returns:

{
  jobId, status,
  director: { id, name },
  logline,              // the treatment's one sentence, reader's language
  pitch,                // the director on THIS song, first person. '' if none
  estimatedCostUsd, clipsTotal, discardedSeconds,
  plateUrl,             // the six-panel reference sheet, '' until drawn
  cast: [ { tag, description, locked } ],
  sections: [ {
    index, label, startSeconds, endSeconds,
    beat,               // what this section is doing, reader's language. 8.4
    place, timeOfDay,   // from the look bible. 8.4
    notes: [ string ],  // the director's notes, collapsed by default. 8.4
    rows: [ {
      index,            // the clip index — same :idx the rerender route takes
      line,             // 'Chorus - wide - both of them - the rooftop'. 8.3
      why,              // 'holds two bars, because the hook holds'. 8.7
      shotSize, lane, lyricMode, cameraMove,
      seconds,          // what the music wants, not what the model generates
      lyricLines: [ string ],
      castTags: [ string ],
      overridden        // true once a person has changed this row. 8.8
    } ]
  } ]
}

Mobile: app/(create)/plan.tsx, lib/generation.ts (the review flag and the accept call), features/create/*

## Acceptance criteria

A person picks a director, taps through the brief, taps Render, and sees the call sheet before anything is paid for: who is in it, what each section does, one row per shot in plain words with the reason one layer down. Tapping Start filming begins the render. Tapping it twice does not error. A person who does nothing has not been charged. A render started from the web, or from a client that does not send review:true, behaves exactly as it does today and never stops at the gate.

## Test steps

1. Start a render from mobile with review:true. Poll: status goes queued -> planning -> review and STOPS there. No anchors are drawn and estimatedCostUsd has not been spent.
2. GET the call sheet. Every section has a beat and a place; every row has a line, a why and the words sung under it.
3. Tap Start filming. The poll moves to anchoring and the stills start appearing. Tap it again — 200, not an error.
4. Start a render WITHOUT review:true (or from the web). It goes queued -> planning -> anchoring without stopping.
5. Background the app during planning and come back. The screen redraws from the poll, not from a dropped stream.

## Thread
2026-10-30T16:20:12+05:30 aquib N: created ticket, status: - -> open
2026-10-30T16:22:07+05:30 aquib N: linked decision D-051 (The review gate is a state before anchoring, opt-in per render, and the direction pass stays in the worker)
2026-10-30T16:22:36+05:30 aquib N: linked decision D-052 (Casting stays before the director and the director's profile steers it, as a range that biases)
2026-10-30T16:23:02+05:30 aquib N: linked decision D-053 (The pitch is persisted and reaches the treatment as the artist-facing contract)
2026-10-30T16:42:09+05:30 aquib N: linked decision D-056 (The cast was never empty — the director's range sets the SIZE, and the storyboard's tags only set the ordinals)
2026-10-30T16:54:47+05:30 aquib N: Backend half is built against exactly the shape in this ticket, with three changes you need and one correction to a promise I made.

ONE NEW FIELD ON THE PROJECT SAVE, and it is the only thing I need from you beyond
the screen. Send back the pitch — the sentence POST /brief already returns, the
director talking about this track. It was being shown and then thrown away: nothing
stored it and nothing passed it to the treatment, so the director described a plan on
the brief screen that the render had no obligation to make. It is persisted now and
handed to the treatment as a commitment. One more string on the save you already do.
Decision D-053.

THE CALL SHEET GAINED A TOP-LEVEL 'approach'. Found by reading a real 45-row sheet
rather than by a test: the director's one-line voice was going into every section's
notes, so the same sentence arrived eight times down one screen and buried the notes
that were actually about that section. It is said once now, at the top, and it is
gone from section.notes.

THE ROW'S PLACE IS SHORTENED, the section's is not. Same reading session. The
treatment writes a full location because that string goes into an image prompt, so
every row came back as 'verse · medium wide · one of them · Dimly lit high-fashion
penthouse party overlooking a neon city skyline' — and 8.3's whole claim is four plain
words. row.line now carries 'penthouse party'; section.place still carries the full
text, which is where it belongs.

A CORRECTION TO MY OWN UNDERSTANDING, assumption 4. I wrote that the cast is empty on
almost every render. It is not, and 36 stored plans say so: 33 of them carry a real
cast of 2 to 4, and 43 of 43 projects have @imageN in their storyboard. The v0
storyboard writes those tags by default. So cast cards will have real descriptions
from the first render rather than the (one unnamed subject) I warned you about. What
WAS wrong is that nobody decided how many — Kabir's card says a single figure and he
has been rendering three. The director's range decides it now. D-056.

Everything else is as filed. 224 tests, typecheck clean, four do-not-touch files
untouched, and all six routes verified over real HTTP rather than only in tests —
including GET call-sheet against a real stored 45-clip plan. Nothing is committed and
this needs 'coord approve JET-228' before you start.
