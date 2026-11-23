---
id: JET-402
title: Stopped and failed renders say why, offer only useful actions, and can be deleted; limits shown before spending
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-23T15:49:58+05:30
updated: 2026-11-23T15:49:58+05:30
decisions: 
---

## Request

Depends on: JET-390, JET-388, JET-394, JET-398.

V1 UX-005/006: the stopped screen says only 'That did not finish.'; unfinished projects cannot be deleted from the app; render_limit is not treated as final (lib/retry.ts SPENT regex misses its wording) and the weekly allowance from /estimate is discarded (lib/generation.ts:1185).

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

Read plan failure {cause, refusalCause, clipsAffected, retryable}; show plain copy per cause; Try again only when retryable; Delete uses the cascade delete so a running render stops. Limit refusals are matched on code, not message text. Ready shows the allowance in the action bar context and blocks Film now when the video will not fit.

## Plan

1. Failure copy per cause + actions.
2. Delete on the stopped screen (ConfirmSheet).
3. retry.ts: final on codes render_limit/capacity/renders_off.
4. Keep allowance from /estimate; show it on Ready; pre-check fit.

## Reason

Users currently retry renders that cannot succeed and pile up dead projects.

## Related files

src/app/(create)/working/[id].tsx, src/lib/retry.ts, src/lib/generation.ts, src/app/(create)/ready.tsx, src/lib/music-videos.ts

## Acceptance criteria

A refused-shot render shows '2 shots couldn't be filmed…' with re-film / use without / delete; an exhausted allowance shows on Ready and Film now never sends a request; deleting a running project stops it.

## Test steps

—

## Thread
2026-11-23T15:49:58+05:30 aquib N: created ticket, status: - -> open
