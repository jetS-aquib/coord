---
id: JET-337
title: Middle-of-shot check costs ~50s a shot on standard renders and changes nothing: turn it off on standard, keep it on hero
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-17T17:13:22+05:30
updated: 2026-11-17T17:14:30+05:30
decisions: D-084
---

## Request

Decide what to do with the middle-of-shot check (clipCheck): it failed 6 of 6 shots on a standard render and re-took none of them, while adding ~50s per shot of model calls (297s total) to the critical path.

## Understanding

Standard's re-take budget is ceil(clips/5) and the seam check spends it first (D-043), so on standard the middle check almost never has budget to act — it only records. A 6/6 fail rate also says it is not calibrated. Hero has half the song as budget, so there it can act, and its recorded verdicts keep the calibration data coming. The deployment kill switch (flags.render.clipCheck) is unchanged. Assumption: no user-facing promise names this check on standard.

## Plan

1. RENDER_TIERS_V1.standard.clipCheck = false (hero stays true, demo already false).
2. Update tier tests and the cost line that counts checks.
3. Decision record: standard drops the middle check until its fail rate is measured as meaningful.

## Reason

Minutes per render and model spend for no effect; the user saw the render sit at 6 of 6.

## Related files

src/config/videoModelsV1.ts, src/services/render/renderV1.test.ts, src/services/render/renderCostV1.test.ts

## Acceptance criteria

A standard render runs no clipcheck calls (timings.work has no clipcheck) and goes to stitching soon after the last shot; a hero render still records clipCheck verdicts.

## Test steps

1. Run a standard render. After it completes, its `timings.work` has no `clipcheck` entry and clips have no `clipCheck` verdict; stitching starts within seconds of the last shot's seam check.
2. The call sheet cost for standard no longer counts clip checks (continuity checks = stills only).
3. Run a hero render: clips still carry `clipCheck` verdicts and the crew note "Watched the middle of N takes" appears.

## Thread
2026-11-17T17:13:22+05:30 aquib N: created ticket, status: - -> open
2026-11-17T17:14:08+05:30 aquib N: status: open -> approved
2026-11-17T17:14:23+05:30 aquib N: linked decision D-084 (Standard renders drop the middle-of-shot check; hero keeps it)
2026-11-17T17:14:30+05:30 aquib N: status: approved -> in_progress
2026-11-17T17:14:30+05:30 aquib N: status: in_progress -> review — Built (uncommitted). Tests green except the pre-existing captchaBypass failure.
