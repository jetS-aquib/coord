---
id: D-090
title: PostHog AI events captured by hand at our token log, not via @posthog/ai; admin audit reuses AuditLog
date: 2026-11-19
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-372
---

## Context

D-089 planned @posthog/ai's Gemini wrapper for $ai_generation and a new AdminAction collection for the admin audit.

## Options considered

1) @posthog/ai GoogleGenAI wrapper inside our gated proxy. 2) Manual $ai_generation: the shared proxy remembers each call's input (WeakMap, like callTimingV1) and tokenLogger, which every Gemini call already passes and which knows fn/model/user/tokens/cost, captures it. Audit: new AdminAction vs the existing, unused AuditLog model.

## Decision

Option 2, and AuditLog (actor 'admin:<id>').

## Reason

The wrapper only covers generateContent (Omni video still needed manual capture) and does not know the calling function (span name), so we would capture in two styles. Manual capture gives one code path, cost from our own calculateCost so PostHog equals GenerationLog, and no new dependency. AuditLog already has the exact shape.

## Consequences

No @posthog/ai dependency. Privacy mode is ours: calls named in PRIVATE_FNS_V1 (special request, edit interpreter) are sent without input/output. A Gemini call that skips tokenLogger would be untraced; today none does. Omni clips carry cost and seconds but not the prompt.
