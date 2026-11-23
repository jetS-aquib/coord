---
id: D-094
title: Over-the-air JS updates with EAS Update (expo-updates), fingerprint runtime
date: 2026-11-23
status: active
superseded_by: 
repos: music-jetkreate-mobile
tickets: JET-411
---

## Context

Every copy fix, validation rule or layout bug needed a store build and a user update. expo-updates was not installed. Design note: music-jetkreate-mobile docs/ux-revamp-v2/REMOTE_CONFIG.md (layer 1).

## Options considered

A: keep store-only releases. B: EAS Update with runtimeVersion policy appVersion (eas update:configure default). C: EAS Update with policy fingerprint. D: a self-hosted CodePush-style server.

## Decision

C. New dependency expo-updates. runtimeVersion {policy:'fingerprint'}; channels development/preview/production on the eas.json profiles. App checks on launch and foreground, applies on next cold start. An update published with OTA_CRITICAL=1 (carried in the manifest via app.config.ts extra) prompts Restart through ConfirmSheet. fingerprint.config.js = balanced preset + ExpoConfigExtraSection, so the flag never changes the runtime. Publish scripts gate on tsc.

## Reason

fingerprint makes it impossible to ship JS to a build whose native code cannot run it, without anyone remembering to bump a version. EAS Update is first-party for Expo and already on our EAS project; D is ops we don't need.

## Consequences

One new store build is needed to carry expo-updates; JS after that ships OTA. Any native change (module, permission, app name, icon) gives a new runtime and needs a build. Lint is not in the publish gate until ESLint is installed. Runbook: music-jetkreate-mobile docs/ota-runbook.md.
