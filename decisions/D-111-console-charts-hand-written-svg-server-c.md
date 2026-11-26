---
id: D-111
title: Console charts: hand-written SVG server components in packages/ui, no chart library
date: 2026-11-26
status: active
superseded_by: 
repos: music-jetkreate-web
tickets: JET-461
---

## Context

JET-461 needs six chart types (line, stacked and diverging bar, waterfall, funnel, cohort heatmap, scatter) with axes and units, theme colours, keyboard-reachable values, an aria summary and a table view. D-110 (assumption 7) asked the web session to choose, preferring one small library over hand-rolled SVG once there are more than a few chart types. The console renders on the server (RSC); the old chart was a 60-line SVG bar.

## Options considered

(a) Recharts 3.11 (3.10.1 for a 2-week-old pin): complete, accessibilityLayer gives keyboard tooltips; but pulls 11 runtime deps including Redux Toolkit, react-redux and immer, and every chart becomes a client component. (b) visx: modular and small per package, but xychart needs react-spring and axes/tooltips are still assembled by hand. (c) uPlot: tiny and fast, but canvas, so weak screen-reader support and theming through JS. (d) Hand-written SVG server components with one shared scale/axis core and one small client tooltip.

## Decision

(d). packages/ui/src/components/charts.tsx (BarChart with negatives, LineChart with dashed projected series, WaterfallChart, FunnelBars, CohortHeatmap, Scatter), packages/ui/src/lib/scale.ts (nice ticks, tested), packages/ui/src/components/chart-tips.tsx (the only client code: tooltip, one tab stop per chart, arrow keys between values). Colours come from --chart-1..6 and semantic tokens; red is reserved for negatives and failures. No pie or gauge charts.

## Reason

None of the libraries is both small and accessible and server-rendered: Recharts is the closest in features but is not small and moves every chart to the client. The six charts share one frame, so the hand-written set is about 300 lines with no dependency, renders with the page, and themes through CSS variables. This departs from D-110's stated preference; that preference was a default for the web session to weigh, not a requirement.

## Consequences

No zoom, brushing or animated transitions. If the console needs interactive exploration (zoom on long ranges, linked charts), revisit with Recharts in a client component; the Point {x, values} data shape maps onto it directly. Tooltip text comes from data-tip attributes, so any new chart type must set data-tip and aria-label on its marks.
