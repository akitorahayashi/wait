---
label: "bugs"
implementation_ready: false
---

## Goal

Preserve error context explicitly when wrapping failures in `cancellationAwareDelay` or handle them transparently according to the failure semantics.

Constrain the signal type for `WaitCancelledError` to an explicit union of handled signals (`'SIGINT' | 'SIGTERM'`) so that the `switch` statement can be exhaustively checked by the compiler.

## Problem

Errors caught during event listener registration and setTimeout scheduling in `cancellationAwareDelay` are swallowed and replaced by generic messages without preserving the original error context.

`WaitCancelledError` uses a broad `NodeJS.Signals` type, necessitating a `default` case in the `signalExitCode` switch statement, preventing exhaustive checking of known cancellation signals.

## Context

The `typescripter` role forbids `catch` blocks that swallow errors or coerce them to `any`. In `cancellationAwareDelay`, there are `catch` blocks around `process.on` and `setTimeout` that catch `unknown` exceptions but do not log or pass the original error to the returned `Error`. This erases runtime evidence of why a cancellation handler installation or delay chunk scheduling failed.

The `typescripter` role explicitly outlines that state should be modeled with discriminated unions, switch statements should be exhaustive, and `never` should be used instead of relying on default cases. `NodeJS.Signals` is an overly broad type including signals that are never passed to the error. Because `WaitCancelledError.signal` is typed as `NodeJS.Signals`, the switch statement requires a default case, hiding missing or newly added signals, and failing the exhaustive check invariant.

## Evidence

- source_event: "swallowed_errors_cancellation_delay_typescripter.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "44-47"
  note: "`process.on` block catches an exception and throws a generic 'Failed to install cancellation handlers.' error without passing or logging the underlying failure."
- source_event: "swallowed_errors_cancellation_delay_typescripter.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "62-67"
  note: "`setTimeout` block catches an exception and throws a generic 'Failed to start wait timer.' error, again swallowing the original error."
- source_event: "broad_signal_type_non_exhaustive_switch_typescripter.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "1-9"
  note: "WaitCancelledError declares `signal: NodeJS.Signals` which is overly broad."
- source_event: "broad_signal_type_non_exhaustive_switch_typescripter.md"
  path: "src/index.ts"
  loc: "35-43"
  note: "`signalExitCode` uses a default case on the broad type instead of an exhaustive switch on a constrained union type."

## Change Scope

- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`

## Constraints

- Ensure no regressions in existing functionality.
- Adhere to the principles defined in the root context.

## Acceptance Criteria

- The goals specified are fully achieved.
- The problems described are completely resolved.
