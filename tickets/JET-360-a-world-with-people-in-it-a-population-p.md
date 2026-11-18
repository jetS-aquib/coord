---
id: JET-360
title: A world with people in it: a population per place, background extras in soft focus, plates described positively
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: review
created: 2026-11-18T17:10:48+05:30
updated: 2026-11-18T17:51:54+05:30
decisions: 
---

## Request

Treatment gives each place a population (empty / a few / busy) from the place and time of day. Still prompts add that many background people, soft focus, going about their business, not looking at camera. Location plates stop saying 'no people' and describe the empty space positively.

## Understanding

Streets were empty in the last render because plates say 'Nobody in it' and stills add extras only when a shot names a crowd; the one crowd shot (1:43) looked best. Crowds hallucinate (merged limbs), so they stay background and soft. Behind flags.render.extras.

## Plan

1. Treatment/look bible: population per place.
2. anchorPromptV1: extras line by population and shot size.
3. Plate prompt rewritten without negatives.
4. Stills previews of the eval set; QA counts for crowd limb failures.

## Reason

An empty city reads as fake.

## Related files

src/services/render/treatmentV1.ts, src/services/render/lookBibleV1.ts, src/services/render/renderPromptsV1.ts

## Acceptance criteria

Street/market/station stills show believable background people; quiet places stay quiet; no rise in anatomy fails.

## Test steps

1. Same render: street/market/station stills have soft-focus background people; rooftop/bedroom stills stay empty.
2. `renderReport.ts`: no rise in anatomy/people failures.

## Thread
2026-11-18T17:10:48+05:30 aquib N: created ticket, status: - -> open
2026-11-18T17:12:47+05:30 aquib N: status: open -> approved
2026-11-18T17:51:54+05:30 aquib N: status: approved -> in_progress
2026-11-18T17:51:54+05:30 aquib N: status: in_progress -> review — Built behind its flag; see docs/rnd/02-realism-plan.md 'Built' section for what was measured.
