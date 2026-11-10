---
id: D-080
title: Each render makes one search-grounded call to name the song's region before casting
date: 2026-11-10
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-288
---

## Context

A Punjabi song was cast East Asian and African. Casting asked for ethnicity with no context; the song's language was only shown on the brief. Models use cultural knowledge only when the region is named specifically.

## Options considered

1) Pass the detected language only. 2) A hand-kept table language->region->wardrobe. 3) One Gemini call with Google Search grounding per render, stored on the plan.

## Decision

Option 3. songContextV1 runs once per plan after the song read and before casting (flags.render.songContext, thinking LOW). Its block goes to casting, script, treatment and shot list, under the artist's own direction, which always wins. Low confidence adds nothing except the language when it is not English.

## Reason

Measured 4-10s and about 1k tokens per render; grounding is within Google free usage at our volume. Language alone does not name the region (Hindi spans Mumbai street pop and Punjab folk-pop); a table would not know the song.

## Consequences

Planning is ~5-10s longer. The context is on the plan and in the summary (songContext) so a creator can see and correct it via their direction. A new provider later would need its own grounding or a search step; the field shape is provider-neutral.
