---
id: D-005
title: Stitch output orientation follows the source clips
date: 2026-10-22
status: superseded
superseded_by: D-011
repos: video-processing-backend, music-jetkreate-mobile, music-jetkreate-backend, creater-ai-backend
tickets: JET-196
---

## Context

The audio and lyrics workflows hardcoded 1920x1080, so a portrait clip set was scaled down and pillarboxed into a landscape master — on a phone, a small rectangle in a black screen. Mobile is portrait-first and could not produce a correct master at all. Alternatives considered: a resolution/orientation field on the request (needs both backends changed and can disagree with the material), and taking the clips' own size (would have stopped upscaling 720p landscape material that existing callers receive at 1080p).

## Options considered

—

## Decision

The audio and lyrics workflows derive orientation from the clips: 1920x1080 unless more than half the clips are taller than wide, in which case 1080x1920. Ties, square clips and unreadable dimensions give landscape. The frame SIZE is not derived — only which way up it is. No request field is added. API #1 (clip-stitching) keeps its fixed 1280x720. Caption canvases are carried over by scaling only their height by the frame's aspect change, so each keeps the reference width it was tuned against — including the classic style's deliberate 4:3 canvas, which is not rebuilt from the frame.

## Reason

Deriving from the clips needs no client change and cannot contradict the material, and holding the size fixed is what makes a landscape job byte-for-byte what it was. Every caller but mobile sends landscape and none of them asked for a different file.

## Consequences

A landscape job is unchanged in frame, captions and billing. A portrait job now produces a portrait master; its measured resolution string becomes 1080x1920, which the creator API carries as a rate-selecting attribute — base per-second rates apply unless a video-service rate card declares a resolution enum selector, which should be confirmed with the rate card owner. The iris vendored copy of this service is unaffected and keeps the old behaviour. The caption preview is still landscape-only and will not match a portrait job.
