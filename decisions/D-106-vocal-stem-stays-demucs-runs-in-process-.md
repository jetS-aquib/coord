---
id: D-106
title: Vocal stem stays; Demucs runs in-process on every vCPU, preloaded at startup
date: 2026-11-25
status: active
superseded_by: 
repos: video-processing-backend
tickets: JET-443
---

## Context

Demucs is 117-234s of a 4-5 min read on staging (JET-441), run as a subprocess per song on torch's default thread count. JET-443 asked whether the Gemini pieces could be cut from the mix instead, dropping Demucs.

## Options considered

1. Pieces from the mix, Silero VAD for the cut points (no Demucs). 2. Keep the stem; Demucs in-process with the model loaded once and all vCPUs. 3. Swap in an ONNX vocals-only model.

## Decision

2. Option 1 was measured and rejected: on the 5-song eval (3 runs each) word accuracy fell 0.72 -> 0.69 overall, Lutt Putt 0.72 -> 0.57, Zaaya worst run 0.65 -> 0.23, consistency 0.67 -> 0.52. Option 3 is not done: it needs an exported model nobody has validated here, and an eval of its own.

## Reason

The accuracy bar is no regression. In-process Demucs runs the same Separator + save_audio code the CLI runs, so the stem is the same; it removes the per-song interpreter/torch/model start and uses all 4 vCPUs instead of torch's physical-core default. Subprocess kept as fallback.

## Consequences

Demucs remains the long pole of an uncached read. A hung in-process separation cannot be killed and holds the gate. Weights now live in a torch-cache volume.
