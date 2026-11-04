---
id: D-070
title: A refused shot's suggested fix is asked for once, at the blocked gate, and the fix is one call for many shots
date: 2026-11-04
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-250
---

## Context

Refused shots got a canned sentence and nothing to act on, and fixing them meant one rerender call per shot, each locking the render and re-stitching.

## Options considered

—

## Decision

Each refused clip carries refusal { cause, suggestedPrompt }. Suggestions come from one text call over all refused shots when the render goes blocked (not per refusal, and not sanitizePromptsV1, which only asks whether a prompt WOULD be refused and only knows real people). POST …/clips/fix takes many { index, prompt } and resumes once. Suggestion failure leaves suggestedPrompt null; it never blocks.

## Reason

—

## Consequences

A refusal that the provider explains in a way none of our three causes match is labelled 'content'. The suggestion rewrites the clip's own prompt, while the provider saw it wrapped with the look bible and cast; a refusal caused by a cast description will get a suggestion that does not fix it, and re-refuse.
