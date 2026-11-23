---
id: JET-399
title: Release: never trap or lose a creation — exits on the call sheet and while starting, keep the draft on failure, confirm before leaving
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T15:49:54+05:30
updated: 2026-11-23T17:50:53+05:30
decisions: 
---

## Request

Depends on: JET-391.

Fix V1 UX-001/002/004/017/020: the call sheet has no back or close on iOS (gesture and header back disabled); Working's opening phase shows no buttons; a failed start resets the whole draft; backing out of the create flow drops the draft silently; the video page hides its back button during autoplay. Use the single create-and-render call so leaving cannot lose the project.

Design: docs/ux-revamp-v2 (SCREEN_REDESIGN.md, DESIGN_SYSTEM.md) and https://claude.ai/artifact/7JdVEQRYBCeC5G1VveG3fM; UX findings: docs/ux-revamp/UX_AUDIT.md.

## Understanding

With the server-side opening call, the app can say 'safe to leave' from the first tap and a failed start leaves a resumable project with every choice. Until then the plan still keeps the draft in memory on failure. Also clean default titles (strip _ and download-site tags) since titles appear on every following screen.

## Plan

1. Call sheet header close; Working opening 'Leave' text action.
2. Switch Ready/plan start to the create-and-render endpoint with an idempotency key.
3. On failure keep the draft: Try again / Change something.
4. Confirm sheet when leaving the create group with a track chosen.
5. Video player back always visible.
6. titleFromFileName cleanup.

## Reason

P0 release blockers from the audit: trapped users on iOS and lost work.

## Related files

src/app/(create)/_layout.tsx, src/app/(create)/plan.tsx, src/app/(create)/working/[id].tsx, src/lib/generation.ts, src/features/video/video-player.tsx, src/features/create/create-context.tsx

## Acceptance criteria

iOS simulator: every create screen can be left without spending; kill the app 2s after Film now -> the project is in the Library and rendering; a forced storyboard failure keeps all choices on Ready; 'Sent Gamkauwa_320(KoshalWorld.Com)' becomes 'Sent Gamkauwa'.

## Test steps

—

## Thread
2026-11-23T15:49:54+05:30 aquib N: created ticket, status: - -> open
2026-11-23T17:38:18+05:30 aquib N: status: open -> approved
2026-11-23T17:50:53+05:30 aquib N: status: approved -> in_progress — Working on it in music-jetkreate-mobile
2026-11-23T17:50:53+05:30 aquib N: Built, not committed. Film now is one POST /create-and-render (Idempotency-Key per tap); Working waits on the jobId (404 = still planning, project.startError = failed) and shows 'Leave, it keeps going' from the 202 on; before it, Back returns to Ready. Failed start: Try again re-sends with projectId (from the project's saved choices on a cold open), Change something goes back to Ready with the draft. Call sheet has a header X. Leaving the create flow with a track and nothing saved asks first (usePreventRemove). Video page back stays visible inline while playing. Default titles cleaned (lib/title.ts, npm run check:title). createStoryboard/saveProject removed from the app.
