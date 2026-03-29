---
label: "refacts"
implementation_ready: false
---

## Goal

Standardize terms across the domain, boundaries, and documentation to use the canonical term `wait` uniformly for pausing execution, eliminating the near-synonym `delay`.

## Problem

The terms "wait" and "delay" are used interchangeably to represent the concept of pausing execution. While the repository is named `wait`, the domain uses `wait` (`WaitRequest`, `executeWait`), and the primary documentation refers to "wait", the adapter implementation introduces `delay` (`cancellationAwareDelay`). More critically, the adapter mixes these terms internally by throwing a `WaitCancelledError` from a function called `delay`. This inconsistency breaks the "One Concept, One Preferred Term" taxonomy rule, leading to cognitive overhead.

## Context

The repository documentation establishes `wait` as the canonical term for a "cancellation-aware wait". Consistency in terminology across domains, variables, documentation, and error classes prevents confusion. Using synonymous terms like "delay" interchangeably creates semantic ambiguity and cognitive load for future contributors.

## Evidence

- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "cancellationAwareDelay vs WaitCancelledError"
  note: "The adapter mixes 'delay' in its exported function name and 'wait' in its error name."

- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "delay: (seconds: number) => Promise<void>"
  note: "The domain use-case requires a 'delay' dependency, creating a term collision with the domain's 'wait' vocabulary."

- source_event: "wait_vs_delay_taxonomy.md"
  path: "README.md"
  loc: "cancellation-aware wait"
  note: "Documentation establishes 'wait' as the canonical term, not 'delay'."

## Change Scope

- `src/adapters/cancellation-aware-delay.ts`
- `src/app/execute-wait/execute-wait-dependencies.ts`
- `src/app/execute-wait/index.ts`
- `src/index.ts`
- `tests/adapters/cancellation-aware-delay.test.ts`

## Constraints

- Files and classes must not have ambiguous names or responsibilities such as base, common, core, utils, or helpers.
- The repository name and action specification must remain `wait` as that represents the public API.

## Acceptance Criteria

- The `cancellationAwareDelay` adapter is renamed to a variation containing `wait` (e.g., `cancellationAwareWait`).
- The dependency interface `ExecuteWaitDependencies` requires a property named `wait` rather than `delay`.
- The filename `cancellation-aware-delay.ts` and its corresponding test file are renamed to replace `delay` with `wait`.
- References across modules, especially in `index.ts` where orchestration happens, are updated to inject the newly named `wait` implementation.