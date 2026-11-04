---
id: D-071
title: One flat generation quota of 50 for every user while only internal users exist
date: 2026-11-04
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: 
---

## Context

Production always enforces quotas and no env var could change the limits; the defaults were text 1000, image 200, video 100, audio 200, and per-user overrides need a database row per user.

## Options considered

—

## Decision

GENERATION_LIMIT env var sets every type to one number, production included. Set to 50 for the prototyping server. limitsEnforced() is unchanged: this is a cap, not a bypass. Unset restores the per-type defaults.

## Reason

—

## Consequences

Text drops from 1000 to 50 a month. v1 renders log one 'video' generation per clip, so a single 45-clip mobile render uses 45 of the 50, after which the web clip routes refuse that user for the rest of the 30-day window (the v1 render route itself is not quota-checked). Revisit before any external user.
