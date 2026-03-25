---
label: "bugs"
created_at: "2026-03-25"
author_role: "typescripter"
confidence: "high"
---

## Problem

`WaitCancelledError` uses a broad `NodeJS.Signals` type, necessitating a `default` case in the `signalExitCode` switch statement, preventing exhaustive checking of known cancellation signals.

## Goal

Constrain the signal type for `WaitCancelledError` to an explicit union of handled signals (`'SIGINT' | 'SIGTERM'`) so that the `switch` statement can be exhaustively checked by the compiler.

## Context

The `typescripter` role explicitly outlines that state should be modeled with discriminated unions, switch statements should be exhaustive, and `never` should be used instead of relying on default cases. `NodeJS.Signals` is an overly broad type including signals that are never passed to the error. Because `WaitCancelledError.signal` is typed as `NodeJS.Signals`, the switch statement requires a default case, hiding missing or newly added signals, and failing the exhaustive check invariant.

## Evidence

- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "1-9"
  note: "WaitCancelledError declares `signal: NodeJS.Signals` which is overly broad."
- path: "src/index.ts"
  loc: "35-43"
  note: "`signalExitCode` uses a default case on the broad type instead of an exhaustive switch on a constrained union type."

## Change Scope

- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`