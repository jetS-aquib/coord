---
id: JET-373
title: Release: PostHog in the app — screens, funnel events, identify, kill-switch flags, consent, replay and a thumbs up/down on each video
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-19T13:31:01+05:30
updated: 2026-11-19T17:21:16+05:30
decisions: D-089
---

## Request

Add posthog-react-native to the app so the create→watch→share funnel, client flags, consent, session replay, crash capture and per-video feedback are live for launch. Shares event names and identity with the backend request (JET-372); plan in music-jetkreate-backend/docs/rnd/03-posthog-and-launch.md.

## Understanding

No analytics, crash reporting or flags in the app today. posthog-react-native@4 works on Expo dev and release builds (not Expo Go); screen tracking via usePathname with captureScreens off; identify after login, reset on logout; useFeatureFlag returns undefined while loading; replay on Android/iOS masks inputs. Catch found in code: session-context.tsx starts a restored user as {id:'restored'} until fetchProfile() returns — identify only with the real id, or every returning user becomes a fake person. Assumptions: distinct_id = backend user id; EU cloud; consent = a line in the privacy notice plus an opt-out in Settings (not opt-in by default) — change if legal says otherwise; replay sampled at 10% with auth screens excluded; PostHog error tracking instead of adding Sentry.

## Plan

B1. PostHogProvider inside SessionProvider in src/app/_layout.tsx; key/host in src/config/env.ts; screen events from usePathname.
B2. identify(user.id) once the real profile loads; reset() on sign-out and account delete (JET-365).
B3. Funnel events: kreate_tapped, track_uploaded, catalogue_track_used, window_chosen, lyrics_saved, director_chosen, brief_continued, quality_chosen, preview_stills_tapped, film_tapped, render_left, render_reopened, video_watched (percent), video_shared (link/file), video_deleted, edit_typed, limit_message_seen.
B4. Thumbs up/down on the finished video → $ai_feedback with $ai_trace_id = renderJobId.
B5. useFeatureFlag for catalogue-enabled (hide Browse songs) and tier-best-enabled (hide Best); bootstrap flags at sign-in; show the backend's 429 render_limit / 503 capacity messages with the seconds left.
B6. Analytics line in the privacy notice, opt-out switch in Settings; replay at 10%, inputs masked, sign-in/create-account excluded.
B7. captureException on error boundaries.

## Reason

—

## Related files

src/app/_layout.tsx, src/lib/session-context.tsx, src/config/env.ts, src/app/(app)/settings.tsx, src/app/(app)/video/[id].tsx, create-flow screens, app.json, package.json

## Acceptance criteria

A fresh user's create → watch → share journey shows as one person in PostHog under the backend's user id; the funnel shows drop-off per step; turning catalogue-enabled off hides Browse songs; opt-out stops capture.

## Test steps

—

## Thread
2026-11-19T13:31:01+05:30 aquib N: created ticket, status: - -> open
2026-11-19T13:31:16+05:30 aquib N: linked decision D-089 (PostHog (EU cloud) for product analytics, AI observability, evals and runtime flags; Mongo stays the record that enforces limits)
2026-11-19T17:15:15+05:30 aquib N: status: open -> approved
2026-11-19T17:21:16+05:30 aquib N: status: approved -> in_progress
