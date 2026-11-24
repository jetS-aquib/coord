---
id: D-099
title: expo-media-library and expo-clipboard for Save to phone and Copy caption
date: 2026-11-24
status: active
superseded_by: 
repos: music-jetkreate-mobile
tickets: JET-406
---

## Context

The video page (JET-406, UX-019, UX-038) needs Save to phone and a Copy that really copies. Neither module was installed: the only download was Share file, and Copy caption opened the Android share sheet.

## Options considered

1) expo-media-library + expo-clipboard (first-party Expo, SDK 58). 2) Keep using the share sheet for both. 3) Community packages (react-native-clipboard, cameraroll).

## Decision

Add expo-media-library ~58.0.14 and expo-clipboard ~58.0.4. Media library is configured save-only: requestPermissionsAsync(writeOnly=true, []), plugin with photosPermission false, granularPermissions [] and READ_MEDIA_VISUAL_USER_SELECTED blocked, so Android 13+ asks for nothing and iOS asks only to add to Photos.

## Reason

First-party Expo, versioned with the SDK. Saving to the gallery is what most users want so they can post from Instagram or TikTok later; Copy must not open the share sheet.

## Consequences

Both are native modules: a new dev build (npx expo run:android / run:ios) and a store build are needed; an OTA update alone does not carry them. The app checks requireOptionalNativeModule before importing, so an older build shows 'needs the latest version' instead of crashing.
