---
id: JET-418
title: Credit accounts and ledger: balance, free grants, refills with switchable rollover, and daily/weekly/monthly limits that reset by rule
from: music-jetkreate-backend
to: music-jetkreate-backend
filed_by: aquib N
status: approved
created: 2026-11-24T12:55:47+05:30
updated: 2026-11-24T13:20:12+05:30
decisions: D-100, D-101
---

## Request

Depends on: JET-416. There is no balance today, only a weekly seconds counter (launch-limits.weeklyRenderSeconds) and per-user override rows. Users need a credit balance with free grants, refills, rollover that can be switched on or off, and daily and weekly limits that reset automatically.

## Understanding

Assumptions: (1) CreditLedgerV1 is append-only and the record of truth: {userId, type grant|refill|reserve|settle|refund|charge|adjust|purchase|expire, credits (+/-), balanceAfter, ref {jobId|adminId|paymentId}, idempotencyKey (unique), meta, createdAt}; (2) CreditAccountV1 caches {balance, planId, planVersion, periodStart per window, frozen, override plan}; every debit is an atomic $inc guarded by the balance (balance >= amount), so two renders started at once cannot both overspend; (3) refills are applied lazily when the account is read (no cron), and are idempotent per period; (4) rollover per plan: off = the refill tops up to the refill amount; on = adds, capped by maxCarry, and carried credits can expire after N days (an expire entry); (5) limits per plan in credits per day/week/month, plus renders per day; windows are calendar windows in the plan's timezone (default Asia/Kolkata), so they reset at midnight, Monday 00:00 and the 1st; computed from the ledger, so they reset by rule with no job; (6) the signup grant is given once per account (abuse controls decide eligibility); (7) migration: existing UserGenerationQuota override rows become account overrides; launch-limits.weeklyRenderSeconds is retired once charging is live; (8) a per-user plan override and a one-off admin grant are both ledger entries.

## Plan

1. Models CreditLedgerV1 and CreditAccountV1, with indexes.
2. accountV1(userId): lazy create, refill, expire.
3. debitV1/creditV1 with idempotency and an atomic guard.
4. limitsV1(userId): what is left today, this week and this month, from the ledger.
5. Migration script for overrides.
6. Tests: concurrent debits never go below zero; a refill fires once per period; rollover on vs off; the daily window resets at IST midnight; an expired carry is removed.

## Reason

Credits need a balance that cannot be double-spent and limits that reset on their own.

## Related files

src/models/CreditLedgerV1.ts, src/models/CreditAccountV1.ts, src/modules/billing/*, src/middleware/generationLimiter.ts, scripts/migrate-quota-overrides.ts

## Acceptance criteria

A new user gets the signup grant once; after the refill period the balance refills by the plan's rule; with rollover off unused credits do not accumulate, and with it on they do up to maxCarry; a user at the daily limit is refused until midnight IST and allowed after; 20 parallel debits of 10 against a balance of 100 succeed exactly 10 times.

## Test steps

1) Sign up a new user -> GET /billing/me shows the signup grant; 2) set the plan's refill period to day and wait (or move the clock in a test) -> one refill entry; 3) switch rollover on in the plan -> the next refill adds instead of topping up; 4) spend up to perDay -> the next request is refused with code daily_limit and resetsAt; 5) check the ledger has one entry per action, with balanceAfter.

## Thread
2026-11-24T12:55:47+05:30 aquib N: created ticket, status: - -> open
2026-11-24T12:56:05+05:30 aquib N: linked decision D-100 (Billing: credits as the unit, an append-only ledger as the record of truth, every AI call metered, free reshoots behind a switch)
2026-11-24T13:02:24+05:30 aquib N: status: open -> approved
2026-11-24T13:20:12+05:30 aquib N: linked decision D-101 (Billing config in one versioned collection; credits seeded at 100 per USD of cost; USD cost logging left on the old tables)
