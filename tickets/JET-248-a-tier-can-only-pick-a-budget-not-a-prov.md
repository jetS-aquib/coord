---
id: JET-248
title: A tier can only pick a budget, not a provider: the v1 clip path speaks one API
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-04T00:01:58+05:30
updated: 2026-11-04T00:01:58+05:30
decisions: 
---

## Request

Make at least one non-Google video provider renderable by the v1 pipeline, so a tier's modelKey is a real choice and demo can run at a lower price per second.

## Understanding

D-068 wired the tier's modelKey and then had to point all three tiers at omni, because omni is the only model this pipeline can render: generateClipV1 speaks the Interactions API and startRenderV1 throws a ValidationError for any provider that is not google-omni. The BytePlus rows are already in VIDEO_MODELS_V1 and unreachable — seedance-1-5-pro at $0.052/s against omni's $0.10/s is half the price of the same song, and that is the only lever that changes what a render actually costs. Assumptions, and one of them is the whole job: (1) THE HARD PART IS NOT THE HTTP CALL, it is that seedance has supportsEndFrame: false. This pipeline pins both ends of every clip to a still — anchor i opens clip i, the seam between them is measured and re-rendered against a threshold — and a provider that cannot pin a closing frame cannot do that, so 'demo on a cheaper provider' means a different continuity model, not a swapped base URL. (2) Only demo should move; standard and hero stay on omni, so the dial becomes cost-and-continuity rather than cost alone. (3) modelKey on the request stays the engineer's override and still wins over the tier. (4) This is not a request to migrate the v0 endpoints or config/aiModels.ts — videoModelsV1 stays additive. (5) Nothing here changes what standard or hero render today; if it cannot be done without touching them, say so rather than doing it.

## Plan

1. One clip call that takes a start frame always and a closing frame only when the model row says the provider accepts one.
2. Replace startRenderV1's google-omni guard with a renderable flag on the model row, so a provider is reachable by being configured rather than by being Google.
3. Decide and write down what an anchor means without end-frame pinning: the seam check measures the opening frame only, the frame gate carries more of the weight, or both — and what the seam threshold means there (it was calibrated on omni output; see JET-245).
4. Point demo at the cheaper row in RENDER_TIERS_V1. renderCostCeilingV1 already prices per model, so the floor and ceiling follow.
5. Update .coord/contracts/api-music-videos.md: the tier table's prices and the continuity difference, stated plainly.
6. Render one song end to end on each provider and record the measured cost and seam scores before either becomes a tier's default.

## Reason

The tier dial shipped with its most useful position empty. demo exists to make a render cheap enough to throw away, and today it costs exactly what hero costs minus the re-shoots — on a four-minute song that is $24.80 either way, because the base cost is the song's length times a price per second and only the provider changes the price.

## Related files

src/services/ai/omniVideoService.ts, src/services/providers/byteplusProvider.ts, src/config/videoModelsV1.ts, src/services/render/renderOrchestratorV1.ts, .coord/contracts/api-music-videos.md

## Acceptance criteria

The same song rendered on demo reports a measurably lower estimatedCostUsd than on standard, with a different modelKey on the state payload; a render on a provider that cannot pin a closing frame produces a master whose seams are explained in the contract rather than quietly worse; standard and hero render exactly what they render today.

## Test steps

—

## Thread
2026-11-04T00:01:58+05:30 aquib N: created ticket, status: - -> open
