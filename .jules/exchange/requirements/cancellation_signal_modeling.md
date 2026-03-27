---
label: "refacts"
implementation_ready: false
---

## Goal

Centralize cancellation signal definitions and ensure exhaustive handling while returning explicit state instead of throwing cancellation errors.

## Problem

Signal definitions are scattered literals, and cancellation flow relies on throwing/catching `WaitCancelledError` deep in adapters. Furthermore, the `signalExitCode` switch lacks exhaustiveness checks for the signal union.

## Context

The core application flow uses `throw new WaitCancelledError(signal)` deeply inside an adapter (`cancellation-aware-delay`), bypassing the domain's return path. This forces the entrypoint (`index.ts`) to rely on an instance-of check instead of explicitly handling the return state from `executeWait`. In `src/index.ts`, `signalExitCode(signal: 'SIGINT' | 'SIGTERM')` correctly handles two string literals. However, if another signal (like `'SIGHUP'`) is later added to the union, TypeScript would only warn if `strictNullChecks` or `noImplicitReturns` forces it. A true exhaustiveness check (`const _: never = signal;`) explicitly prevents the invalid state at compile time and is a safer best practice for state unions.

## Evidence

- source_event: "cancellation_signal_modeling_data_arch.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "4-12"
  note: "`WaitCancelledError` is defined in an adapter layer and uses literal types for signals, throwing for control flow."

- source_event: "cancellation_signal_modeling_data_arch.md"
  path: "src/index.ts"
  loc: "16-20"
  note: "Entrypoint relies on `instanceof WaitCancelledError` to catch an expected control flow (cancellation)."

- source_event: "cancellation_signal_modeling_data_arch.md"
  path: "src/index.ts"
  loc: "30-37"
  note: "Duplicated literal union `'SIGINT' | 'SIGTERM'` inside `signalExitCode`."

- source_event: "switch_exhaustive_missing_typescripter.md"
  path: "src/index.ts"
  loc: "line 36-41"
  note: "Switch lacks an explicit default `never` case, making it potentially non-exhaustive if the type signature is expanded."

## Change Scope

- `src/domain/cancellation-signal.ts`
- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`
- `src/app/execute-wait/index.ts`

## Constraints

- Define a single source of truth for runtime signals.
- Avoid throwing for expected control flow like cancellation.

## Acceptance Criteria

- Signals are defined in a centralized domain type.
- `cancellationAwareDelay` handles cancellation using return state or explicit Results.
- `signalExitCode` has an exhaustive `never` check for unrecognized signals.
