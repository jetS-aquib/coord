---
id: D-087
title: Places come from the lyrics; a picked place is a commitment
date: 2026-11-17
status: active
superseded_by: 
repos: music-jetkreate-backend, music-jetkreate-mobile
tickets: JET-342, JET-343
---

## Context

Nearly every Hindi/Punjabi render was two people in a yellow-flower field. Causes: the 'Nature' option's phrase said 'fields'; Jassi's voice named mustard fields; Rohan's said 'a grand new place'; song research returned the region's stock places; nothing looked at the lyrics or at where the person's last videos were set.

## Options considered

(a) let the person pick from the six coarse place ids only; (b) image thumbnails per suggested place (~$0.03 each, every brief); (c) text place cards read from the lyrics on /brief, a free-text direction.where, and prompts that avoid the postcard and the last 3 renders' places.

## Decision

(c). /brief returns places[]; direction.where replaces the place phrase as a commitment; treatment and brief are told the person's recent places; the Nature phrase, Jassi's and Rohan's voices and the song-research settings line no longer point at fields or a postcard.

## Reason

Fixes the default for people who tap through, and gives people who care a one-tap choice, at no extra image cost.

## Consequences

The treatment prompt changes for every render (new PLACES COME FROM THE WORDS rule), so earlier renders are not byte-comparable on places. Recent places cost one indexed query per brief and per direction. Thumbnails can be added later on top of the same cards.
