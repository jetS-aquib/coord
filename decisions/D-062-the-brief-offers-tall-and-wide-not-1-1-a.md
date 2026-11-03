---
id: D-062
title: The brief offers Tall and Wide, not 1:1, and names the frame by where the video is going
date: 2026-11-03
status: active
superseded_by: 
repos: music-jetkreate-mobile, music-jetkreate-backend
tickets: JET-241
---

## Context

9.1 asks for an aspect selector with three values: 9:16, 1:1 and 16:9. The mobile half was built on 3 Nov. Reading the backend first changed what got built: the render route validates z.enum(['16:9','9:16']), shotListV1 has a framing ladder for each of those two and nothing for square, and thumbnails.ts collapses every aspect that is not '9:16' to '16:9', so square stills would sit under square clips. The whole chain has accepted an aspect since v1 shipped; mobile was sending a module constant.

## Options considered

Three segments now, with 1:1 failing at the route. Three segments with square silently rendering landscape. Two segments and 1:1 filed. Labels by ratio ('9:16') or by destination ('Tall for Reels and Shorts').

## Decision

Two segments, Tall and Wide, each verified end to end through the ladder, the stills and the model. Square is filed as JET-241 and spikes one clip against the provider before any of it is written. The labels name where the video is going, not its ratio: the caption under them says Reels, Shorts and TikTok, or YouTube.

## Reason

A control that offers an answer the server refuses is worse than a control with two answers. Nothing was blocked on the backend for the two that ship, so the honest version is the one that only offers what was verified. On the labels: a musician knows which of their own feeds is which shape, and '9:16' is the correct answer to a question nobody asks.

## Consequences

The brief cannot produce a square master until JET-241 lands, and the plan row says so rather than implying three. Adding the third option afterwards is one entry in the ASPECTS array. The frame now lives on the create draft and is sent on the project save and the render call, so a per-shot save can no longer quietly reset it. D-026's warning still stands for square: a 1:1 render reports a resolution string no rate card has seen, and that is the rate card owner's call before the first paid one.
