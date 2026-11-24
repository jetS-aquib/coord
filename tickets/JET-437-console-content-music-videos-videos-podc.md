---
id: JET-437
title: Console content: music videos, videos, podcasts, feedback, public assets and elements
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: open
created: 2026-11-24T17:05:09+05:30
updated: 2026-11-24T17:05:09+05:30
decisions: 
---

## Request

Browse, preview and moderate all user content, and manage the public asset library.

## Understanding

Uses JET-429. Takedown hides an item (share link 404) without deleting it; restore undoes it. Public assets and elements get create/edit/delete. Feedback is read-only, linking to the video and user.

## Plan

1. /content with tabs per kind: table, filters, preview player/drawer.
2. Takedown/restore with reason.
3. /content/feedback list.
4. /content/assets and /content/elements CRUD with upload.

## Reason

—

## Related files

apps/admin/app/(console)/content/**

## Acceptance criteria

Taking a video down from the console breaks its share link; restoring brings it back.

## Test steps

—

## Thread
2026-11-24T17:05:09+05:30 aquib N: created ticket, status: - -> open
