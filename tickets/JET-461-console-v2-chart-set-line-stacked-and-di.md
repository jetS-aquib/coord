---
id: JET-461
title: Console v2: chart set (line, stacked and diverging bar, waterfall, funnel, cohort heatmap, scatter) and chart library decision
from: music-jetkreate-web
to: music-jetkreate-web
filed_by: aquib N
status: approved
created: 2026-11-26T15:48:49+05:30
updated: 2026-11-26T17:32:22+05:30
decisions: D-111
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
2026-11-26T17:32:22+05:30 aquib N: linked decision D-111 (Console charts: hand-written SVG server components in packages/ui, no chart library)
2026-11-26T17:32:45+05:30 aquib N: BUILT (uncommitted). Decision D-111: hand-written SVG server components, no chart library (Recharts pulls Redux and forces client charts). packages/ui/src/components/charts.tsx: BarChart (stacked, negatives below zero), LineChart (missing = 0, null = gap, dashed projected series), WaterfallChart, FunnelBars, CohortHeatmap, Scatter (y=x option). Shared: y-axis with units, integer steps for counts, short date labels, theme colours (red only for negatives/failures; render statuses fixed colours), legend, 'View as table', aria summary; chart-tips.tsx gives hover/focus tooltips, one tab stop per chart, arrow keys/Home/End between values. scale.ts tested (packages/ui test script). Overview, Analytics (funnel + retention heatmap) and Billing moved to it; old Bars removed. Waterfall and Scatter are built but first used by JET-467. TEST STEPS: 1. /: four charts with y-axes and units; 30 days show 30 slots. 2. /billing: price-vs-cost chart draws below zero. 3. Tab to a chart, press arrow keys: the tooltip walks day by day. 4. 'View as table' under any chart lists the values. 5. /analytics: funnel bars with conversion %, retention grid readable in light and dark.
