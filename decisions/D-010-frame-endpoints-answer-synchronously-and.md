---
id: D-010
title: Frame endpoints answer synchronously and return the frame inline
date: 2026-10-23
status: active
superseded_by: 
repos: video-processing-backend, music-jetkreate-backend
tickets: JET-197
---

## Context

JET-197 moves frame extraction and frame comparison out of music-jetkreate-backend (D-009). Three shapes were open: 202+poll like the stitching endpoints vs synchronous; frame returned as a stored URL vs inline bytes; and comparison taking two image URLs as the ticket proposed vs taking the video and the anchor it is measured against. Verifying one 4:08 song is about 66 extractions, six concurrent, each sub-second.

## Options considered

—

## Decision

Both endpoints are synchronous. frame-extraction returns the PNG inline as image_base64 + mime_type and stores nothing. frame-comparison takes { video_url, position, image_url } and returns { score }, NOT the { image_url_a, image_url_b } the ticket proposed. The comparison metric is mean absolute difference over 320x180 Rec.709 greyscale, in grey levels, rounded to three decimals.

## Reason

A job id and a poll per sub-second frame is more bookkeeping than work. Storing the frame would buy a URL at the cost of an upload, a round trip and a retention policy for an image used once — and having no stored URL is exactly why the comparison cannot take two image URLs: the side that came out of a video has no URL. The chosen shape is what seamScoreV1(videoUrl, position, anchorUrl) already holds, so the caller makes one call instead of two plus an upload. Rec.709 rather than OpenCV's Rec.601 default because the caller's 4.0 threshold was measured against libvips/sharp greyscale; measured, that choice is worth 0.16 of score where the resampling kernel is worth 0.003.

## Consequences

music-jetkreate-backend swaps two call sites and deletes its ffmpeg and sharp code; the call it writes for scoring is one HTTP request, not two. Nothing is retained on this side, so there is no frame storage to clean up or pay for. If a second caller ever genuinely holds two image URLs, an image-vs-image shape has to be added beside this one rather than replacing it. The identical-scores-0 and unrelated-scores-10+ ends of the measured band are verified here; the 2.1-3.3 middle should be sanity-checked once on real model output before the threshold is trusted blind.
