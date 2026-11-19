---
id: JET-374
title: Prompts in PostHog prompt management, with today's hardcoded prompts as the fallback
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-19T16:57:46+05:30
updated: 2026-11-19T16:57:46+05:30
decisions: 
---

## Request

Store and serve our LLM prompts from PostHog prompt management (Prompts), so a prompt can be changed, versioned, rolled back and A/B tested without a deploy. Keep today's hardcoded prompts in the files as the fallback.

## Understanding

Every prompt is fetched by name from PostHog with label 'production'; if PostHog has no such prompt, is unreachable, or keys are missing, the hardcoded text in the file is used, so behaviour is unchanged until a prompt is published there. Verified in code: prompts are not static strings — they are template literals assembled with flag-dependent blocks (e.g. shotListV1 has ~25 interpolations, GEN_V2/stillRules/performance blocks), so each one must be rewritten as a {{variable}} template whose variables (including whole optional blocks) are computed in code; the fallback becomes that template, and the risk is changing a prompt by accident while converting. Docs (posthog.com/docs/prompt-management): Prompts class in @posthog/ai, prompts.get(name,{label,fallback,cacheTtlSeconds}) with a 5-min cache and stale-on-failure, prompts.compile(template, vars) for {{var}}, / link a generation to the version used; needs the app host (https://eu.posthog.com, not eu.i) and a phs_/phx_ key with llm_prompt:read. ASSUMPTIONS: (1) scope = the render pipeline prompts only (treatment, script, shot list, safety, still/clip prompts, frame gate, clip check/QA, song context, brief, special request, edits) — the legacy services (thumbnails, ideas, podcasts, audio, video ~280 interpolations) stay hardcoded unless you say otherwise; (2) git stays the source of truth: a sync script uploads each fallback as a new PostHog version and reports drift, because once a 'production' label exists PostHog wins and a later code edit to the fallback would silently not ship; (3) a render keeps the prompt versions it started with is NOT attempted (5-min cache only) — versions are recorded on each  instead; (4) adds @posthog/ai (only for Prompts), recorded as a decision since D-090 avoided it; (5) behind flags.posthog.prompts, off by default.

## Plan

1. Add @posthog/ai; promptV1(name, fallbackTemplate, vars) in src/shared/posthog.ts: prompts.get with label 'production' + fallback, compile, returns text; remembers name/version per compiled text so the shared proxy tags $ai_generation with $ai_prompt_name/$ai_prompt_version.
2. Convert render prompts one file at a time to {{var}} templates; a unit test per file asserts the template compiled with today's inputs equals today's prompt byte for byte (no accidental change).
3. scripts/rnd/syncPrompts.ts: list every registered fallback, upload as new versions (dry run shows diffs vs PostHog production), optionally move the production label.
4. Decision record (dependency, git-as-source-of-truth); docs section; flag off by default; npm test green.
5. Guide: key scope llm_prompt:read (and write for the sync), first sync, how to edit/roll back a prompt in PostHog.

## Reason

Iterating on prompt wording is most of the R&D loop; today every wording change is a deploy, and there is no record of which wording a render used.

## Related files

src/shared/posthog.ts, src/services/ai/shared.ts, src/services/render/{treatmentV1,scriptV1,shotListV1,promptSafetyV1,renderPromptsV1,frameGateV1,clipCheckV1,clipQaV1,songContextV1,briefV1,specialRequestV1,editsV1}.ts, src/config/flags.ts, scripts/rnd/syncPrompts.ts, package.json

## Acceptance criteria

With flags.posthog.prompts off, or PostHog empty, every prompt is byte-identical to today (tests prove it). After a sync, editing a prompt in PostHog and moving 'production' changes the next render's prompt within 5 minutes with no deploy, and its $ai_generation shows the prompt name and version. Deleting the label falls back to the code.

## Test steps

—

## Thread
2026-11-19T16:57:46+05:30 aquib N: created ticket, status: - -> open
