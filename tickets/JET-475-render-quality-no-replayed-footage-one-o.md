---
id: JET-475
title: Render quality: no replayed footage, one outfit per character, only the shot's cast in its still, varied performance shots
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T17:23:53+05:30
updated: 2026-11-26T17:39:19+05:30
decisions: 
---

## Request

The Heroine render (Dev, 9:16) replayed 15% of its runtime frame for frame, gave the male lead three outfits, and put an unplanned man in solo shots. Fix the quick-fix half of the audit (Q1-Q5) for every director, not only Dev. Audit: https://claude.ai/artifact/8pu3tvf2t1gsUMQV34EQG7

## Understanding

Requested by aquib in session after reviewing the audit. Changes stay director-agnostic: nothing keys on Dev. No extra model calls and no change to cost. The edit will cut between clips a little less often, because a partner can only lend spare footage; I am treating that as acceptable since the replays were the complaint. The seed test (Q6) costs money and is left out.

## Plan

1. subShotV1: one unbroken window per slot, partners lend only unplayed tail footage, nearest different shot size, tests for no repeated frames.
2. Wardrobe: one outfit per character; the treatment's wardrobe replaces the cast description's clothing instead of being appended.
3. Stills: describe only the shot's own cast when the shot list named it.
4. shotListV1: performance camera move rotates by position too; 9:16 framing text per shot size.
5. Unit tests for each; full test suite.

## Reason

subShotV1 rewinds an exhausted source to 0.5s and lends partners footage their own slot also plays; castWardrobeV1 appends a second outfit; every still lists the whole cast; performance camera moves ignore position and every 9:16 shot gets one framing line.

## Related files

src/services/render/subShotV1.ts, src/services/render/lookBibleV1.ts, src/services/ai/videoService.ts, src/services/render/renderPromptsV1.ts, src/services/render/renderOrchestratorV1.ts, src/services/render/shotListV1.ts

## Acceptance criteria

Re-render of Heroine with Dev and one other director: no shot replays earlier footage (SSIM method in the audit), the lead keeps one outfit, solo shots show one person.

## Test steps

—

## Thread
2026-11-26T17:23:53+05:30 aquib N: created ticket, status: - -> open
2026-11-26T17:29:57+05:30 aquib N: BUILT (uncommitted), on aquib's go-ahead in session. subShotV1: one window per slot, partners lend only unplayed tail, nearest different size; treatment: one outfit per person, recast drops stale wardrobe; stills and clip prompts carry only the shot's named cast (shotAbsentV1); performance moves rotate by performance ordinal. Director-agnostic, tested across every director in DIRECTORS_V1/V2 and every cut-style pace. 451 render tests pass; the 13 failures in posthog/captcha tests fail on clean HEAD too. Q6 seed test and per-size clip framing deliberately skipped.
2026-11-26T17:39:19+05:30 aquib N: status: open -> approved
