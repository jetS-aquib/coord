---
id: JET-461
title: Console v2: chart set (line, stacked and diverging bar, waterfall, funnel, cohort heatmap, scatter) and chart library decision
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:49+05:30
updated: 2026-11-26T15:51:00+05:30
decisions: 
---

## Request

Replace the hand-rolled Bars with a small chart set (music-jetkreate-web/planning/ui-ux-audit/02 §5, doc 08 F0.2). D-110 asks the web session to pick the library with its own decision record.
Size: M. Builds on: JET-460. Decisions: D-109 (backend defaults), D-110 (business answers).

## Understanding

Every chart needs: y-axis with units, a gap-filled x domain, theme tokens (chart-1..6; red only for negatives and failures), legend when more than one series, keyboard-reachable tooltip, aria-label summary, and a "view as table" toggle. No pie or gauge charts. A decision record chooses one small library (candidates: Recharts, visx, uPlot) vs hand-rolled SVG, judged on bundle size, SSR, a11y and theming.

## Plan

1. Compare 2-3 libraries on one chart; write the decision record (coord decide).
2. Build LineChart, BarChart (stacked, diverging), WaterfallChart, FunnelBars, CohortHeatmap, Scatter in packages/ui.
3. Replace chart.tsx usages on Overview, Analytics and Billing.
4. Readable heatmap text in both themes.

## Reason

Console v2 (planning/ui-ux-audit). Backend APIs are final: JET-448..458 done, contract .coord/contracts/api-admin.md.

## Related files

packages/ui/src/components/charts/*, apps/admin/components/chart.tsx (removed), pages that use Bars

## Acceptance criteria

Negative values render below zero; a 30-day range with 3 data points shows 30 slots; tooltips work by keyboard; each chart has a table view; decision record linked.

## Test steps

—

## Thread
2026-11-26T15:48:49+05:30 aquib N: created ticket, status: - -> open
2026-11-26T15:51:00+05:30 aquib N: status: open -> approved
