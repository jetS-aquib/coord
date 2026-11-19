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

Needs a NEW dev build (native deps added: @posthog/react-native-plugin, expo-application, expo-localization); Expo Go and the old build will not do. Put the project key in .env.local as EXPO_PUBLIC_POSTHOG_KEY, then `npx expo run:android`.

1. Sign in. In PostHog → Activity, the person is the backend's user id (same as the server's `user_logged_in`), not an anonymous or "restored" id. Kill and reopen the app: still the same person.
2. Kreate → upload a song → Continue → lyrics → director → brief → Ready → Preview stills. Each step shows as `kreate_tapped`, `track_uploaded`, `window_chosen`, `lyrics_saved`, `director_chosen`, `brief_continued`, `quality_chosen`, `preview_stills_tapped`, with `$screen` events named like `(create)/ready`.
3. Open a finished video: watch a bit, tap a thumb (a "Thanks" note shows), share a link, go back. Expect `$ai_feedback` with `$ai_trace_id` = the render's jobId, `video_shared` (via link), `video_watched` (percent).
4. In PostHog set `catalogue-enabled` off: Browse songs disappears on the audio screen. Set `tier-best-enabled` off: Best disappears on Ready. Turn both back on.
5. Settings → Privacy → turn off "Share usage data". Tap around: no new events arrive. Turn it back on: events resume.
6. With limits on (backend `posthog.limits`) and a tiny override, tap Film on the plan: the backend's "you have Ns left this week" message shows on the plan instead of moving on, and `limit_message_seen` arrives with `secondsLeft`.

## Thread
2026-11-19T13:31:01+05:30 aquib N: created ticket, status: - -> open
2026-11-19T13:31:16+05:30 aquib N: linked decision D-089 (PostHog (EU cloud) for product analytics, AI observability, evals and runtime flags; Mongo stays the record that enforces limits)
2026-11-19T17:15:15+05:30 aquib N: status: open -> approved
2026-11-19T17:21:16+05:30 aquib N: status: approved -> in_progress
2026-11-19T17:21:35+05:30 aquib N: Built, uncommitted. Notes for review: (1) posthog-react-native-session-replay is deprecated on npm, so replay/native crashes use its successor @posthog/react-native-plugin (same SDK, still D-089). (2) No flag bootstrap from sign-in: the backend's sign-in response carries no flags, so kill switches read 'on' until PostHog answers; the backend enforces the same switches, so the worst case is one tap that answers with its message. (3) reset() on account delete waits for JET-365, which has no button yet. (4) Error capture is the SDK's uncaught-exception/rejection autocapture, no extra boundaries. (5) Replay: 10% local sampleRate, inputs and images masked, the whole (auth) group wrapped in PostHogMaskView.
