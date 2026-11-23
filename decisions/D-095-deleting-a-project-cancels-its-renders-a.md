---
id: D-095
title: Deleting a project cancels its renders and keeps their plans
date: 2026-11-23
status: active
superseded_by: 
repos: music-jetkreate-backend
tickets: JET-388
---

## Context

DELETE /api/music-videos/:id left a running render filming and billing. JET-388 left delete-vs-mark of RenderPlanV1 rows to the implementer.

## Options considered

Delete the plan rows; keep them cancelled; add a deletedAt mark

## Decision

Cancel every unfinished plan via cancelRenderV1, then delete the project. Plans stay, status cancelled, no new field.

## Reason

Shots already in flight save onto their plan when they land, and a deleted row would fail that save. The admin render list is the history of what was filmed. Allowance and spend come from GenerationLog, so a kept plan charges nobody.

## Consequences

Plan rows outlive their project until account deletion (deleteAccount removes them). GCS media is untouched; cleanup is a later job.
