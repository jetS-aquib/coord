---
id: JET-287
title: Fix screen: prefill the suggested prompt and show what was sent and why it failed
from: music-jetkreate-backend
to: music-jetkreate-mobile
filed_by: aquib N
status: open
created: 2026-11-10T01:57:40+05:30
updated: 2026-11-10T01:57:40+05:30
decisions: 
---

## Request

On "One shot could not be made", fill the wording box with the suggested prompt and show the sent prompt (collapsed), the cause in plain words, and the likely reason.

## Understanding

Uses the fields added by the backend failure-transparency request. Extends JET-251.

## Plan

Depends on: JET-286.
1. Prefill the wording with suggestedPrompt (editable).
2. "What we asked for" disclosure with sentPrompt.
3. Cause and likelyReason as one plain line.

## Reason

Audit 2026-11-10 (plan: v1 orchestration + v2 stitch). Today the box is empty and the screen says only "the video service did not return this shot", so a creator who picked a director cannot see what was asked.

## Related files

fix screen in music-jetkreate-mobile

## Acceptance criteria

A blocked render opens with the suggested prompt already in the box, and the sent prompt and reason visible on tap.

## Test steps

—

## Thread
2026-11-10T01:57:40+05:30 aquib N: created ticket, status: - -> open
2026-11-10T15:11:12+05:30 aquib N: Backend side is built (JET-286). Every missing clip (failed or refused) now carries failure: { cause: refused|timeout|no_video|quota|error, likelyReason, prompt, sentPrompt, suggestedPrompt }. In blocked-decision.tsx: prefill the wording box from failure.suggestedPrompt (falls back to failure.prompt when null), show failure.likelyReason as the line under the shot, and put failure.sentPrompt behind a 'What we asked for' disclosure (read-only, never sent back). For timeout/quota/error, suggestedPrompt is the shot itself, so the button is enabled straight away. See the failure section of api-music-videos.md.
