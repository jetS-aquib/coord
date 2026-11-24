---
id: JET-425
title: Billing gaps the app needs: credit refusals through create-and-render, enforced flag on /billing/me, feature categories, call sheet and edits in credits, copy keys
from: music-jetkreate-mobile
to: music-jetkreate-backend
filed_by: aquib N
status: open
created: 2026-11-24T14:03:19+05:30
updated: 2026-11-24T14:03:19+05:30
decisions: 
---

## Request

Found while building JET-423/424 against the billing API (JET-416..421). Depends on: JET-419, JET-421.

## Understanding

Assumptions: (1) createAndStartV1 catches startRenderV1's 402 insufficient_credits / 403 account_frozen / 409 concurrent_limit / 429 daily|weekly|monthly|render_limit and stores a generic start_failed, so Film now shows 'That did not start' + Try again instead of the credit sheet; the app already reads startError.code and details if they are kept. (2) GET /billing/me does not say whether billingEnforced is on, so during the soft launch the app blocks a film the server would allow; the app also hard-codes the 1.2 reserve buffer. (3) /billing/usage byFeature items carry no category, so the Credits screen guesses from the function name and most of Filming shows as 'Inside your videos'. (4) The call sheet and the edit proposal still only carry USD (costUsd); no credits figure. (5) After settle, render state sets reserved to 0, so the app cannot say how much unused credit came back. (6) The copy bundle has no credits.howItWorks text and there is no support contact anywhere (LEGAL_LINKS.contact empty), so the frozen message points at no address.

## Plan

1. createAndStartV1: keep the billing refusal's code and details on startError (code, message, details).
2. /billing/me: add enforced (billingEnforced) and reserveBuffer.
3. usageV1: add category to each byFeature item.
4. Call sheet and edit proposal: add credits (estimate or held) beside costUsd; never USD to users.
5. Render state credits: keep reserved after settle, add returned.
6. Copy seed: credits.howItWorks and a support contact (email or URL); bump the copy bundle.
7. Tests for each; update contracts/api-billing.md.

## Reason

Credits only make sense if every refusal reaches the person with its reason, and the app must not refuse what the server allows.

## Related files

src/services/render/*createAndStart*, src/modules/billing/billing.routes.ts, src/modules/billing/usageV1.ts, src/services/render/callSheetV1.ts, src/modules/config/seedV1.ts, .coord/contracts/api-billing.md

## Acceptance criteria

Film now with 0 credits and billing enforced shows the credit sheet, not 'did not start'; /billing/me returns enforced; byFeature items have category; call sheet shows credits held; copy has credits.howItWorks and a support contact.

## Test steps

—

## Thread
2026-11-24T14:03:19+05:30 aquib N: created ticket, status: - -> open
