---
label: "refacts"
implementation_ready: true
---

## Goal

Ensure state handling exhaustiveness in the `signalExitCode` function is enforced explicitly by TypeScript compiler utilizing a `never` check rather than implicit function return checking.

## Problem

The `signalExitCode` function handles a `'SIGINT' | 'SIGTERM'` union type using a `switch` statement but fails to include a `default` case to prove to the compiler that all possible cases have been explicitly considered. While currently protected from errors because the function doesn't return anything outside the switch, this is an implicit, brittle validation method. If new signals are later added and the switch is not updated, the compiler will vaguely fail on a return missing error instead of pinpointing the unhandled signal member.

## Context

Relying on implicit function return type validation instead of explicit exhaustiveness checking can lead to confusing errors when union types are expanded. Explicitly handling the `default` case and assigning the value to `never` ensures that invalid or missing states are flagged clearly by the compiler directly at the state handling site, making invalid states unrepresentable.

## Evidence

- source_event: "missing_never_check_typescripter.md"
  path: "src/index.ts"
  loc: "35-42"
  note: "`signalExitCode` uses a switch statement without a default case asserting the exhaustive check via `never`."

## Change Scope

- `src/index.ts`

## Constraints

- Employ standard TypeScript generic exhaustiveness checking techniques (e.g., assigning the unhandled state to `never` directly, or utilizing an `assertNever` helper).
- No new utility libraries can be introduced.

## Acceptance Criteria

- The `switch` statement in `signalExitCode` includes an explicit `default` case.
- Inside the `default` case, the unhandled state is assigned to a parameter or variable typed strictly as `never`, ensuring compilation fails locally if the union type expands without a corresponding case handler.