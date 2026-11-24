---
id: D-100
title: Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch
date: 2026-11-24
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-416, JET-417, JET-418, JET-419, JET-420, JET-421, JET-422, JET-423, JET-424
---

## Context

Launch is free credits, payments later. Prices were hard-coded, limits were weekly seconds, nothing recorded a balance, and two renders started together could both pass the limit.

## Options considered

Unit: credits vs seconds vs USD. Store: Mongo versioned config vs PostHog payloads. Charging: reserve/settle per render vs charge per call only. Failed shots: always free vs always charged vs a switch.

## Decision

Users see credits only. The rate card, plans and billing switches are versioned in Mongo, admin-published, and cached for 10s. CreditLedgerV1 is append-only and the record of truth, with an atomic guarded balance on CreditAccountV1. Every AI call is metered in credits with category, feature and jobId. Renders reserve at start and settle at the end, with the rate and freeReshoots frozen per render. Calls outside a render are charged per call. Rollover and refill periods are per plan. Daily, weekly and monthly limits are calendar windows in the plan timezone, computed from the ledger. Abuse controls: rate limits, one grant per verified person and device, concurrent caps, and an anomaly freeze.

## Reason

Credits decouple the price from our cost. Money needs an audit trail and atomic balances, which PostHog cannot give. A per-render reservation closes the double-start race. Freezing the rate per render keeps the 'immediate' price changes from changing a video mid-render.

## Consequences

The weekly-seconds limit and override rows are retired by migration. Hard-coded price tables become the seed only. Selling credits in the iOS/Android app must go through store in-app purchase (e.g. RevenueCat); a web gateway such as Razorpay only for the web. Every AI route gains a balance pre-check, so the app must handle 402 insufficient_credits everywhere.
