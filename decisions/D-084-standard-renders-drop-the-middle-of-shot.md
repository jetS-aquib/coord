---
id: D-084
title: Standard renders drop the middle-of-shot check; hero keeps it
date: 2026-11-17
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-337
---

## Context

On mvr_1794914282826_5cab2c68 (standard, 6 shots) the middle-of-shot check failed 6/6, re-took none (seam check had spent the one-shot budget), and cost 297s of model calls, ~2 min on the critical path after the last shot.

## Options considered

(a) keep as is; (b) recalibrate the check first; (c) off on standard, on for hero; (d) off everywhere.

## Decision

(c): RENDER_TIERS_V1.standard.clipCheck = false. Hero keeps it, where half-the-song budget lets it act and its verdicts keep the calibration data coming. flags.render.clipCheck stays the kill switch.

## Reason

On standard it could only record, not act, and a 6/6 fail rate is not a signal anyone can act on; minutes per render for nothing.

## Consequences

Standard renders finish sooner and cost less; drift inside a shot is no longer measured on standard. Revisit if hero's recorded fail rate shows the check is meaningful.
