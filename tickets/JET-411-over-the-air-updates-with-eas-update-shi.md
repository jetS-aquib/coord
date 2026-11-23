---
id: JET-411
title: Over-the-air updates with EAS Update: ship JS fixes and UI changes without a store release
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-23T16:05:13+05:30
updated: 2026-11-23T16:25:20+05:30
decisions: D-094
---

## Request

Depends on: nothing.

expo-updates is not installed and app.json has no updates/runtimeVersion, so every validation fix, copy change or layout bug needs a store build and a user update. Add EAS Update (layer 1 of the remote-config design). Design note: music-jetkreate-mobile docs/ux-revamp-v2/REMOTE_CONFIG.md.

## Understanding

Assumptions: (1) expo-updates is a new first-party dependency, recorded with coord decide; (2) runtimeVersion policy 'fingerprint' so an update only reaches builds with matching native code; (3) channels development/preview/production mapped to the existing eas.json profiles; (4) the app checks on launch and on foreground, applies on next cold start, and offers 'Restart to update' only for updates marked critical; (5) publishing is gated by tsc + lint (a script or EAS workflow); (6) this needs one new store build to carry expo-updates, after which JS ships over the air. Should land before the Studio Ink mobile work so its follow-up fixes can ship OTA.

## Plan

1. npx expo install expo-updates; app.json updates.url + runtimeVersion {policy:'fingerprint'}.
2. eas.json channel per profile; eas update:configure.
3. lib/updates.ts: check on launch/foreground, critical prompt via ConfirmSheet (plain Alert until JET-398 lands).
4. Publish script with tsc/lint gate; runbook in docs (publish, staged rollout, rollback).
5. Decision record.

## Reason

Removes the store pipeline from small fixes and most UI changes.

## Related files

package.json, app.json, eas.json, src/lib/updates.ts, src/app/_layout.tsx, docs/ota-runbook.md

## Acceptance criteria

Build a preview APK, then publish an update that changes one string to the preview channel: relaunching the app twice shows the new string without reinstalling. eas update:rollback restores the old string. An update published from a build with different native deps does not reach the old build.

## Test steps

—

## Thread
2026-11-23T16:05:13+05:30 aquib N: created ticket, status: - -> open
2026-11-23T16:11:16+05:30 aquib N: status: open -> approved
2026-11-23T16:25:20+05:30 aquib N: linked decision D-094 (Over-the-air JS updates with EAS Update (expo-updates), fingerprint runtime)
2026-11-23T16:27:00+05:30 aquib N: Implemented (uncommitted): expo-updates ~58.0.22; app.json runtimeVersion {policy:'fingerprint'} + updates.url; eas.json channel per profile; app.config.ts adds extra.otaCritical from OTA_CRITICAL=1; fingerprint.config.js = balanced + ExpoConfigExtraSection (verified: same fingerprint with/without the flag); src/lib/updates.ts (check+fetch on launch/foreground, critical -> ConfirmSheet Restart/Later in _layout); npm scripts update:preview / update:production gated on tsc; docs/ota-runbook.md; D-094. Lint is NOT in the gate: expo lint fails (ESLint not installed). eas update:configure had duplicated the Android permissions; deduped. Test steps: build preview APK; change one string; npm run update:preview -- --message test; kill + relaunch twice -> new string; eas update:rollback -> old string after two cold launches; OTA_CRITICAL=1 publish -> Restart sheet appears.
