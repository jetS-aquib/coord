---
id: D-004
title: Onboarded music-jetkreate-mobile to coordination
date: 2026-10-20
status: active
superseded_by: 
repos: music-jetkreate-mobile
tickets: 
---

## Context

New Expo SDK 58 React Native client (Expo Router, Hermes, Android-first) for the jetKreate music-video product. Owns no contracts: it serves no API. Depends on music-jetkreate-backend, which it calls for auth, presigned GCS uploads, music storyboard and job polling. An apparent dependency on iris was checked and dropped: every reference is a comment recording where the design tokens were copied from, with no imports or calls.

## Options considered

—

## Decision

music-jetkreate-mobile joins the platform registry as an active repo. It owns no contracts and declares one dependency, music-jetkreate-backend.

## Reason

The mobile client needs backend changes, starting with a captcha exemption for native clients, and coord refuses tickets for a repo that is not onboarded.

## Consequences

Cross-repo changes between music-jetkreate-mobile and music-jetkreate-backend now go through requests. The repo has no git remote and no commits yet, so other machines will see a registry row for a repo they cannot clone until that is fixed.
