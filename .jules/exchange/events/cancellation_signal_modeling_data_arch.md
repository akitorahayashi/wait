---
label: "refacts"
created_at: "2026-03-27"
author_role: "data_arch"
confidence: "high"
---

## Problem

Signal types (`'SIGINT' | 'SIGTERM'`) are hardcoded across multiple domain, adapter, and index layers as literal string types, creating scattered duplication. Error boundary handling throws exceptions into control flow instead of returning explicitly modeled results.

## Goal

Define a single source of truth for runtime signals (e.g., an enum or constant-type module). Move from using thrown errors (`WaitCancelledError`) for control flow to a union or Result-based approach for returning a cancellation state gracefully back to `index.ts`.

## Context

The core application flow uses `throw new WaitCancelledError(signal)` deeply inside an adapter (`cancellation-aware-delay`), bypassing the domain's return path. This forces the entrypoint (`index.ts`) to rely on an instance-of check instead of explicitly handling the return state from `executeWait`.

## Evidence

- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "4-12"
  note: "`WaitCancelledError` is defined in an adapter layer and uses literal types for signals."
- path: "src/index.ts"
  loc: "16-20"
  note: "Entrypoint relies on `instanceof WaitCancelledError` to catch an expected control flow (cancellation)."
- path: "src/index.ts"
  loc: "30-37"
  note: "Duplicated literal union `'SIGINT' | 'SIGTERM'` inside `signalExitCode`."

## Change Scope

- `src/domain/cancellation-signal.ts` (new)
- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`
- `src/app/execute-wait/index.ts`