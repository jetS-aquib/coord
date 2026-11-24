---
id: D-101
title: Billing config in one versioned collection; credits seeded at 100 per USD of cost; USD cost logging left on the old tables
date: 2026-11-24
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-416, JET-418
---

## Context

JET-416 asked for RateCardV1, PlanV1 and BillingSettingsV1 collections and for tokenLogger/renderCostV1/videoModelsV1 to read prices from the rate card. The person asked for a new billing module that leaves the old pricing code alone.

## Options considered

Three collections vs one with a kind field. Rewire USD cost logging to the rate card vs leave it and price only credits from the card. Active version as a pointer vs the most recently published row.

## Decision

One BillingConfigV1 collection, kind = rateCard | plans | settings, immutable versions, draft then publish once; active = most recently published; rollback publishes a new version carrying the old payload. Credits come only from the rate card (creditsForV1); USD cost logging (tokenLogger, renderCostV1 USD) still reads the hard-coded tables, which are also the seed, so both agree at v1. Seed: 100 credits per USD of cost, tier multipliers 1, free plan 700 signup + 700/week top-up, 500/day, 3 renders/day, 1 concurrent, 90s max; billingEnforced off, freeReshoots on. A model with no entry is priced costUsd x creditsPerUsd; no entry and no cost is refused, never free.

## Reason

The three configs differ only in payload, so one model and one set of routes is less code. Not touching tokenLogger keeps USD logging stable while billing is new. Publishing a new version for rollback keeps history append-only.

## Consequences

Changing a cost in the rate card does not change logged USD until JET-417 meters from the card. Plans and switches are each one document holding all plans / all switches. Prices and plan numbers are launch defaults to tune by publishing plans@2 / rate-card@2.
