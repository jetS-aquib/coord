---
id: D-041
title: Mobile shows nothing of the frame gate until a live render says how often it fires
date: 2026-10-29
status: active
superseded_by: 
repos: music-jetkreate-mobile, music-jetkreate-backend
tickets: 
---

## Context

Batch 7B.1 shipped on the backend 2026-10-29: a vision model reads every anchor still against that shot's stated constraints and redraws it once on a people, location or text failure (D-040). 7B.5 writes all five verdicts to RenderPlanV1.anchors[].gate. None of it reaches a client: the v1 render state in .coord/contracts/api-music-videos.md carries anchorsTotal/anchorsDone and, per clip, state, openingFrameUrl, seamScore, sectionLabel and error, and no gate field exists in any contract. So the question for this repo was what a person on a phone is shown of a continuity supervisor. Two facts decided it. First, the gate runs inside renderAnchorsV1, during status 'anchoring', before any clip renders - so a redraw is not a clip taking longer, it is a strip tile whose still arrives late while describeRender says 'Setting the look. N of 46 key frames.' The strip is driven by state.clips from the first poll, so every tile sits on the clock glyph through that whole phase anyway. Second, per music-jetkreate-backend's own status file at 17:50 today, 7B.1 is built, unit-tested, uncommitted and has never been run on a render. Nobody knows whether the gate fires on 2 anchors in 46 or on 20.

## Options considered

1. Show nothing. The gate is quality control and silent success is correct. 2. Put a gate field on the wire and mark the redraw in the strip the way clip state already is - a ticket to music-jetkreate-backend, a contract change, and an eighth entry in shot-strip.tsx's MARKS table. 3. Show the recorded verdicts after the fact, including the wardrobe and anatomy ones D-040 deliberately never pays to fix. Also needs a wire field, and blocked-decision.tsx is the wrong host for it: that screen only renders on status 'blocked' and exists for decisions a person has to make, which a gate verdict is not.

## Decision

Option 1 for now. No ticket is filed to music-jetkreate-backend, no gate field is asked for, and nothing changes in this repo. The trigger to revisit is named rather than left to memory: the first render run with RENDER_FRAME_GATE on, which D-040's consequences and JET-222's plan step 2 both say is coming before 7B.2 is built either way. If that render's recorded verdicts show the gate redrawing often enough that a person waiting on the strip would notice the pause, option 2 is what we build, and the field goes on the wire before any screen work.

## Reason

Designing the signal before measuring the event is the exact mistake this codebase has now paid for four times - the 4.0 seam threshold, the 0.70/0.90 cut-rate line, Whisper's language field, and the one D-040 was written to avoid making fifth. A tile mark for an event that fires twice a song is worse than no mark: it teaches a person to watch for something that never happens. The cost of waiting is one render, and the backend has to run that render anyway. The cost of guessing wrong is a contract change, an eighth state in a MARKS table whose own comment argues against having seven, and a shared vocabulary between two repos that we would then have to unship. The anchoring phase is also the least visible place in the whole render for this to land: it is minutes of a counter before any video exists, which is the weakest possible reason to widen the wire.

## Consequences

Until that render happens, a still can be judged wrong and redrawn and the person watching sees only a tile that fills in late - which is what they see today, so nothing regresses. The six requests already in review (JET-213, JET-216, JET-217, JET-218, JET-220, JET-221) are unaffected; none of them touches the strip's state vocabulary. shot-strip.tsx's MARKS stays at seven entries and ClipState stays as the contract defines it, so the strip keeps one source for what a tile can say. 7B.2 and 7B.3, the clip half, are a separate question when they are built: they act on clips rather than anchors, during 'rendering' and 'verifying', where 'checking' and 'regenerating' already exist on the wire - so that half may need no new field at all, only a reason attached to a state the strip can already draw. Whoever runs the first gated render should bring the fire rate back here rather than to a ticket.
