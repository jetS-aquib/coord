---
id: JET-413
title: Config client and content-block renderer: useConfig() with cache and fallbacks, and Home content blocks driven by config
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: in_progress
created: 2026-11-23T16:05:16+05:30
updated: 2026-11-23T18:51:29+05:30
decisions: 
---

## Request

Depends on: JET-412, JET-398.

Layers 2 and 3 of the remote-config design: one hook per bundle that reads the PostHog 'ui-config' pointer, fetches newer bundles, validates, caches and falls back; and a small renderer for content areas (Home's starter row, banners, empty states) from a fixed registry of Studio Ink blocks. Design note: music-jetkreate-mobile docs/ux-revamp-v2/REMOTE_CONFIG.md.

## Understanding

Assumptions: (1) resolution order memory -> AsyncStorage last-good -> embedded default JSON shipped per bundle; (2) refresh on start and on foreground (posthog.reloadFeatureFlagsAsync, throttled 5 min), fetch only bundles whose version increased, validate with zod, check schemaVersion/minAppVersion, swap whole or not at all; (3) prefetch first N images with expo-image Image.prefetch; (4) killSwitch in the payload forces embedded defaults; (5) block registry hero/starterRow/banner/tileGrid/text/spacer; unknown type or minApp above the running app is skipped; per-block error boundary; actions only from an allowlist (openStarter, openScreen with whitelisted routes, openUrl https allowlisted hosts, startCreate); styling by token names only; from/until dates; (6) the renderer never draws the creation flow, player, auth or settings; (7) limits bundle feeds validation (password rule, title max, upload max MB) through existing code paths.

## Plan

1. lib/config: pointer, fetch, validate, cache, defaults, kill switch, foreground refresh.
2. Embedded defaults generated from the backend seed.
3. components/blocks: registry + renderer + error boundary + action allowlist.
4. Home content area driven by the 'home' bundle.
5. Wire limits into create-account/brief/audio validation.
6. PostHog events: config_applied, config_rejected (bundle, version, reason).

## Reason

Ship content and small UI-content changes by moving a pointer, not by publishing the app.

## Related files

src/lib/config/*, src/components/blocks/*, src/app/(app)/index.tsx, src/config-defaults/*.json, src/app/(auth)/create-account.tsx

## Acceptance criteria

Move the PostHog pointer to a new 'home' bundle with an extra banner: on next foreground the banner appears without a rebuild or OTA. Publish a malformed bundle and point to it: the app keeps the previous content and logs config_rejected. Airplane-mode fresh install shows embedded defaults.

## Test steps

—

## Thread
2026-11-23T16:05:16+05:30 aquib N: created ticket, status: - -> open
2026-11-23T18:49:04+05:30 aquib N: status: open -> approved
2026-11-23T18:51:29+05:30 aquib N: status: approved -> in_progress — Working on it
2026-11-23T19:05:16+05:30 aquib N: Built, not committed. src/lib/config: pointer from PostHog ui-config payload, else GET /config/manifest; fetch bundles whose version DIFFERS (so moving the pointer back rolls back), hand validators mirroring BUNDLE_SCHEMAS_V1 (zod not a dep), schemaVersion/minAppVersion, whole-bundle swap, AsyncStorage last-good, embedded defaults (src/config-defaults, 40 KB, regenerate with scripts/gen-config-defaults.ts), kill switch, 5-min foreground throttle, image prefetch, config_applied/config_rejected. components/blocks: hero/starterRow/banner/tileGrid/text/spacer with per-block error boundary and action allowlist, on Home. Wired: style list + real stills on Direction (swatch fallback), Ready lyrics backdrop = chosen style's still, password rules from limits, special max, upload max. Not wired: LEGAL_LINKS (no bundle field), lyricLooks, director picker. npm run check:config.
