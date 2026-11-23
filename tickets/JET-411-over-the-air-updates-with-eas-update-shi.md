---
id: JET-411
title: Over-the-air updates with EAS Update: ship JS fixes and UI changes without a store release
from: music-jetkreate-mobile
to: music-jetkreate-mobile
filed_by: aquib N
status: approved
created: 2026-11-23T16:05:13+05:30
updated: 2026-11-23T16:11:16+05:30
decisions: 
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
