---
id: D-052
title: Casting stays before the director and the director's profile steers it, as a range that biases
date: 2026-10-30
status: superseded
superseded_by: D-056
repos: music-jetkreate-backend
tickets: JET-228
---

## Context

Batch 8.1. The cast is empty in practice and has been since v1 existed. resolveCastV1 opens with 'if (!tags.size) return []' — it only produces a cast when the v0 storyboard prompts already carry @imageN tags, and mobile sends no characterInfo, so almost every v1 render runs the treatment and the shot list with the literal string '(one unnamed subject)'. The storyboard blob is also exactly what Batch 7 replaced, so the one source of those tags is the part of the pipeline being retired. 8.1 is therefore not 'wire up autoGenerateCast'; it is 'decide how many people are in this video'. That decision has an owner now and nothing connects them: DirectorProfileV1 has no cast field, while the pitch each director writes on the brief screen already promises one — Mira says two people and the space between them, Dev says crowds and nobody alone in a frame, Kabir says a single figure. If all three render one unnamed subject the director contradicts their own sentence on the screen before it. Separately, resolveCastV1 runs BEFORE generateTreatmentV1 and is blind to the director entirely.

## Options considered

1. Leave the order and leave casting blind — pick a count in code from the lyrics. An unmeasured threshold over free text, which is the fifth time that mistake would be made here. 2. Invert the order: write the treatment first, let it say who is in the video, then cast from it. Most informed, and it costs a pass plus new resume semantics, because the treatment would then be written before the cast it is supposed to describe. 3. Keep the order and give the DIRECTOR a cast preference that steers casting, read before the treatment is written. 4. Ask the user. The app never asks a craft question, and nobody can answer it before seeing the video.

## Decision

Option 3. DirectorProfileV1 gains cast: { min, max } — a RANGE, exactly like locations, never a count. resolveCastV1 keeps its position before generateTreatmentV1 and reads that range: when the storyboard states no @imageN tags and the director's max is at least 1, it calls the same autoGenerateCast the v0 path already uses and takes as many of the people it returns as the range allows, clamping into [min, max] and minting @image1..@imageN itself. Mira is 1 to 2, Dev 2 to 3, Kabir 1 to 1. HOUSE_DIRECTOR_V1 is 0 to 0, which means no auto-cast at all and therefore no changed frame on any render that has no director — the same guarantee D-047 bought for every other lever. The order is recorded here precisely so nobody re-opens it by accident later.

## Reason

Inverting the order is the tempting one and it is more expensive than it looks. It is not one extra call: the treatment is the document that describes the cast, so writing it first means writing it about people who do not exist yet and then either rewriting it or living with the mismatch — and applyDirectionV1's 'directed' flag exists because a treatment's second answer is not its first, so a resume would have to know which half had run. That is a new resume semantics for a question a director can already answer.

A range rather than a count is D-046 applied unchanged, and it is the same shape the locations lever already has. A count would be an absolute, and absolutes against a distribution nobody has measured are the four numbers this codebase has already paid for. The clamp is the whole mechanism: the model decides who the people are from the lyrics and the brief — a judgement, D-034 — and the director decides how many of them this video has room for, which is arithmetic. Neither half guesses at the other's job.

Reusing autoGenerateCast rather than writing a casting call is the cheap half and the honest half: it already takes prompt, lyrics and style, it is already the v0 path's answer to this exact question, and it is imported and not modified. The whole of 8.1's new code is a clamp and a tag mint.

## Consequences

Almost every v1 render now has a real cast where it had none, which means the treatment's wardrobe block, the plate's six panels, the shot list's castTags and the frame gate's people count all have something stated for the first time — the gate in particular has been comparing frames against a constraint that was usually absent. That is a quality change, not a refactor, and it should be judged on a render. One extra text call on a render that previously skipped it; it fails soft to today's empty cast exactly as it does now. A render with no director still casts nobody, so the baseline stays comparable and that claim stays provable. The three directors' pitches stop contradicting their own videos, which was the visible defect. What this does NOT buy is a portrait per person: the cast is descriptions plus the existing six-panel plate, and per-person art is a separate decision nobody needs yet.
