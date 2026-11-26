---
id: JET-460
title: Console v2: design tokens and base components (theme split, semantic colours, status light, level meter, states, loading)
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: open
created: 2026-11-26T15:48:48+05:30
updated: 2026-11-26T15:48:48+05:30
decisions: 
---

## Request

Build the console's visual foundation from music-jetkreate-web/planning/ui-ux-audit/02 §3-5 and doc 08 F0.1, F0.5, F0.6, F0.7.
Size: M. Builds on: none. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

The console shares Studio Ink with www; the audit (Impeccable cream-palette finding, Frontend Design calibration) moves the console to a neutral "mixing desk" theme where colour means state, while www keeps its warm look. Needs: globals.css split into base + theme-www + theme-console; tokens bg, surface, surface-2, ink, ink-2, line, cue, ok, warn, danger, info, chart-1..6 in light and dark; type scale (13px tables, 11px chart axes); 6/8px radius; hairlines, no shadows; 2px focus outline. Components in packages/ui: PageHeader (breadcrumb, one primary action, overflow menu), FilterBar with chips and Clear all, DateRange (presets 7d/30d/90d/MTD/QTD/custom, UTC label, URL from/to), KpiTile (value, delta, sparkline slot, number badge Measured/Priced/Estimated/Entered/Projected), StatusLight, LevelMeter, ChannelStrip, Badge (quiet by default), EmptyState, ErrorState (code, message, retry, request id), plus loading.tsx per console route group and pending nav state. Assumption: www must look identical after the split.

## Plan

1. Split globals.css; add console tokens in light and dark.
2. Build the components above in packages/ui with one usage each.
3. Add loading.tsx skeletons and error boundaries per route group.
4. Number formatters: fmtUsd, fmtCredits, fmtPct, number badge.
5. Check www unchanged (screenshots) and console contrast >= 4.5:1 in both themes.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

packages/ui/src/globals.css, packages/ui/src/components/*, apps/admin/app/(console)/**/loading.tsx, apps/admin/components/ui.tsx

## Acceptance criteria

www pages look unchanged; console text and controls meet 4.5:1 in light and dark; a throttled page shows a skeleton within 100 ms; Impeccable detect reports no cream-palette on console pages.

## Test steps

—

## Thread
2026-11-26T15:48:48+05:30 aquib N: created ticket, status: - -> open
