---
id: JET-454
title: Console v2: revenue foundation (payments, subscriptions or credit packs, refunds) - feasibility only
from: music-jetkreate-web
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-26T15:07:31+05:30
updated: 2026-11-26T15:12:09+05:30
decisions: 
---

## Request

Feasibility study, not a build: payment model (subscriptions vs credit packs vs both); provider choice (RevenueCat for IAP + Razorpay for web?); webhook ingestion that writes Payment/Subscription records and purchase ledger rows; refunds; revenue facts table (gross, store/gateway fee, tax, net, currency, recognised period) for MRR movement and recognition.

Full 15-field spec: music-jetkreate-web/planning/ui-ux-audit/09-backend-feasibility-tickets.md#b7. Suggested priority: P3 (blocked on business decision).

## Understanding

No payment provider exists anywhere. CreditLedgerV1 has a purchase type and ref.paymentId but nothing writes them. D-100: launch on free credits; later store IAP in app and Razorpay on web. Revenue, MRR/ARR, ARPPU, refunds, churned revenue, LTV, CAC payback cannot exist without payment records. Assumptions: this is a feasibility request from the console v2 audit; the backend team decides the approach and may split or reject parts. Data: Payment, Subscription, RevenueFact (new). Schema: New collections; ledger purchase rows reference paymentId. Events: payment_succeeded, payment_failed, subscription_started/renewed/cancelled, refund_issued (PostHog + audit). Security: PCI scope stays with providers; webhook signature verification; finance/owner access.

## Plan

1. Confirm feasibility and answer the open questions: Subscriptions, credit packs, or both? Prices and currencies? Store commission handling? Recognise credit-pack revenue on purchase or on consumption (accountant)?
2. Propose the API shape (Provider webhooks; GET /admin/revenue/{summary,mrr-movement,payments,refunds}.) and update the owned contract.
3. Build behind the existing admin guard; expected behaviour: n/a until decided.
4. Fill Test steps.
Risks: Large cross-repo scope (mobile + backend + web); store policy constraints on selling credits. Dependencies: Business decision on monetisation; mobile app purchase SDK (music-jetkreate-mobile).

## Reason

Console v2 UI/UX audit (planning/ui-ux-audit). The web console will not start this work until these APIs are final.

## Related files

—

## Acceptance criteria

A written feasibility answer: chosen model, provider(s), data model, revenue recognition rule for credit packs, effort estimate.

## Test steps

—

## Thread
2026-11-26T15:07:31+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:12:09+05:30 aquib N: status: open -> approved
