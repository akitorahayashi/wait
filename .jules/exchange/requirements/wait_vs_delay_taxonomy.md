---
label: "refacts"
implementation_ready: false
---

## Goal

Establish clear, consistent taxonomy separating 'Wait' (domain concept) from 'Delay' (technical mechanism).

## Problem

Synonym collision conflates 'Wait' and 'Delay'. `ExecuteWaitDependencies` injects `delay` and `cancellationAwareDelay` throws `WaitCancelledError`, mixing the concepts in the same logical layer.

## Context

The repository represents a GitHub Action designed to "wait" for a duration. The domain speaks of `WaitRequest` and `WaitResult`, but the application layer (`executeWait`) relies on an injected `ExecuteWaitDependencies.delay` function. Furthermore, the adapter `cancellationAwareDelay` throws a `WaitCancelledError`, mixing the two concepts in a single file. This violates the "One Concept, One Preferred Term" principle.

## Evidence

- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "line 2"
  note: "Domain application boundary `ExecuteWaitDependencies` uses `delay: (seconds: number) => Promise<void>` instead of `wait`."

- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "lines 4-13, 17"
  note: "The function is named `cancellationAwareDelay` but it explicitly throws `WaitCancelledError`."

## Change Scope

- `src/app/execute-wait/execute-wait-dependencies.ts`
- `src/app/execute-wait/index.ts`
- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`

## Constraints

- 'Wait' must represent the business suspension concept.
- 'Delay' must be reserved exclusively for the low-level timer mechanism.

## Acceptance Criteria

- `ExecuteWaitDependencies` uses domain-appropriate terminology instead of 'delay'.
- Domain and Adapter layers strictly separate 'Wait' and 'Delay' nomenclature.
