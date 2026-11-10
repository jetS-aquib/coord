---
id: D-078
title: Feature flags and tuning live in config/flags.ts, not env
date: 2026-11-10
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-279
---

## Context

Flags and tuning knobs were spread across env vars (RENDER_*, STITCH_API_VERSION, LYRIC_ENGINE, GENERATION_LIMIT, RECAPTCHA_MIN_SCORE, the new GEMINI_* gate knobs) and hard-coded consts (SCRIPT_WRITER_V1, LOCATION_PLATES_V1). Too many env vars to manage across deployments.

## Options considered

1) keep env vars; 2) one typed config file read at call sites; 3) a flag service (PostHog) now.

## Decision

2. src/config/flags.ts holds every flag and tuning value; callers read flags.x.y at the call site, never copy it into a module const. Env keeps only secrets, URLs and per-machine settings. Kept in env on purpose: CAPTCHA_BYPASS_CLIENT (staging only, must never reach prod), ENFORCE_GENERATION_LIMITS (dev-machine opt-in), GCS_DISABLED, LOG_LEVEL.

## Reason

The user wants env for secrets and constants only, and a flag service later. Reading at call sites means a flag service can replace values in the object without touching callers or restarting.

## Consequences

Every deployment now behaves the same: a value that used to differ per environment is a code change. File defaults copy the local .env (stitch v2, gemini lyrics, generation limit 50); if a deployed env set different values, those deployments change behaviour on next deploy. Tests set flags instead of env.
