---
id: D-093
title: Lock the Studio Ink design language for the mobile app (V2)
date: 2026-11-23
status: active
superseded_by: 
repos: music-jetkreate-mobile
tickets: JET-397, JET-398
---

## Context

V1 revamp fixed the journey but kept a heavy look: rounded panels on every section, full-width lavender slab buttons, lavender on every control, cool blue-black with glow orbs, system font only, no in-app branding. User reviewed the V2 proposal (docs/ux-revamp-v2, artifact 7JdVEQRYBCeC5G1VveG3fM) and approved it on 2026-11-23: 'this is awesome lets lock this'.

## Options considered

A Editorial Dark Studio; B Cinematic Immersive; C Modern Creative Workspace; hybrids.

## Decision

Studio Ink = A as the base, B's full-bleed media only on Sign in, Home featured, Working hero and the reveal (scrims, no blur), C's compact sizes only in the call sheet/studio. Warm charcoal #121110/#1A1817/#23211F; ivory #F2ECE4/#ABA49B/#8F8981; cue coral #FF7759 for live states only (playhead, active lyric, progress, the one Film commit); selection is ivory, never coral. Instrument Serif (display >= 20px) + Geist + Geist Mono, bundled OFL via existing expo-font. 48/40 buttons that hug their label in a bottom action bar; hairlines and space instead of panels; radius 4/8/10/12/pill. Brand 'jetKreate Music' with the logo mark. Director avatars kept everywhere.

## Reason

Distinct identity (coral is the warm end of our own logo), content-first, works for forms as well as media, fixed text contrast (all text tokens measured >= 4.5:1), no blur so it is safe on 2 GB Android, mostly achievable by changing token values.

## Consequences

signal/orbs tokens retired (125 uses in 32 files remapped); three bundled fonts; mobile tickets JET-397..JET-410 implement it after backend JET-384..JET-396.
